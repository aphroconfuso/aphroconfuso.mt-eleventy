const slugifyMaltese = require("./slugifyMaltese.js");

module.exports = (title, author, translator) => {
	return slugifyMaltese(`${author ? author + ' ' : ''} ${translator ? translator + ' ' : ''} ${title}`);
}
