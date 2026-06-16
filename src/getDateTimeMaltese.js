const monthNames = require("./getMonthsInMaltese.js")();
const sunnify = require("./sunnify.js");

const dateTimeMaltese = (date) => {

	// Get the current date or today
	// const thisDate = !!date ? Date.parse(new Date(date).toLocaleString({timeZone: 'Europe/Malta'})) : new Date();
	const thisDate = !!date ? new Date(date) : new Date();


	// Get the current month and year
	const nowHours = thisDate.getHours() % 12
	const nowAmPm = thisDate.getHours() >= 12 ? 'pm' : 'am';
	const nowDate = thisDate.getDate();
	const nowMonth = thisDate.getMonth(); // 0-indexed (0: January, 1: February, ..., 11: December)
	const nowYear = thisDate.getFullYear();

	return {
		fullDate: `${ sunnify(nowDate) } ta’ ${ monthNames[nowMonth] } ${ nowYear }`,
		fullDateTime: `${ sunnify(nowDate) } ta’ ${ monthNames[nowMonth] } ${ nowYear } f${ sunnify(nowHours) }:${ thisDate.getMinutes() } ${ nowAmPm }`,
	};
}

module.exports = dateTimeMaltese;
