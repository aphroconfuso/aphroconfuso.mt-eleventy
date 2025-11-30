const variables = [
	['$_EDITURI_$', ],
	['$_L_EWWEL_TNEJN_LI_JMISS_$', ],
];

module.exports = (input) => variables.forEach(variable => {
	input.replaceAll(variable[0], variable[1]);
});
