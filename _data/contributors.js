const fetch = require("node-fetch");

// function to get contributors
async function getAllContributors() {
  // max number of records to fetch per query
  const recordsPerQuery = 100;

  // number of records to skip (start at 0)
  let recordsToSkip = 0;

  let makeNewQuery = true;

  let contributors = [];

  // make queries until makeNewQuery is set to false
  while (makeNewQuery) {
    try {
      // initiate fetch
      const data = await fetch("https://cms.aphroconfuso.mt/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `{
						people {
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
												issueMonth
												issueYear
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
												issueMonth
												issueYear
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

      // update blogpost array with the data from the JSON response
      contributors = contributors.concat(response.data.people.data);

      // prepare for next query
      recordsToSkip += recordsPerQuery;

      // stop querying if we are getting back less than the records we fetch per query
      if (response.data.people.length < recordsPerQuery) {
        makeNewQuery = false;
      }
      makeNewQuery = false;
    } catch (error) {
      throw new Error(error);
    }
  }

  // format contributors objects
  const contributorsFormatted = contributors.map((item) => {

		const storiesAuthored = item.attributes.storiesAuthored.data.length && item.attributes.storiesAuthored.data.map((storyAuthored) => {
			console.log('>>>>>', storyAuthored);
			return {
				title: storyAuthored.attributes.title,
				slug: storyAuthored.attributes.title,
				monthYear: `${storyAuthored.attributes.issueMonth} ${storyAuthored.attributes.issueYear.replace("s_", "")}`,
				description: storyAuthored.attributes.description,
			};
		});

		const storiesTranslated = item.attributes.storiesTranslated.data.length && item.attributes.storiesTranslated.data.map((storyTranslated) => {
			console.log('>>>>>', storyTranslated);
			return {
				title: storyTranslated.attributes.title,
				slug: storyTranslated.attributes.title,
				monthYear: `${storyTranslated.attributes.issueMonth} ${storyTranslated.attributes.issueYear.replace("s_", "")}`,
				description: storyTranslated.attributes.description,
			};
		});

		return {
      name: `${ item.attributes.forename } ${ item.attributes.surname }`,
			bioNote: item.attributes.bioNote,
			slug: `${ item.attributes.forename } ${ item.attributes.surname }`,
			storiesAuthored: storiesAuthored,
			storiesTranslated: storiesTranslated
    };
  });

  // return formatted contributors
  return contributorsFormatted;
}

// export for 11ty
module.exports = getAllContributors;
