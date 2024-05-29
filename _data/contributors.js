const fetch = require("node-fetch");
const processPromos = require("../src/processPromos.js");
const slugifyMaltese = require("../src/slugifyMaltese.js");
const getPersonName = require("../src/getPersonName.js");
const smartTruncate = require("smart-truncate");
const stripTags = require("striptags");

const { linkedStoryData } = require("./_fragments.js");

async function getAllContributors() {
	const fetchStatus = process.env.NODE_ENV === 'development' ? 'PREVIEW' : 'LIVE';
	const recordsPerQuery = 100;
	let recordsToSkip = 0;
	let makeNewQuery = true;
	let contributors = [];
	while (makeNewQuery) {
		try {
			const data = await fetch("https://cms.aphroconfuso.mt/graphql", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					query: `{
						people(
	            publicationState: ${ fetchStatus },
							pagination: { page: 1, pageSize: 999 },
							sort: ["surname:asc", "forename:asc"],
							filters: {contributor: { eq: true}}
							) {
							data {
								id
								attributes {
									affiliation
									bioNote
									displayName
									forename
									initials
									pronoun
									surname
									storiesAuthored(
				            publicationState: ${ fetchStatus },
										sort: ["diaryDate:desc", "dateTimePublication:desc"],
										filters: {type: { notIn: ["Djarju", "Poddata"]}}
									) {
										${ linkedStoryData }
									}
									diaryEntries: storiesAuthored(
				            publicationState: ${ fetchStatus },
										sort: "dateTimePublication:desc",
										filters: {type: { eq: "Djarju"}}
									) {
										${ linkedStoryData }
									}
									podcastEpisodes: storiesAuthored(
				            publicationState: ${ fetchStatus },
										sort: "dateTimePublication:desc",
										filters: {type: { eq: "Poddata"}}
									) {
										${ linkedStoryData }
									}
									storiesTranslated(
				            publicationState: ${ fetchStatus },
										sort: "dateTimePublication:desc"
									) {
										${ linkedStoryData }
									}
								}
							}
						}
          }`,
				}),
			});
			// store the JSON response when promise resolves
			const response = await data.json();

			// handle CMS errors
			if (response.errors) {
				let errors = response.errors;
				errors.map((error) => {
					console.log(error.message);
				});
				throw new Error("Houston... We have a CMS problem");
			}
			contributors = contributors.concat(response.data.people.data);
			recordsToSkip += recordsPerQuery;
			if (response.data.people.length < recordsPerQuery) {
				makeNewQuery = false;
			}
			makeNewQuery = false;
		} catch (error) {
			throw new Error(error);
		}
	}

	const countPronoun = (pronoun) => contributors.filter(i => (i.attributes.affiliation !== i.attributes.forename) && i.attributes.pronoun === pronoun).length;

	const contributorsFormatted = contributors.map((item) => {
		const storiesAuthored = processPromos(item.attributes.storiesAuthored.data);
		const storiesTranslated = processPromos(item.attributes.storiesTranslated.data);
		const diaryEntries = processPromos(item.attributes.diaryEntries.data);
		const podcastEpisodes = processPromos(item.attributes.podcastEpisodes.data);
		const displayContributorName = getPersonName(item.attributes);
		return {
			bioNote: item.attributes.bioNote,
			forename: item.attributes.forename,
			id: item.id,
			metaDescription: smartTruncate(stripTags(item.attributes.bioNote), 155),
			metaTitle: `${ displayContributorName } · Aphroconfuso`,
			slug: slugifyMaltese(displayContributorName),
			storiesAuthored: storiesAuthored,
			storiesTranslated: storiesTranslated,
			diaryEntries: diaryEntries,
			podcastEpisodes: podcastEpisodes,
			name: displayContributorName,
		};
	});

	contributorsFormatted[0].pronounsArrayString = JSON.stringify([
		['kittieba', 'pronom'],
		['hi', countPronoun('hi')],
		['hu', countPronoun('hu')],
		['hi/hu', countPronoun('hi_hu')],
		['huma', countPronoun('huma')],
	]);

	return contributorsFormatted;
}

module.exports = getAllContributors;
