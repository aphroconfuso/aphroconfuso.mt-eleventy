const fixSubjectDate = require("../src/fixSubjectDate.js");

module.exports = (title, author, translator, sequenceTitle, sequenceNumber, subjectDate, sequenceEpisodeTitle, type) => {
	if (type === 'Terminu') return `Il-Kliem Fit-Teorija · ${ title }`;
	if (type === 'Recensjoni' && title.startsWith('Antoloġija')) return `Kotba · ${title}`;
	if (type === 'Recensjoni') return `Kotba · ${author} · ${title}`;
	return [
		(type === 'Esej' || type === 'Poezija') && sequenceTitle,
		title !== 'Bil-Moħbi fil-Beraħ' && subjectDate && fixSubjectDate(subjectDate) || sequenceNumber && (`#${ sequenceNumber }`),
		sequenceEpisodeTitle || title,
		"ta’",
		author,
		translator && `(tr ${translator})`
	].filter(e => e).join(" ").replace(/:: /, ": ");
}

// When it's posssible to null diaryDate (subjectDate)
//		subjectDate ? type : '',
