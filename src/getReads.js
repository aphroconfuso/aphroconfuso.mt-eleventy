module.exports = (pronoun) => {
	const reads = {
		'hi': 'taqra',
		'hu': 'jaqra',
		'hi_hu': Math.round(Math.random()) ? 'taqra' : 'jaqra',
		'huma': 'jaqraw',
	}
	return reads[pronoun || 'huma'];
}
