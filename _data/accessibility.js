const cachedPostFetch = require('../src/cachedPostFetch');
const getGeneric = require("../src/getGeneric.js");
const getAccessibility = () => getGeneric('accessibility');
module.exports = getAccessibility;
