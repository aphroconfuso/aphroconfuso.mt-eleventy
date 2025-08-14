const fetchStatus = process.env.NODE_ENV === 'development' ? 'PREVIEW' : 'LIVE';

const imageData = `data {
	attributes {
		alternativeText
		caption
		formats
	}
}`;

const personData = `data {
	attributes {
		contributor
		displayName
		forename
		initials
		pronoun
		surname
	}
}`;

const linkedStoriesAttributes = `
	authorsType
	dateTimePublication
	description
	diaryDate
	pageUrl
	podcastLengthMinutes
	podcastNote
	podcastUrl
	sequenceEpisodeNumber
	title
	type
	useDefaultPodcastMessage
	authors (
		publicationState: ${ fetchStatus },
	) {
		${personData}
	}
	translators (
		publicationState: ${ fetchStatus },
	) {
		${personData}
	}
	sequence {
		data {
			id
			attributes {
				title
				description
			}
		}
	}
	collections (
		publicationState: ${ fetchStatus },
	) {
		data {
			id
			attributes {
				title
			}
		}
	}
	isBook {
		inShops
		isbn
		lokalUrl
		orderable
		pages
		price
		published
	}
`;

const linkedStoryData = `
	data {
		id
		attributes {
			${linkedStoriesAttributes}
		}
	}
`;

const linkedStoryDataWithImage = `data {
	id
	attributes {
		${linkedStoriesAttributes}
		showImagePromo
		promoImage {
			${imageData}
		}
		promoImageMobile {
			${imageData}
		}
	}
}`;

module.exports = { imageData, linkedStoryData, linkedStoryDataWithImage, personData };
