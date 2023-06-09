var
	audioLoaded,
	author,
	body,
	bodyEnd,
	bodyHeight,
	bodyStart,
	bodyText,
	bookmarksList,
	charactersPerPixel,
	charactersPerScreen,
	currentTime,
	duration,
	elapsedTime,
	hideScrollTools,
	lastReportedReadingTime,
	lastReportedScrollPosition,
	lastScrollPosition,
	newScrollPosition,
	pageHeight,
	percentageProgress,
	placeText,
	podcastUrl,
	previousTime,
	progressElement,
	screenHeight,
	skippedTime,
	storyCompleted,
	timeStarted,
	title,
	wordcount,
	wordsPerPixel,
	wordsPerSecond,
	wordsPerSecondAudio,
	wordsPerScreen;

audioLoaded = false;
percentageProgress = 0;
storyCompleted = false;

const audioBookmarkingInterval = 10;
const audioReportingInterval = 30;
const thresholdWords = 100;
const minWordsperSecond = 1;
const maxWordsPerSecond = 5;

const bookmarksMenuElement = document.getElementById("bookmarksTotal");
const getScrollPosition = () => window.pageYOffset || document.documentElement.scrollTop;

const scrolling = () => {
  newScrollPosition = getScrollPosition();
  if (newScrollPosition < 120 || newScrollPosition < lastScrollPosition) {
    document.body.classList.add('show-nav');
  } else {
    document.querySelector('#menu-toggle').checked = false;
    document.body.classList.remove('show-nav');
	}
	if (!wordcount) {
		return;
	}
  if (newScrollPosition !== lastScrollPosition) {
    document.body.classList.add('scrolling');
    clearTimeout(hideScrollTools);
    hideScrollTools = setTimeout(() => {
      document.body.classList.remove('scrolling')
    }, 5000);
		percentageProgress = parseInt(((newScrollPosition - bodyStart) * 100) / bodyHeight);
		if (percentageProgress >= 0) {
			if (percentageProgress > 100) {
				percentageProgress = 100;
			}
			// FIXME this throws an error
			progressElement.innerHTML = `${ percentageProgress }%`;
		}
		lastScrollPosition = newScrollPosition;
  }
  return;
}

const addBookmarkNow = () => {
	addBookmark('text', {
		title,
		author,
		placeText: getCurrentBlurb(percentageProgress),
		wordcount,
		speed: wordsPerSecond && wordsPerSecond.toFixed(2),
		percentage: percentageProgress,
		scrollPosition: newScrollPosition
	});
}

const heartbeat = (wordsPerPixel, title) => {
	const timeNow = new Date() / 1000;
	const secondsElapsed = timeNow - lastReportedReadingTime;
	const newScrollPosition = getScrollPosition();

	if (newScrollPosition > lastReportedScrollPosition) {
		const pixelProgress = newScrollPosition - lastReportedScrollPosition;
		const wordsRead = wordsPerPixel * pixelProgress;
		const wordsPerSecond = wordsRead / secondsElapsed;

		// Is it a plausible speed?
		if (wordsRead > thresholdWords && wordsPerSecond > minWordsperSecond && wordsPerSecond < maxWordsPerSecond) {
			window._paq.push(['trackEvent', 'Qari', 'kliem', title, parseInt(wordsRead)]);
			window._paq.push(['trackEvent', 'Qari', 'minuti', title, (secondsElapsed / 60).toFixed(2)]);
			window._paq.push(['trackEvent', 'Qari', 'perċentwali', title, parseInt(percentageProgress)]);
			window._paq.push(['trackEvent', 'Qari', 'ħeffa', title, wordsPerSecond.toFixed(2)]);

			// save bookmark
			addBookmarkNow();

			lastReportedScrollPosition = newScrollPosition;
			lastReportedReadingTime = timeNow;
			return;
		}
		// Shall we reset?
		return;
	}
}

// BOOKMARKS *************************************************************************************

const initialiseBookmarksList = () => {
	bookmarksList = JSON.parse(localStorage.getItem("bookmarks") || "{}");
}

const saveBookmarksList = () => {localStorage.setItem("bookmarks", JSON.stringify(bookmarksList));}

const addBookmark = (type, bookmark) => {
	bookmarksList[`${ type }-${ slugifiedUrl }`] = {
		dateTime: new Date(),
		...bookmark
	};
	saveBookmarksList();
	updateBookmarksMenu();
}

const deleteBookmark = (type) => {
	delete bookmarksList[`${type}-${slugifiedUrl}`];
	saveBookmarksList();
	updateBookmarksMenu();
}

const getCurrentBlurb = (percent) => {
	const currentPlace = parseInt(percent * bodyText.length / 100);
	const blurb = bodyText.substring(currentPlace, currentPlace + (charactersPerScreen));
	return blurb;
}

const updateBookmarksMenu = () => {
	if (!bookmarksList) {
		return;
	}
	count = Object.keys(bookmarksList).length;
	if (bookmarksMenuElement) {
		bookmarksMenuElement.innerHTML = ` (${ count })`;
	}
}

const showFullBookmarks = () => {
	const tbody = document.querySelector("ol");
	const template = document.querySelector("template");
	if (!template) {
		return;
	}
	Object.keys(bookmarksList).forEach = (key) => {
		const bookmark = bookmarksList[key];
		const clone = template.content.cloneNode(true);
		let h1 = clone.querySelectorAll("h1");
		let h2 = clone.querySelectorAll("h2");
		let body = clone.querySelectorAll(".body-text")[0];
		h1.textContent = bookmark.title;
		h2.textContent = bookmark.author;
		tbody.appendChild(clone);
	}
}

const clearAllBookmarks = () => { localStorage.clear(); }

const getPreviousAudioTime = () => {
	return bookmarksList[`audio-${slugifiedUrl}`] && bookmarksList[`audio-${slugifiedUrl}`].playPosition || 0;
}

// INITIALISE ***********************************************************************

const initialiseAfterNewsletter = () => {
	return;
}

const initialiseFontSizeListeners = () => {
	document.getElementById("font-size-1").addEventListener('click', () => addRemoveFontSizeClass(1));
	document.getElementById("font-size-2").addEventListener('click', () => addRemoveFontSizeClass(2));
	document.getElementById("font-size-3").addEventListener('click', () => addRemoveFontSizeClass(3));
	document.getElementById("font-size-4").addEventListener('click', () => addRemoveFontSizeClass(4));
};

const initialiseReadingHeartbeat = () => {
	lastReportedReadingTime = new Date() / 1000;
	timeStarted = lastReportedReadingTime;
	setInterval(heartbeat, 3000, wordsPerPixel, title);
}

const initialiseAfterNav = () => {
	initialiseFontSizeListeners();
}

let message;
const initialiseMessage = () => {
	if (getCookie('newsletter') === 'pendenti') {
		message = 'Bgħatnielek email biex tikkonferma <l-m>l-abbonament</l-m> tiegħek fin-newsletter.';
	}
	if (!!location.hash && document.referrer.indexOf('//newsletter.aphroconfuso.mt')) {
    // REVIEW escape is deprecated
    const salted = decodeURIComponent(escape(window.atob((location.hash.substring(1)))));
    [salt, message] = salted.split('|');
		if (salt === 'aaaASUDHASUWYQQU55%$ASGDGAS*Jhh23423') {
      if (message.indexOf('biex tikkonferma l-abbonament')) {
				_paq.push(['trackEvent', 'Newsletter', 'Abbonament', 'Pendenti']);
        setCookie('newsletter', 'pendenti');
      }
			if (message.indexOf('abbonament ikkonfermat')) {
				_paq.push(['trackEvent', 'Newsletter', 'Abbonament', 'Komplut']);
        setCookie('newsletter', 'abbonat*');
      }
		}
	}
	if (!!message) {
		document.getElementById('message').setAttribute('data-content-piece', '«' + message + '»');
		document.getElementById('message').innerHTML = '<p>' + message + '</p>';
		document.getElementById('message').classList.add('active');
		setTimeout(() => document.getElementById('message').classList.remove('active'), 10000);
		location.hash = '';
	}
}

const initialiseAfterWindow = () => {
	progressElement = document.getElementById('progress');

	initialiseAfterNav();
	initialiseMessage();
	initialiseBookmarksList();
	showFullBookmarks();
	window.addEventListener('scroll', (event) => {
		scrolling();
	});

	if (!!wordcount) {
		// TODO: Fix enjambed
		bodyText = Array.from(document.getElementById("grid-body").getElementsByClassName("body-text"), e => e.innerText).join(' ').replace(/\s+/g, ' ');
		screenHeight = window.innerHeight;
		body = document.getElementById('grid-body');
		bodyHeight = body.offsetHeight - screenHeight;
		bodyStart = body.offsetTop;
		title = document.querySelector("h1").innerText;
		author = document.querySelector("meta[name=author]").content;
		bodyEnd = bodyStart + bodyHeight;
		charactersPerPixel = bodyText.length / bodyHeight;
		wordsPerPixel = wordcount / bodyHeight;
		charactersPerScreen = parseInt(charactersPerPixel * screenHeight);
		wordsPerScreen = parseInt(wordsPerPixel * screenHeight);
		lastScrollPosition = getScrollPosition();
		lastReportedScrollPosition = lastScrollPosition;
		pageHeight = document.body.scrollHeight;
		initialiseReadingHeartbeat(wordcount);

		const slideshows = document.getElementsByClassName('splide');
		if (slideshows.length) {
			Splide.defaults = {
				type: 'fade',
				rewind: true,
				speed: 2000,
				padding: '2rem 0',
			}
			for (var i = 0; i < slideshows.length; i++) {
				const newSplide = new Splide(slideshows[i]).mount();
				newSplide.on('visible', function (slide) {
					window._paq.push(['trackEvent', 'Stampi', 'slideshow', title, slide.index + 1]);
				});
			}
		}
		const lightbox = document.getElementById('lightbox');
		const openLightbox = () => {
			lightbox.classList.add('open');
			window._paq.push(['trackEvent', 'Stampi', 'lightbox - iftaħ', title]);
		}
		const closeLightbox = () => {
			lightbox.classList.remove('open');
			window._paq.push(['trackEvent', 'Stampi', 'lightbox - għalaq', title]);
		}
		const lightboxOpen = document.getElementById('lightbox-open');
		const lightboxClose = document.getElementById('lightbox-close');
		lightboxOpen && lightboxOpen.addEventListener('click', () => openLightbox());
		lightboxClose && lightboxClose.addEventListener('click', () => closeLightbox());
		if (lightboxClose) {
			document.onkeydown = function(evt) {
				evt = evt || window.event;
				if (evt.keyCode === 27) {
					closeLightbox();
				}
			};
		}

		const closeTriggerWarning = () => {
			document.body.classList.add('trigger-warning-closed');
			setCookie(`tw-${ slugifiedUrl }`, 'magħluq', 3);
			window._paq.push(['trackEvent', 'Stampi', 'lightbox - għalaq', title]);
		}
		const triggerWarningClose = document.getElementById('trigger-warning-close');
		triggerWarningClose && triggerWarningClose.addEventListener('click', () => closeTriggerWarning());


		if (podcastUrl) {
			Amplitude.init({
				songs: [
					{
						url: podcastUrl
					}
				]
			});
			const audio = Amplitude.getAudio();

			audio.addEventListener('canplaythrough', () => {
			if (audioLoaded) {
				return;
			}
				duration = parseInt(audio.duration);
				wordsPerSecondAudio = wordcount / duration;
				previousTime = getPreviousAudioTime();
				if (previousTime !== 0) {
					audio.currentTime = previousTime;
				}
				audioLoaded = true;
			});

			const addAudioBookmarkNow = (percentage) => {
				let playPosition = parseInt(audio.currentTime);
				percentageAudio = percentage || (parseInt(audio.currentTime) * 100 / duration).toFixed(2);
				addBookmark('audio', {
					title,
					author,
					placeText: getCurrentBlurb(percentageAudio),
					duration,
					percentageAudio,
					playPosition
				});
			}

			audio.addEventListener('play', () => {
				window._paq.push(['trackEvent', 'Smiegħ', 'play', title]);
			});
			audio.addEventListener('pause', () => {
				percentageAudio = (parseInt(audio.currentTime) * 100 / duration).toFixed(2);
				window._paq.push(['trackEvent', 'Smiegħ', 'pause', title, percentageAudio]);
				addAudioBookmarkNow(percentageAudio);
			});
			audio.addEventListener('seek', () => {
				percentageAudio = (parseInt(audio.currentTime) * 100 / duration).toFixed(2);
				window._paq.push(['trackEvent', 'Smiegħ', 'seek', title, percentageAudio]);
				if (currentTime === 0) {
					deleteBookmark('audio');
					return;
				}
				addAudioBookmarkNow(percentageAudio);
			});
			audio.addEventListener('ended', () => {
				window._paq.push(['trackEvent', 'Smiegħ', 'spiċċa', title]);
				deleteBookmark('audio');
			});
			audio.addEventListener('waiting', () => {
				window._paq.push(['trackEvent', 'Smiegħ', 'buffering', title, 1]);
			});
			audio.addEventListener('timeupdate', () => {
				currentTime = parseInt(audio.currentTime);
				if (currentTime === 0 || currentTime === previousTime) {
					return;
				}
				elapsedTime = currentTime - previousTime;
				if (elapsedTime > 10) {
					window._paq.push(['trackEvent', 'Smiegħ', 'kliem maqbuż', parseInt(elapsedTime * wordsPerSecondAudio)]);
				}
				if (currentTime % audioBookmarkingInterval === 0) {
					addAudioBookmarkNow();
				}
				if (currentTime % audioReportingInterval === 0) {
					window._paq.push(['trackEvent', 'Smiegħ', 'kliem (awdjo)', title, parseInt(audioReportingInterval * wordsPerSecondAudio)]);
					window._paq.push(['trackEvent', 'Smiegħ', 'minuti (awdjo)', title, 0.5]);
					window._paq.push(['trackEvent', 'Smiegħ', 'perċentwali (awdjo)', title, ((currentTime * 100) / duration).toFixed(2)]);
				}
				previousTime = currentTime;
			});
			document.getElementById('range').addEventListener('click', function(e){
					var offset = this.getBoundingClientRect();
					var x = e.pageX - offset.left;
					Amplitude.setSongPlayedPercentage((parseFloat(x) / parseFloat( this.offsetWidth) ) * 100);
			});
			document.getElementById('audio').classList.add('initialised');
		}
	};
}

window.onload = initialiseAfterWindow;
