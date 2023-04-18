const fetch = require("node-fetch");
const getGeneric = require("../src/getGeneric.js");
const getNewsletters = () => getGeneric('newsletterPage');
module.exports = getNewsletters;
