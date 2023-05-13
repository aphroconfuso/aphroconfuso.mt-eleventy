const fetch = require("node-fetch");

const codes = {
	"alerbyt": "ar",
	"Catala": "ca",
	"Deutsch": "de",
	"English": "en",
	"Espanol": "es",
	"Euskara": "eu",
	"Francais": "fr",
	"Hrvatski": "hr",
	"Italiano": "it",
	"Nederlands": "nl",
	"Polski": "pl",
	"Romana": "ro",
}

async function getInternationals() {
	let internationals;
	try {
		const data = await fetch("https://cms.aphroconfuso.mt/graphql", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				query: `{
					internationalMedias {
						data {
							attributes {
								language
								title
								body
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
		internationals = response.data.internationalMedias;
	} catch (error) {
		throw new Error(error);
	}

	const internationalsFormatted = internationals.data.map((international) => {
		const atts = international.attributes;
		return {
			code: codes[atts.language],
			direction: (atts.language === 'alerbyt' ? 'rtl' : 'ltr'),
			title: atts.title,
			body: atts.body,
		};
	});
	return internationalsFormatted;
}

module.exports = getInternationals;
