const slugifyMaltese = require("./slugifyMaltese.js");

module.exports = (title, author, translator, sequenceTitle, sequenceNumber, subjectDate, sequenceEpisodeTitle, type) => {
	if (type === 'Terminu') return slugifyMaltese(`il-kliem-fit-teorija-${title}`);
	if (type === 'Ktieb_stampat' && title.startsWith('Antoloġija')) return slugifyMaltese(`kotba-${title}`);
	if (type === 'Ktieb_stampat') return slugifyMaltese(`kotba-${author}-${title}`);

	// Add author
	// if (type === 'Ktieb_stampat') return slugifyMaltese(`kotba-${ author }-${ title }`);
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
