module.exports = (text) => {
	return (text || []).replace(/  +/gm, " ")
			.replace(/'/gm, "")
			.replace(/[ \;\:\@\~\#\!\?\·]/gm, "-")
			.toLowerCase()
}
