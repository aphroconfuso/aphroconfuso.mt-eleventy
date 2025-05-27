const cachedPostFetch = require('../src/cachedPostFetch');
const getGeneric = require("../src/getGeneric.js");
const getNewsletter = () => getGeneric('newsletterPage');
module.exports = getNewsletter;
