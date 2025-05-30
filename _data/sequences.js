const cachedPostFetch = require('../src/cachedPostFetch');
const processPromos = require("../src/processPromos.js");
const makePageTitle = require("../src/makePageTitle.js");
const makeTitleSlug = require("../src/makeTitleSlug.js");

const { imageData, linkedStoryData } = require("./_fragments.js");

async function getAllsequences() {
	const fetchStatus = process.env.NODE_ENV === 'development' ? 'PREVIEW' : 'LIVE';
  let sequencesData;
	try {
		const data = await cachedPostFetch("https://cms.aphroconfuso.mt/graphql", {
			body: JSON.stringify({
				query: `{
					sequences(
            publicationState: ${ fetchStatus },
						pagination: { page: 1, pageSize: 250 },
						) {
						data {
							id
							attributes {
								description
								title
								moreToCome
								promoImage {
									${imageData}
								}
								promoImageMobile {
									${imageData}
								}
								stories(
			            publicationState: ${ fetchStatus },
									sort: "dateTimePublication:asc"
									pagination: { page: 1, pageSize: 250 },
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
		sequencesData = response.data.sequences.data;
	} catch (error) {
		throw new Error(error);
	}

	const sequences = sequencesData.map((sequence) => {
		const atts = sequence.attributes;
		const storiesFormatted = !!atts.stories.data.length && processPromos(atts.stories.data);
		if (!atts.promoImage) console.log("Image missing! An image was probably deleted from the media library after it had been added as the social image.");
		const promoImageFormats = !!atts.promoImage.data && atts.promoImage.data.attributes.formats;

		// REFACTOR: rationalise titles mainTitle, subtitle, metaTitle, displayTitle, reportingTitle, fixPodcastTitle
		let [mainTitle, subtitle] = atts.title.split(/(?<!:):(?!:)/);
		mainTitle = mainTitle.replace(/:: /, ": ");
		let sequenceTitle = mainTitle;

		// REFACTOR with page titles
		sequenceTitle = sequenceTitle.replace(/:: /, ": ")

		// Get the author data from first story
		// 	REVIEW: in the future it may be necessary to collate from all stories
		const { authorsType, authors, authorForename, authorsString, authorPronoun, authorSurname, translator, type } = (storiesFormatted.length && storiesFormatted[0]) || {};

		const displayTitle = makePageTitle(
			sequenceTitle,
			authorsString,
			translator,
			null,
			null,
			null,
			null,
			type,
		);

		const pageSlug = makeTitleSlug(
			sequenceTitle,
			authorsString,
			translator,
			null,
			null,
			null,
			null,
			type,
		);

		return {
			authorForename,
			authorPronoun,
			authors,
			authorsString,
			authorsType,
			description: atts.description,
			displayTitle,
			id: sequence.id,
			isDiary: storiesFormatted.length && storiesFormatted[0].type === 'Djarju',
			moreToCome: atts.moreToCome,
			slug: pageSlug,
			image: promoImageFormats,
			socialImage: promoImageFormats.social && `${ promoImageFormats.social.hash }${ promoImageFormats.social.ext }`,
			socialImageAlt: promoImageFormats.social && atts.promoImage.data.attributes.alternativeText,
			sortBy: authorSurname,
			stories: storiesFormatted,
			title: sequenceTitle,
			totalMinutes: storiesFormatted.reduce((acc, story) => acc + story.podcastLengthMinutes, 0),
			totalWords: storiesFormatted.reduce((acc, story) => acc + story.totalWords, 0),
			translator,
			latestEpisodeDate: storiesFormatted[storiesFormatted.length-1].dateTimePublication,
		}
	});
  return sequences.sort((a, b) => new Date(b.latestEpisodeDate) - new Date(a.latestEpisodeDate));
}

module.exports = getAllsequences;
