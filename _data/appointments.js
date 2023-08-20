const fetch = require("node-fetch");
const smartTruncate = require("smart-truncate");
const stripTags = require("striptags");
const makeTitleSlug = require("../src/makeTitleSlug.js");
const getMonthYear = require("../src/getMonthYear.js");

async function getAllAppointments() {
  let appointmentsData;
	try {
		const data = await fetch("https://cms.aphroconfuso.mt/graphql", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				query: `{
					appointmentIndex {
						data {
							attributes {
								title
								body
							}
						}
					}
					appointments(sort: "dateTimePublication:desc") {
						data {
							attributes {
								dateTimePublication
								editorial
								moreToCome
								stories(sort: "dateTimePublication:desc") {
									data {
										attributes {
											title
											dateTimePublication
											description
											pageUrl
											type
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
				}`,
			}),
		});
		const response = await data.json();
		if (response.errors) {
			let errors = response.errors;
			errors.map((error) => {
				console.log(error.message);
			});
			throw new Error("Houston... We have a CMS problem");
		}
		appointmentsData = response.data;
	} catch (error) {
		throw new Error(error);
	}

	const appointments = appointmentsData.appointments.data.map((appointment) => {
		const storiesFormatted = !!appointment.attributes.stories.data.length && appointment.attributes.stories.data.map((storyAuthored) => {

			const author = storyAuthored.attributes.authors.data.length && storyAuthored.attributes.authors.data[0].attributes;
			const translator = storyAuthored.attributes.translators.data.length && storyAuthored.attributes.translators.data[0].attributes;
			const authorFullName = author && `${author.forename} ${author.surname}`
			const translatorFullName = translator && `${ translator.forename } ${ translator.surname }`

			return {
				title: storyAuthored.attributes.title,
				slug: storyAuthored.attributes.pageUrl || makeTitleSlug(storyAuthored.attributes.title, authorFullName, translatorFullName),
				monthYear: getMonthYear(storyAuthored.attributes.dateTimePublication),
				description: storyAuthored.attributes.description,
				author: authorFullName,
				translator: translatorFullName,
				type: storyAuthored.attributes.type,
				cssClass: storyAuthored.attributes.type === 'Poezija' ? 'body-text poetry' : 'body-text',
			};
		});

		return {
			title: appointment.attributes.title || null,
			editorial: appointment.attributes.editorial,
			moreToCome: appointment.attributes.moreToCome,
			monthYear: getMonthYear(appointment.attributes.dateTimePublication),
			stories: storiesFormatted
		}
	});

  return appointments;
}

module.exports = getAllAppointments;
