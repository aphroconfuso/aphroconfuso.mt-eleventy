const fetch = require("node-fetch");
const getGeneric = require("../src/getGeneric.js");
const getBookmarks = () => getGeneric('bookmark');
module.exports = getBookmarks;
