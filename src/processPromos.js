const fixAuthorsType = require("./fixAuthorsType.js");
const getIssueMonthYear = require("./getIssueMonthYear.js");
const makeTitleSlug = require("./makeTitleSlug.js");
const parseAuthors = require("./parseAuthors.js");
const processCollections = require("./processCollections.js");
const stripTags = require("striptags");
const getReads = require('./getReads.js');

// REFACTOR: Save externally
const fixReportingTitle = (processedPromo) => {
	const { type, sequenceEpisodeNumber, author, title } = processedPromo;
	if (type === 'Djarju') return `Djarju #${ sequenceEpisodeNumber } ${ author }`;
	if (!!sequenceEpisodeNumber) return `${ title } #${ sequenceEpisodeNumber }`;
	return title;
}

module.exports = (promos, storyAtts) => {
	if (!promos) return null;
	return promos.map((promo) => {
		// If this is ad hoc audio, we use the containing story for meta data
		var promoAtts = storyAtts || promo.story && promo.story.data && promo.story.data.attributes || promo.attributes;
		if (!promoAtts) {
			return null;
		}
		const authorsType = fixAuthorsType(promoAtts.authorsType);
		const { author, authors, authorsString, authorPronoun, authorForename, authorSurname } = promoAtts.authors.data.length && parseAuthors(promoAtts.authors.data, authorsType);
		const translator = promoAtts.translators.data.length && promoAtts.translators.data[0].attributes;
		const sequence = promoAtts.sequence.data && promoAtts.sequence.data.attributes;
		const translatorFullName = !!translator && (translator.displayName || `${ translator.forename } ${ translator.surname }`);
		const sequenceTitle = sequence && sequence.title;
		const title = sequenceTitle || promoAtts.title;
		const sequenceEpisodeTitle = sequence && promoAtts.title;

		// REFACTOR: rationalise titles mainTitle, subtitle, metaTitle, displayTitle, reportingTitle, fixPodcastTitle
		let [mainTitle, subtitle] = title.split(/(?<!:):(?!:)/);
		mainTitle = mainTitle.replace(/:: /, ": ");

		const storycollections = promoAtts.collections && processCollections(promoAtts.collections.data);

		const processedPromo = {
			audioHighlight: promo.highlight,
			audioLengthMinutes: promo.audioLengthMinutes,
			audioNote: promo.note,
			audioUrl: promo.audioUrl || promo.story && promo.story.data && promo.story.data.attributes.podcastUrl,
			author,
			authorForename,
			authorPronoun,
			authors,
			authorsString,
			authorsType,
			authorSurname,
			collaboration: authors && authors.length > 1,
			cssClass: promoAtts.type === 'Poezija' ? 'body-text poetry' : 'body-text',
			dateTimePublication: promoAtts.dateTimePublication,
			description: stripTags(promo.text || promoAtts.description),
			downloads: promo.downloads && promo.downloads.data && promo.downloads.data.map((download) => {
				const downloadAtts = download.attributes;
				return {
					mime: downloadAtts.mime,
					name: downloadAtts.name,
					size: downloadAtts.size && parseInt(downloadAtts.size / 1024, 10),
					url: downloadAtts.url,
				};
			}),
			id: promo.id || (promo.story && promo.story.data.id),
			isSequenceEpisode: !!sequence,
			issueMonth: getIssueMonthYear(promoAtts.dateTimePublication).month,
			issueMonthYear: getIssueMonthYear(promoAtts.dateTimePublication).monthYear,
			mainTitle,
			note: promo.note,
			podcastLengthMinutes: promoAtts.podcastLengthMinutes,
			podcastNote: promoAtts.podcastNote,
			podcastUrl: promoAtts.podcastUrl,
			promoImageMobile: promoAtts.promoImageMobile && promoAtts.promoImageMobile.data,
			putAfterThisText: promo.putAfterThisText,
			rawText: promo.text,
			reads: getReads(authorPronoun),
			sequenceEpisodeNumber: promoAtts.sequenceEpisodeNumber,
			sequenceEpisodeTitle: sequenceEpisodeTitle,
			sequenceId: promoAtts.sequence.data && promoAtts.sequence.data.id,
			subjectDate: promoAtts.diaryDate,
			slug: promoAtts.pageUrl || makeTitleSlug(
				promoAtts.title,
				authorsString,
				translatorFullName,
				sequenceTitle,
				promoAtts.sequenceEpisodeNumber,
				promoAtts.diaryDate,
				!!sequence && promoAtts.title,
				promoAtts.type
			),
			storycollections,
			subtitle,
			text: promo.text && stripTags(promo.text),
			title,
			translator: translatorFullName,
			translatorForename: (translator && translator.forename) || translatorFullName,
			translatorPronoun: (translator && translator.pronoun) || 'huma',
			type: promoAtts.type,
			useDefaultPodcastMessage: promoAtts.useDefaultPodcastMessage,
		};

		processedPromo.reportingTitle = fixReportingTitle(processedPromo);

		return processedPromo;
	});
}
