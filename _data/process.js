const fetch = require("node-fetch");
const getGeneric = require("../src/getGeneric.js");
const getProcess = () => getGeneric('process');
module.exports = getProcess;
