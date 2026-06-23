const cheerio = require("cheerio");

const utmise = (html, key) => {

	const $ = cheerio.load(html);

  let imageCount = 0;
  let textCount = 0;

  $("a[href]").each((_, a) => {
    const $a = $(a);

    const url = new URL($a.attr("href"), "https://aphroconfuso.mt");

    url.search = "";
    url.hash = "";

    if ($a.find("img").length) {
      imageCount++;
      url.search = `?mtm_campaign=${key}&mtm_kwd=stampa-${imageCount}@TrackLink`;
    } else {
      textCount++;
      url.search = `?mtm_campaign=${key}&mtm_kwd=kliem-${textCount}@TrackLink`;
    }

    $a.attr("href", url.toString());
  });

  return $.html();
}

module.exports = utmise;
