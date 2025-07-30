const stripTags = require("striptags");
// const unique = require('unique-words');
const cachedPostFetch = require('../src/cachedPostFetch');
const smartTruncate = require('smart-truncate');

const getIssueMonthYear = require("../src/getIssueMonthYear.js");
const makePageTitle = require("../src/makePageTitle.js");
const makeSortableTitle = require("../src/makeSortableTitle.js");
const makeTitleSlug = require("../src/makeTitleSlug.js");
const parseAuthors = require("../src/parseAuthors.js");
const processCollections = require("../src/processCollections.js");
const processPromos = require("../src/processPromos.js");
const slugifyStringMaltese = require("../src/slugifyMaltese.js");

const getReads = require('../src/getReads.js');

const { imageData, linkedStoryData, linkedStoryDataWithImage, personData } = require("./_fragments.js");

let abecedaireArray = [];
let almanacArray = [];
let wordcountArray = [];
let cumulativeBody, cumulativeWordcount;

const shuffleArray = (array) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

function findUniqueWords(text) {
    // Normalize to lowercase for case-insensitive comparison
    text = text.normalize('NFC').toLowerCase();

    // Use regex to match words, including Unicode characters
    const words = text.match(/\p{L}+/gu) || []; // \p{L}+ matches any letter character in any language

    // Store unique words in a Set
    const uniqueWords = new Set(words);

    return Array.from(uniqueWords);
}

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
      const data = await cachedPostFetch("https://cms.aphroconfuso.mt/graphql", {
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
									podcastDate
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
										top
									}
									snippets {
										beginning
										end
										full
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
									bookPromos {
										text
										story {
											${linkedStoryDataWithImage}
										}
									}
									sequence {
										data {
											id
											attributes {
												title
												description
												stories (
													publicationState: ${ fetchStatus },
													pagination: { page: 1, pageSize: 250 },
													sort: ["sequenceEpisodeNumber:asc"],
												) {
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
									isBook {
										inShops
										isbn
										lokalUrl
										orderable
										pages
										price
										published
									}
									collections (
				            publicationState: ${ fetchStatus },
									) {
										data {
											id
											attributes {
												title
												moreToCome
												description
												stories (
				            				publicationState: ${ fetchStatus },
													) {
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
      // const response = await data;
      const response = await data;

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
				.replace(/\b(bi?|bħa|fi?|ġo|għa|ma|mi|sa|ta|di|da)l?.?-?/gi, "")
				// .replace(/\b(bi?|bħa|fi?|ġo|għa|mi|sa|ta)l?.?-?(.)-/gi, "")
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
		wordcountArray.push({ "${id}": wordcount });
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

	const promotableStories = stories.filter(({ attributes: { type } }) => ['Esej', 'Storja', 'Djarju', 'Terminu'].includes(type));
	const promotablePoems = stories.filter(({ attributes: { type } }) => ['Poezija'].includes(type));

	const twoMonthsAgo = new Date(); twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 3);
	const promotableStoriesHome = stories.filter(
		({ attributes }) =>
			['Esej', 'Storja', 'Poddata'].includes(attributes?.type) &&
			new Date(attributes?.dateTimePublication) < twoMonthsAgo
	);

  // format stories objects
	const storiesFormatted = stories.map((story) => {
		const atts = story.attributes;
		console.log(atts.title);

		// Add anchors
		const cleanedBody = atts.body.replace(/ data-.*?=".*?"/gmi, "").replace(/fx-(\d)/gmi, "fx$1");
		const anchoredBody = cleanedBody.replace(/(<h[56])>(.*?)(<\/h[56]>)/gmi, (full, openingTag, headline, closingTag) => `<hr>${ openingTag } id="${ slugifyStringMaltese(headline) }">${ headline }${ closingTag }`)
		const booksMentioned = !!atts.booksMentioned.data.length && processBooksMentioned(atts.booksMentioned.data, atts.prominentMentions);
		const authorsType = atts.authorsType && atts.authorsType.replace(/\_.*/, '') || 'solo';
		let {authors, authorForename, authorsString, authorPronoun} = parseAuthors(atts.authors.data, authorsType);

		// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		if (authors.length > 10) authorsString = "";

		const translator = !!atts.translators.data.length && atts.translators.data[0].attributes;
		const sequenceData = atts.sequence.data;
		const endPromosFormatted = (atts.endPromos.length && processPromos(atts.endPromos)) || processPromos([...promotableStories].sort(() => Math.random() - 0.5).slice(0, 2)).concat(processPromos([...promotablePoems].sort(() => Math.random() - 0.5).slice(0, 1)));
		const bookPromoFormatted = atts.bookPromos.length && processPromos(atts.bookPromos);
		atts.audio && JSON.stringify(atts.audio);
		// const audioPromosFormatted = atts.audio.length && processPromos(atts.audio);
		const audioPromosFormatted = atts.audio.length && processPromos(atts.audio, atts);
		const translatorFullName = !!translator && (translator.displayName || `${ translator.forename } ${ translator.surname }`);
		// REFACTOR use titleArray to derive slug and title

		if (!atts.promoImage || !atts.promoImage.data) console.log("Image missing! An image was probably deleted from the media library after it had been added as the social image.");
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
		let [mainTitle, subtitle] = title.split(/(?<!:):(?!:)/);
		mainTitle = mainTitle.replace(/:: /, ": ");

		const displayTitle = makePageTitle(
			atts.title,
			authorsString,
			translatorFullName,
			sequenceData && sequenceData.attributes.title,
			atts.sequenceEpisodeNumber,
			atts.diaryDate,
			!!sequenceData && atts.title,
			atts.type
		);

		// REFACTOR: Save externally
		const fixReportingTitle = (processedStory) => {
			const {type, sequenceEpisodeNumber, authorsString, title} = processedStory;
			if (type === 'Djarju') return `Djarju #${ sequenceEpisodeNumber } ${ authorsString }`;
			if (!!sequenceEpisodeNumber) return `${ title } #${ sequenceEpisodeNumber }`;
			return title.replace(/:.*$/, "");
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

		// Refactor externally
		const sequenceSlug = !!sequenceData && makeTitleSlug(
			(atts.type === 'Djarju' ? 'Djarju' : title),
			authorsString,
			translatorFullName,
		);

		const snippets = atts.snippets && atts.snippets.map((snippet) => {
			if (snippet.full) return snippet.full;
			const startIndex = atts.body.indexOf(snippet.beginning);
			if (startIndex === -1) return '';
			if (snippet.end) {
				const endIndex = atts.body.indexOf(snippet.end, startIndex + snippet.beginning.length);
				if (endIndex === -1) return '';
				return atts.body.slice(startIndex, endIndex + snippet.end.length);
			} else {
				const afterStart = atts.body.slice(startIndex);
				const words = afterStart.split(/\s+/).slice(0, 200).join(' ');
				return words;
			}
		});

		const { month: issueMonth, year: issueYear, monthYear: issueMonthYear, season: issueSeason } = getIssueMonthYear(atts.dateTimePublication);

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
					sequencePreviousPromo = {slug: episodeSlug, ...episodeAtts};
				}

				if (episodeAtts.sequenceEpisodeNumber === atts.sequenceEpisodeNumber + 1) {
					sequenceNextPromo = {slug: episodeSlug, ...episodeAtts};
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

		const endOfSeries = (!!atts.sequenceEpisodeNumber && atts.sequenceEpisodeNumber === (sequenceEpisodes && sequenceEpisodes.length)) && !atts.moreToCome;
		const storycollections = atts.collections && processCollections(atts.collections.data);
		cumulativeBody += " " + atts.body;

		// const body = unique(stripTags(atts.body).toLowerCase().replace(/ċ/gm, "czMXc").replace(/ġ/gm, "gzMXg").replace(/ħ/gm, "hzMXh").replace(/ż/gm, "zzMXz").replace(/à/gm, "azMXa"));
		// const vocabulary = unique(body).sort().map((word) => {
		// 	return word.replace(/czMXc/gm, "ċ").replace(/gzMXg/gm, "ġ").replace(/hzMXh/gm, "ħ").replace(/zzMXz/gm, "ż").replace(/azMXa/gm, "à");
		// });


// Example usage
		const vocabulary = findUniqueWords(atts.body);
		const wordcount = splitText(atts.body).length
		const isBook = atts.type === 'Ktieb_stampat';

		const processedStory = {
			appointment: atts.appointment,
			authorForename,
			authors,
			authorPronoun,
			authorsString,
			authorsType,
			body: anchoredBody,
			booksMentioned,
			bookIsbn: isBook && atts.isBook?.isbn,
			bookInShops: isBook && atts.isBook?.inShops,
			bookLokalUrl: isBook && atts.isBook?.lokalUrl,
			bookOrderable: isBook && atts.isBook?.orderable,
			bookPages: isBook && atts.isBook?.pages,
			bookPublished: isBook && atts.isBook?.published,
			bookPreRelease: isBook && !atts.isBook?.published,
			bookPrice: isBook && atts.isBook?.price,
			bookPromos: bookPromoFormatted,
			bookSeason: isBook && !atts.isBook?.published && `${issueSeason} ${issueYear}`,
			coda: atts.coda,
			cssClass: atts.type === 'Poezija' ? 'body-text poetry' : 'body-text',
			dateTimePublication: atts.dateTimePublication,
			description: atts.description || stripTags(atts.body.substring(0, 400)),
			displayTitle,
			dontUseDropCaps: atts.dontUseDropCaps,
			endOfSeriesClass: endOfSeries ? ' end-of-series' : '',
			endnote: atts.endnote,
			endPromos: endPromosFormatted,
			epigraphs: !!atts.epigraphs && atts.epigraphs,
			id: story.id,
			imageBorderColour: atts.imageBorderColour,
			imageCrop: imageTypes[atts.imagesType],
			imagesType: atts.imagesType,
			images: atts.images.data,
			imagesPositionText: atts.imagesPositionText,
			introduction: atts.introduction,
			isSequenceEpisode: !!sequenceData,
			issueMonth,
			issueMonthYear,
			listable: !['Avveniment', 'Djarju', 'Memoir', 'Poddata', 'Ktieb_stampat', 'Terminu'].includes(atts.type),
			listableAudio: atts.type !== 'Djarju' && atts.type !== 'Poddata' && !!atts.podcastDate,
			listableBook: atts.type === 'Ktieb_stampat',
			listableDiary: atts.type === 'Djarju',
			listableEvent: atts.type === 'Avveniment',
			listablePodcast: atts.type === 'Poddata',
			listableTerm: atts.type === 'Terminu',
			mainTitle,
			metaTitle: displayTitle,
			moreToCome: atts.moreToCome,
			newsletterStyle: atts.type === 'Djarju' ? 'sidebar-entry' : 'sidebar-part',
			podcastLengthMinutes: atts.podcastLengthMinutes,
			podcastDate: atts.podcastDate,
			podcastNote: atts.podcastNote,
			podcastUrl: atts.podcastUrl,
			postscript: atts.postscript,
			prominentMentions: atts.prominentMentions,
			promoImage: atts.promoImage.data,
			promoImageMobile: atts.promoImageMobile.data,
			publicationHistory: atts.publicationHistory,
			reads: getReads(authorPronoun),
			sequence: sequenceData && sequenceData.attributes.title,
			sequenceEpisodeNumber: atts.sequenceEpisodeNumber,
			sequenceEpisodes: sequenceEpisodes,
			sequenceEpisodeTitle: sequenceData && atts.title,
			sequenceId: sequenceData && sequenceData.id,
			sequencePreviousPromo,
			sequenceNextPromo,
			sequenceSlug,
			showImagePromo: atts.showImagePromo,
			singleImage: atts.images.data && atts.images.data.length === 1,
			slideshow:  atts.images.data && atts.images.data.length > 1,
			slug: pageSlug,
			snippets,
			socialImage: promoImageFormats.social && `${ promoImageFormats.social.hash }${ promoImageFormats.social.ext }`,
			socialImageAlt: promoImageFormats.social && atts.promoImage.data.attributes.alternativeText,
			socialImageFormats: promoImageFormats,
			sortTitle: makeSortableTitle(title + atts.sequenceEpisodeNumber),
			storycollections,
			subjectDate: atts.diaryDate,
			subtitle,
			title: mainTitle,
			translator: translatorFullName,
			translatorForename: (translator && translator.forename) || translatorFullName,
			triggerWarning: atts.triggerWarning,
			type: atts.type,
			updatedAt: atts.updatedAt,
			useDefaultPodcastMessage: !!atts.useDefaultPodcastMessage,
			useProseStyling: !!atts.useProseStyling,
			useSeparators: !!atts.useSeparators,
			useSquareOnMobile: !!atts.useSquareOnMobile,
			vocabulary,
			wordcount,
		};

		const reportingTitle = fixReportingTitle(processedStory);
		processedStory.reportingTitle = reportingTitle;

		// FIXME: This should be handled by Nunjuck's striptags, but it doesn't work
		processedStory.descriptionStripped = stripTags(processedStory.description);
		const normalisedBodyTextForAbecedaire = atts.body.replace(/blockquote/g, "p").replace(/<h\d>.*?<\/h\d>/g, "").replace(/strong>/g, "span>").replace(/ /gm, " ");

		// ABECEDAIRE  ENTRIES FROM THIS STORY ***********************************************************************************************
		if (atts.type !== 'Poezija' && atts.type !== 'Poddata' && atts.type !== 'Djarju' && atts.type !== 'Terminu' && !atts.dontUseDropCaps) {
			const abecedaireMatches = normalisedBodyTextForAbecedaire.replace(/\n+/g, '').matchAll(/(^<p>\s*|<p>\#<\/p>\s*<p>)\s*(.)(.)(.{0,600})/g);
			abecedaireMatches && shuffleArray(Array.from(abecedaireMatches)).forEach(match => {
				let snippet = match[2] + match[3] + match[4];
				let digraph = (match[2] + match[3]).toLowerCase();
				snippet = snippet.replace(/<em>\w*$/g, "").replace(/<em>\s*<\/em>/g, "").replace(/<p>\s*<\/p>/g, "").replace(/<\/p>\s*<p>/gm, " ").replace(/<\/p>\s*<p class="\w*">/gm, " ").replace(/<\/p>/gm, " ").replace(/<p>/gm, " ").replace(/  /gm, " ").replace(/<\/?\w*$/, "");
				//FIXME: Regularise <em> and <i>
				if ((snippet.match(/<i>/g) || []).length > (snippet.match(/<\/i>/g) || []).length) snippet += '</i>';
				if ((snippet.match(/<em>/g) || []).length > (snippet.match(/<\/em>/g) || []).length) snippet += '</em>';
				abecedaireArray.push({
					authorsString,
					letter: makeSortableTitle(digraph === 'ie' || digraph === 'għ' ? digraph : match[2]).toLowerCase(),
					issueMonth,
					issueMonthYear,
					slug: pageSlug,
					reportingTitle,
					snippet,
					title: mainTitle,
					sequenceEpisodeNumber: processedStory.sequenceEpisodeNumber,
					sequenceEpisodeTitle: processedStory.sequenceEpisodeTitle,
					subjectDate: atts.diaryDate,
					titleTruncated: smartTruncate(processedStory.reportingTitle, 26),
					translator: translatorFullName,
				});
			});
		}

		// const normalisedBodyTextForAlmanac = atts.body.replace(/blockquote/g, "p").replace(/strong>|h\d>/g, "span>").replace(/ /gm, " ");
		const normalisedBodyTextForAlmanac = stripTags(atts.body);

		// ALMANAC *************************************************************************************************************************
		// if (atts.type !== 'Poezija' && atts.type !== 'Poddata' && atts.type !== 'Djarju' && atts.type !== 'Terminu' && !atts.dontUseDropCaps) {
		let almanacMatches = normalisedBodyTextForAlmanac.replaceAll(/\n+/g, '').matchAll(/(\b[\wċħżġĊĦŻĠ]*?.{0,100})(<h6.*?>)?(\d+)( ta’ | ta\' )?(Jannar|Frar|Marzu|April|Mejju|.unju|Lulju|Awwissu|Settembru|Ottubru|Novembru|Di.embru)( )?(tal\-)?(\d\d\d\d)?(<\/h6>)?(.{0,100})[\wċħżġĊĦŻĠ]*?\b/gmi);
		// add dates
			almanacMatches && shuffleArray(Array.from(almanacMatches)).forEach(match => {
			const thisDate = `${ match[3] } ta’ ${ match[5] }`;
				let snippet = '… ' + match[0].replace(/<[^\>]*?>/gi, "").replace(thisDate, ` <mark class="date">${ thisDate }</mark> `).replace(/  /gm, " ").trim() + ' …';

				//
				// #:~:text={{ story.day + ' ta’ ' + story.month | urlencode }}
				// Diary #21-ta-april-2024

			almanacArray.push({
					authors,
					authorsType,
					day: match[3],
					month: match[5],
					year: match[8],
					mainTitle,
					issueMonth,
					slug: pageSlug,
					snippet,
					reportingTitle,
					sequenceEpisodeNumber: processedStory.sequenceEpisodeNumber,
					sequenceEpisodeTitle: processedStory.sequenceEpisodeTitle,
					title: processedStory.reportingTitle,
					truncatedTitle: smartTruncate(processedStory.reportingTitle, 26),
					type: processedStory.type,
					wordcount,
				});
			});
		//  }

		const audioUrls = [];
		const audioPlayers = [];
		if (atts.podcastUrl) {
			audioUrls.push({
				author: processedStory.authorsString,
				storyId: story.id,
				issueMonth: processedStory.issueMonth,
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
				issueMonth: processedStory.issueMonth,
				podcastLengthMinutes: processedStory.podcastLengthMinutes,
				podcastNote: processedStory.type !== "Poddata" && processedStory.podcastNote,
				reads: getReads(processedStory.authorPronoun),
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
				if (!promo) return;
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
					issueMonth: promo.issueMonth,
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
					issueMonth: promo.issueMonth,
					putAfterThisText: promo.putAfterThisText,
					reads: getReads(promo.authorPronoun),
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

	// const cumulativeVocabulary = getWordFrequency(cumulativeBody);
	// storiesFormatted[0].cumulativeVocabulary = cumulativeVocabulary;
	storiesFormatted[0].cumulativeVocabulary = findUniqueWords(cumulativeBody);
	storiesFormatted[0].cumulativeWordcount = splitText(cumulativeBody).length;

	// QUOTAS ********************************************************************************

	const pronounWordCounter = { hi: 0, hu: 0, hi_hu: 0, huma: 0, };
	storiesFormatted.forEach(story => {
		if (story.type !== 'Poddata' && story.authorsType === 'solo') {
			//  && story.authorsString !== 'Omar N’Shea'
			pronounWordCounter[story.authorPronoun] += story.wordcount;
		}
	});

	storiesFormatted[0].pronounWordsArrayString = JSON.stringify([
		['kittieba', 'pronom'],
		['hi', pronounWordCounter['hi']],
		['hu', pronounWordCounter['hu']],
		['hi/hu', pronounWordCounter['hi_hu']],
		['huma', pronounWordCounter['huma']],
	]);

	// ABECEDAIRE ********************************************************************************
	// const sortAlphaThenNumbers = (a, b) => isFinite(a.letter) - isFinite(b.letter)
	// 	|| a.letter.localeCompare(b.letter, undefined, {numeric: true, sensitivity: 'base'});

	// const shuffledAbecedaireArray = shuffleArray(abecedaireArray);

	// console.log('>>>', shuffledAbecedaireArray.length);

	// // This makes it too predictable
	// // const storyCounts = {};
	// // // Count the number of stories for each author
	// // shuffledAbecedaireArray.forEach(story => {
	// // 	const { authorsString } = story;
	// // 	storyCounts[authorsString] = (storyCounts[authorsString] || 0) + 1;
	// // });
	// // // Sort the stories array based on the count of stories for each authorsString (in descending order)
	// // // This way we privilege authors with fewer occurences
	// // shuffledAbecedaireArray.sort((a, b) => storyCounts[b.authorsString] - storyCounts[a.authorsString]);

	// storiesFormatted[0].abecedaire = [...new Map(shuffledAbecedaireArray.map(item => [item.letter, item])).values()].sort(sortAlphaThenNumbers);

	const sortAlphaThenNumbers = (a, b) =>
		isFinite(a.letter) - isFinite(b.letter) ||
		a.letter.localeCompare(b.letter, undefined, { numeric: true, sensitivity: 'base' });

	const evenlyDistributeAbecedaire = (abecedaireArray) => {
		// Group stories by author
		const storiesByAuthor = abecedaireArray.reduce((acc, story) => {
			const { authorsString } = story;
			if (!acc[authorsString]) acc[authorsString] = [];
			acc[authorsString].push(story);
			return acc;
		}, {});

		// Shuffle entries for randomness
		Object.keys(storiesByAuthor).forEach((author) => {
			storiesByAuthor[author] = shuffleArray(storiesByAuthor[author]);
		});

		const selectedStories = new Map();
		const authors = Object.keys(storiesByAuthor);
		let authorIndex = 0;

		// Determine the unique letters present in the array
		const uniqueLetters = [...new Set(abecedaireArray.map((story) => story.letter))];

		// Cycle through authors and assign one story per letter
		while (selectedStories.size < uniqueLetters.length) {
			const currentAuthor = authors[authorIndex];
			const authorStories = storiesByAuthor[currentAuthor];

			// Find a story for an unused letter
			const nextStory = authorStories.find((story) => !selectedStories.has(story.letter));
			if (nextStory) {
				selectedStories.set(nextStory.letter, nextStory);
				// Remove the used story from the author's list
				storiesByAuthor[currentAuthor] = authorStories.filter((story) => story !== nextStory);
			}

			// Move to the next author in a round-robin manner
			authorIndex = (authorIndex + 1) % authors.length;
		}

		return [...selectedStories.values()].sort(sortAlphaThenNumbers);
	};

	storiesFormatted[0].abecedaireFull = abecedaireArray.sort(sortAlphaThenNumbers);
	storiesFormatted[0].abecedaire = evenlyDistributeAbecedaire(shuffleArray(abecedaireArray));

	// ***********************************************************************************************

	// ALMANAC ********************************************************************************
	storiesFormatted[0].almanac = almanacArray;

	// HOME PROMOTIONS ********************************************************************************
	// FIXME Remove limit from Home stories
	// Automate termini
	// then make this .slice(0, 6);
	storiesFormatted[0].promotableStoriesHome = processPromos([...promotableStoriesHome].sort(() => Math.random() - 0.5).slice(0, 5));

	return storiesFormatted;
}

// export for 11ty
module.exports = getAllStories;
