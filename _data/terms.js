const fetch = require("node-fetch");
const getGeneric = require("../src/getGeneric.js");
const getTerms = () => getGeneric('termsStatement');
module.exports = getTerms;
