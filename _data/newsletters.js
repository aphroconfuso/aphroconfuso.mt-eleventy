const cachedPostFetch = require('../src/cachedPostFetch.js');
const smartTruncate = require("smart-truncate");
const getIssueMonthYear = require("../src/getIssueMonthYear.js");
const makeTitleSlug = require("../src/makeTitleSlug.js");
const parseAuthors = require("../src/parseAuthors.js");
const stripTags = require("striptags");

const { imageData, linkedStoryData, linkedStoryDataWithImage } = require("./_fragments.js");

async function getNewsletters() {
	let newsletters;
	const fetchStatus = process.env.NODE_ENV === 'development' ? 'PREVIEW' : 'LIVE';
	try {
		const data = await cachedPostFetch("https://cms.aphroconfuso.mt/graphql", {
			body: JSON.stringify({
				query: `{
					newsletters {
						data {
							attributes {
								date
								key
								image {
									${imageData}
								}
								imageLink
								subject
								promos(pagination: { page: 1, pageSize: 12 }) {
									title
									subtitle
									linkText
									story {
										${linkedStoryDataWithImage}
									}
								}
							}
						}
					}
				}`
			}),
		});
		const response = await data;

		if (response.errors) {
			let errors = response.errors;
			errors.map((error) => {
				console.log(error.message);
			});
			throw new Error("Problem fetching data at newsletters.js");
		}
		newsletters = response.data.newsletters;
	} catch (error) {
		throw new Error(error);
	}

	const newslettersData = newsletters.data;

	// REFACTOR ... use processPromos?
	const promosFormatted = (promos, includesImages, number, lengths) => {
		const result = promos.length && promos.slice(0, number).map((promo, index) => {
			if (!promo.story.data) {
				const { title, subtitle, linkText } = promo;
				return {title, subtitle, linkText};
			}
			const storyAtts = promo.story && promo.story.data.attributes;
			console.log('000', JSON.stringify(promo.story.data));
			const authorsType = storyAtts.authorsType && storyAtts.authorsType.replace(/\_.*/, '') || 'solo';
			const { authors, authorsString } = storyAtts.authors.data.length && parseAuthors(storyAtts.authors.data, authorsType);
			const translator = storyAtts.translators.data.length && storyAtts.translators.data[0].attributes;
			const translatorFullName = !!translator && (translator.displayName || `${ translator.forename }${ translator.initials ? ' ' + translator.initials + ' ' : ' ' }${ translator.surname }`);
			const promoSequenceData = storyAtts.sequence && storyAtts.sequence.data;
			const descriptionLength = lengths && lengths[index] || 9999;
			const title = !!promoSequenceData ? promoSequenceData.attributes.title : storyAtts.title;

			// REFACTOR: rationalise titles mainTitle, subtitle, metaTitle, displayTitle, reportingTitle, fixPodcastTitle
			let [mainTitle, subtitle] = title.split(/(?<!:):(?!:)/);
			mainTitle = mainTitle.replace(/:: /, ": ");

			// REFACTOR: Save externally
			const fixReportingTitle = (formattedPromo) => {
				const { type, sequenceEpisodeNumber, author, title } = formattedPromo;
				if (type === 'Djarju') return `Djarju #${ sequenceEpisodeNumber } ${ author }`;
				if (!!sequenceEpisodeNumber) return `${ title } #${ sequenceEpisodeNumber }`;
				return title;
			}
			let formattedPromo = {
				authorsType,
				authorsString,
				authors,
				bookOrderable: storyAtts.isBook?.bookOrderable,
				blurbLines: promo.blurbLines,
				collections: storyAtts.collections && storyAtts.collections.data.map(collection => { return { id: collection.id, title: collection.attributes.title }}),
				cssClass: storyAtts.type === 'Poezija' ? 'body-text poetry' : 'body-text',
				description: smartTruncate(promo.text || storyAtts.description, descriptionLength),
				subjectDate: storyAtts.diaryDate,
				id: promo.story && promo.story.data.id || promo.id,
				isSequenceEpisode: !!promoSequenceData,
				mainTitle,
				isTypeTerm: storyAtts.type === 'Terminu',
				issueMonth: getIssueMonthYear(storyAtts.dateTimePublication).month,
				issueMonthYear: getIssueMonthYear(storyAtts.dateTimePublication).monthYear,
				sequenceEpisodeNumber: storyAtts.sequenceEpisodeNumber,
				sequenceEpisodeTitle: !!promoSequenceData && storyAtts.title,


				slug: storyAtts.pageUrl || makeTitleSlug(
					storyAtts.title,
					authorsString,
					translatorFullName,
					promoSequenceData && promoSequenceData.attributes.title,
					storyAtts.sequenceEpisodeNumber,
					storyAtts.diaryDate,
					!!promoSequenceData && storyAtts.title,
					storyAtts.type
				),
				subtitle: promo.subtitle || authorsString,
				title,
				linkText: promo.linkText || smartTruncate(promo.text || storyAtts.description, descriptionLength),
				translator: translatorFullName,
				type: storyAtts.type,
			};

			formattedPromo.reportingTitle = fixReportingTitle(formattedPromo);

			if (includesImages && index === 0) {
				const promoImageData = storyAtts && storyAtts.promoImage.data;
				formattedPromo.image = promoImageData && promoImageData.attributes.formats.newsletter;
			}

			return formattedPromo;
		});
		return result;
	}

const newslettersFormatted = newslettersData.map((newsletter) => {
		const {date, image, imageLink, subject, promos, key} = newsletter.attributes;

	const usePromos = promosFormatted(promos, true, 99);

	const useImage = image && image.data && image.data.attributes.formats.newsletter || usePromos[0].image;

	const useImageLink = imageLink || 'https://aphroconfuso.mt/' + usePromos[0].slug + '/';

	// console.log('111', promos);
		return {
			date,
			image: useImage,
			imageLink: useImageLink,
			subject,
			key,
			promos: usePromos,
		}
	});
	// console.log('222', JSON.stringify(newslettersFormatted));
	return newslettersFormatted;
}

module.exports = getNewsletters;
