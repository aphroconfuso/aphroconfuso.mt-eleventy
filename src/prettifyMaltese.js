const fixBlockquotes = require("./fixBlockquotes.js");
const dateTimeMaltese = require("./getDateTimeMaltese.js");

const prettifyMaltese = (text) => {
	if (!text) return "XXXXXXprettifyMalteseXXX";

	let result = text;
	result = fixBlockquotes(result);

	return (result || []).replace(/ data-.*?=".*?"/gmi, "")
		.replace(/&nbsp;/gmi, " ")
		.replace(/td data-.*?=".*?"/gmi, "td")
		.replace(/fx-(\d)/gmi, "fx$1")
		.replace(/<mark/gm, "<span")
		.replace(/<\/mark>/gm, "</span>")
		.replace(/<i>/gm, "<em>")
		.replace(/<\/i>/gm, "</em>")
		.replace(/<p>&nbsp;<\/p>/gm, "")
		.replace(/<p>\s*<\/p>/gm, "")
		.replace(/-</gm, "- <")
		.replace(/  +/gm, " ")
		.replace(/<p>\s+/gm, "<p>")
		.replace(/\s+<\/p>/gm, "</p>")
		.replace(/« /gm, "«&nbsp;")
		.replace(/ »/gm, "&nbsp;»")
		.replace(/ ?— ?| - | -- /gm, String.fromCharCode(8202, 8212, 8202))
		.replace(/ċ/gm, "MMXXc").replace(/ġ/gm, "MMXXg").replace(/ħ/gm, "MMXXh").replace(/ż/gm, "MMXXz").replace(/à/gm, "MMXXa")
		.replace(/Ċ/gm, "MMXXC").replace(/Ġ/gm, "MMXXG").replace(/Ħ/gm, "MMXXH").replace(/Ż/gm, "MMXXZ").replace(/À/gm, "MMXXA")
		.replace(/([ \'\"\,\.\?\!\’\“\”\—\>])([\w]{0,6}[lrstdnxz]|MMXXc|MMXXz)(-|’)(<em>)?(.+?)([ \,\.\?\!\’\“\”\—\<]|$)/gmi, "$1<l-m>$2$3$4$5</l-m>$6")
		.replace(/( [\'\’])(i?l) /gmi, "$1$2&nbsp;")
		.replace(/\'/gm, "’")
		.replace(/ \"/gm, " “")
		.replace(/\"/gm, "”")
		.replace(/”>/gm, "\">")
		.replace(/\=”/gm, "=\"")
		.replace(/(”)([,\.;:])/gm, "$1<span class=\"pull\">$2</span>")
		.replace(/([,\.])(”)/gm, "$1<span class=\"pullsemi\">$2</span>")
		.replace(/(’)([,\.;:])/gm, "$1<span class=\"pullsemi\">$2</span>")
		.replace(/MMXXc/gm, "ċ").replace(/MMXXg/gm, "ġ").replace(/MMXXh/gm, "ħ").replace(/MMXXz/gm, "ż").replace(/MMXXa/gm, "à")
		.replace(/MMXXC/gm, "Ċ").replace(/MMXXG/gm, "Ġ").replace(/MMXXH/gm, "Ħ").replace(/MMXXZ/gm, "Ż").replace(/MMXXA/gm, "À")
		.replace(/- </gm, "-<")
		.replace(/(\d)\,(\d\d\d)/gm, `$1${ String.fromCharCode(8201) }$2`)
		.replace(/&amp;shy;/gm, '<wbr>')
		.replace(/<l-m>(fx-?\d)<\/l-m>/gm, "$1")
		.replace(/<l-m>right-aligned<\/l-m>/gm, "right-aligned")
		.replace(/(<h[56] id=".*?)(<l-m>)(.*?)(<\/l-m>)(.*?<\/h[56]>)/gm, "$1$3$5")
		.replace(/(id=")<span-class=fx-?\d+>(.)<-mark>/gm, "$1$2")
		.replace(/https:\/\/aphroconfuso.mt\//gm, "/")
		.replace(/https:\/\/search\.worldcat\.org\/\w\w\//gm, "https://search.worldcat.org/")
		.replace(/XXXDATETIMEFULLXXX/gm, dateTimeMaltese().full)
		.replace(/(=")<l-m>/gm, "$1");
}

module.exports = prettifyMaltese;

// .replace(/([A-Z]{3,})/gm, "<span class=\"sc\">$1</span>").replace(/([A-Z]+[\.-]?[0-9.-]+)/gm, "<span class=\"sc\">$1</span>").replace(/([0-9]+[\.-]?[A-Z]+)/gm, "<span class=\"sc\">$1</span>")

// test properly
// .replace(/([ \-“‘\(\{\[])([ \-\/A-Z]{3,})([ \-”’\!\?\.\,\;\:\)\}\]])/gm, "<span class=\"sc\">$1$2$3</span>")
