const customMonthNumber = require("./getCustomMonthNumber.js")();

const getFounders = () => {
	if (customMonthNumber % 2 === 0) {
		return '<a href="/joe-gatt/">Joe Gatt</a> u <a href="/loranne-vella/">Loranne Vella</a>';
	} else {
		return '<a href="/loranne-vella/">Loranne Vella</a> u <a href="/joe-gatt/">Joe Gatt</a>';
	}
}

module.exports = getFounders;
