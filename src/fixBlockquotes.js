const fixBlockquotes = (text) => {
	if (!text) return "XXXXXXfixBlockquotesXXX";
	return (text || []).replace(/<blockquote class="enjambed">\s*<blockquote>\s*(.*?)\s*<\/blockquote>\s*<\/blockquote>/gm, "<blockquote class=\"enjambed\">$1</blockquote>")
		.replace(/<blockquote>\s*<blockquote>\s*(.*?)\s*<\/blockquote>\s*<\/blockquote>/gm, "<blockquote>$1</blockquote>")
		.replace(/<blockquote class="enjambed">\s*<p>\s*(.*?)\s*<\/p>\s*<\/blockquote>/gm, "<blockquote class=\"enjambed\">$1</blockquote>")
		.replace(/<blockquote>\s*<p>\s*(.*?)\s*<\/p>\s*<\/blockquote>/gm, "<blockquote>$1</blockquote>")
	return text;
}

module.exports = fixBlockquotes;
