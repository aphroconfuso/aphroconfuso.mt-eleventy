module.exports = (text) => {
	if (!text) {
		console.log(`slugifyMaltese got null!`);
	}
	return (text || []).trim().replace(/  +/gm, " ")
		.replace(/\s+/gm, "-")
		.replace(/['‘’"“”]/gm, "")
		.replace(/[ \/\,\;\:\@\~\#\!\?\·]/gm, "-")
		.replace(/--/gm, "-")
		.toLowerCase()
}
