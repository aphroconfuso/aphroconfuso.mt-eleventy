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
								promos {
									text
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

	const promosFormatted = atts.promos.length && atts.promos.map((promo) => {
		const promoAtts = promo.story.data.attributes;
		const author = promoAtts.authors.data.length && promoAtts.authors.data[0].attributes;
		const translator = promoAtts.translators.data.length && promoAtts.translators.data[0].attributes;

		const authorFullName = author && `${ author.forename } ${ author.surname }`
		const translatorFullName = translator && `${ translator.forename } ${ translator.surname }`

		return {
			title: promoAtts.title,
			monthYear: getMonthYear(promoAtts.dateTimePublication),
			description: promo.text || promoAtts.description,
			author: authorFullName,
			translator: translatorFullName,
			slug: makeTitleSlug(promoAtts.title, authorFullName, translatorFullName),
			images: promoAtts.showImagePromo && promoAtts.promoImage.data && promoAtts.promoImage.data.attributes.formats,
			alternativeText: promoAtts.promoImage.data.attributes.alternativeText,
			type: promoAtts.type,
			cssClass: promoAtts.type === 'Poezija' ? 'body-text poetry' : 'body-text',
			promoType: promoAtts.type === 'Poezija' ? 'promo-poetry promo' : (promoAtts.showImagePromo && promoAtts.promoImage.data ? 'promo-picture-1 promo' : 'promo'),
		};
	});

	const homepageFormatted = {
		layout: atts.layout,
		editorial: atts.appointment.data.attributes.editorial,
		monthYear: getMonthYear(atts.appointment.data.attributes.dateTimePublication),
		promos: promosFormatted,
	};

	return homepageFormatted;
}

module.exports = getHomepage;
