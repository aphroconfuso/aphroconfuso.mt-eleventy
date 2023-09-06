module.exports = (person) => {
	if (!person) return null;
	if (!!person.displayName) return person.displayName;
	const { forename, initials, surname } = person;
	return [forename, initials, surname].filter((e) => !!e).join(' ');
}
