const fetch = require("node-fetch");
const smartTruncate = require("smart-truncate");
const getIssueMonthYear = require("../src/getIssueMonthYear.js");
const makeTitleSlug = require("../src/makeTitleSlug.js");
const parseAuthors = require("../src/parseAuthors.js");

const { imageData, linkedStoryData, linkedStoryDataWithImage } = require("./_fragments.js");

const complementaryColours = {
	jannar: "#994d33",
	frar: "#99337a",
	marzu: "#779933",
	april: "#339977",
	mejju: "#993338",
	"ġunju": "#336b99",
	lulju: "#529933",
	awwissu: "#998d33",
	settembru: "#339999",
	ottubru: "#743399",
	novembru: "#339955",
	"diċembru": "#334499"
};

async function getHomepage() {
	let homepage, diaryEntries;
	const fetchStatus = process.env.NODE_ENV === 'development' ? 'PREVIEW' : 'LIVE';
	try {
		const data = await fetch("https://cms.aphroconfuso.mt/graphql", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				query: `{
					homepage {
						data {
							attributes {
								layout
                appointment {
                  data {
                    attributes {
											dateTimePublication
											editorial
                    }
                  }
                }
								promos(pagination: { page: 1, pageSize: 12 }) {
									text
									story {
										${linkedStoryData}
									}
								}
								poetryPromos(pagination: { page: 1, pageSize: 3 }) {
									text
									story {
										${linkedStoryData}
									}
								}
								imagePromos(pagination: { page: 1, pageSize: 3 }) {
									text
									imageCrop
									image {
										${imageData}
									}
									mobileImage {
										${imageData}
									}
									story {
										${linkedStoryDataWithImage}
									}
								}
							}
						}
					}
					diaryEntries: stories(
						publicationState: ${ fetchStatus }
						pagination: { page: 1, pageSize: 3 },
						sort: ["dateTimePublication:desc"],
						filters: {type: { eq: "Djarju"}}
					) {
						${linkedStoryData}
					}
				}`
			}),
		});
		const response = await data.json();

		if (response.errors) {
			let errors = response.errors;
			errors.map((error) => {
				console.log(error.message);
			});
			throw new Error("Problem fetching data at homepage.js");
		}
		homepage = response.data.homepage;
		diaryEntries = response.data.diaryEntries;
	} catch (error) {
		throw new Error(error);
	}

	const atts = homepage.data.attributes;
	const diaryPromos = diaryEntries;

	const layouts = {
		Layout_1: {
			diary: 2,
			image: 2,
			poem: 1,
			text: 11,
			lengths: [2150, 1200],
		},
		Layout_2: {
			diary: 2,
			image: 2,
			poem: 1,
			text: 11,
			lengths: [2150, 1200],
		},
		Layout_3: {
			diary: 2,
			image: 2,
			poem: 1,
			text: 11,
			lengths: [2150, 1200],
		},
		Layout_4: {
			diary: 2,
			image: 2,
			poem: 1,
			text: 11,
			lengths: [2150, 1200],
		},
		Layout_5: {
			diary: 3,
			image: 3,
			poem: 1,
			text: 11,
			lengths: [2150, 1200],
		},
}

	const layoutConfig = layouts[atts.layout];

	// REFACTOR ... use processPromos?S
	const promosFormatted = (promos, includesImages, number, lengths) => {
		const result = promos.length && promos.slice(0, number).map((promo, index) => {
			const storyAtts = (promo.story && promo.story.data.attributes) || promo.attributes;
			const authorsType = storyAtts.authorsType && storyAtts.authorsType.replace(/\_.*/, '') || 'solo';
			const { authors, authorsString } = storyAtts.authors.data.length && parseAuthors(storyAtts.authors.data, authorsType);
			const translator = storyAtts.translators.data.length && storyAtts.translators.data[0].attributes;
			const translatorFullName = !!translator && (translator.displayName || `${ translator.forename }${ translator.initials ? ' ' + translator.initials + ' ' : ' ' }${ translator.surname }`);
			const promoSequenceData = storyAtts.sequence && storyAtts.sequence.data;
			const descriptionLength = lengths && lengths[index] || 9999;
			const title = !!promoSequenceData ? promoSequenceData.attributes.title : storyAtts.title

			// REFACTOR: rationalise titles mainTitle, subtitle, metaTitle, displayTitle, reportingTitle, fixPodcastTitle
			let [mainTitle, subtitle] = title.split(/(?<!:):(?!:)/);
			mainTitle = mainTitle.replace(/:: /, ": ");

			// REFACTOR: Save externally
			const fixReportingTitle = (formattedPromo) => {
				const { type, sequenceEpisodeNumber, author, title } = formattedPromo;
				if (type === 'Djarju') return `Djarju #${ sequenceEpisodeNumber } ${ author }`;
				if (!!sequenceEpisodeNumber) return `${ title } #${ sequenceEpisodeNumber }`;
				return title;
			}
			let formattedPromo = {
				authorsType,
				authorsString,
				authors,
				collections: storyAtts.collections && storyAtts.collections.data.map(collection => { return { id: collection.id, title: collection.attributes.title }}),
				cssClass: storyAtts.type === 'Poezija' ? 'body-text poetry' : 'body-text',
				description: smartTruncate(promo.text || storyAtts.description, descriptionLength),
				subjectDate: storyAtts.diaryDate,
				id: promo.story && promo.story.data.id || promo.id,
				isSequenceEpisode: !!promoSequenceData,
				mainTitle,
				mobilePriority: promo.mobilePriority || 9,
				isTypeTerm: storyAtts.type === 'Terminu',
				issueMonth: getIssueMonthYear(storyAtts.dateTimePublication).month,
				issueMonthYear: getIssueMonthYear(storyAtts.dateTimePublication).monthYear,
				sequenceEpisodeNumber: storyAtts.sequenceEpisodeNumber,
				sequenceEpisodeTitle: !!promoSequenceData && storyAtts.title,
				slug: storyAtts.pageUrl || makeTitleSlug(
					storyAtts.title,
					authorsString,
					translatorFullName,
					promoSequenceData && promoSequenceData.attributes.title,
					storyAtts.sequenceEpisodeNumber,
					storyAtts.diaryDate,
					!!promoSequenceData && storyAtts.title,
					storyAtts.type
				),
				subtitle,
				title,
				translator: translatorFullName,
				type: storyAtts.type,
			};

			formattedPromo.reportingTitle = fixReportingTitle(formattedPromo);

			if (includesImages) {
				console.log(promo && promo.image.data);
				const promoImageData = promo && promo.image.data[0] || storyAtts.promoImage.data;
				const promoImageMobileData = promo.imageMobile && promo.imageMobile.data[0] || storyAtts.promoImageMobile.data;
				formattedPromo.image = storyAtts.showImagePromo && promoImageData && promoImageData.attributes.formats,
				formattedPromo.imageMobile = storyAtts.showImagePromo && promoImageMobileData && promoImageMobileData.attributes.formats,
				formattedPromo.imageCrop = promo.imageCrop,
				formattedPromo.alternativeText = promoImageData.attributes.alternativeText
			}

			return formattedPromo;
		});
		return result;
	}

	const issueMonth = getIssueMonthYear(atts.appointment.data.attributes.dateTimePublication).month;

	const homepageFormatted = {
		complementaryMonthColour: complementaryColours[issueMonth.toLowerCase()],
		diaryEntries: promosFormatted(diaryPromos.data, false, layoutConfig.diary),
		editorial: atts.appointment.data.attributes.editorial,
		imagePromos: promosFormatted(atts.imagePromos, true, layoutConfig['image']),
		issueMonth,
		issueMonthYear: getIssueMonthYear(atts.appointment.data.attributes.dateTimePublication).monthYear,
		layout: atts.layout,
		poetryPromos: promosFormatted(atts.poetryPromos, false, layoutConfig.poem),
		promos: promosFormatted(atts.promos, false, layoutConfig.text, layoutConfig.lengths),
	};

	return homepageFormatted;
}

module.exports = getHomepage;
