const fetch = require("node-fetch");
const getGeneric = require("../src/getGeneric.js");
const getColophon = () => getGeneric('colophon');
module.exports = getColophon;
