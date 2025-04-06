const slugifyMaltese = require("../src/slugifyMaltese.js");
const monthNames = require("../src/getMonthsInMaltese.js")();

function days() {
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Frar always 29

  const days = [];

  for (let m = 0; m < 12; m++) {
		for (let d = 1; d <= daysInMonth[m]; d++) {
			const thisDate = `${ d } ta' ${ monthNames[m] }`;
      days.push({ date: thisDate, month: monthNames[m] });
    }
  }

  return days;
}

module.exports = days();
