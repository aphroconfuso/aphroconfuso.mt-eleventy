const { DateTime } = require("luxon");
const markdownItAnchor = require("markdown-it-anchor");

const {EleventyHtmlBasePlugin} = require("@11ty/eleventy");
const eleventySass = require("eleventy-sass");
const fetch = require('node-fetch');
const fs = require('fs');
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginNavigation = require("@11ty/eleventy-navigation");
const pluginRev = require("eleventy-plugin-rev");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

const smartTruncate = require('smart-truncate');
const stripTags = require("striptags");

const fixSubjectDate = require('./src/fixSubjectDate.js');
const slugifyStringMaltese = require("./src/slugifyMaltese.js");

const QRCode = require('qrcode');

module.exports = function(eleventyConfig) {
	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig.addPassthroughCopy({
		"./public/": "/",
		"./scss/style.css": "/css",
		"./node_modules/prismjs/themes/prism-okaidia.css": "/css/prism-okaidia.css"
	});

	// Copy redirects for Cloudflare
	fs.copyFile("./_redirects", "./aphroconfuso.mt/_redirects", () => console.log("_redirects copied"));

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch content images for the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");
	eleventyConfig.watchIgnores.add("public/img/qr/*");

	const fetchImage = async (imageUrl, saveToFileLocation) => await fetch(imageUrl).then(res =>
		res.body.pipe(fs.createWriteStream(saveToFileLocation))
	);

	eleventyConfig.on('eleventy.after', async ({dir, results, runMode, outputMode}) => {
		let urlsInContent = [], imagesInContent = [];
		results.forEach(i => {
			urlsInContent = urlsInContent.concat(i.content.match(/href="\/(.*?)\/"/g));
			imagesInContent = imagesInContent.concat(i.content.match(/\/stampi\/(.*?)\.(avif|jpg|jpeg|webp)/g));
		});

		const uniqueUrlsArray = [...new Set(urlsInContent)].filter(n => n).sort();
		uniqueUrlsArray.forEach(i => {
			if (!i) { return; }
			const fileLocation = i.replace(/href\=\"/, "./aphroconfuso.mt/site").replace(/\/\"/, "/index.html");
			if (!fs.existsSync(fileLocation)) {
				throw new Error(`${fileLocation} is linked but does not exist!`);
			};
		});

		const uniqueImagesArray = [...new Set(imagesInContent)].filter(n => n).sort();
		uniqueImagesArray.forEach(i => {
			if (!i) { return; }
			const saveToFileLocation = i.replace(/\/stampi/g, "./image-cache/");
			if (fs.existsSync(saveToFileLocation)) { return; }
			console.log(`Fetching ${i} ...`);
			const imageUrl = i.replace(/\/stampi/g, "https://stampi.aphroconfuso.mt");
			fetchImage(imageUrl, saveToFileLocation);
			// fetch(imageUrl).then(res =>
			// 	res.body.pipe(fs.createWriteStream(saveToFileLocation))
			// )
		});

		const webImagesFolder = "./aphroconfuso.mt/site/stampi";
		if (!fs.existsSync(webImagesFolder)){
			fs.mkdirSync(webImagesFolder);
		}

		await uniqueImagesArray.forEach(i => {
			if (!i) {return;}
			const image = i.replace(/\/stampi/g, "")
			const cachedFileLocation = `./image-cache${image}`;
			const webFileLocation = `${webImagesFolder}${image}`;

			if (fs.existsSync(webFileLocation)) {return;}
			if (fs.existsSync(cachedFileLocation)) {
				fs.copyFile(cachedFileLocation, webFileLocation, (err) => {
				if (err) throw err;
					console.log(`${i} copied to web folder`);
				});
			}
		});
		fs.readdir("./aphroconfuso.mt/site/stampi", (err, files) => {
			if (files.length < uniqueImagesArray.length) {
				console.log(`SOFT ERROR: Image discrepancy in folder: ${ files.length - uniqueImagesArray.length }!`);
				// throw new Error(`ERROR: Image discrepancy in folder: ${ files.length - uniqueImagesArray.length }!`);
			}
		});
	});

	// App plugins
	// eleventyConfig.addPlugin(require("./eleventy.config.drafts.js"));
	// eleventyConfig.addPlugin(require("./eleventy.config.images.js"));

	// Official plugins
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 }
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
	eleventyConfig.addPlugin(pluginBundle);

	// Others
	eleventyConfig.addPlugin(pluginRev);
	eleventyConfig.addPlugin(eleventySass, {
    compileOptions: {
      permalink: function(contents, inputPath) {
        return (data) => data.page.filePathStem.replace(/^\/scss\//, "/css/") + ".css";
      }
    },
    sass: {
      style: "compressed",
      sourceMap: false
    },
    rev: true
  });

	// Filters
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
	});

	eleventyConfig.addFilter('htmlDateString', (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
	});

	eleventyConfig.addFilter('subjectDate', function subjectDate(dateString) {
		return fixSubjectDate(dateString);
	});

	eleventyConfig.addFilter('subjectDateShort', function subjectDateShort(dateString) {
		return fixSubjectDate(dateString).replace(/\.20/, ".");
	});

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if(!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if( n < 0 ) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	// Return all the tags used in a collection
	eleventyConfig.addFilter("getAllTags", collection => {
		let tagSet = new Set();
		for(let item of collection) {
			(item.data.tags || []).forEach(tag => tagSet.add(tag));
		}
		return Array.from(tagSet);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
	});

	eleventyConfig.addFilter("prettifyMaltese", function prettifyMaltese(text) {
		return (text || []).replace(/<p>\s*<\/p>/gm, "")
			.replace(/-</gm, "- <")
			.replace(/  +/gm, " ")
			.replace(/<p> */gm, "<p>")
			.replace(/ *<\/p>/gm, "</p>")
			.replace(/ ?— ?| - | -- /gm, String.fromCharCode(8202, 8212, 8202))
			.replace(/ċ/gm, "MXc").replace(/ġ/gm, "MXg").replace(/ħ/gm, "MXh").replace(/ż/gm, "MXz").replace(/à/gm, "MXa")
			.replace(/Ċ/gm, "MXC").replace(/Ġ/gm, "MXG").replace(/Ħ/gm, "MXH").replace(/Ż/gm, "MXZ").replace(/À/gm, "MXA")
			.replace(/([ \'\"\,\.\?\!\’\“\”\—\>])([\w]{0,6}[lrstdnxz]|MXc|MXz)(-|’)(<em>)?(.+?)([ \,\.\?\!\’\“\”\—\<]|$)/gmi, "$1<l-m>$2$3$4$5</l-m>$6")
			.replace(/\'/gm, "’")
			.replace(/ \"/gm, " “")
			.replace(/\"/gm, "”")
			.replace(/”>/gm, "\">")
			.replace(/\=”/gm, "=\"")
			.replace(/(”)([,\.;:])/gm, "$1<span class=\"pull\">$2</span>")
			.replace(/([,\.])(”)/gm, "$1<span class=\"pullsemi\">$2</span>")
			.replace(/(’)([,\.;:])/gm, "$1<span class=\"pullsemi\">$2</span>")
			.replace(/MXc/gm, "ċ").replace(/MXg/gm, "ġ").replace(/MXh/gm, "ħ").replace(/MXz/gm, "ż").replace(/MXa/gm, "à")
			.replace(/MXC/gm, "Ċ").replace(/MXG/gm, "Ġ").replace(/MXH/gm, "Ħ").replace(/MXZ/gm, "Ż").replace(/MXA/gm, "À")
			.replace(/<\/blockquote>\s*<blockquote>/gm, "<br>")
			.replace(/- </gm, "-<")
			.replace(/(\d)\,(\d\d\d)/gm, `$1${ String.fromCharCode(8201) }$2`)
			.replace(/&amp;shy;/gm, '<wbr>')
			.replace(/<l-m>fx-1<\/l-m>/gm, "fx-1")
			.replace(/<l-m>right-aligned<\/l-m>/gm, "right-aligned")
			.replace(/(<h[56] id=".*?)(<l-m>)(.*?)(<\/l-m>)(.*?<\/h[56]>)/gm, "$1$3$5")
			.replace(/(id=")<i-class=fx-\d+>(.)<-i>/gm, "$1$2")
			.replace(/(=")<l-m>/gm, "$1");
	});

	eleventyConfig.addFilter("anchorise", function anchorise(sentence, useVerb = 'ara') {
		const [verb, destination] = sentence.split(' ');
		console.log(verb, destination, verb.toLowerCase() !== useVerb);
		if (verb.toLowerCase() !== useVerb) return sentence;
		return `${ verb } <a href="#${destination}">${slugifyStringMaltese(destination)}</a>`;
	});

	eleventyConfig.addFilter("escapeQuote", function escapeQuote(text) {
		return (text || []).replace(/'/g, "\\'");
	});

	eleventyConfig.addFilter("anchorise", function anchorise(sentence, useVerb = 'ara') {
		var regex = new RegExp(`(<p>${useVerb} “?"?)(\\w+)("?”?\.?<\\/p>)`, 'i');
		var match = sentence.match(regex);
		if (!match) return sentence;
		return `${match[1]}<a href="#${slugifyStringMaltese(match[2])}">${match[2]}</a>${match[3]}`;
	});

	eleventyConfig.addFilter("slugifyMaltese", function slugifyMaltese(text) {
		return slugifyStringMaltese(text);
	});

	eleventyConfig.addFilter("prettifyNumbers", function prettifyNumbers(text, punctuation = String.fromCharCode(8201)) {
		return (text.toString() || []).replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, `$&${ punctuation }`);
	});

	eleventyConfig.addFilter("semiDeSlugify", function semiDeSlugify(text) {
		return (text || []).replace(/\//g,'');
	});

	eleventyConfig.addFilter("fixMonthMaltese", function fixMonthMaltese(text) {
		return (text || []).replace(/Gunju/gi, "Ġunju")
			.replace(/Dicembru/gi, "Diċembru")
			.replace(/gunju/gi, "ġunju")
			.replace(/dicembru/gi, "diċembru");
	});

	eleventyConfig.addFilter("paragraphise", function paragraphise(text) {
		return (text || []).replace(/\\n\\n/gm, '\n').split('\n')
			.map(p => p && p.length && `<p>${ p }</p>`)
			.join('\n');
	});

	eleventyConfig.addFilter("wrapInQuotes", function wrapInQuotes(text) {
		if (!text) return "null";
		return `"${ text }"`;
	});

	eleventyConfig.addFilter("numberify", function numberify(number, words) {
		// kelma, kelmiet
		if (!number) return "null";
		const digits = parseInt(number.toString().slice(-2));
		if (digits >= 2 && digits <= 10) return `${ number } ${ words[1] }`;
		if (digits >= 11 && digits <= 20) return `${ number }-il ${ words[0]}`;
		return `${ number } ${ words[0] }`;
	});

	// REMOVE NBSP;
	// REDO THIS ALGORITHM
	eleventyConfig.addFilter("versify", function versify(text1) {
		const text = text1.replace("&nbsp;", "").replace(/<p>\s*<\/p>\s*/gm, '#').replace(/#\s*#/gm, '#');
		return stripTags(text, ['i', 'em']).split('#').map(p => p && p.length && `<p>${ p.replace(/\n/gm, '<br/>') }</p>`)
			.join('<p class="poetry-separator">*</p>');
	});

	eleventyConfig.addFilter("versifyDescription", function versifyDescription(text) {
		return stripTags(text || [], ['i', 'em']).replace(/\n/gm, '<br/>');
	});

	eleventyConfig.addFilter("dropCapsifyAndSectionise", function dropCapsifyAndSectionise(text, splitText, beforeOrAfter, dontUseDropcaps) {
		let decoratedText = (text || []).replace(/<p>\#\#\#<\/p>$/, '');
		if (!dontUseDropcaps) {
			decoratedText = decoratedText.replace(/ċ/gm, "MXc").replace(/ġ/gm, "MXg").replace(/ħ/gm, "MXh").replace(/ż/gm, "MXz").replace(/à/gm, "MXa")
				.replace(/Ċ/gm, "MXC").replace(/Ġ/gm, "MXG").replace(/Ħ/gm, "MXH").replace(/Ż/gm, "MXZ").replace(/À/gm, "MXA")
				.replace(/<p(.*?)>(.)([\w\-]+)/, '<p$1><span class="initial"><span class="dropcap drop-$2">$2</span>$3</span>')
				.replace(/<p>\#<\/p>\s*(<h[56].*?<\/h[56]>)?\s*<p>(.)([\w\-\’]+)/gm, '$1<p class="break"><span class="initial"><span class="dropcap drop-$2">$2</span>$3</span>')
				.replace(/MXc/gm, "ċ").replace(/MXg/gm, "ġ").replace(/MXh/gm, "ħ").replace(/MXz/gm, "ż").replace(/MXa/gm, "à")
				.replace(/MXC/gm, "Ċ").replace(/MXG/gm, "Ġ").replace(/MXH/gm, "Ħ").replace(/MXZ/gm, "Ż").replace(/MXA/gm, "À")
				.replace('drop-I">I</span>e', 'drop-Ie">IE</span>')
				.replace('drop-G">G</span>ħ', 'drop-Għ">GĦ</span>')
				.replace('drop-M">M</span>XC', 'drop-Ċ">Ċ</span>')
				.replace('drop-M">M</span>XG', 'drop-Ġ">Ġ</span>')
				.replace('drop-M">M</span>XH', 'drop-Ħ">Ħ</span>')
				.replace('drop-M">M</span>XZ', 'drop-Ż">Ż</span>')
				.replace(/\[\+\]/gm, `<p>${String.fromCharCode(160)}</p>`);
		}
		if (!splitText) {
			return decoratedText;
		}
		const regex = new RegExp(`${ splitText }</p>`);
		const splitArray = decoratedText.split(regex);
		const matchedText = decoratedText.match(regex)[0];
		return beforeOrAfter === 0 ? splitArray[0] + matchedText : splitArray[1];
	});

	eleventyConfig.addFilter("diarySectionise", function diarySectionise(text, splitText, beforeOrAfter, dontUseDropcaps) {
		let decoratedText = (text || []).replace(/<p>\#\#\#<\/p>$/, '');
		decoratedText = decoratedText.replace(/ċ/gm, "MXc").replace(/ġ/gm, "MXg").replace(/ħ/gm, "MXh").replace(/ż/gm, "MXz").replace(/à/gm, "MXa")
			.replace(/Ċ/gm, "MXC").replace(/Ġ/gm, "MXG").replace(/Ħ/gm, "MXH").replace(/Ż/gm, "MXZ").replace(/À/gm, "MXA")
			.replace(/<p(.*?)>(.)([\w\-]+)/, '<p$1><span class="initial">$2$3</span>')
			.replace(/<p>\#<\/p>\s*<p>(.)([\w\-\’]+)/gm, '<p class="break"><span class="initial">$1$2</span>')
			.replace(/MXc/gm, "ċ").replace(/MXg/gm, "ġ").replace(/MXh/gm, "ħ").replace(/MXz/gm, "ż").replace(/MXa/gm, "à")
			.replace(/MXC/gm, "Ċ").replace(/MXG/gm, "Ġ").replace(/MXH/gm, "Ħ").replace(/MXZ/gm, "Ż").replace(/MXA/gm, "À")
			.replace('drop-I">I</span>e', 'drop-Ie">IE</span>')
			.replace('drop-G">G</span>ħ', 'drop-Għ">GĦ</span>')
			.replace('drop-M">M</span>XC', 'drop-Ċ">Ċ</span>')
			.replace('drop-M">M</span>XG', 'drop-Ġ">Ġ</span>')
			.replace('drop-M">M</span>XH', 'drop-Ħ">Ħ</span>')
			.replace('drop-M">M</span>XZ', 'drop-Ż">Ż</span>')
			.replace(/\[\+\]/gm, `<p>${String.fromCharCode(160)}</p>`);
		return decoratedText;
	});

	eleventyConfig.addFilter("sectioniseOnly", function sectioniseOnly(text) {
		return (text || []).replace(/<p>\#\#\#<\/p>$/, '').replace(/<p>\#<\/p>\s*<p>/gm, '<p class="break">');
	});

	eleventyConfig.addFilter("endDotify", function endDotify(text) {
		return (text || []).replace(/([^ ]+)([.?!]|<span class="pull.*?">.<\/span>)\s*<\/(p|blockquote)>\s*$/, '<l-m>$1 <span class="end-dot">.</span></l-m></$3>');
	});

	eleventyConfig.addFilter("restrictHtml", function restrictHtml(text, allowedTags) {
		return stripTags(text || [], allowedTags || ['a', 'span', 'p', 'i', 'em']);
	});

	eleventyConfig.addFilter("getDescription", function getDescription(text) {
		return smartTruncate(stripTags(text || []), 300);
	});

	eleventyConfig.addFilter("wordcount", function wordcount(text) {
		return stripTags(text || []).trim().split(/\s+/).length;
	});

	// Customize Markdown library settings:
	eleventyConfig.amendLibrary("md", mdLib => {
		mdLib.use(markdownItAnchor, {
			permalink: markdownItAnchor.permalink.ariaHidden({
				placement: "after",
				class: "header-anchor",
				symbol: "#",
				ariaHidden: false,
			}),
			level: [1,2,3,4],
			slugify: eleventyConfig.getFilter("slugify")
		});
	});

	eleventyConfig.addFilter("fixPodcastTitle", function wordcount(text) {
		return stripTags(text || []).replace(/(Noti Editorjali)(\:.*$)/i, "$1")
			.replace(/(.*?)( \(taħdita\)$)/i, "$1");
	});

	eleventyConfig.addFilter("qrCodePng", function qrCodePng(path) {
		const imageLocation = `/img/qr/${ path.replace(/\//gm, '') }.png`;
		QRCode.toFile(`public${imageLocation}`, `https://aphroconfuso.mt${path}`, {
			errorCorrectionLevel: 'H'
		}, function(err) {
			if (err) throw err;
		});
		return imageLocation;
	});

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

	return {
		// Control which files Eleventy will process
		// e.g.: *.md, *.njk, *.html, *.liquid
		templateFormats: [
			"md",
			"njk",
			"html",
			"liquid"
		],

		// Pre-process *.md files with: (default: `liquid`)
		markdownTemplateEngine: "njk",

		// Pre-process *.html files with: (default: `liquid`)
		htmlTemplateEngine: "njk",

		// These are all optional:
		dir: {
			input: "content",          // default: "."
			includes: "../_includes",  // default: "_includes"
			data: "../_data",          // default: "_data"
			output: "aphroconfuso.mt/site"  // default: "_site"
		},

		// -----------------------------------------------------------------
		// Optional items:
		// -----------------------------------------------------------------

		// If your site deploys to a subdirectory, change `pathPrefix`.
		// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

		// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
		// it will transform any absolute URLs in your HTML to include this
		// folder name and does **not** affect where things go in the output folder.
		pathPrefix: "/",
	};
};
