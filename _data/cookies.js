const fetch = require("node-fetch");
const getGeneric = require("../src/getGeneric.js");
const getCookies = () => getGeneric('cookiePolicy');
module.exports = getCookies;
