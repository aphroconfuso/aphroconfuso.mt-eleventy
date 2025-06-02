const cachedPostFetch = require('../src/cachedPostFetch');
const { linkedStoryDataWithImage } = require("./_fragments.js");

const processPromos = require("../src/processPromos.js");
const makeTitleSlug = require("../src/makeTitleSlug.js");
const parseAuthors = require("../src/parseAuthors.js");

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
	const fetchStatus = process.env.NODE_ENV === 'development' ? 'PREVIEW' : 'LIVE';
	let internationals;
	try {
		const data = await cachedPostFetch("https://cms.aphroconfuso.mt/graphql", {
			body: JSON.stringify({
				query: `{
					internationalMedias(
            publicationState: ${ fetchStatus },
					) {
						data {
							attributes {
								language
								title
								body
								summaries {
									text
									title
									story {
										${ linkedStoryDataWithImage }
									}
									downloads {
										data {
											attributes {
												mime
												name
												size
												url
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
		const response = await data;

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
			body: atts.body,
			code: codes[atts.language],
			direction: (atts.language === 'alerbyt' ? 'rtl' : 'ltr'),
			title: atts.title,
			summaries: atts.summaries && processPromos(atts.summaries),
		}
	});

	return internationalsFormatted;
}

module.exports = getInternationals;
