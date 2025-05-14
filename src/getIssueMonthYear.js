const monthNames = require("./getMonthsInMaltese.js")();

function getFirstMondayOfMonth(year, month) {
    // Create a new Date object for the first day of the month
    const firstDayOfMonth = new Date(year, month - 1, 1); // Month is 0-indexed, so subtract 1 from the month

    // Calculate the day of the week for the first day of the month (0: Sunday, 1: Monday, ..., 6: Saturday)
    const dayOfWeek = firstDayOfMonth.getDay();

    // Calculate the number of days to add to get to the first Monday
    const daysToAdd = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

    // Create a new Date object for the first Monday of the month
    const firstMonday = new Date(year, month - 1, 1 + daysToAdd); // Add daysToAdd to the first day of the month

    return firstMonday;
}

function getCurrentOrPreviousMonth(date) {

    // Get the current date or today
    const issueDate = !!date ? new Date(date) : new Date();

    // Get the current month and year
    const issueMonth = issueDate.getMonth(); // 0-indexed (0: January, 1: February, ..., 11: December)
    const issueYear = issueDate.getFullYear();

    // Find the first Monday of the current month
    const firstMonday = getFirstMondayOfMonth(issueYear, issueMonth + 1); // Add 1 to month since getFirstMondayOfMonth() expects 1-indexed month

		const season = (issueDate.getMonth() >= 2 && issueDate.getMonth() <= 7) ? "Rebbiegħa" : "Ħarifa";

    // Check if the current date is after the first Monday of the month
    if (issueDate >= firstMonday) {
        // Return the name of the current month
			return { month: monthNames[issueMonth], year: issueYear, monthYear: `${ monthNames[issueMonth] } ${ issueYear }`, season  };
    } else {
        // If the current date is before the first Monday of the month, return the name of the previous month
        const previousMonth = issueMonth === 0 ? 11 : issueMonth - 1; // If current month is January (0), previous month is December (11)
        const previousMonthYear = issueMonth === 0 ? issueYear - 1 : issueYear; // If current month is January (0), previous year is -1
        return { month: monthNames[previousMonth], year: previousMonthYear, monthYear: `${ monthNames[previousMonth] } ${ previousMonthYear }`, season }
    }
}

module.exports = getCurrentOrPreviousMonth;
