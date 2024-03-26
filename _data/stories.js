const stripTags = require("striptags");
const unique = require('unique-words');
const fetch = require("node-fetch");
const getMonthYear = require("../src/getMonthYear.js");
const makePageTitle = require("../src/makePageTitle.js");
const makeSortableTitle = require("../src/makeSortableTitle.js");
const makeTitleSlug = require("../src/makeTitleSlug.js");
const parseAuthors = require("../src/parseAuthors.js");
const processCollections = require("../src/processCollections.js");
const processPromos = require("../src/processPromos.js");
const reads = require("../src/getReads.js");
const slugifyStringMaltese = require("../src/slugifyMaltese.js");

const { imageData, linkedStoryData, personData } = require("./_fragments.js");

let wordcount, cumulativeBody, cumulativeWordcount;

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
	const fetchStatus = process.env.NODE_ENV === 'development' ? 'PREVIEW' : 'LIVE';
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
						stories(
	            publicationState: ${ fetchStatus },
							pagination: { page: 1, pageSize: 250 },
							sort: ["diaryDate:desc", "dateTimePublication:desc"],
							) {
							data {
								id
								attributes {
									appointment
									authorsType
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
									moreToCome
									pageUrl
									podcastLengthMinutes
									podcastNote
									podcastUrl
									postscript
									prominentMentions
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
									authors (
				            publicationState: ${ fetchStatus },
									) {
										${personData}
									}
									translators (
				            publicationState: ${ fetchStatus },
									) {
										${personData}
									}
									booksMentioned (
				            publicationState: ${ fetchStatus },
									) {
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
									audio {
										id
										highlight
										note
										audioUrl
										audioLengthMinutes
										putAfterThisText
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
															type
														}
													}
												}
											}
										}
									}
									collections(
				            publicationState: ${ fetchStatus },
									) {
										data {
											id
											attributes {
												title
												moreToCome
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
															type
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

	// Also used externally
	const splitText = (text, aggressively = false) => {
		let cleanedText = stripTags(text).toLowerCase()
			.replace(/\b\d+\b/g, " ")
			.replace(/b\’/g, "b’ ")
			.replace(/[\—]/g, " ")
			.replace(/[\.,\/#!\$\€%\^&\*;:{}=_‘`“”~()]/g, "")
			.replace(/\s+/g, " ");
		if (aggressively) {
			cleanedText = cleanedText.replace(/\b(b|f)(\’|\')/gi, "")
				.replace(/\bi?(.)-/gi, "")
				.replace(/\b(bi?|bħa|fi?|ġo|għa|mi|sa|ta)l?.?-?(.)-/gi, "")
				.replace(/\b\’/gi, "")
		}
		// .replace(/f\’/g, "f’ ")
		// .replace(/[\-]/g, "- ")
		// FIXME: avoid doing this twice, maybe concatenate arrays and split at the end
		return cleanedText.split(/\s+/);
	}

	const getWordFrequency = (text) => {
		const wordsArray = splitText(text, true);
		wordcount = wordsArray.length;
		cumulativeWordcount += wordcount;
		const wordFrequency = {};
		wordsArray.forEach((word) => {
			wordFrequency[word] = (wordFrequency[word] || 0) + 1;
		});
		const result = Object.entries(wordFrequency).map(([word, frequency]) => ({ word, frequency }));
		const filteredResult = result; // .filter((word) => word.frequency === 1);
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

	const processBooksMentioned = (booksData, prominentMentions) => {
		return booksData.slice(0, prominentMentions).map((book) => {
			const bookAtts = book.attributes;
			console.log('·', bookAtts.title);
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
	}

  // format stories objects
	const storiesFormatted = stories.map((story) => {
		const atts = story.attributes;
		console.log(atts.title);

		// Add anchors
		const cleanedBody = atts.body.replace(/ data-.*?=".*?"/gmi, "").replace(/fx-(\d)/gmi, "fx$1");
		const anchoredBody = cleanedBody.replace(/(<h[56])>(.*?)(<\/h[56]>)/gmi, (full, openingTag, headline, closingTag) => `<hr>${ openingTag } id="${ slugifyStringMaltese(headline) }">${ headline }${ closingTag }`)

		// Check anchors
		const anchors = anchoredBody.match(/(?<=href="#).*?(?=">)/gm);
		let anchorErrors = false;
		anchors && anchors.forEach(anchor => {
			if (!anchoredBody.includes(`id=\"${ anchor }\"`)) {
				anchorErrors = true;
				console.log(`Link to "${ anchor }" but no anchor!`);
			}
		});
		if (anchorErrors) {
			// throw new Error(`${ atts.title } has anchor errors!`)
		}

		const booksMentioned = !!atts.booksMentioned.data.length && processBooksMentioned(atts.booksMentioned.data, atts.prominentMentions);
		const authorsType = atts.authorsType && atts.authorsType.replace(/\_.*/, '') || 'solo';
		const { authors, authorForename, authorsString, authorPronoun } = parseAuthors(atts.authors.data, authorsType);
		const translator = !!atts.translators.data.length && atts.translators.data[0].attributes;
		const sequenceData = atts.sequence.data;
		const endPromosFormatted = atts.endPromos.length && processPromos(atts.endPromos);
		const audioPromosFormatted = atts.audio.length && processPromos(atts.audio, atts);
		const translatorFullName = !!translator && (translator.displayName || `${ translator.forename } ${ translator.surname }`);
		// REFACTOR use titleArray to derive slug and title

		if (!atts.promoImage) console.log("Image missing! An image was probably deleted from the media library after it had been added as the social image.");
		const promoImageFormats = atts.promoImage.data.attributes.formats;

		// find total times a story is endPromoted
		// const timesStoryPromoted = stories.map((story) => story.attributes.endPromos
		// promo.story.data.attributes.title)

		// const body = unique(stripTags(atts.body).toLowerCase().replace(/ċ/gm, "czMXc").replace(/ġ/gm, "gzMXg").replace(/ħ/gm, "hzMXh").replace(/ż/gm, "zzMXz").replace(/à/gm, "azMXa"));

		// const vocabulary = unique(body).sort().map((word) => {
		// 	return word.replace(/czMXc/gm, "ċ").replace(/gzMXg/gm, "ġ").replace(/hzMXh/gm, "ħ").replace(/zzMXz/gm, "ż").replace(/azMXa/gm, "à");
		// });

		const imageTypes = {
			'Wisgha_tat_test': 'uncropped',
			'Wisgha_tat_test 16:9': 'landscape',
			'Wisgha_tal_pagna': 'uncropped',
			'Wisgha_tal_pagna 16:9': 'landscape',
		}

		// REFACTOR: rationalise titles mainTitle, subtitle, metaTitle, displayTitle, reportingTitle, fixPodcastTitle
		const title = sequenceData && sequenceData.attributes.title || atts.title;
		const [mainTitle, subtitle] = title.split(": ");

		const displayTitle = makePageTitle(
			atts.title,
			authorsString,
			translatorFullName,
			sequenceData && sequenceData.attributes.title,
			atts.sequenceEpisodeNumber,
			atts.diaryDate,
			!!sequenceData && atts.title,
			atts.type,
		);

		// REFACTOR: Save externally
		const fixReportingTitle = (processedStory) => {
			const { type, sequenceEpisodeNumber, authorsString, title } = processedStory;
			if (type === 'Djarju') return `Djarju #${ sequenceEpisodeNumber } ${ authorsString }`;
			if (!!sequenceEpisodeNumber) return `${ title } #${ sequenceEpisodeNumber }`;
			return title;
		}

		const pageSlug = atts.pageUrl || makeTitleSlug(
			atts.title,
			authorsString,
			translatorFullName,
			sequenceData && sequenceData.attributes.title,
			atts.sequenceEpisodeNumber,
			atts.diaryDate,
			!!sequenceData && atts.title,
			atts.type
		);

		let sequencePreviousPromo, sequenceNextPromo;
		let sequenceEpisodes = sequenceData
			&& sequenceData.attributes.stories.data.length > 1
			&& sequenceData.attributes.stories.data.map((episode) => {
				const episodeAtts = episode.attributes;

				const episodeSlug = episodeAtts.pageUrl || makeTitleSlug(
					episodeAtts.title,
					authorsString,
					translatorFullName,
					sequenceData && sequenceData.attributes.title,
					episodeAtts.sequenceEpisodeNumber,
					episodeAtts.diaryDate,
					!!sequenceData && episodeAtts.title,
					episodeAtts.type
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

		const storycollections = atts.collections && processCollections(atts.collections.data);

		cumulativeBody += " " + atts.body;

		const processedStory = {
			appointment: atts.appointment,
			authorForename,
			authors,
			authorPronoun,
			authorsString,
			authorsType,
			body: anchoredBody,
			booksMentioned,
			coda: atts.coda,
			cssClass: atts.type === 'Poezija' ? 'body-text poetry' : 'body-text',
			dateTimePublication: atts.dateTimePublication,
			description: atts.description || stripTags(atts.body.substring(0, 400)),
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
			listable: atts.type !== 'Djarju' && atts.type !== 'Poddata',
			listableDiary: atts.type === 'Djarju',
			listablePodcast: atts.type === 'Poddata',
			mainTitle,
			metaTitle: displayTitle,
			monthYear: getMonthYear(atts.dateTimePublication),
			moreToCome: atts.moreToCome || storycollections.length, // FIXME
			newsletterStyle: atts.type === 'Djarju' ? 'sidebar-entry' : 'sidebar-part',
			podcastLengthMinutes: atts.podcastLengthMinutes,
			podcastNote: atts.podcastNote,
			podcastUrl: atts.podcastUrl,
			postscript: atts.postscript,
			prominentMentions: atts.prominentMentions,
			promoImage: atts.promoImage.data,
			promoImageMobile: atts.promoImageMobile.data,
			publicationHistory: atts.publicationHistory,
			reads: reads(authorPronoun),
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
			sortTitle: makeSortableTitle(title + atts.sequenceEpisodeNumber),
			storycollections,
			subjectDate: atts.diaryDate,
			subtitle,
			title,
			translator: translatorFullName,
			translatorForename: (translator && translator.forename) || translatorFullName,
			triggerWarning: atts.triggerWarning,
			type: atts.type,
			updatedAt: atts.updatedAt,
			useDefaultPodcastMessage: !!atts.useDefaultPodcastMessage,
			useProseStyling: !!atts.useProseStyling,
			useSeparators: !!atts.useSeparators,
			useSquareOnMobile: !!atts.useSquareOnMobile,
			wordcount: splitText(atts.body).length,
		};

		processedStory.reportingTitle = fixReportingTitle(processedStory);
		const audioUrls = [];
		const audioPlayers = [];
		// This story's own audio (normally a plain reading)
		if (atts.podcastUrl) {
			audioUrls.push({
				author: processedStory.authorsString,
				storyId: story.id,
				monthYear: processedStory.monthYear,
				pageSlug,
				podcastLengthMinutes: processedStory.podcastLengthMinutes,
				podcastNote: processedStory.podcastNote,
				reportingTitle: processedStory.reportingTitle,
				sequenceEpisodeNumber: processedStory.sequenceEpisodeNumber,
				sequenceEpisodeTitle: processedStory.sequenceEpisodeTitle,
				title: processedStory.title,
				translatorName: processedStory.translatorFullName,
				type: processedStory.type,
				url: processedStory.podcastUrl,
			});
			audioPlayers.push({
				authorName: processedStory.translatorForename || processedStory.authorForename,
				monthYear: processedStory.monthYear,
				podcastLengthMinutes: processedStory.podcastLengthMinutes,
				podcastNote: processedStory.type !== "Poddata" && processedStory.podcastNote,
				reads: reads(processedStory.authorPronoun),
				reportingTitle: processedStory.reportingTitle,
				title: processedStory.title,
				type: processedStory.type,
				url: processedStory.podcastUrl,
				useDefaultPodcastMessage: !!processedStory.useDefaultPodcastMessage,
			});
		}
		// Extra players or FX
		if (audioPromosFormatted.length) {
			audioPromosFormatted.forEach(promo => {
				if (audioUrls && audioUrls.length && promo.url === audioUrls[0].url) return;
				// // If audio is ad hoc (e.g. sound effects for this story)
				// if (promo.audioUrl) {
				// 	audioPlayers.push({
				// 		podcastLengthMinutes: promo.audioLengthMinutes,
				// 		podcastNote: promo.note,
				// 		url: promo.audioUrl,
				// 	});
				// 	return;
				// }
				audioUrls.push({
					// add description
					authorName: promo.authorsString,
					monthYear: promo.monthYear,
					pageSlug: promo.slug,
					reportingTitle: promo.reportingTitle,
					sequenceEpisodeNumber: promo.sequenceEpisodeNumber,
					sequenceEpisodeTitle: promo.sequenceEpisodeTitle,
					storyId: promo.id,
					title: promo.title,
					type: promo.type,
					url: promo.audioUrl || promo.podcastUrl,
				});
				audioPlayers.push({
					authorName: promo.translatorForename || promo.authorForename,
					highlight: promo.audioHighlight,
					podcastLengthMinutes: promo.audioLengthMinutes || promo.podcastLengthMinutes,
					podcastNote: promo.note || promo.podcastNote,
					monthYear: promo.monthYear,
					putAfterThisText: promo.putAfterThisText,
					reads: reads(promo.authorPronoun),
					reportingTitle: promo.reportingTitle,
					title: promo.title,
					type: promo.type,
					url: promo.audioUrl || promo.podcastUrl,
					useDefaultPodcastMessage: !!promo.useDefaultPodcastMessage,
				});
			});
		}

		processedStory.audioUrlsString = JSON.stringify(audioUrls);
		processedStory.audioPlayers = audioPlayers;

		console.log('---------------------------------------------------------');

		return processedStory;
	});

	const vocabulary = getWordFrequency(cumulativeBody);
	storiesFormatted[0].vocabulary = vocabulary;
	storiesFormatted[0].cumulativeWordcount = splitText(cumulativeBody).length;

	return storiesFormatted;
}

// export for 11ty
module.exports = getAllStories;
