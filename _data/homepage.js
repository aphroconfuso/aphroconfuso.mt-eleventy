const fetch = require("node-fetch");
const smartTruncate = require("smart-truncate");
const makeTitleSlug = require("../src/makeTitleSlug.js");
const getMonthYear = require("../src/getMonthYear.js");

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
										data {
											attributes {
												title
												description
												pageUrl
												type
												dateTimePublication
												authors {
													data {
														attributes {
															forename
															surname
														}
													}
												}
												translators {
													data {
														attributes {
															forename
															surname
														}
													}
												}
											}
										}
									}
								}
								poetryPromos(pagination: { page: 1, pageSize: 250 }) {
									mobilePriority
									text
									story {
										data {
											attributes {
												title
												description
												pageUrl
												type
												dateTimePublication
												authors {
													data {
														attributes {
															forename
															surname
														}
													}
												}
												translators {
													data {
														attributes {
															forename
															surname
														}
													}
												}
											}
										}
									}
								}
								imagePromos(pagination: { page: 1, pageSize: 250 }) {
									mobilePriority
									text
									imageCrop
									image {
										data{
											attributes {
												alternativeText
												formats
											}
										}
									}
									mobileImage {
										data{
											attributes {
												formats
											}
										}
									}
									story {
										data {
											attributes {
												title
												description
												pageUrl
												type
												dateTimePublication
												showImagePromo
												promoImage {
													data{
														attributes {
															alternativeText
															formats
														}
													}
												}
												promoImageMobile {
													data{
														attributes {
															formats
														}
													}
												}
												authors {
													data {
														attributes {
															forename
															surname
														}
													}
												}
												translators {
													data {
														attributes {
															forename
															surname
														}
													}
												}
											}
										}
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
			promo_3_wordcount: 1640,
		},
		Layout_7: {
			text: 10,
			image: 2,
			poem: 1,
			promo_1_wordcount: 165,
			promo_4_wordcount: 165,
		}
	}

	const promosFormatted = (promos, includesImages, number) => {
		const result = promos.length && promos.map((promo) => {
			const promoAtts = promo.story.data.attributes;
			const author = promoAtts.authors.data.length && promoAtts.authors.data[0].attributes;
			const translator = promoAtts.translators.data.length && promoAtts.translators.data[0].attributes;
			const authorFullName = author && `${ author.forename } ${ author.surname }`;
			const translatorFullName = translator && `${ translator.forename } ${ translator.surname }`;

			let promos = {
				mobilePriority: promo.mobilePriority || 9,
				description: promo.text || promoAtts.description,
				title: promoAtts.title,
				monthYear: getMonthYear(promoAtts.dateTimePublication),
				author: authorFullName,
				translator: translatorFullName,
				slug: promoAtts.pageUrl || makeTitleSlug(promoAtts.title, authorFullName, translatorFullName),
				type: promoAtts.type,
				cssClass: promoAtts.type === 'Poezija' ? 'body-text poetry' : 'body-text',
				promoType: promoAtts.type === 'Poezija' ? 'promo-poetry promo' : (promoAtts.showImagePromo && promoAtts.promoImage.data ? 'promo-picture-1 promo' : 'promo'),
			};

			if (includesImages) {
				const promoImageData = promo.image.data[0] || promoAtts.promoImage.data;
				promos.images = promoAtts.showImagePromo && promoImageData && promoImageData.attributes.formats,
				promos.alternativeText = promoImageData.attributes.alternativeText,
				promos.imageCrop = promo.imageCrop
			}

			return promos;
		});
		return result;
	}

	const homepageFormatted = {
		layout: atts.layout,
		editorial: atts.appointment.data.attributes.editorial,
		monthYear: getMonthYear(atts.appointment.data.attributes.dateTimePublication),
		promos: promosFormatted(atts.promos, false, layouts[atts.layout]['text']),
		imagePromos: promosFormatted(atts.imagePromos, true, layouts[atts.layout]['image']),
		poetryPromos: promosFormatted(atts.poetryPromos, false, layouts[atts.layout]['poem']),
	};

	return homepageFormatted;
}

module.exports = getHomepage;
