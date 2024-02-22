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
	authors {
		${personData}
	}
	translators {
		${personData}
	}
	sequence {
		data {
			attributes {
				title
				description
			}
		}
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
