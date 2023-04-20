const fetch = require("node-fetch");
const smartTruncate = require("smart-truncate");
const stripTags = require("striptags");
const slugifyMaltese = require("../src/slugifyMaltese.js");
const makeTitleSlug = require("../src/makeTitleSlug.js");

const getMonthYear = (date) => {
	const newDate = new Date(date);
	const year = newDate.getFullYear();
	const monthNumber = newDate.getMonth();
	const monthsMaltese = ['Jannar', 'Frar', 'Marzu', 'April', 'Mejju', 'Ġunju', 'Lulju', 'Awwissu', 'Settembru', 'Ottubru', 'Novembru', 'Diċembru'];
	const month = monthsMaltese[monthNumber];
	return `${month} ${year}`
}


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
					appointments(sort: "term:asc") {
						data {
							attributes {
								dateTimePublication
								issueMonth
								issueYear
								editorial
								stories {
									data {
										id
										attributes {
											title
											description
											pageUrl
											issueMonth
											issueYear
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

	// console.log(JSON.stringify(appointmentsData));

	const appointmentIndex = appointmentsData.appointmentIndex.data.attributes;
	const appointments = appointmentsData.appointments.data.map((appointment) => {
		const storiesFormatted = !!appointment.attributes.stories.data.length && appointment.attributes.stories.data.map((storyAuthored) => {

			const author = storyAuthored.attributes.authors.data.length && storyAuthored.attributes.authors.data[0].attributes;
			const translator = storyAuthored.attributes.translators.data.length && storyAuthored.attributes.translators.data[0].attributes;
			const authorFullName = author && `${author.forename} ${author.surname}`
			const translatorFullName = translator && `${ translator.forename } ${ translator.surname }`

			return {
				title: storyAuthored.attributes.title,
				slug: makeTitleSlug(storyAuthored.attributes.title, authorFullName, translatorFullName),
				monthYear: getMonthYear(appointment.attributes.dateTimePublication),
				description: storyAuthored.attributes.description,
			};
		});

		return {
			title: appointment.attributes.title || null,
			editorial: appointment.attributes.editorial,
			monthYear: getMonthYear(appointment.attributes.dateTimePublication),
			stories: storiesFormatted
		}
	});

	console.log(appointments);

	// const appointmentsFormatted = {
	// 	title: appointmentIndex.title,
	// 	body: appointmentIndex.body,
	// 	appointments: appointments
	// };

  return appointments;
}

module.exports = getAllAppointments;
