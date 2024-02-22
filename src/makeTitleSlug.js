const fixSubjectDate = require("./fixSubjectDate.js");
const slugifyMaltese = require("./slugifyMaltese.js");

module.exports = (title, author, translator, sequenceTitle, sequenceNumber, subjectDate, sequenceEpisodeTitle, type) => slugifyMaltese(
	`
		${ author || '' }
		${ translator || '' }
		${ !!subjectDate ? (type === 'Djarju' ? 'djarju' : 'poddata') : (sequenceTitle || '') }
		${ (!!subjectDate &&  subjectDate.replace(/\./g, '-')) || sequenceNumber || '' }
		${ sequenceEpisodeTitle || title }
	`
);
