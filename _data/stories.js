const fetch = require("node-fetch");

// function to get stories
async function getAllStories() {
  // max number of records to fetch per query
  const recordsPerQuery = 100;

  // number of records to skip (start at 0)
  let recordsToSkip = 0;

  let makeNewQuery = true;

  let stories = [];

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
						stories {
							data {
								attributes {
									title
									body
									description
									endnote
									issueMonth
									issueYear
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
									booksMentioned {
										data {
											attributes {
												title
												publicationDate
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
												publishers {
													data {
														attributes {
															name
															city
														}
													}
												}
											}
										}
									}
									endPromos {
										text
										story {
											data {
												attributes {
													issueMonth
													issueYear
													title
													description
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
      stories = stories.concat(response.data.stories.data);

      // prepare for next query
      recordsToSkip += recordsPerQuery;

      // stop querying if we are getting back less than the records we fetch per query
      if (response.data.stories.length < recordsPerQuery) {
        makeNewQuery = false;
      }
      makeNewQuery = false;
    } catch (error) {
      throw new Error(error);
    }
  }

  // format stories objects
  const storiesFormatted = stories.map((item) => {
		const author = item.attributes.authors.data.length && item.attributes.authors.data[0].attributes;
		const translator = item.attributes.translators.data.length && item.attributes.translators.data[0].attributes;

		const endPromosFormatted = item.attributes.endPromos.length && item.attributes.endPromos.map((promo) => {
			const promoAtts = promo.story.data.attributes;
			const author = promoAtts.authors.data.length && promoAtts.authors.data[0].attributes;
			const translator = promoAtts.translators.data.length && promoAtts.translators.data[0].attributes;

			return {
				title: promoAtts.title,
				slug: promoAtts.title,
				monthYear: `${promoAtts.issueMonth} ${promoAtts.issueYear.replace("s_", "")}`,
				description: promo.text || promoAtts.description,
				author: author && `${author.forename} ${author.surname}`,
				translator: translator && `${ translator.forename } ${ translator.surname }`,
			};
		});

		const booksMentioned = item.attributes.booksMentioned.data.length && item.attributes.booksMentioned.data.map((book) => {
			const bookAtts = book.attributes;
			const author = bookAtts.authors.data.length && bookAtts.authors.data[0].attributes;
			const translator = bookAtts.translators.data.length && bookAtts.translators.data[0].attributes;
			const publisher = bookAtts.publishers.data.length && bookAtts.publishers.data[0].attributes;

			return {
				title: bookAtts.title,
				author: author && `${ author.forename } ${ author.surname }`,
				translator: translator && `${ translator.forename } ${ translator.surname }`,
				publicationYear: new Date(bookAtts.publicationDate).getFullYear(),
				publisherName: publisher.name,
				publisherCity: publisher.city
			};
		});

		console.log(5, booksMentioned);

    return {
      title: item.attributes.title,
			body: item.attributes.body,
			slug: item.attributes.title,
			endnote: item.attributes.endnote,
			monthYear: `${item.attributes.issueMonth} ${item.attributes.issueYear.replace("s_", "")}`,
			description: item.attributes.description,
			author: author && `${author.forename} ${author.surname}`,
			translator: translator && `${ translator.forename } ${ translator.surname }`,
			endPromos: endPromosFormatted,
			booksMentioned: booksMentioned
    };
  });

  // return formatted stories
  return storiesFormatted;
}

// export for 11ty
module.exports = getAllStories;
