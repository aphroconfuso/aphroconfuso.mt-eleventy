const fetch = require("node-fetch");
const smartTruncate = require("smart-truncate");
const makeTitleSlug = require("../src/makeTitleSlug.js");
const getMonthYear = require("../src/getMonthYear.js");

const { imageData, linkedStoryData, linkedStoryDataWithImage } = require("./_fragments.js");

async function getHomepage() {
	let homepage, diaryEntries;
	const fetchStatus = process.env.NODE_ENV === 'development' ? 'PREVIEW' : 'LIVE';
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
								promos(
			            publicationState: ${ fetchStatus },
									pagination: { page: 1, pageSize: 250 }
								) {
									text
									story {
										${linkedStoryData}
									}
								}
								poetryPromos(
			            publicationState: ${ fetchStatus },
									pagination: { page: 1, pageSize: 250 }
								) {
									text
									story {
										${linkedStoryData}
									}
								}
								imagePromos(
			            publicationState: ${ fetchStatus },
									pagination: { page: 1, pageSize: 250 }
								) {
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
					diaryEntries: stories(
            publicationState: ${ fetchStatus },
						pagination: { page: 1, pageSize: 3 },
						sort: ["diaryDate:desc"],
						filters: {type: { eq: "Djarju"}}
					) {
						${linkedStoryData}
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
		diaryEntries = response.data.diaryEntries;
	} catch (error) {
		throw new Error(error);
	}

	const atts = homepage.data.attributes;
	const diaryPromos = diaryEntries;

	const layouts = {
		Layout_1: {
			diary: 1,
			image: 2,
			poem: 1,
			text: 4,
		},
		Layout_2: {
			diary: 1,
			image: 2,
			poem: 1,
			text: 5,
		},
		Layout_3: {
			diary: 1,
			image: 2,
			poem: 1,
			text: 6,
			lengths: [1740],
		},
		Layout_4: {
			diary: 1,
			image: 2,
			poem: 1,
			text: 5,
		},
		Layout_5: {
			diary: 1,
			image: 2,
			poem: 2,
			text: 5,
			lengths: [1740],
		},
		Layout_6: {
			diary: 1,
			image: 2,
			poem: 1,
			text: 9,
			lengths: [1640],
		},
		Layout_7: {
			diary: 1,
			image: 2,
			poem: 1,
			text: 10,
			lengths: [2430, 1331],
		},
		Layout_8: {
			diary: 1,
			image: 2,
			poem: 1,
			text: 5,
		},
		Layout_9: {
			diary: 1,
			image: 2,
			poem: 1,
			text: 8,
			lengths: [2150, 1300],
		},
		Layout_10: {
			diary: 1,
			image: 2,
			poem: 1,
			text: 5,
			lengths: [2150],
		},
		Layout_11: {
			diary: 2,
			image: 1,
			poem: 1,
			text: 6,
			lengths: [2150],
		},
		Layout_12: {
			diary: 2,
			image: 2,
			poem: 1,
			text: 4,
			lengths: [2150],
		},
	}

	const layoutConfig = layouts[atts.layout];

	// REFACTOR
	const promosFormatted = (promos, includesImages, number, lengths) => {
		const result = promos.length && promos.slice(0, number).map((promo, index) => {
			const storyAtts = (promo.story && promo.story.data.attributes) || promo.attributes;
			const author = storyAtts.authors.data.length && storyAtts.authors.data[0].attributes;
			const translator = storyAtts.translators.data.length && storyAtts.translators.data[0].attributes;
			const authorFullName = !!author && (author.displayName || `${ author.forename }${ author.initials ? ' ' + author.initials + ' ' : ' ' }${ author.surname }`);
			const translatorFullName = !!translator && (translator.displayName || `${ translator.forename }${ translator.initials ? ' ' + translator.initials + ' ' : ' ' }${ translator.surname }`);
			const promoSequenceData = storyAtts.sequence && storyAtts.sequence.data;
			const descriptionLength = lengths && lengths[index] || 9999;

			// REFACTOR: Save externally
			const fixReportingTitle = (formattedPromo) => {
				const { type, sequenceEpisodeNumber, author, title } = formattedPromo;
				if (type === 'Djarju') return `Djarju #${ sequenceEpisodeNumber } ${ author }`;
				if (!!sequenceEpisodeNumber) return `${ title } #${ sequenceEpisodeNumber }`;
				return title;
			}

			let formattedPromo = {
				author: authorFullName,
				cssClass: storyAtts.type === 'Poezija' ? 'body-text poetry' : 'body-text',
				description: smartTruncate(promo.text || storyAtts.description, descriptionLength),
				subjectDate: storyAtts.subjectDate,
				id: promo.story && promo.story.data.id || promo.id,
				isSequenceEpisode: !!promoSequenceData,
				mobilePriority: promo.mobilePriority || 9,
				monthYear: getMonthYear(storyAtts.dateTimePublication),
				sequenceEpisodeNumber: storyAtts.sequenceEpisodeNumber,
				sequenceEpisodeTitle: !!promoSequenceData && storyAtts.title,
				slug: storyAtts.pageUrl || makeTitleSlug(
					storyAtts.title,
					authorFullName,
					translatorFullName,
					promoSequenceData && promoSequenceData.attributes.title,
					storyAtts.sequenceEpisodeNumber,
					storyAtts.diaryDate,
					!!promoSequenceData && storyAtts.title
				),
				title: !!promoSequenceData ? promoSequenceData.attributes.title : storyAtts.title,
				translator: translatorFullName,
				type: storyAtts.type,
			};

			formattedPromo.reportingTitle = fixReportingTitle(formattedPromo);

			if (includesImages) {
				const promoImageData = promo && promo.image.data[0] || storyAtts.promoImage.data;
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
		poetryPromos: promosFormatted(atts.poetryPromos, false, layoutConfig.poem),
		promos: promosFormatted(atts.promos, false, layoutConfig.text, layoutConfig.lengths),
		diaryEntries: promosFormatted(diaryPromos.data, false, layoutConfig.diary),
	};

	return homepageFormatted;
}

module.exports = getHomepage;
