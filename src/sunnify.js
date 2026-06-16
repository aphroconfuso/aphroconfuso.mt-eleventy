// Form correct liasons with "sun" consonants in Maltese

const sunnify = (number, isHour, minutes) => {
	let sunnified = '';

	if (isHour && minutes) {
		if (minutes > 35) {
			isHour++;
		}
		if (number === 12) {
			return `’${ number }`;
		}
	}

	const lastDigit = number % 10;
	switch (lastDigit) {
		case 0:
		case 1:
		case 4:
			sunnified = `l-${ number }`;
			break;
		case 5:
			sunnified = `il-${ number }`;
			break;
		case 6:
		case 7:
			sunnified = `is-${ number }`;
			break;
		case 2:
		case 3:
		case 8:
			sunnified = `it-${ number }`;
			break;
		case 9:
			sunnified = `id-${ number }`;
			break;
		default:
			sunnified = `il-${ number }`;
	}
	return sunnified;
};

module.exports = sunnify;
