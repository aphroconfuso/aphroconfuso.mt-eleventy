const fixDiaryDate = require("../src/fixDiaryDate.js");
const slugifyMaltese = require("./slugifyMaltese.js");

module.exports = (title, author, translator, sequenceTitle, sequenceNumber, diaryDate, sequenceEpisodeTitle) => {
	return slugifyMaltese(
		`
			${ author || '' }
			${ translator || '' }
			${ diaryDate ? 'Djarju' : (sequenceTitle || '') }
			${ diaryDate && fixDiaryDate(diaryDate).replace(/\./g, '-') || sequenceNumber || '' }
			${ sequenceEpisodeTitle || title }
		`
	);
}
