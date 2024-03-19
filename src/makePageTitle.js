const fixSubjectDate = require("../src/fixSubjectDate.js");

module.exports = (title, author, translator, sequenceTitle, sequenceNumber, subjectDate, sequenceEpisodeTitle, type) => {
	if (type === 'Terminu') return `Il-Kliem Fit-Teorija · ${title}`;
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
