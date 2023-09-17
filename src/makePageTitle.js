const fixDiaryDate = require("../src/fixDiaryDate.js");

module.exports = (title, author, translator, sequenceTitle, sequenceNumber, diaryDate, sequenceEpisodeTitle) => {
	return [
		diaryDate ? 'Djarju ' : sequenceTitle,
		diaryDate && fixDiaryDate(diaryDate) || sequenceNumber && (`#${sequenceNumber}`),
		sequenceEpisodeTitle || title,
		"ta’",
		author,
		translator && `(tr ${translator})`
	].filter(elm => elm).join(" ");
}
