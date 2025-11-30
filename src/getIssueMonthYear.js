const monthNames = require("./getMonthsInMaltese.js")();

function getFirstMondayOfMonth(year, month) {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const dayOfWeek = firstDayOfMonth.getDay();
  const daysToAdd = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  return new Date(year, month - 1, 1 + daysToAdd);
}

function getMonthInfo(date = new Date(), option = "currentOrPrevious") {
  const issueDate = new Date(date);
  let issueMonth = issueDate.getMonth(); // 0–11
  let issueYear = issueDate.getFullYear();

  if (option === "next") {
    issueMonth = issueMonth === 11 ? 0 : issueMonth + 1;
    issueYear = issueMonth === 0 ? issueYear + 1 : issueYear;
  } else if (option === "previous") {
    issueMonth = issueMonth === 0 ? 11 : issueMonth - 1;
    issueYear = issueMonth === 11 ? issueYear - 1 : issueYear;
  } else if (option === "currentOrPrevious") {
    const firstMonday = getFirstMondayOfMonth(issueYear, issueMonth + 1);
    if (issueDate < firstMonday) {
      issueMonth = issueMonth === 0 ? 11 : issueMonth - 1;
      issueYear = issueMonth === 11 ? issueYear - 1 : issueYear;
    }
  }

  const firstMonday = getFirstMondayOfMonth(issueYear, issueMonth + 1);
  const season =
    issueMonth >= 2 && issueMonth <= 7 ? "Rebbiegħa" : "Ħarifa";

  return {
    month: monthNames[issueMonth],
    year: issueYear,
    monthYear: `${monthNames[issueMonth]} ${issueYear}`,
    season,
    firstMonday,              // full Date object
    firstMondayDate: firstMonday.getDate(), // just the day number
  };
}

module.exports = getMonthInfo;
