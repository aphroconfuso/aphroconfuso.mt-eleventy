const fetch = require("node-fetch");
const getGeneric = require("../src/getGeneric.js");
const getPrivacy = () => getGeneric('privacyPolicy');
module.exports = getPrivacy;
