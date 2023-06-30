const { DateTime } = require("luxon");
const markdownItAnchor = require("markdown-it-anchor");

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginNavigation = require("@11ty/eleventy-navigation");
const {EleventyHtmlBasePlugin} = require("@11ty/eleventy");
const eleventySass = require("eleventy-sass");
const pluginRev = require("eleventy-plugin-rev");
const stripTags = require("striptags");
const smartTruncate = require('smart-truncate');

const slugifyStringMaltese = require("./src/slugifyMaltese.js");

module.exports = function(eleventyConfig) {
	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig.addPassthroughCopy({
		"./public/": "/",
		"./scss/style.css": "/css",
		"./node_modules/prismjs/themes/prism-okaidia.css": "/css/prism-okaidia.css"
	});

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch content images for the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

	// App plugins
	eleventyConfig.addPlugin(require("./eleventy.config.drafts.js"));
	eleventyConfig.addPlugin(require("./eleventy.config.images.js"));

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
			.replace(/'/gm, "’")
			.replace(/  +/gm, " ")
			.replace(/<p> */gm, "<p>")
			.replace(/ *<\/p>/gm, "</p>")
			.replace(/ ?— ?| - | -- /gm, "&hairsp;—&hairsp;")
			.replace(/ċ/gm,"MXc").replace(/ġ/gm,"MXg").replace(/ħ/gm,"MXh").replace(/ż/gm,"MXz").replace(/à/gm,"MXa")
			.replace(/Ċ/gm,"MXC").replace(/Ġ/gm,"MXG").replace(/Ħ/gm,"MXH").replace(/Ż/gm,"MXZ").replace(/À/gm,"MXA")
			.replace(/([ \,\.\?\!\’\“\”\—\>])([\w]{0,6}[lrstdnxz]|MXc|MXz)(-|’)(<em>)?(.+?)([ \,\.\?\!\’\“\”\—\<])/gmi, "$1<l-m>$2$3$4$5</l-m>$6")
			.replace(/(”)([,\.;:])/gm, "$1<span class=\"pull\">$2</span>")
			.replace(/([,\.])(”)/gm, "$1<span class=\"pullsemi\">$2</span>")
			.replace(/(’)([,\.;:])/gm, "$1<span class=\"pullsemi\">$2</span>")
			.replace(/MXc/gm, "ċ").replace(/MXg/gm, "ġ").replace(/MXh/gm, "ħ").replace(/MXz/gm, "ż").replace(/MXa/gm, "à")
			.replace(/MXC/gm, "Ċ").replace(/MXG/gm, "Ġ").replace(/MXH/gm, "Ħ").replace(/MXZ/gm, "Ż").replace(/MXA/gm, "À")
			.replace(/<\/blockquote>\s*<blockquote>/gm, "<br>")
			.replace(/- </gm, "-<")
			.replace(/(\d)\,(\d\d\d)/gm, "$1&hairsp;$2")
			.replace(/&amp;shy;/gm, '<wbr>');
	});

	eleventyConfig.addFilter("slugifyMaltese", function slugifyMaltese(text) {
		return slugifyStringMaltese(text);
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

	//  REMOVE NBSP;
	// REDO THIS ALGORITHM
	eleventyConfig.addFilter("versify", function versify(text1) {
		const text = text1.replace("&nbsp;", "").replace(/<p>\s*<\/p>\s*/gm, '#').replace(/#\s*#/gm, '#');
		return stripTags(text, ['i', 'em']).split('#').map(p => p && p.length && `<p>${ p.replace(/\n/gm, '<br/>') }</p>`)
			.join('<p class="poetry-separator">*</p>');
	});

	eleventyConfig.addFilter("versifyDescription", function versifyDescription(text) {
		return stripTags(text || [], ['i', 'em']).replace(/\n/gm, '<br/>');
	});

	eleventyConfig.addFilter("dropCapsifyAndSectionise", function dropCapsifyAndSectionise(text, splitText, beforeOrAfter) {
		const decoratedText = (text || []).replace(/<p>\#\#\#<\/p>$/, '')
			.replace(/ċ/gm, "MXc").replace(/ġ/gm, "MXg").replace(/ħ/gm, "MXh").replace(/ż/gm, "MXz").replace(/à/gm, "MXa")
			.replace(/Ċ/gm, "MXC").replace(/Ġ/gm, "MXG").replace(/Ħ/gm, "MXH").replace(/Ż/gm, "MXZ").replace(/À/gm, "MXA")
			.replace(/<p(.*?)>(.)([\w\-]+)/, '<p$1><span class="initial"><span class="dropcap drop-$2">$2</span>$3</span>&nbsp;')
			.replace(/<p>\#<\/p>\s*<p>(.)([\w\-\’]+)/gm, '<p class="break"><span class="initial"><span class="dropcap drop-$1">$1</span>$2</span>&nbsp;')
			.replace(/MXc/gm, "ċ").replace(/MXg/gm, "ġ").replace(/MXh/gm, "ħ").replace(/MXz/gm, "ż").replace(/MXa/gm, "à")
			.replace(/MXC/gm, "Ċ").replace(/MXG/gm, "Ġ").replace(/MXH/gm, "Ħ").replace(/MXZ/gm, "Ż").replace(/MXA/gm, "À")
			.replace('drop-M">M</span>XC', 'drop-Ċ">Ċ</span>')
			.replace('drop-M">M</span>XG', 'drop-Ġ">Ġ</span>')
			.replace('drop-M">M</span>XH', 'drop-Ħ">Ħ</span>')
			.replace('drop-M">M</span>XZ', 'drop-Ż">Ż</span>')
			.replace(/\[\+\]/gm, '<p>&nbsp;</p>');
		if (!splitText) {
			return decoratedText;
		}
		const regex = new RegExp(`${ splitText }</p>`);
		const splitArray = decoratedText.split(regex);
		const matchedText = decoratedText.match(regex)[0];
		return beforeOrAfter === 0 ? splitArray[0] + matchedText : splitArray[1];
	});

	eleventyConfig.addFilter("sectioniseOnly", function sectioniseOnly(text) {
		return (text || []).replace(/<p>\#\#\#<\/p>$/, '').replace(/<p>\#<\/p>\s*<p>/gm, '<p class="break">');
	});

	eleventyConfig.addFilter("endDotify", function endDotify(text) {
		return (text || []).replace(/\.?\s*<\/p>\s*$/, '&nbsp;<span class="end-dot">.</span></p>');
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
