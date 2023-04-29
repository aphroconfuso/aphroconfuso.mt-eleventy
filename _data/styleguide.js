const fetch = require("node-fetch");

async function getStyleGuide() {
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
					styleGuideEntries(sort: "term:asc", pagination: { page: 1, pageSize: 250 }) {
						data {
							attributes {
								term
								definition
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
	const styleGuideEntries = styleguideData.styleGuideEntries.data;

	return {
		title: styleGuide.title,
		body: styleGuide.body,
		entries: styleGuideEntries,
	};
}

module.exports = getStyleGuide;
