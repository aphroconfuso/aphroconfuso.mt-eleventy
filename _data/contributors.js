const fetch = require("node-fetch");
const processPromos = require("../src/processPromos.js");
const slugifyMaltese = require("../src/slugifyMaltese.js");
const getPersonName = require("../src/getPersonName.js");
const smartTruncate = require("smart-truncate");
const stripTags = require("striptags");

const { linkedStoryData } = require("./_fragments.js");

async function getAllContributors() {
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
							pagination: { page: 1, pageSize: 999 },
							sort: ["surname:asc", "forename:asc"],
							filters: {contributor: { eq: true}}
							) {
							data {
								attributes {
									bioNote
									displayName
									forename
									initials
									surname
									storiesAuthored(
										sort: "dateTimePublication:desc",
										filters: {type: { ne: "Djarju"}}
									) {
										${linkedStoryData}
									}
									diaryEntries: storiesAuthored(
										sort: "dateTimePublication:desc",
										filters: {type: { eq: "Djarju"}}
									) {
										${linkedStoryData}
									}
									storiesTranslated(sort: "dateTimePublication:desc") {
										${linkedStoryData}
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
  const contributorsFormatted = contributors.map((item) => {

		const storiesAuthored = processPromos(item.attributes.storiesAuthored.data);
		const storiesTranslated = processPromos(item.attributes.storiesTranslated.data);
		const diaryEntries = processPromos(item.attributes.diaryEntries.data);
		const useFullName = getPersonName(item.attributes);

		return {
			bioNote: item.attributes.bioNote,
			forename: item.attributes.forename,
			metaDescription: smartTruncate(stripTags(item.attributes.bioNote), 155),
			metaTitle: `${ useFullName } · Aphroconfuso`,
			slug: slugifyMaltese(useFullName),
			storiesAuthored: storiesAuthored,
			storiesTranslated: storiesTranslated,
			diaryEntries: diaryEntries,
      name: useFullName,
    };
  });
	return contributorsFormatted;
}

module.exports = getAllContributors;
