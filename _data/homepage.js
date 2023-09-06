const fetch = require("node-fetch");
const smartTruncate = require("smart-truncate");
const makeTitleSlug = require("../src/makeTitleSlug.js");
const getMonthYear = require("../src/getMonthYear.js");

const { imageData, linkedStoryData, linkedStoryDataWithImage } = require("./_fragments.js");

async function getHomepage() {
	let homepage;
	try {
		const data = await fetch("https://cms.aphroconfuso.mt/graphql", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				query: `{
					homepage {
						data {
							attributes {
								layout
                appointment {
                  data {
                    attributes {
											dateTimePublication
											editorial
                    }
                  }
                }
								promos(pagination: { page: 1, pageSize: 250 }) {
									text
									story {
										${linkedStoryData}
									}
								}
								poetryPromos(pagination: { page: 1, pageSize: 250 }) {
									text
									story {
										${linkedStoryData}
									}
								}
								imagePromos(pagination: { page: 1, pageSize: 250 }) {
									text
									imageCrop
									image {
										${imageData}
									}
									mobileImage {
										${imageData}
									}
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
		const response = await data.json();

		if (response.errors) {
			let errors = response.errors;
			errors.map((error) => {
				console.log(error.message);
			});
			throw new Error("Problem fetching data at homepage.js");
		}
		homepage = response.data.homepage;
	} catch (error) {
		throw new Error(error);
	}

	const atts = homepage.data.attributes;

	const layouts = {
		Layout_6: {
			text: 9,
			image: 2,
			poem: 1,
			promo_3_characters: 1640,
		},
		Layout_7: {
			text: 10,
			image: 2,
			poem: 1,
			promo_1_characters: 2430,
			promo_4_characters: 1331,
		},
		Layout_8: {
			text: 5,
			image: 2,
			poem: 1,
			promo_1_characters: 165,
			promo_4_characters: 165,
		}
	}

	const layoutConfig = layouts[atts.layout];

	const promosFormatted = (promos, includesImages, number) => {
		const result = promos.length && promos.slice(0, number).map((promo) => {
			const storyAtts = promo.story.data.attributes;
			const author = storyAtts.authors.data.length && storyAtts.authors.data[0].attributes;
			const translator = storyAtts.translators.data.length && storyAtts.translators.data[0].attributes;
			const authorFullName = !!author && (author.displayName || `${ author.forename } ${ author.surname }`);
			const translatorFullName = !!translator && (translator.displayName || `${ translator.forename } ${ translator.surname }`);
			const promoSequenceData = storyAtts.sequence && storyAtts.sequence.data;

			let formattedPromo = {
				author: authorFullName,
				cssClass: storyAtts.type === 'Poezija' ? 'body-text poetry' : 'body-text',
				description: promo.text || storyAtts.description,
				isSequenceEpisode: !!promoSequenceData,
				mobilePriority: promo.mobilePriority || 9,
				monthYear: getMonthYear(storyAtts.dateTimePublication),
				promoType: storyAtts.type === 'Poezija' ? 'promo-poetry promo' : (storyAtts.showImagePromo && storyAtts.promoImage.data ? 'promo-picture-1 promo' : 'promo'),
				sequenceEpisodeNumber: 1,
				sequenceEpisodeTitle: promoSequenceData && promoSequenceData.attributes.title,
				slug: storyAtts.pageUrl || makeTitleSlug(storyAtts.title, authorFullName, translatorFullName, promoSequenceData && promoSequenceData.attributes.title, 1),
				title: promoSequenceData && promoSequenceData.attributes.title || storyAtts.title,
				translator: translatorFullName,
				type: storyAtts.type,
			};

			if (includesImages) {
				const promoImageData = promo.image.data[0] || storyAtts.promoImage.data;
				const promoImageMobileData = promo.imageMobile && promo.imageMobile.data[0] || storyAtts.promoImageMobile.data;
				formattedPromo.image = storyAtts.showImagePromo && promoImageData && promoImageData.attributes.formats,
				formattedPromo.imageMobile = storyAtts.showImagePromo && promoImageMobileData && promoImageMobileData.attributes.formats,
				formattedPromo.imageCrop = promo.imageCrop,
				formattedPromo.alternativeText = promoImageData.attributes.alternativeText
			}

			return formattedPromo;
		});
		return result;
	}

	const homepageFormatted = {
		editorial: atts.appointment.data.attributes.editorial,
		imagePromos: promosFormatted(atts.imagePromos, true, layoutConfig['image']),
		layout: atts.layout,
		monthYear: getMonthYear(atts.appointment.data.attributes.dateTimePublication),
		poetryPromos: promosFormatted(atts.poetryPromos, false, layoutConfig['poem']),
		promos: promosFormatted(atts.promos, false, layoutConfig['text']),
	};

	return homepageFormatted;
}

module.exports = getHomepage;
