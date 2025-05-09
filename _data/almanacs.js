const slugifyMaltese = require("../src/slugifyMaltese.js");

const monthNames = require("../src/getMonthsInMaltese.js")();

function generateCalendar(month) {
	const year = new Date().getFullYear();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const calendar = [];
  let startDay = (firstDay.getDay() + 6) % 7; // Adjust Sunday (0) to Monday (0)
  const totalDays = lastDay.getDate();

  let date = 1 - startDay;
  while (date <= totalDays) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(date > 0 && date <= totalDays ? date : '');
      date++;
    }
    calendar.push(week);
	}

	const weeks = { month: monthNames[month], weeks: calendar };

	if (month === 0) weeks.link = slugifyMaltese(`almanakk-${monthNames[new Date().getMonth()]}`)

	return weeks;
}

const getCalendar = () => {
	return [
		generateCalendar(0),
		generateCalendar(1),
		generateCalendar(2),
		generateCalendar(3),
		generateCalendar(4),
		generateCalendar(5),
		generateCalendar(6),
		generateCalendar(7),
		generateCalendar(8),
		generateCalendar(9),
		generateCalendar(10),
		generateCalendar(11),
	];
};

module.exports = getCalendar();
