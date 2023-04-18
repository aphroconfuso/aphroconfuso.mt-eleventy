const fetch = require("node-fetch");
const getGeneric = require("../src/getGeneric.js");
const getPodcast = () => getGeneric('podcastPage');
module.exports = getPodcast;
