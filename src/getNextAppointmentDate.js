const monthNames = require("./getMonthsInMaltese.js")();

const getNextFirstMonday = () => {
  const now = new Date();
  const nextMonth = now.getMonth() + 1;
  const year = nextMonth === 12 ? now.getFullYear() + 1 : now.getFullYear();

  // Create a date object for the first day of the next month
  const firstDayNextMonth = new Date(year, nextMonth % 12, 1);

  // Find the day of the week (0 for Sunday, 1 for Monday, etc.)
  const dayOfWeek = firstDayNextMonth.getDay();

  // Calculate the offset to the next Monday
  const offset = (8 - dayOfWeek) % 7;

  // Get the first Monday date
  const firstMonday = new Date(firstDayNextMonth);
  firstMonday.setDate(firstDayNextMonth.getDate() + offset);

  return firstMonday;
}

const getNextAppointmentDate = () => {
	const nextFirstMonday = getNextFirstMonday();
	const nextFirstMondayDate = nextFirstMonday.getDate();
	const nextFirstMondayMonth = nextFirstMonday.getMonth();
	const nextFirstMondayYear = nextFirstMonday.getFullYear();
	return `${ nextFirstMondayDate } ta’ ${ monthNames[nextFirstMondayMonth] } ${ nextFirstMondayYear }`;
}

module.exports = getNextAppointmentDate;
