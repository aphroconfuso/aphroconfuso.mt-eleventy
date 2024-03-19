const fixSubjectDate = require("../src/fixSubjectDate.js");

module.exports = (title, author, translator, sequenceTitle, sequenceNumber, subjectDate, sequenceEpisodeTitle, type) => {
	return [
		subjectDate ? type : '',
		sequenceTitle,
		subjectDate && fixSubjectDate(subjectDate) || sequenceNumber && (`#${ sequenceNumber }`),
		sequenceEpisodeTitle || title,
		"ta’",
		author,
		translator && `(tr ${translator})`
	].filter(e => e).join(" ");
}
