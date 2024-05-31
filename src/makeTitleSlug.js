const slugifyMaltese = require("./slugifyMaltese.js");

module.exports = (title, author, translator, sequenceTitle, sequenceNumber, subjectDate, sequenceEpisodeTitle, type) => {
	if (type === 'Terminu') return slugifyMaltese(`il-kliem-fit-teorija-${title}`);
	return slugifyMaltese(
		`
			${ author || '' }
			${ translator || '' }
			${ !!subjectDate ? (type === 'Djarju' ? 'djarju' : 'poddata') : (sequenceTitle || '') }
			${ (!!subjectDate &&  subjectDate.replace(/\./g, '-')) || sequenceNumber || '' }
			${ sequenceEpisodeTitle || title }
		`
	);
}
