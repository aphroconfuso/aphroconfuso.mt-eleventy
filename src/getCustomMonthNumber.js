function getFirstMonday(year, month) {
  // month: 0-11
  const d = new Date(year, month, 1);

  while (d.getDay() !== 1) { // Monday = 1
    d.setDate(d.getDate() + 1);
  }

  return d;
}

function getCustomMonthNumber(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstMonday = getFirstMonday(year, month);

  if (date < firstMonday) {
    // Belongs to previous custom month
    const prevMonth = new Date(year, month - 1, 15);
    return prevMonth.getMonth() + 1;
  }

  return month + 1;
}

module.exports = getCustomMonthNumber;
