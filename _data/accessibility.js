const fetch = require("node-fetch");
const getGeneric = require("../src/getGeneric.js");
const getAccessibility = () => getGeneric('accessibility');
module.exports = getAccessibility;
