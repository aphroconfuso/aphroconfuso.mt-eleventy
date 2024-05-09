const fixAuthorsType = require("./fixAuthorsType.js");
const getIssueMonthYear = require("./getIssueMonthYear.js");
const makeTitleSlug = require("./makeTitleSlug.js");
const parseAuthors = require("./parseAuthors.js");
const processCollections = require("./processCollections.js");
const reads = require("./getReads.js");

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
		const { author, authors, authorsString, authorPronoun, authorForename } = promoAtts.authors.data.length && parseAuthors(promoAtts.authors.data, authorsType);
		const translator = promoAtts.translators.data.length && promoAtts.translators.data[0].attributes;
		const sequence = promoAtts.sequence.data && promoAtts.sequence.data.attributes;
		const translatorFullName = !!translator && (translator.displayName || `${ translator.forename } ${ translator.surname }`);
		const sequenceTitle = sequence && sequence.title;
		const title = sequenceTitle || promoAtts.title;
		const sequenceEpisodeTitle = sequence && promoAtts.title;
		const [mainTitle, subtitle] = title.split(": ");

		const storycollections = promoAtts.collections && processCollections(promoAtts.collections.data);

		const processedPromo = {
			audioNote: promo.note,
			audioHighlight: promo.highlight,
			audioLengthMinutes: promo.audioLengthMinutes,
			audioUrl: promo.audioUrl || promo.story && promo.story.data && promo.story.data.attributes.podcastUrl,
			authorsType,
			author,
			authors,
			authorForename,
			authorPronoun,
			authorsString,
			cssClass: promoAtts.type === 'Poezija' ? 'body-text poetry' : 'body-text',
			description: promo.text || promoAtts.description,
			subjectDate: promoAtts.diaryDate,
			id: promo.id || (promo.story && promo.story.data.id),
			isSequenceEpisode: !!sequence,
			mainTitle,
			issueMonth: getIssueMonthYear(promoAtts.dateTimePublication).month,
			issueMonthYear: getIssueMonthYear(promoAtts.dateTimePublication).monthYear,
			note: promo.note,
			podcastLengthMinutes: promoAtts.podcastLengthMinutes,
			podcastNote: promoAtts.podcastNote,
			podcastUrl: promoAtts.podcastUrl,
			putAfterThisText: promo.putAfterThisText,
			reads: reads(authorPronoun),
			sequenceEpisodeNumber: promoAtts.sequenceEpisodeNumber,
			sequenceEpisodeTitle: sequenceEpisodeTitle,
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
