const fetch = require("node-fetch");
const getGeneric = require("../src/getGeneric.js");
const getNewsletter = () => getGeneric('newsletterPage');
module.exports = getNewsletter;
