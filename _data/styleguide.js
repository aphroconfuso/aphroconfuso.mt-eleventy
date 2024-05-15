const fetch = require("node-fetch");

async function getStyleGuide() {
	const fetchStatus = process.env.NODE_ENV === 'development' ? 'PREVIEW' : 'LIVE';
	let styleguideData;
	try {
		const data = await fetch("https://cms.aphroconfuso.mt/graphql", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				query: `{
					styleGuide {
						data {
							attributes {
								title
								body
							}
						}
					}
					styleGuideEntries(
            publicationState: ${ fetchStatus },
						sort: "term:asc",
						pagination: { page: 1, pageSize: 250 }
						) {
						data {
							attributes {
								term
								definition
								notWords
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
		styleguideData = response.data;
	} catch (error) {
		throw new Error(error);
	}

	const styleGuide = styleguideData.styleGuide.data.attributes;
	const styleGuideEntries = styleguideData.styleGuideEntries.data.sort((a, b) => {
		const preparedA = a.attributes.term.toLowerCase().replace(/^il-/g, '').replace(/ċ/, 'c').replace(/ġ/g, 'g').replace(/ħ/g, 'h');
		const preparedB = b.attributes.term.toLowerCase().replace(/^il-/g, '').replace(/ċ/, 'c').replace(/ġ/g, 'g').replace(/ħ/g, 'h');
		return preparedA > preparedB ? 1 : ((preparedB > preparedA) ? -1 : 0);
	});
 	styleGuideEntries.forEach((entry) => entry.notWords = entry.attributes.notWords && entry.attributes.notWords.split(/\s*\,\s*/));

	return {
		title: styleGuide.title,
		body: styleGuide.body,
		entries: styleGuideEntries,
	};
}

module.exports = getStyleGuide;
