const fetch = require("node-fetch");
const processPromos = require("../src/processPromos.js");
const slugifyMaltese = require("../src/slugifyMaltese.js");
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
							sort: ["surname:asc", "name:asc"],
							filters: {contributor: { eq: true}}
							) {
							data {
								attributes {
									bioNote
									displayName
									forename
									surname
									storiesAuthored(sort: "dateTimePublication:desc") {
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

		const storiesAuthored = item.attributes.storiesAuthored.data.length && processPromos(item.attributes.storiesAuthored.data, 'contributor');
		const storiesTranslated = item.attributes.storiesTranslated.data.length && processPromos(item.attributes.storiesTranslated.data);
		const useFullName = item.attributes.displayName || `${ item.attributes.forename } ${ item.attributes.surname }`;

		return {
			bioNote: item.attributes.bioNote,
			forename: item.attributes.forename,
			metaDescription: smartTruncate(stripTags(item.attributes.bioNote), 155),
			metaTitle: `${ useFullName } · Aphroconfuso`,
			slug: slugifyMaltese(useFullName),
			storiesAuthored: storiesAuthored,
			storiesTranslated: storiesTranslated,
      name: useFullName,
    };
  });
	return contributorsFormatted;
}

module.exports = getAllContributors;
