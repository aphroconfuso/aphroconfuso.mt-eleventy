const slugifyMaltese = require("./slugifyMaltese.js");

module.exports = (title, author, translator, sequenceTitle, sequenceNumber, subjectDate, sequenceEpisodeTitle, type) => {
	if (type === 'Terminu') return slugifyMaltese(`il-kliem-fit-teorija-${title}`);
	return slugifyMaltese(
		`
			${ author || '' }
			${ translator || '' }
			${ !!subjectDate && (type === 'Djarju' || type === 'Poddata') ? (type === 'Djarju' ? 'djarju' : 'poddata') : (sequenceTitle || '') }
			${ (!!subjectDate && (type === 'Djarju' || type === 'Poddata') &&  subjectDate.replace(/\./g, '-')) || sequenceNumber || '' }
			${ sequenceEpisodeTitle || title }
		`
	);
}

// TEMPORARILY changed these until cms is upgraded to be able to delete dates (4.12.5)
// ${ !!subjectDate ? (type === 'Djarju' ? 'djarju' : 'poddata') : (sequenceTitle || '') }
// ${ (!!subjectDate &&  subjectDate.replace(/\./g, '-')) || sequenceNumber || '' }
