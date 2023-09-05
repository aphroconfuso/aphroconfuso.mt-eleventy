const slugifyMaltese = require("./slugifyMaltese.js");

module.exports = (title, author, translator, sequenceTitle, sequenceNumber, sequenceEpisodeTitle) => {
	return slugifyMaltese(
		`
			${ author ? author + ' ' : '' }
			${ translator ? translator + ' ' : '' }
			${ sequenceTitle ? sequenceTitle + ' ' : '' }
			${ sequenceTitle ? sequenceNumber + ' ' : '' }
			${ sequenceEpisodeTitle || title }
		`
	);
}
