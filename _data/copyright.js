const cachedPostFetch = require('../src/cachedPostFetch');
const getGeneric = require("../src/getGeneric.js");
const getCopyright = () => getGeneric('copyright');
module.exports = getCopyright;
