const stripTags = require("striptags");
const unique = require('unique-words');
const fetch = require("node-fetch");
const getMonthYear = require("../src/getMonthYear.js");
const makePageTitle = require("../src/makePageTitle.js");
const makeSortableTitle = require("../src/makeSortableTitle.js");
const makeTitleSlug = require("../src/makeTitleSlug.js");
const processPromos = require("../src/processPromos.js");

const {imageData, linkedStoryData, personData} = require("./_fragments.js");

let cumulativeBody;

// const fs = require('fs');
// var Spellchecker = require("hunspell-spellchecker");
// var spellchecker = new Spellchecker();
// // Parse an hunspell dictionary that can be serialized as JSON
// var DICT = spellchecker.parse({
// 	dic: fs.readFileSync("./mt_MT.dic"),
// 	aff: fs.readFileSync("./mt_MT.aff")
// });
// spellchecker.use(DICT);

// function to get stories
async function getAllStories() {
  const recordsPerQuery = 100;
  let recordsToSkip = 0;
  let makeNewQuery = true;
  let stories = [];
  while (makeNewQuery) {
    try {
      // initialise fetch
      const data = await fetch("https://cms.aphroconfuso.mt/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `{
						stories(pagination: { page: 1, pageSize: 250 }) {
							data {
								id
								attributes {
									appointment
									body
									coda
									dateTimePublication
									description
									diaryDate
									dontUseDropCaps
									endnote
									imageBorderColour
									imagesPositionText
									imagesType
									introduction
									pageUrl
									podcastLengthMinutes
									podcastNote
									podcastUrl
									postscript
									publicationHistory
									sequenceEpisodeNumber
									showImagePromo
									title
									triggerWarning
									type
									updatedAt
									useDefaultPodcastMessage
									useProseStyling
									useSeparators
									useSquareOnMobile
									images(pagination: { page: 1, pageSize: 250 }) {
										${imageData}
									}
									promoImage {
										${imageData}
									}
									promoImageMobile {
										${imageData}
									}
									epigraphs {
										attribution
										quotation
									}
									authors {
										${personData}
									}
									translators {
										${personData}
									}
									booksMentioned {
										data {
											attributes {
												title
												publicationDate
												authors {
													${personData}
												}
												translators {
													${personData}
												}
												publishers {
													data {
														attributes {
															name
															city
														}
													}
												}
											}
										}
									}
									endPromos {
										text
										story {
											${linkedStoryData}
										}
									}
									sequence {
										data {
											attributes {
												title
												description
												stories {
													data {
														attributes {
															dateTimePublication
															description
															diaryDate
															pageUrl
															sequenceEpisodeNumber
															title
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}`,
        }),
      });
      const response = await data.json();

      if (response.errors) {
        let errors = response.errors;
        errors.map((error) => {
          console.log(error.message);
        });
        throw new Error("Houston... We have a CMS problem");
      }

      // update blogpost array with the data from the JSON response
      stories = stories.concat(response.data.stories.data);

      // prepare for next query
      recordsToSkip += recordsPerQuery;

      // stop querying if we are getting back less than the records we fetch per query
      if (response.data.stories.length < recordsPerQuery) {
        makeNewQuery = false;
      }
      makeNewQuery = false;
    } catch (error) {
      throw new Error(error);
    }
  }

	const getWordFrequency = (text) => {
		const cleanedText = stripTags(text).toLowerCase().replace(/\b\d+\b/g, " ").replace(/f\’/g, "f’ ").replace(/b\’/g, "b’ ").replace(/[\-]/g, "- ").replace(/[\—]/g, " ").replace(/[.,\/#!$%\^&\*;:{}=_`“”~()]/g, "").replace(/\s+/g, " ");
		const words = cleanedText.split(/\s+/);
		const wordFrequency = {};
		words.forEach((word) => {
			wordFrequency[word] = (wordFrequency[word] || 0) + 1;
		});
		const result = Object.entries(wordFrequency).map(([word, frequency]) => ({ word, frequency }));

		const filteredResult = result.filter((word) => word.frequency === 1);
		filteredResult.sort((a, b) => {
			if (a.frequency === b.frequency) {
				return a.word.localeCompare(b.word);
			}
			return a.frequency - b.frequency;
		});
		return filteredResult;
	};

	// const body = unique(stripTags(atts.body).toLowerCase().replace(/ċ/gm, "czMXc").replace(/ġ/gm, "gzMXg").replace(/ħ/gm, "hzMXh").replace(/ż/gm, "zzMXz").replace(/à/gm, "azMXa"));
	// const vocabulary = unique(body).sort().map((word) => {
	// 	return word.replace(/czMXc/gm, "ċ").replace(/gzMXg/gm, "ġ").replace(/hzMXh/gm, "ħ").replace(/zzMXz/gm, "ż").replace(/azMXa/gm, "à");
	// });

  // format stories objects
	const storiesFormatted = stories.map((story) => {
		const atts = story.attributes;
		const author = !!atts.authors.data.length && atts.authors.data[0].attributes;
		const translator = !!atts.translators.data.length && atts.translators.data[0].attributes;
		const sequenceData = atts.sequence.data;
		const endPromosFormatted = atts.endPromos.length && processPromos(atts.endPromos);

		const booksMentioned = !!atts.booksMentioned.data.length && atts.booksMentioned.data.slice(0, atts.prominentMentions).map((book) => {
			const bookAtts = book.attributes;
			const author = !!bookAtts.authors.data.length && bookAtts.authors.data[0].attributes;
			const translator = !!bookAtts.translators.data.length && bookAtts.translators.data[0].attributes;
			const publisher = !!bookAtts.publishers.data.length && bookAtts.publishers.data[0].attributes;

			const authorFullName = !!author && (author.displayName || `${ author.forename }${ author.initials ? ' ' + author.initials + ' ' : ' ' }${ author.surname }`);
			const translatorFullName = !!translator && (translator.displayName || `${ translator.forename }${ author.initials ? ' ' + author.initials + ' ' : ' ' }${ translator.surname }`);

			return {
				title: bookAtts.title,
				publicationYear: new Date(bookAtts.publicationDate).getFullYear(),
				publisherName: publisher.name,
				publisherCity: publisher.city,
				author: authorFullName,
				translator: translatorFullName
			};
		});

		const authorFullName = !!author && (author.displayName || `${ author.forename } ${ author.surname }`);
		const translatorFullName = !!translator && (translator.displayName || `${ translator.forename } ${ translator.surname }`);
		// REFACTOR use titleArray to derive slug and title

		if (!atts.promoImage) console.log("Image missing! An image was probably deleted from the media library after it had been added as the social image.");
		const promoImageFormats = atts.promoImage.data.attributes.formats;

		// find total times a story is endPromoted
		// const timesStoryPromoted = stories.map((story) => story.attributes.endPromos
		// promo.story.data.attributes.title)

		const body = unique(stripTags(atts.body).toLowerCase().replace(/ċ/gm, "czMXc").replace(/ġ/gm, "gzMXg").replace(/ħ/gm, "hzMXh").replace(/ż/gm, "zzMXz").replace(/à/gm, "azMXa"));

		const vocabulary = unique(body).sort().map((word) => {
			return word.replace(/czMXc/gm, "ċ").replace(/gzMXg/gm, "ġ").replace(/hzMXh/gm, "ħ").replace(/zzMXz/gm, "ż").replace(/azMXa/gm, "à");
		});

		const imageTypes = {
			'Wisgha_tat_test': 'uncropped',
			'Wisgha_tat_test 16:9': 'landscape',
			'Wisgha_tal_pagna': 'uncropped',
			'Wisgha_tal_pagna 16:9': 'landscape',
		}

		const reads = {
			'hi': 'taqra',
			'hu': 'jaqra',
			'hi_hu': Math.round(Math.random()) ? 'taqra' : 'jaqra',
			'huma': 'jaqraw',
		}

		const title = sequenceData && sequenceData.attributes.title || atts.title;

		const displayTitle = makePageTitle(
			atts.title,
			authorFullName,
			translatorFullName,
			sequenceData && sequenceData.attributes.title,
			atts.sequenceEpisodeNumber,
			atts.diaryDate,
			!!sequenceData && atts.title
		);

		const pageSlug = atts.pageUrl || makeTitleSlug(
			atts.title,
			authorFullName,
			translatorFullName,
			sequenceData && sequenceData.attributes.title,
			atts.sequenceEpisodeNumber,
			atts.diaryDate,
			!!sequenceData && atts.title
		);

		let sequencePreviousPromo, sequenceNextPromo;
		let sequenceEpisodes = sequenceData
			&& sequenceData.attributes.stories.data.length > 1
			&& sequenceData.attributes.stories.data.map((episode) => {
				const episodeAtts = episode.attributes;

				const episodeSlug = episodeAtts.pageUrl || makeTitleSlug(
					episodeAtts.title,
					authorFullName,
					translatorFullName,
					sequenceData && sequenceData.attributes.title,
					episodeAtts.sequenceEpisodeNumber,
					episodeAtts.diaryDate,
					!!sequenceData && episodeAtts.title
				);

				if (episodeAtts.sequenceEpisodeNumber === atts.sequenceEpisodeNumber - 1) {
					sequencePreviousPromo = { slug: episodeSlug, ...episodeAtts };
				}

				if (episodeAtts.sequenceEpisodeNumber === atts.sequenceEpisodeNumber + 1) {
					sequenceNextPromo = { slug: episodeSlug, ...episodeAtts };
				}

				return {
				date: episodeAtts.diaryDate,
				number: episodeAtts.sequenceEpisodeNumber,
				title: episodeAtts.title,
				slug: episodeSlug !== pageSlug && episodeSlug,
			}
		});
		if (sequenceEpisodes && sequenceEpisodes[0].date) {
			sequenceEpisodes.reverse();
		}

		cumulativeBody += " " + atts.body;

		return {
			appointment: atts.appointment,
			author: authorFullName,
			body: atts.body,
			booksMentioned: booksMentioned,
			coda: atts.coda,
			cssClass: atts.type === 'Poezija' ? 'body-text poetry' : 'body-text',
			dateTimePublication: atts.dateTimePublication,
			description: atts.description,
			diaryDate: atts.diaryDate,
			displayTitle: displayTitle,
			dontUseDropCaps: !!atts.dontUseDropCaps,
			dontUseDropCaps: atts.dontUseDropCaps,
			endnote: atts.endnote,
			endPromos: endPromosFormatted,
			epigraphs: !!atts.epigraphs && atts.epigraphs,
			id: story.id,
			imageBorderColour: atts.imageBorderColour,
			imageCrop: imageTypes[atts.imagesType],
			images: atts.images.data,
			imagesPositionText: atts.imagesPositionText,
			introduction: atts.introduction,
			isSequenceEpisode: !!sequenceData,
			listable: atts.type !== 'Djarju',
			metaTitle: displayTitle,
			monthYear: getMonthYear(atts.dateTimePublication),
			podcastLengthMinutes: atts.podcastLengthMinutes,
			podcastNote: atts.podcastNote,
			podcastUrl: atts.podcastUrl,
			postscript: atts.postscript,
			prominentMentions: atts.prominentMentions,
			promoImage: atts.promoImage.data,
			promoImageMobile: atts.promoImageMobile.data,
			publicationHistory: atts.publicationHistory,
			reads: reads[translator.pronoun || author.pronoun],
			sequence: sequenceData && sequenceData.attributes.title,
			sequenceEpisodeNumber: atts.sequenceEpisodeNumber,
			sequenceEpisodes: sequenceEpisodes,
			sequenceEpisodeTitle: sequenceData && atts.title,
			sequencePreviousPromo,
			sequenceNextPromo,
			showImagePromo: atts.showImagePromo,
			singleImage: atts.images.data && atts.images.data.length === 1,
			slideshow:  atts.images.data && atts.images.data.length > 1,
			slug: pageSlug,
			socialImage: promoImageFormats.social && `${ promoImageFormats.social.hash }${ promoImageFormats.social.ext }`,
			socialImageAlt: promoImageFormats.social && atts.promoImage.data.attributes.alternativeText,
			sortTitle: makeSortableTitle(title),
			title: title,
			translator: translatorFullName,
			triggerWarning: atts.triggerWarning,
			type: atts.type,
			updatedAt: atts.updatedAt,
			useDefaultPodcastMessage: !!atts.useDefaultPodcastMessage,
			useProseStyling: !!atts.useProseStyling,
			useSeparators: !!atts.useSeparators,
			useSquareOnMobile: !!atts.useSquareOnMobile,
    };
	});

	const vocabulary = getWordFrequency(cumulativeBody);
	storiesFormatted[0].vocabulary = vocabulary;

	return storiesFormatted;
}

// export for 11ty
module.exports = getAllStories;
