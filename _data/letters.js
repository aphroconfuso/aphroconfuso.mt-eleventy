const fetch = require("node-fetch");
const getGeneric = require("../src/getGeneric.js");
const getLetters = () => getGeneric('lettersPage');
module.exports = getLetters;
