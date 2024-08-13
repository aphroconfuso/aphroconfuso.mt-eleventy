const getReads = (pronoun) => {
	const reads = {
	'hi': 'taqra',
	'hu': 'jaqra',
	'hi_hu': 'taqra',
	'huma': 'jaqraw',

	}
	return reads[pronoun || 'huma'];
}

module.exports = getReads;
