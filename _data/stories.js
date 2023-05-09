const fetch = require("node-fetch");
const smartTruncate = require("smart-truncate");
// const stripTags = require("striptags");
// const unique = require('unique-words');
const makeTitleSlug = require("../src/makeTitleSlug.js");

const getMonthYear = require("../src/getMonthYear.js");

// const fs = require('fs');
// var Spellchecker = require("hunspell-spellchecker");
// var spellchecker = new Spellchecker();
// // Parse an hunspell dictionary that can be serialized as JSON
// var DICT = spellchecker.parse({
// 	dic: fs.readFileSync("./mt_MT.dic"),
// 	aff: fs.readFileSync("./mt_MT.aff")
// });
// spellchecker.use(DICT);

// function to get stories
async function getAllStories() {
  const recordsPerQuery = 100;
  let recordsToSkip = 0;
  let makeNewQuery = true;
  let stories = [];
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
						stories {
							data {
								attributes {
									title
									body
									description
									endnote
									dateTimePublication
									type
									appointment
									showImagePromo
									publicationHistory
									promoImage {
										data{
											attributes {
												formats
											}
										}
									}
									promoImageMobile {
										data{
											attributes {
												formats
											}
										}
									}
									epigraphs {
										quotation
										attribution
									}
									introduction
									podcastNote
									coda
									postscript
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
													dateTimePublication
													title
													description
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
	const storiesFormatted = stories.map((story) => {
		const atts = story.attributes;
		const author = !!atts.authors.data.length && atts.authors.data[0].attributes;
		const translator = !!atts.translators.data.length && atts.translators.data[0].attributes;

		const endPromosFormatted = atts.endPromos.length && atts.endPromos.map((promo) => {
			const promoAtts = promo.story.data.attributes;
			const author = promoAtts.authors.data.length && promoAtts.authors.data[0].attributes;
			const translator = promoAtts.translators.data.length && promoAtts.translators.data[0].attributes;

			const authorFullName = author && `${author.forename} ${author.surname}`
			const translatorFullName = translator && `${ translator.forename } ${ translator.surname }`

			return {
				title: promoAtts.title,
				slug: promoAtts.title,
				monthYear: getMonthYear(promoAtts.dateTimePublication),
				description: promo.text || promoAtts.description,
				author: authorFullName,
				translator: translatorFullName,
				slug: makeTitleSlug(promoAtts.title, authorFullName, translatorFullName),
				type: promoAtts.type,
				cssClass: promoAtts.type === 'Poezija' ? 'body-text poetry' : 'body-text',
			};
		});

		const booksMentioned = !!atts.booksMentioned.data.length && atts.booksMentioned.data.map((book) => {
			const bookAtts = book.attributes;
			const author = !!bookAtts.authors.data.length && bookAtts.authors.data[0].attributes;
			const translator = !!bookAtts.translators.data.length && bookAtts.translators.data[0].attributes;
			const publisher = !!bookAtts.publishers.data.length && bookAtts.publishers.data[0].attributes;

			const authorFullName = author && `${author.forename} ${author.surname}`
			const translatorFullName = translator && `${ translator.forename } ${ translator.surname }`

			return {
				title: bookAtts.title,
				publicationYear: new Date(bookAtts.publicationDate).getFullYear(),
				publisherName: publisher.name,
				publisherCity: publisher.city,
				author: authorFullName,
				translator: translatorFullName
			};
		});

		const authorFullName = !!author && `${ author.forename } ${ author.surname }`;
		const translatorFullName = !!translator && `${ translator.forename } ${ translator.surname }`;
		const displayTitle = `${ author && authorFullName }: ${ atts.title }${ translatorFullName ? ' (tr ' + translatorFullName + ')' : '' }`;
		const promoImageFormats = atts.promoImage.data.attributes.formats;

		// find total times a story is endPromoted
		// const timesStoryPromoted = stories.map((story) => story.attributes.endPromos
		// promo.story.data.attributes.title)

		// const body = unique(stripTags(atts.body).toLowerCase().replace(/ċ/gm, "MXc").replace(/ġ/gm, "MXg").replace(/ħ/gm, "MXh").replace(/ż/gm, "MXz").replace(/à/gm, "MXa"));
		// const vocabulary = unique(body).filter((word) => {
		// 	const fixedWord = word.replace(/MXc/gm, "ċ").replace(/MXg/gm, "ġ").replace(/MXh/gm, "ħ").replace(/MXz/gm, "ż").replace(/MXa/gm, "à");
		// 	const check = spellchecker.check(fixedWord);
		// 	if (check) {
		// 		return true;
		// 	} else {
		// 		console.log(fixedWord);
		// 		return false;
		// 	}
		// });
		// console.log('tul', vocabulary.length);

		const vocabulary = [];
		// console.log(vocabulary);

		return {
      title: atts.title,
			body: atts.body,
			slug: makeTitleSlug(atts.title, authorFullName, translatorFullName),
			endnote: atts.endnote,
			monthYear: getMonthYear(atts.dateTimePublication),
			description: atts.description,
			type: atts.type,
			appointment: atts.appointment,
			epigraphs: !!atts.epigraphs && atts.epigraphs,
			introduction: atts.introduction,
			podcastNote: atts.podcastNote,
			coda: atts.coda,
			postscript: atts.postscript,
			author: authorFullName,
			translator: translatorFullName,
			endPromos: endPromosFormatted,
			booksMentioned: booksMentioned,
			displayTitle: displayTitle,
			metaTitle: `${ displayTitle } · Aphroconfuso`,
			showImagePromo: atts.showImagePromo,
			socialImage: promoImageFormats.social && `${ promoImageFormats.social.hash }${ promoImageFormats.social.ext }`,
			vocabulary: vocabulary,
			publicationHistory: atts.publicationHistory,
    };
  });

  // return formatted stories
  return storiesFormatted;
}

// export for 11ty
module.exports = getAllStories;
