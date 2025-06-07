const cachedPostFetch = require('../src/cachedPostFetch');
const slugify = require('../src/slugifyMaltese.js');

async function getGenerics() {
	const fetchStatus = process.env.NODE_ENV === 'development' ? 'PREVIEW' : 'LIVE';

	try {
		const data = await cachedPostFetch("https://cms.aphroconfuso.mt/graphql", {
			body: JSON.stringify({
				query: `{
					generics(
			            publicationState: ${fetchStatus},
						pagination: { page: 1, pageSize: 250 },
					) {
						data {
							attributes {
								key
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
			response.errors.forEach((error) => console.log(error.message));
			throw new Error("Houston... We have a CMS problem");
		}

		const items = response.data.generics.data;

		return items.reduce((acc, item) => {
			const attrs = item.attributes;
			const key = attrs.key || slugify(attrs.title);
			acc[key] = attrs;
			return acc;
		}, {});

	} catch (error) {
		throw new Error(error);
	}
}

module.exports = getGenerics;
