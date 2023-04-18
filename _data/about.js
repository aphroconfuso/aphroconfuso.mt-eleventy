const fetch = require("node-fetch");
const getGeneric = require("../src/getGeneric.js");
const getAbout = () => getGeneric('about');
module.exports = getAbout;
