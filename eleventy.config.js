const { DateTime } = require("luxon");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const { execSync } = require('child_process');
const eleventySass = require("eleventy-sass");
const fetch = require('node-fetch');
const fs = require('fs');
const markdownItAnchor = require("markdown-it-anchor");
const path = require('path');
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginNavigation = require("@11ty/eleventy-navigation");
const pluginRev = require("eleventy-plugin-rev");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const QRCode = require('qrcode');
const rollupPlugin = require('eleventy-plugin-rollup');
const smartTruncate = require('smart-truncate');
const stripTags = require("striptags");

const fixSubjectDate = require('./src/fixSubjectDate.js');
const prettifyMaltese  = require('./src/prettifyMaltese.js');
const slugifyStringMaltese = require('./src/slugifyMaltese.js');

module.exports = function (eleventyConfig) {
	// const cssDir = path.join('aphroconfuso.mt', 'site', 'css');
	// if (!fs.existsSync(cssDir)) {
	// 	fs.mkdir(cssDir, {recursive: true}, err => console.log(err));
	// }
	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig.addPassthroughCopy({
		"./_redirects": "/",
		"./public/": "/",
		"./scss/style.css": "/css",
		"./node_modules/prismjs/themes/prism-okaidia.css": "/css/prism-okaidia.css"
	});

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch content images for the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{jpg,svg,webp,png,jpeg}");
	eleventyConfig.watchIgnores.add("public/img/qr/*");

	const fetchImage = async (imageUrl, saveToFileLocation) => await fetch(imageUrl).then(res =>
		res.body.pipe(fs.createWriteStream(saveToFileLocation))
	);

	const handleError = (message, fatal = true) => {
		if (!fatal || process.env.NODE_ENV === 'development') {
			console.error('\x1b[31m%s\x1b[0m', message);
			return;
		}
		throw new Error(`\x1b[31m${ message }\x1b[0m`);
	}

	const handleWarning = (message) => {	console.warn('\x1b[33m%s\x1b[0m', message); }

	eleventyConfig.on('eleventy.before', async ({dir, results, runMode, outputMode}) => {
		const cssDir = path.join('./aphroconfuso.mt/site/css/');
		if (!fs.existsSync(cssDir)) {
			fs.mkdir(cssDir, {recursive: true}, err => console.log(err));
		} else {
			fs.readdir(cssDir, (err, files) => {
				if (err) console.log(err);
				files && files.forEach(file => {
					const fileDir = path.join('./aphroconfuso.mt/site/css/', file);
					if (file.startsWith('style-')) fs.rmSync(fileDir);
				});
			});
		}

		// fs.readdir('./aphroconfuso.mt/site/crr/, files) => {
		// 	if (err) console.log(err);
		// 	files.forEach(file => {
		// 		const fileDir = path.join('./aphroconfuso.mt/site/cle/);
		// 		if (file !== 'stampi') fs.rmSync(fileDir, {recursive: true, force: true,});
		// 	});
		// });
	});

	eleventyConfig.on('eleventy.after', async ({dir, results, runMode, outputMode}) => {
		// SKIP ALL THESE IF WE ARE IN QUICKBUILD MODE
		if (process.env.BUILDADMIN !== 'False') {
			console.log('Postproduction...');
			// Check links ********************************************************************************************
			let linksInContent = [], imagesInContent = [];
			results.forEach(i => {
				linksInContent = linksInContent.concat(i.content.match(/href="\/^\#(.*?)\/"/g));
				imagesInContent = imagesInContent.concat(i.content.match(/\/stampi\/(.*?)\.(avif|jpg|jpeg|webp)/g));
				const anchorsInContent = i.content.match(/(?<=href="#).*?(?=">)/gm);
				anchorsInContent && anchorsInContent.length && anchorsInContent.forEach(anchor => {
					if (anchor && !i.content.match(`id=\"${ anchor }\"`)) {
						handleError(`Link to "${ anchor }" but no anchor!`);
					}
				});
				if (i.url.match(/\.html$/) && !i.content.match(/\<html/i)) handleError(`Missing <html> wrapper: ${ i.url } !!!`);
				if (i.content.match(/xxx/i)) handleError(`XXX detected in ${ i.url } !!!`);

				if (i.content.match(/style=\"text-align/i)) handleWarning(`Inline style (text-align) detected in ${ i.url } !!!`);

				// NOTWORDS
				// if (i.content.match(/00 /i)) handleError(`00 detected in ${ i.url } !!!`);
			});

			const uniqueLinksArray = [...new Set(linksInContent)].filter(n => n).sort();
			uniqueLinksArray && uniqueLinksArray.forEach(i => {
				if (!i) {return;}
				const fileLocation = decodeURIComponent(i.replace(/href\=\"/, "./aphroconfuso.mt/site").replace(/\/\"/, "/index.html"));
				if (fileLocation.includes('localhost:')) handleError(`${ fileLocation } points to localhost!`);
				if (fileLocation.includes('provi.:')) handleError(`${ fileLocation } points to provi!`);
				if (fileLocation.includes('kltyvehasfpmuxan')) handleError(`${ fileLocation } points to klty`);
				if (!fs.existsSync(fileLocation)) handleError(`ERROR: ${ fileLocation } is linked but does not exist!`);
			});

			// Transfer images ****************************************************************************************
			const uniqueImagesArray = [...new Set(imagesInContent)].filter(n => n).sort();
			uniqueImagesArray.forEach(i => {
				if (!i) {return;}
				const saveToFileLocation = i.replace(/\/stampi/g, "./image-cache/");
				if (fs.existsSync(saveToFileLocation)) {return;}
				console.log(`Fetching ${ i } ...`);
				const imageUrl = i.replace(/\/stampi/g, "https://stampi.aphroconfuso.mt");
				fetchImage(imageUrl, saveToFileLocation);
				// fetch(imageUrl).then(res =>
				// 	res.body.pipe(fs.createWriteStream(saveToFileLocation))
				// )
			});
			const webImagesFolder = "./aphroconfuso.mt/site/stampi";
			if (!fs.existsSync(webImagesFolder)) {
				fs.mkdirSync(webImagesFolder);
			}
			uniqueImagesArray.forEach(i => {
				if (!i) {return;}
				const image = i.replace(/\/stampi/g, "")
				const cachedFileLocation = `./image-cache${ image }`;
				const webFileLocation = `${ webImagesFolder }${ image }`;

				if (fs.existsSync(webFileLocation)) {return;}
				if (fs.existsSync(cachedFileLocation)) {
					fs.copyFile(cachedFileLocation, webFileLocation, (err) => {
						if (err) throw err;
						console.log(`${ i } copied to web folder`);
					});
				}
			});
			fs.readdir("./aphroconfuso.mt/site/stampi", (err, files) => {
				if (files.length < uniqueImagesArray.length) {
					console.error("\x1b[33m%s\x1b[0m", `Image discrepancy in folder: ${ files.length - uniqueImagesArray.length }!`);
				}
			});

			// Create deco image backgrounds
			const cssFile = fs.readdirSync('./aphroconfuso.mt/site/css/').filter(fn => fn.startsWith('style-'))[0];
			if (!cssFile) handleError("Can't find a css file...");
			const srcFile = './public/img/deco/frame-02-faint-TEMPLATE.svg';
			const destFolder = './aphroconfuso.mt/site/img/deco/';
			if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, {recursive: true});
			if (cssFile) {
				console.log(`Found ${ cssFile } ...`);
				const cssFileContents = fs.readFileSync('./aphroconfuso.mt/site/css/' + cssFile).toString();
				const fileNames = cssFileContents.match(/frame-02-faint-hsl-[^\)]*?\.svg/g);
				fileNames && fileNames.forEach(fileName => {
					const [fileString, h, s, l] = fileName.match(/hsl-(\d+)-(\d+)-(\d+).*?\./);
					const destFile = destFolder + 'frame-02-faint-' + fileString + 'svg';
					if (fs.existsSync(destFile)) return;
					console.log(`Creating file for ${ fileString } ...`);
					fs.readFile(srcFile, 'utf8', (err, data) => {
						if (err) return console.log(err);
						var result = data.replace(/\#ff0000/g, `hsl(${ h }, ${ s }%, ${ l }%)`);
						fs.writeFile(destFile, result, 'utf8', (err) => {
							if (err) return console.log(err);
						});
					});
				});
				const hexFileNames = cssFileContents.match(/frame-02-faint-(......)\.svg/g);
				hexFileNames && hexFileNames.forEach(fileName => {
					const [fileString, hexColour] = fileName.match(/faint-(......)\./);
					const destFile = destFolder + 'frame-02-' + fileString + 'svg';
					if (fs.existsSync(destFile)) return;
					console.log(`Creating file for ${ fileString }..`);
					fs.readFile(srcFile, 'utf8', (err, data) => {
						if (err) return console.log(err);
						var result = data.replace(/\#ff0000/g, `#${ hexColour }`);
						fs.writeFile(destFile, result, 'utf8', (err) => {
							if (err) return console.log(err);
						});
					});
				});
			}

			// Index pages for search **************************************************************************************
			execSync(`npx pagefind --site aphroconfuso.mt/site --glob \"**/*.html\"`, {encoding: 'utf-8'});

			// END QUICKBUILD
		}
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
        return (data) => data.page.filePathStem && data.page.filePathStem.replace(/^\/scss\//, "/css/") + ".css";
      }
    },
    sass: {
      style: "compressed",
      sourceMap: false
    },
    rev: true
  });
  eleventyConfig.addPlugin(rollupPlugin, {
    rollupOptions: {
      output: {
        format: 'es',
        dir: 'aphroconfuso.mt/site/script',
      },
    },
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
		if (!dateString) return null;
		return fixSubjectDate(dateString);
	});

	eleventyConfig.addFilter('subjectDateShort', function subjectDateShort(dateString) {
		if (!dateString) return null;
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

	// eleventyConfig.addFilter("anchorise", function anchorise(sentence, useVerb = 'ara') {
	// 	const [verb, destination] = sentence.split(' ');
	// 	if (verb.toLowerCase() !== useVerb) return sentence;
	// 	return `${ verb } <a href="#${destination}">${slugifyStringMaltese(destination)}</a>`;
	// });

	eleventyConfig.addFilter("escapeQuote", function escapeQuote(text) {
		if (!text) return "XXXXXXescapeQuoteXXX";
		return (text || []).replace(/'/g, "\\'");
	});

	eleventyConfig.addFilter("anchorise", function anchorise(sentence, useVerb = 'ara') {
		var regex = new RegExp(`(<p>${useVerb} “?"?)(\\w+)("?”?\.?<\\/p>)`, 'i');
		var match = sentence.match(regex);
		if (!match) return sentence;
		return `${match[1]}<a href="#${slugifyStringMaltese(match[2])}">${match[2]}</a>${match[3]}`;
	});

	eleventyConfig.addFilter("slugifyMaltese", function slugifyMaltese(text) {
		if (!text) return "XXXXXXslugifyMalteseXXX";
		return slugifyStringMaltese(text);
	});

	eleventyConfig.addFilter("prettifyMaltese", prettifyMaltese);

	eleventyConfig.addFilter("prettifyNumbers", function prettifyNumbers(text, punctuation = String.fromCharCode(8201)) {
		if (!text) return "XXXXXXprettifyNumbersXXX";
		return (text.toString() || []).replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, `$&${ punctuation }`);
	});

	eleventyConfig.addFilter("semiDeSlugify", function semiDeSlugify(text) {
		if (!text) return "XXXXXXsemiDeSlugifyXXX";
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
		if (digits >= 11 && digits <= 19) return `${ number }-il ${ words[0]}`;
		return `${ number } ${ words[0] }`;
	});

	// REMOVE NBSP;
	// REDO THIS ALGORITHM
	// eleventyConfig.addFilter("versify", function versify(text1) {
	// 	const text = text1.replace("&nbsp;", "").replace(/<p>\s*<\/p>\s*/gm, '#').replace(/#\s*#/gm, '#');
	// 	return stripTags(text, ['i', 'em']).split('#').map(p => p && p.length && `<p>${ p.replace(/\n/gm, '<br/>') }</p>`)
	// 		.join('<p class="poetry-separator">*</p>');
	// });

	eleventyConfig.addFilter("versify", function versify(text1) {
		const text = text1.replace("&nbsp;", "")
			.replace(/<\/p>/gm, '</p>\n')
			.replace(/\n\n+/gm, '\n')
			.replace(/\s*<p>#<\/p>\s*/gm, '#')
			.replace(/<em>#<\/em>/gm, '#')
			.replace(/<em>\*<\/em>/gm, '*')
			.replace(/#\s*#/gm, '#')
		return stripTags(text, ['span', 'em'])
			.split('#')
			.map(p => p && p.length && `<p>${ p.replace(/\n/gm, '<br/>') }</p>`)
			.join(' ')
			.replace(/<br\/><br\/>/gm, '</p>\n<p>')
			.replace(/<p>\*<\/p>/gm, '<p class="poetry-separator">*</p>')
			.replace(/<em>\s*\*\s*<\/em>/gm, '<p class="poetry-separator">*<\/p>')
			.replace(/\*\s*<br\/>/gm, '</p><p class="poetry-separator">*</p><p>')
			.replace(/<em>\s*<\/em>/gm, '');
	});

	eleventyConfig.addFilter("versifyDescription", function versifyDescription(text) {
		return stripTags(text || [], ['span', 'em']).replace(/\n/gm, '<br/>');
	});

	eleventyConfig.addFilter("sectionise", function sectionise(text) {
		let decoratedText = (text || []).replace(/<p>\#\#\#<\/p>$/, '');
		decoratedText = decoratedText.replace(/ċ/gm, "MMXXc").replace(/ġ/gm, "MMXXg").replace(/ħ/gm, "MMXXh").replace(/ż/gm, "MMXXz").replace(/à/gm, "MMXXa")
			.replace(/Ċ/gm, "MMXXC").replace(/Ġ/gm, "MMXXG").replace(/Ħ/gm, "MMXXH").replace(/Ż/gm, "MMXXZ").replace(/À/gm, "MMXXA")
			.replace(/<p>\s*\#\s*<\/p>\s*(<hr>)?(<h[56].*?<\/h[56]>)?\s*<p>([\w\-\’]+)/gm, '$1$2<p class="break"><span class="initial">$3</span>')
			.replace(/MMXXc/gm, "ċ").replace(/MMXXg/gm, "ġ").replace(/MMXXh/gm, "ħ").replace(/MMXXz/gm, "ż").replace(/MMXXa/gm, "à")
			.replace(/MMXXC/gm, "Ċ").replace(/MMXXG/gm, "Ġ").replace(/MMXXH/gm, "Ħ").replace(/MMXXZ/gm, "Ż").replace(/MMXXA/gm, "À")
			.replace(/\[\+\]/gm, `<p>${String.fromCharCode(160)}</p>`);
		return decoratedText;
	});

	eleventyConfig.addFilter("simpleDropCapsify", function simpleDropCapsify(text) {
		return (text || []).replace(/ċ/gm, "MMXXc").replace(/ġ/gm, "MMXXg").replace(/ħ/gm, "MMXXh").replace(/ż/gm, "MMXXz").replace(/à/gm, "MMXXa")
			.replace(/Ċ/gm, "MMXXC").replace(/Ġ/gm, "MMXXG").replace(/Ħ/gm, "MMXXH").replace(/Ż/gm, "MMXXZ").replace(/À/gm, "MMXXA")
			.replace(/^(.)([\w\-\’]+)/, '<span class="initial"><span class="dropcap drop-$1">$1</span>$2</span>')
			.replace(/MMXXc/gm, "ċ").replace(/MMXXg/gm, "ġ").replace(/MMXXh/gm, "ħ").replace(/MMXXz/gm, "ż").replace(/MMXXa/gm, "à")
			.replace(/MMXXC/gm, "Ċ").replace(/MMXXG/gm, "Ġ").replace(/MMXXH/gm, "Ħ").replace(/MMXXZ/gm, "Ż").replace(/MMXXA/gm, "À")
			.replace('drop-I">I</span>e', 'drop-Ie">IE</span>')
			.replace('drop-G">G</span>ħ', 'drop-Għ">GĦ</span>')
			.replace('drop-M">M</span>MXXC', 'drop-Ċ">Ċ</span>')
			.replace('drop-M">M</span>MXXG', 'drop-Ġ">Ġ</span>')
			.replace('drop-M">M</span>MXXH', 'drop-Ħ">Ħ</span>')
			.replace('drop-M">M</span>MXXZ', 'drop-Ż">Ż</span>')
			.replace('drop-1">1</span>6', 'drop-16">16</span>')
			.replace(/\[\+\]/gm, `<p>${String.fromCharCode(160)}</p>`);
	});

	eleventyConfig.addFilter("dropCapsifyAndSectionise", function dropCapsifyAndSectionise(text, splitText = false, beforeOrAfter = 0, dontUseDropcaps = false) {
		let decoratedText = (text || []).replace(/<p>\#\#\#<\/p>$/, '');
		if (!dontUseDropcaps) {
			decoratedText = decoratedText.replace(/ċ/gm, "MMXXc").replace(/ġ/gm, "MMXXg").replace(/ħ/gm, "MMXXh").replace(/ż/gm, "MMXXz").replace(/à/gm, "MMXXa")
				.replace(/Ċ/gm, "MMXXC").replace(/Ġ/gm, "MMXXG").replace(/Ħ/gm, "MMXXH").replace(/Ż/gm, "MMXXZ").replace(/À/gm, "MMXXA")
				.replace(/<p(.*?)>(.)([\w\-]+)/, '<p$1><span class="initial"><span class="dropcap drop-$2">$2</span>$3</span>')
				.replace(/<p>\#<\/p>\s*(<hr>)?(<h[56].*?<\/h[56]>)?\s*<p>(.)([\w\-\’]+)/gm, '$1$2<p class="break"><span class="initial"><span class="dropcap drop-$3">$3</span>$4</span>')
				.replace(/MMXXc/gm, "ċ").replace(/MMXXg/gm, "ġ").replace(/MMXXh/gm, "ħ").replace(/MMXXz/gm, "ż").replace(/MMXXa/gm, "à")
				.replace(/MMXXC/gm, "Ċ").replace(/MMXXG/gm, "Ġ").replace(/MMXXH/gm, "Ħ").replace(/MMXXZ/gm, "Ż").replace(/MMXXA/gm, "À")
				.replace('drop-I">I</span>e', 'drop-Ie">IE</span>')
				.replace('drop-G">G</span>ħ', 'drop-Għ">GĦ</span>')
				.replace('drop-M">M</span>MXXC', 'drop-Ċ">Ċ</span>')
				.replace('drop-M">M</span>MXXG', 'drop-Ġ">Ġ</span>')
				.replace('drop-M">M</span>MXXH', 'drop-Ħ">Ħ</span>')
				.replace('drop-M">M</span>MXXZ', 'drop-Ż">Ż</span>')
				.replace('drop-1">1</span>6', 'drop-16">16</span>')
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

	// .replace(/<p(^\>*?)>(.)([\w\-]+)/, '<p$1><span class="initial">$2$3</span>')
	// .replace(/<p>\#<\/p>\s*<p>(.)([\w\-\’]+)/gm, '<p class="break"><span class="initial">$1$2</span>')

	// eleventyConfig.addFilter("diarySectionise", function diarySectionise(text, splitText, beforeOrAfter, dontUseDropcaps) {
	// 	let decoratedText = (text || []).replace(/<p>\#\#\#<\/p>$/, '');
	// 	decoratedText = decoratedText.replace(/ċ/gm, "MMXXc").replace(/ġ/gm, "MMXXg").replace(/ħ/gm, "MMXXh").replace(/ż/gm, "MMXXz").replace(/à/gm, "MMXXa")
	// 		.replace(/Ċ/gm, "MMXXC").replace(/Ġ/gm, "MMXXG").replace(/Ħ/gm, "MMXXH").replace(/Ż/gm, "MMXXZ").replace(/À/gm, "MMXXA")
	// 		.replace(/MMXXc/gm, "ċ").replace(/MMXXg/gm, "ġ").replace(/MMXXh/gm, "ħ").replace(/MMXXz/gm, "ż").replace(/MMXXa/gm, "à")
	// 		.replace(/MMXXC/gm, "Ċ").replace(/MMXXG/gm, "Ġ").replace(/MMXXH/gm, "Ħ").replace(/MMXXZ/gm, "Ż").replace(/MMXXA/gm, "À")
	// 		.replace(/<p>\#<\/p>\s*(<hr>)?(<h[56].*?<\/h[56]>)?\s*<p>(.)([\w\-\’]+)/gm, '$1$2<p class="break"><span class="initial"><span class="dropcap drop-$3">$3</span>$4</span>')
	// 		.replace(/\[\+\]/gm, `<p>${String.fromCharCode(160)}</p>`);
	// 	return decoratedText;
	// });

	eleventyConfig.addFilter("stripDataAttributes", function stripDataAttributes(html) {
		if (!html || !html.match(/data-/)) return html;
		var tags = html.match(/(<\/?[\S][^>]*>)/gi);
		tags.forEach(function(tag){
			html = html.replace(tag, tag.replace(/(data-.+?=".*?")|(data-.+?='.*?')|(data-[a-zA-Z0-9-]+)/g, ''));
		});
		return html;
	});

	eleventyConfig.addFilter("sectioniseOnly", function sectioniseOnly(text) {
		return (text || []).replace(/<p>\#\#\#<\/p>\s*$/, '').replace(/<p>\s*\#\s*<\/p>\s*<(p|h5|h6) /gm, '<$1 class="break"');
	});

	eleventyConfig.addFilter("endDotify", function endDotify(text) {
		let fixedText = (text || []).replace(/([^ ]+)([\.]|<span class="pull">.<\/span>)\s*<\/(p|blockquote)>\s*$/, '<l-m>$1 <span class="end-dot">.</span></l-m></$3>');
		if (!fixedText.match(/class=\"end\-dot\"/m)) {
			fixedText = text.replace(/<\/(p|blockquote)>\s*$/, '&nbsp;<span class="end-dot">.</span></$1>')
				.replace(/\s*<\/td>\s*<\/tr>\s*<\/tbody>\s*<\/table>\s*$/, '<span class="end-dot">.</span></td></tr></tbody></table>');
		}
		return fixedText;
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
		return stripTags(text || []).replace(/(Noti Editorjali)( *?\#?\d*)(\:.*$)/i, "$1<span class=\"episodeNumber\">$2</span>")
			.replace(/(.*?)( \(taħdita\)$)/i, "$1");
	});

	eleventyConfig.addFilter("qrCodePng", function qrCodePng(path) {
		const imageUrlPath = `/img/qr/${ path.replace(/\//gm, '') }.png`;
		const imageLocation = `public${ imageUrlPath }`;
		if (fs.existsSync(imageLocation)) return imageUrlPath;
		console.log('Creating QR png for', path);
		QRCode.toFile(imageLocation, `https://aphroconfuso.mt${ path }`, {
			errorCorrectionLevel: 'H'
		}, function(err) {
			if (err) throw err;
		});
		return imageUrlPath;
	});

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

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
