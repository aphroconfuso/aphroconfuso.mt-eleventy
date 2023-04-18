const fetch = require("node-fetch");

async function getGeneric(page) {
	console.log('>>>>>', page);
	let generic;
	try {
		const data = await fetch("https://cms.aphroconfuso.mt/graphql", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				query: `{
					${page} {
						data {
							attributes {
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
		generic = response.data[page];
	} catch (error) {
		throw new Error(error);
	}
  return generic.data.attributes;
}

module.exports = getGeneric;
