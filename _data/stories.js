// const stripTags = require("striptags");
// const unique = require('unique-words');
const fetch = require("node-fetch");
const getMonthYear = require("../src/getMonthYear.js");
const makeTitleSlug = require("../src/makeTitleSlug.js");
const processPromos = require("../src/processPromos.js");

const {imageData, linkedStoryData, personData} = require("./_fragments.js");


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
									dontUseDropCaps
									endnote
									imageBorderColour
									imagesPositionText
									imagesType
									introduction
									pageUrl
									podcastNote
									podcastUrl
									postscript
									publicationHistory
									showImagePromo
									title
									triggerWarning
									type
									updatedAt
									useDefaultPodcastMessage
									useProseStyling
									useSeparators
									useSquareOnMobile
									images {
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

			const authorFullName = !!author && (author.displayName || `${ author.forename } ${ author.surname }`);
			const translatorFullName = !!translator && (translator.displayName || `${ translator.forename } ${ translator.surname }`);

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
		const displayTitle = `${ author && authorFullName }: ${ atts.title }${ translatorFullName ? ' (tr ' + translatorFullName + ')' : '' }`;
		const promoImageFormats = atts.promoImage.data.attributes.formats;

		// find total times a story is endPromoted
		// const timesStoryPromoted = stories.map((story) => story.attributes.endPromos
		// promo.story.data.attributes.title)

		// const body = unique(stripTags(atts.body).toLowerCase().replace(/ċ/gm, "MXc").replace(/ġ/gm, "MXg").replace(/ħ/gm, "MXh").replace(/ż/gm, "MXz").replace(/à/gm, "MXa"));
		// const vocabulary = unique(body).filter((word) => {
		// 	const fixedWord = word.replace(/MXc/gm, "ċ").replace(/MXg/gm, "ġ").replace(/MXh/gm, "ħ").replace(/MXz/gm, "ż").replace(/MXa/gm, "à");
		// 	const check = spellchecker.check(fixedWord);
		// 	if (check) {
		// 		return true;
		// 	} else {
		// 		console.log(fixedWord);
		// 		return false;
		// 	}
		// });
		// console.log('tul', vocabulary.length);

		const vocabulary = [];
		// console.log(vocabulary);

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

		return {
			appointment: atts.appointment,
			author: authorFullName,
			body: atts.body,
			booksMentioned: booksMentioned,
			coda: atts.coda,
			dateTimePublication: atts.dateTimePublication,
			description: atts.description,
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
			metaTitle: `${ displayTitle }`,
			monthYear: getMonthYear(atts.dateTimePublication),
			podcastNote: atts.podcastNote,
			podcastUrl: atts.podcastUrl,
			postscript: atts.postscript,
			prominentMentions: atts.prominentMentions,
			publicationHistory: atts.publicationHistory,
			reads: reads[translator.pronoun || author.pronoun],
			sequence: sequenceData && sequenceData.attributes.title,
			sequenceEpisodeNumber: 1,
			sequenceEpisodeTitle: sequenceData && atts.title,
			showImagePromo: atts.showImagePromo,
			singleImage: atts.images.data && atts.images.data.length === 1,
			slideshow:  atts.images.data && atts.images.data.length > 1,
			slug: atts.pageUrl || makeTitleSlug(atts.title, authorFullName, translatorFullName, sequenceData && sequenceData.attributes.title, 1),
			socialImage: promoImageFormats.social && `${ promoImageFormats.social.hash }${ promoImageFormats.social.ext }`,
			socialImageAlt: promoImageFormats.social && atts.promoImage.data.attributes.alternativeText,
			title: sequenceData && sequenceData.attributes.title || atts.title,
			translator: translatorFullName,
			triggerWarning: atts.triggerWarning,
			type: atts.type,
			updatedAt: atts.updatedAt,
			useDefaultPodcastMessage: !!atts.useDefaultPodcastMessage,
			useProseStyling: !!atts.useProseStyling,
			useSeparators: !!atts.useSeparators,
			useSquareOnMobile: !!atts.useSquareOnMobile,
			vocabulary: vocabulary,
    };
	});
  return storiesFormatted;
}

// export for 11ty
module.exports = getAllStories;
