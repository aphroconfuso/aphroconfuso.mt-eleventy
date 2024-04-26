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

function getCurrentOrPreviousMonth() {
    // Get the current date
    const currentDate = new Date();

    // Get the current month and year
    const currentMonth = currentDate.getMonth(); // 0-indexed (0: January, 1: February, ..., 11: December)
    const currentYear = currentDate.getFullYear();

    // Find the first Monday of the current month
    const firstMonday = getFirstMondayOfMonth(currentYear, currentMonth + 1); // Add 1 to month since getFirstMondayOfMonth() expects 1-indexed month

    // Check if the current date is after the first Monday of the month
    if (currentDate >= firstMonday) {
        // Return the name of the current month
        return monthNames[currentMonth];
    } else {
        // If the current date is before the first Monday of the month, return the name of the previous month
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1; // If current month is January (0), previous month is December (11)
        return monthNames[previousMonth];
    }
}

module.exports = getCurrentOrPreviousMonth;
