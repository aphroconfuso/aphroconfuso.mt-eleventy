module.exports = (pronoun) => {
	const reads = {
		'hi': 'taqra',
		'hu': 'jaqra',
		'hi_hu': 'taqra',
		'huma': 'jaqraw',
	}
	return reads[pronoun || 'huma'];
}

// 'hi_hu': Math.round(Math.random()) ? 'taqra' : 'jaqra',
