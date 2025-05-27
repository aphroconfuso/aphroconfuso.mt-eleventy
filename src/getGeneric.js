const cachedPostFetch = require('../src/cachedPostFetch');

async function getGeneric(page) {
	const fetchStatus = process.env.NODE_ENV === 'development' ? 'PREVIEW' : 'LIVE';
	let generic;
	try {
		const data = await cachedPostFetch("https://cms.aphroconfuso.mt/graphql", {
			body: JSON.stringify({
				query: `{
					${page} (
            publicationState: ${ fetchStatus },
					) {
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
		const response = await data;

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
