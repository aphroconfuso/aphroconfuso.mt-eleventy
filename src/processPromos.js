const getMonthYear = require("../src/getMonthYear.js");
const makeTitleSlug = require("./makeTitleSlug.js");

module.exports = (promos) => {
	if (!promos) return null;
	return promos.map((promo) => {
		const promoAtts = promo.story && promo.story.data.attributes || promo.attributes;
		const author = promoAtts.authors.data.length && promoAtts.authors.data[0].attributes;
		const translator = promoAtts.translators.data.length && promoAtts.translators.data[0].attributes;
		const sequence = promoAtts.sequence.data && promoAtts.sequence.data.attributes;

		const authorFullName = !!author && (author.displayName || `${ author.forename } ${ author.surname }`);
		const translatorFullName = !!translator && (translator.displayName || `${ translator.forename } ${ translator.surname }`);
		const sequenceTitle = sequence && sequence.title;
		const computedTitle = sequenceTitle || promoAtts.title;
		const sequenceEpisodeTitle = sequence && promoAtts.title;

		return {
			author: authorFullName,
			cssClass: promoAtts.type === 'Poezija' ? 'body-text poetry' : 'body-text',
			description: promo.text || promoAtts.description,
			diaryDate: promoAtts.diaryDate,
			id: promo.id || (promo.story && promo.story.data.id),
			isSequenceEpisode: !!sequence,
			monthYear: getMonthYear(promoAtts.dateTimePublication),
			sequenceEpisodeNumber: promoAtts.sequenceEpisodeNumber,
			sequenceEpisodeTitle: sequenceEpisodeTitle,
			slug: promoAtts.pageUrl || makeTitleSlug(
				promoAtts.title,
				authorFullName,
				translatorFullName,
				sequenceTitle,
				promoAtts.sequenceEpisodeNumber,
				promoAtts.diaryDate,
				!!sequence && promoAtts.title
			),
			title: computedTitle,
			translator: translatorFullName,
			type: promoAtts.type,
		};
	});
}
