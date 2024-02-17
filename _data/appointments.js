const fetch = require("node-fetch");
const getMonthYear = require("../src/getMonthYear.js");
const processPromos = require("../src/processPromos.js");

const {linkedStoryData} = require("./_fragments.js");

async function getAllAppointments() {
	const fetchStatus = process.env.NODE_ENV === 'development' ? 'PREVIEW' : 'LIVE';
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
					appointments(
            publicationState: ${ fetchStatus },
						pagination: { page: 1, pageSize: 250 },
						sort: "dateTimePublication:desc"
						) {
						data {
							attributes {
								moreToCome
								editorial
								dateTimePublication
								stories(sort: "dateTimePublication:asc") {
									${linkedStoryData}
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
		appointmentsData = response.data.appointments.data;
	} catch (error) {
		throw new Error(error);
	}

	const appointments = appointmentsData.map((appointment) => {
		const storiesFormatted = !!appointment.attributes.stories.data.length && processPromos(appointment.attributes.stories.data);

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
