const getGeneric = require("../src/getGeneric.js");
const getCookies = () => getGeneric('cookiePolicy');
module.exports = getCookies;
