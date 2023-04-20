module.exports = (date) => {
	const newDate = new Date(date);
	const year = newDate.getFullYear();
	const monthNumber = newDate.getMonth();
	const monthsMaltese = ['Jannar', 'Frar', 'Marzu', 'April', 'Mejju', 'Ġunju', 'Lulju', 'Awwissu', 'Settembru', 'Ottubru', 'Novembru', 'Diċembru'];
	const month = monthsMaltese[monthNumber];
	return `${month} ${year}`
}
