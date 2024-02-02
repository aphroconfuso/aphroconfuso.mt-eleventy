const fixSubjectDate = require("../src/fixSubjectDate.js");
const slugifyMaltese = require("./slugifyMaltese.js");

module.exports = (title, author, translator, sequenceTitle, sequenceNumber, subjectDate, sequenceEpisodeTitle) => {
	return slugifyMaltese(
		`
			${ author || '' }
			${ translator || '' }
			${ subjectDate ? 'Djarju' : (sequenceTitle || '') }
			${ subjectDate && fixSubjectDate(subjectDate).replace(/\./g, '-') || sequenceNumber || '' }
			${ sequenceEpisodeTitle || title }
		`
	);
}
