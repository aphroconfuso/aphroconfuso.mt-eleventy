const monthNames = require("./getMonthsInMaltese.js")();

const sunnyfier = (number) => {
	let sunnified = '';
	const lastDigit = number % 10;
	switch (lastDigit) {
		case 1:
		case 2:
		case 6:
		case 7:
			sunnified = `fis-${ number }`;
			break;
		case 3:
		case 8:
			sunnified = `fit-${ number }`;
			break;
		case 9:
			sunnified = `fid-${ number }`;
			break;
		case 4:
		case 10:
			sunnified = `fl-${ number }`;
			break;
		case 12:
			sunnified = `f’${ number }`;
			break;
		default:
			sunnified = `fil-${ number }`;
	}
	return sunnified;
};

const dateTimeMaltese = (date) => {

	// Get the current date or today
	const thisDate = !!date ? new Date(date) : new Date();

	// Get the current month and year
	const nowHours = thisDate.getHours() % 12
	const nowAmPm = thisDate.getHours() >= 12 ? 'pm' : 'am';
	const nowDate = thisDate.getDate();
	const nowMonth = thisDate.getMonth(); // 0-indexed (0: January, 1: February, ..., 11: December)
	const nowYear = thisDate.getFullYear();

	return {
		full: `${ sunnyfier(nowDate) } ta’ ${ monthNames[nowMonth] } ${ nowYear } ${ sunnyfier(nowHours) }:${ thisDate.getMinutes() } ${ nowAmPm }`,
	};
}

module.exports = dateTimeMaltese;
