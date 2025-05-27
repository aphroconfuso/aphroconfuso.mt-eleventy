const cachedPostFetch = require('../src/cachedPostFetch');
const stripTags = require("striptags");
const makeSortableTitle = require("../src/makeSortableTitle.js");
const processPromos = require("../src/processPromos.js");

const { imageData, linkedStoryData } = require("./_fragments.js");

async function getAllcollections() {
	const fetchStatus = process.env.NODE_ENV === 'development' ? 'PREVIEW' : 'LIVE';
  let collectionsData;
	try {
		const data = await cachedPostFetch("https://cms.aphroconfuso.mt/graphql", {
			body: JSON.stringify({
				query: `{
					collections(
            publicationState: ${ fetchStatus },
						pagination: { page: 1, pageSize: 250 },
						) {
						data {
							id
							attributes {
								body
								description
								title
								moreToCome
								continuity
								promoImage {
									${imageData}
								}
								promoImageMobile {
									${imageData}
								}
								stories(
			            publicationState: ${ fetchStatus },
									sort: "dateTimePublication:desc"
									) {
									${linkedStoryData}
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
		collectionsData = response.data.collections.data;
	} catch (error) {
		throw new Error(error);
	}

	// REVIEW: make external (filter)
	const flattenParas = (text, joinerClass = "pilcrow", joinerCharacter = "¶") => {
		return stripTags(text, ['i', 'em', 'mark', 'p', 'span']).trim().replace(/<\/p>\s*<p>/g, `<span class=\"${ joinerClass }\">${ joinerCharacter }</span>`);
	}

	const collections = collectionsData.map((collection) => {
		const atts = collection.attributes;
		const storiesFormatted = !!atts.stories.data.length && processPromos(atts.stories.data);
		if (!atts.promoImage) console.log("Image missing! An image was probably deleted from the media library after it had been added as the social image.");
		const promoImageFormats = atts.promoImage.data.attributes.formats;

		return {
			id: collection.id,
			body: flattenParas(atts.body),
			continuity: atts.continuity,
			description: atts.description,
			moreToCome: atts.moreToCome,
			socialImage: promoImageFormats.social && `${ promoImageFormats.social.hash }${ promoImageFormats.social.ext }`,
			socialImageAlt: promoImageFormats.social && atts.promoImage.data.attributes.alternativeText,
			sortTitle: makeSortableTitle(atts.title || ''),
			stories: storiesFormatted,
			title: atts.title || null,
		}
	});
  return collections;
}

module.exports = getAllcollections;
