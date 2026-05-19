const cachedPostFetch = require('../src/cachedPostFetch');
const slugify = require('../src/slugifyMaltese.js');

async function getManualPages() {
	const fetchStatus = process.env.NODE_ENV === 'development' ? 'PREVIEW' : 'LIVE';

	try {
		const data = await cachedPostFetch("https://cms.aphroconfuso.mt/graphql", {
			body: JSON.stringify({
				query: `{
					manualPages(
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

		const items = response.data.manualPages.data.map((page) => {
			const atts = page.attributes;
			return {
				key: atts.key || slugify(atts.title),
				slug: 'manwal-' + slugify(atts.title),
				body: atts.body,
				title: atts.title,
			}
		});

		return items;

	} catch (error) {
		throw new Error(error);
	}
}

module.exports = getManualPages;
