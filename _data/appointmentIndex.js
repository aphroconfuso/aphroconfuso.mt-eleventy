const fetch = require("node-fetch");
const getGeneric = require("../src/getGeneric.js");
const getAppointmentIndex = () => getGeneric('appointmentIndex');
module.exports = getAppointmentIndex;
