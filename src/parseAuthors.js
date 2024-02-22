module.exports = (authorsData, authorsType) => {
	if (!authorsData) return;
	const authors = authorsData.map(author => author.attributes.displayName || `${ author.attributes.forename } ${ author.attributes.surname }`);
	const authorForename = authorsData[0].attributes && authorsData[0].attributes.forename;
	const authorsString = authorsType === 'kollettiva' ? authors[0] : authors.join(", ");
	const author = authorsString;
	const authorPronoun = authors.length > 1 ? 'huma' : authorsData[0].attributes.pronoun;
	return { author, authors, authorForename, authorsString, authorPronoun };
}
