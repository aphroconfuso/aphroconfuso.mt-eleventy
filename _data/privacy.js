const cachedPostFetch = require('../src/cachedPostFetch');
const getGeneric = require("../src/getGeneric.js");
const getPrivacy = () => getGeneric('privacyPolicy');
module.exports = getPrivacy;
