const monthsInMaltese = require("./getMonthsInMaltese.js");

module.exports = (date) => {
	const newDate = new Date(date);
	const monthNumber = newDate.getMonth();
	const month = monthsInMaltese()[monthNumber];
	return month;
}
