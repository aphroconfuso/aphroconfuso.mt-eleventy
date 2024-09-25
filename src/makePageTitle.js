const fixSubjectDate = require("../src/fixSubjectDate.js");

module.exports = (title, author, translator, sequenceTitle, sequenceNumber, subjectDate, sequenceEpisodeTitle, type) => {
	if (type === 'Terminu') return `Il-Kliem Fit-Teorija · ${title}`;
	return [
		subjectDate && title !== 'Bil-Moħbi fil-Beraħ' ? type : '',
		type === 'Esej' && sequenceTitle,
		title !== 'Bil-Moħbi fil-Beraħ' && subjectDate && fixSubjectDate(subjectDate) || sequenceNumber && (`#${ sequenceNumber }`),
		sequenceEpisodeTitle || title,
		"ta’",
		author,
		translator && `(tr ${translator})`
	].filter(e => e).join(" ").replace(/:: /, ": ");
}

// When it's posssible to null diaryDate (subjectDate)
//		subjectDate ? type : '',
