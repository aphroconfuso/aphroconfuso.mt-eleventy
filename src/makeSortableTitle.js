module.exports = (title) => {
	return title.replace(/c/gi, 'cbb')
		.replace(/ċ/gi, 'cba')
		.replace(/għ/gi, 'gac')
		.replace(/g/gi, 'gab')
		.replace(/ġ/gi, 'gaa')
		.replace(/h/gi, 'gad')
		.replace(/ħ/gi, 'gae')
		.replace(/z/gi, 'zb')
		.replace(/ż/gi, 'za')
		.replace(/\d+/g, (match) => match.padStart(9, '0'))
		.replace(/^\W/, '')
		.replace(/^[Ii]?[lrstċdnxzż]\-/i, '');
}
