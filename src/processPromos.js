const getMonthYear = require("../src/getMonthYear.js");
const makeTitleSlug = require("./makeTitleSlug.js");

module.exports = (promos, from) => {
	return promos.map((promo) => {
		const promoAtts = promo.story && promo.story.data.attributes || promo.attributes;
		const author = promoAtts.authors.data.length && promoAtts.authors.data[0].attributes;
		const translator = promoAtts.translators.data.length && promoAtts.translators.data[0].attributes;
		const sequence = promoAtts.sequence.data && promoAtts.sequence.data.attributes;

		const authorFullName = author && `${ author.forename } ${ author.surname }`;
		const translatorFullName = translator && `${ translator.forename } ${ translator.surname }`;
		const sequenceTitle = sequence && sequence.title;
		const computedTitle = sequenceTitle || promoAtts.title;
		const sequenceEpisodeTitle = sequence && promoAtts.title;

		return {
			author: authorFullName,
			cssClass: promoAtts.type === 'Poezija' ? 'body-text poetry' : 'body-text',
			description: promo.text || promoAtts.description,
			isSequenceEpisode: !!sequence,
			monthYear: getMonthYear(promoAtts.dateTimePublication),
			sequenceEpisodeNumber: 1,
			sequenceEpisodeTitle: sequenceEpisodeTitle,
			slug: promoAtts.pageUrl || makeTitleSlug(computedTitle, authorFullName, translatorFullName, sequenceTitle, 1, sequenceEpisodeTitle),
			title: computedTitle,
			translator: translatorFullName,
			type: promoAtts.type,
		};
	});
}
