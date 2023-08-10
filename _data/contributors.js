const fetch = require("node-fetch");
const smartTruncate = require("smart-truncate");
const stripTags = require("striptags");
const slugifyMaltese = require("../src/slugifyMaltese.js");
const makeTitleSlug = require("../src/makeTitleSlug.js");
const getMonthYear = require("../src/getMonthYear.js");

async function getAllContributors() {
  const recordsPerQuery = 100;
  let recordsToSkip = 0;
  let makeNewQuery = true;
  let contributors = [];
  while (makeNewQuery) {
    try {
      // initialise fetch
      const data = await fetch("https://cms.aphroconfuso.mt/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `{
						people(pagination: { page: 1, pageSize: 999 }, sort: ["surname:asc", "name:asc"], filters: {contributor: { eq: true}}) {
							data {
								attributes {
									forename
									surname
									bioNote
									storiesAuthored {
										data {
											id
											attributes {
												title
												description
												pageUrl
												dateTimePublication
												type
												authors {
													data {
														attributes {
															forename
															surname
														}
													}
												}
												translators {
													data {
														attributes {
															forename
															surname
														}
													}
												}
											}
										}
									}
									storiesTranslated {
										data {
											id
											attributes {
												title
												description
												pageUrl
												dateTimePublication
												type
												authors {
													data {
														attributes {
															forename
															surname
														}
													}
												}
												translators {
													data {
														attributes {
															forename
															surname
														}
													}
												}
											}
										}
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

		const storiesAuthored = item.attributes.storiesAuthored.data.length && item.attributes.storiesAuthored.data.map((storyAuthored) => {
			const author = storyAuthored.attributes.authors.data.length && storyAuthored.attributes.authors.data[0].attributes;
			const translator = storyAuthored.attributes.translators.data.length && storyAuthored.attributes.translators.data[0].attributes;
			const authorFullName = author && `${author.forename} ${author.surname}`
			const translatorFullName = translator && `${ translator.forename } ${ translator.surname }`
			return {
				title: storyAuthored.attributes.title,
				slug: makeTitleSlug(storyAuthored.attributes.title, authorFullName, translatorFullName),
				monthYear: getMonthYear(storyAuthored.attributes.dateTimePublication),
				description: storyAuthored.attributes.description,
				type: storyAuthored.attributes.type,
				cssClass: storyAuthored.attributes.type === 'Poezija' ? 'body-text poetry' : 'body-text',
			};
		});

		const storiesTranslated = item.attributes.storiesTranslated.data.length && item.attributes.storiesTranslated.data.map((storyTranslated) => {
			const author = storyTranslated.attributes.authors.data.length && storyTranslated.attributes.authors.data[0].attributes;
			const translator = storyTranslated.attributes.translators.data.length && storyTranslated.attributes.translators.data[0].attributes;
			const authorFullName = author && `${author.forename} ${author.surname}`
			const translatorFullName = translator && `${ translator.forename } ${ translator.surname }`

			return {
				title: storyTranslated.attributes.title,
				slug: makeTitleSlug(storyTranslated.attributes.title, authorFullName, translatorFullName),
				monthYear: getMonthYear(storyTranslated.attributes.dateTimePublication),
				description: storyTranslated.attributes.description,
			};
		});

		return {
      name: `${ item.attributes.forename } ${ item.attributes.surname }`,
			bioNote: item.attributes.bioNote,
			slug: slugifyMaltese(`${ item.attributes.forename } ${ item.attributes.surname }`),
			storiesAuthored: storiesAuthored,
			storiesTranslated: storiesTranslated,
			metaTitle: `${ item.attributes.forename } ${ item.attributes.surname } · Aphroconfuso`,
			metaDescription: smartTruncate(stripTags(item.attributes.bioNote), 155)
    };
  });
  return contributorsFormatted;
}

module.exports = getAllContributors;
