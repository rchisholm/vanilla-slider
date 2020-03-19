/* jshint esversion:6 */

/**
 * slider class
 */
class Slider {
    constructor(options) {
        this.containerId = options.containerId;
        this.imageURLs = options.imageURLs;
        this.currentIndex = 0;
        this.sliderLock = false;
        this.images = [];
        
        if(!Array.isArray(this.imageURLs)) {
            throw("Slider error: imageURLs must be an array of strings");
        }
        if(!document.getElementById(this.containerId)) {
            throw("Slider error: conatinerId must be a valid element's id");
        }

        var image;
        this.container = document.getElementById(this.containerId);
        this.imageURLs.forEach((imageURL, index) => {
            image = document.createElement('IMG');
            image.id = this.containerId + "-slide-" + index;
            image.src = imageURL;
            image.classList.add('mhc-slider-image');
            if(index > 0) {
                image.style.visibility = 'hidden';
            }
            this.container.appendChild(image);
            this.images[index] = image;
        });
        this.container.classList.add('mhc-slider-container');
        this.container.style.width = this.images[0].clientWidth;
        this.container.style.height = this.images[0].clientHeight;
        
        this.container.setAttribute('current-index', this.currentIndex);
        this.container.setAttribute('num-slides', this.images.length);
        this.container.setAttribute('slider-lock', false);

        // functions

        /**
         * resize container, called on resizing browser window. only shrinks
         */
        this.resizeContainer = () => {
            this.container.style.width = this.images[0].clientWidth;
            this.container.style.height = this.images[0].clientHeight;
        };

        /**
         * get the index of the next slide
         */
        this.getNextIndex = () => {
            return (this.currentIndex + 1) % this.images.length;
        };
    
        /**
         * get the index of the previous slide
         */
        this.getPrevIndex = () => {
            return this.currentIndex < 1 ? this.images.length - 1 : this.currentIndex - 1;
        };

        /**
         * go to the next slide, then execute the callback
         */
        this.nextSlide = (callback = null) => {
            if(!this.sliderLock) {
                this.sliderLock = true;
                console.log("this.currentIndex: " + this.currentIndex);
                slideFadeReplace(this.images[this.currentIndex], this.images[this.getNextIndex()], () => {
                    console.log("this.currentIndex: " + this.currentIndex);
                    this.currentIndex = (this.currentIndex + 1) % this.images.length;
                    this.sliderLock = false;
                    if(typeof callback === 'function') {
                        callback();
                    }
                }, { toggleVisibility: true });
            }
        };


        /**
         * go to the previous slide, then execute the callback
         */
        this.prevSlide = (callback = null) => {
            if(!this.sliderLock) {
                this.sliderLock = true;
                slideFadeReplace(this.images[this.currentIndex], this.images[this.getPrevIndex()], () => {
                    this.currentIndex = this.getPrevIndex();
                    this.sliderLock = false;
                    if(typeof callback === 'function') {
                        callback();
                    }
                }, { toggleVisibility: true });
            }
        };


        /**
         * go to the slide at index (if possible), then execute the callback
         */
        this. goToSlide = (index, callback = null) => {
            if(typeof index !== 'number' || index < 0 || index + 1 > this.images.length) {
                console.log('Slider error: invalid index in goToSlide: ' + index);
                if(typeof callback === 'function') {
                    callback();
                }
            }
            if(index === this.currentIndex) {
                console.log('Slider error: current index in goToSlide: ' + index);
                if(typeof callback === 'function') {
                    callback();
                }
            }
            if(!this.sliderLock) {
                this.sliderLock = true;
                slideFadeReplace(this.images[this.currentIndex], this.images[index], () => {
                    this.currentIndex = index;
                    this.sliderLock = false;
                    if(typeof callback === 'function') {
                        callback();
                    }
                }, { toggleVisibility: true });
            }
        };
        window.addEventListener('resize', this.resizeContainer);
    }
}

/**
 * fades the first target out, then fades the second target in.
 * @param {any} fadeOutTarget element to fade out, or its id
 * @param {any} fadeInTarget element to fade in, or its id
 * @param {function} callback function executed when fade is finished
 * @param {{waitTime: any, display: any, fadeTime: number, toggleVisibility: boolean}} options options object for fade:
 * options.waitTime: wait before executing - true for 2 sec, false for 0 sec, num for other (ms);
 * options.display: display the target should have - true for flex, false for block, string for other;
 * options.fadeTime: time for the fadeIn/fadeOut effects, defaults to 250;
 * options.toggleVisibility: true if using visibility:hidden instead of display:none for fadeOut;
 */
function slideFadeReplace(fadeOutTarget, fadeInTarget, callback = function () {}, options = []) {

    // default options
    options.waitTime = options.waitTime ? options.waitTime : false;
    options.display = options.display ? options.display : false;
    options.fadeTime = options.fadeTime ? options.fadeTime : 250;
    options.toggleVisibility = options.toggleVisibility ? options.toggleVisibility : false;

    if (options.waitTime) {
        options.waitTime = options.waitTime === true ? 2000 : options.waitTime;
        setTimeout(function () {
            options.waitTime = false;
            slideFadeReplace(fadeOutTarget, fadeInTarget, callback, options);
        }, options.waitTime);
    } else {
        debugConsoleLog('slideFadeReplace');
        slideFadeOut(fadeOutTarget, function () {
            slideFadeIn(fadeInTarget, callback, options);
        }, options);
    }
}

/**
 * fades the target out
 * @param {element||string} fadeOutTarget element to fade out, or its id
 * @param {function} callback function executed when fade is finished
 * @param {{waitTime: any, fadeTime: number, toggleVisibility: boolean}} options options object for fade:
 * options.waitTime: wait before executing - true for 2 sec, false for 0 sec, num for other (ms);
 * options.fadeTime: time for the fadeIn/fadeOut effects, defaults to 250;
 * options.toggleVisibility: true if using visibility:hidden instead of display:none for fadeOut;
 */
function slideFadeOut(fadeOutTarget, callback = function () {}, options = []) {
    debugConsoleLog('slideFadeOut');

    // check cb
    if(typeof callback !== 'function') {
        callback = function() {};
    }

    // check target
    if(typeof fadeOutTarget === 'string') {
        fadeOutTarget = document.getElementById(fadeOutTarget);
    }

    // default options
    options.waitTime = options.waitTime ? options.waitTime : false;
    options.fadeTime = options.fadeTime ? options.fadeTime : 250;
    options.toggleVisibility = options.toggleVisibility ? options.toggleVisibility : false;

    var isVisible = options.toggleVisibility ? function(element) { return element.style.visibility !== "hidden"; } : function(element) {return element.style.display !== "none";};
    var makeInvisible = options.toggleVisibility ? function(element) { element.style.visibility = "hidden"; } : function(element) { element.style.display = "none"; };

    if(fadeOutTarget) {
        if (isVisible(fadeOutTarget)) {
            if (options.waitTime) {
                options.waitTime = options.waitTime === true ? 2000 : options.waitTime;
                setTimeout(function () {
                    options.waitTime = false;
                    slideFadeOut(fadeOutTarget, callback, options);
                }, options.waitTime);
            } else {
                if (fadeOutTarget) {
                    options.fadeTime = typeof options.fadeTime === 'number' ? options.fadeTime : 250;
                    var opacityInterval = 25 / options.fadeTime;
                    fadeOutTarget.style.opacity = 1;
                    var fadeOutEffect = setInterval(function () {
                        if (fadeOutTarget.style.opacity > 0) {
                            fadeOutTarget.style.opacity -= opacityInterval;
                        } else {
                            clearInterval(fadeOutEffect);
                            makeInvisible(fadeOutTarget);
                            callback();
                        }
                    }, options.fadeTime * opacityInterval);
                }
            }
        } else {
            callback();
            // setTimeout(callback, options.fadeTime);
        }
    } else {
        debugConsoleError('fadeOut error: no such element exists.');
    }
}

/**
 * fades the target in
 * @param {any} fadeInTarget element to fade in, or its id
 * @param {function} callback function executed when fade is finished
 * @param {{waitTime: any, display: any, fadeTime: number, toggleVisibility: boolean}} options options object for fade:
 * options.waitTime: wait before executing - true for 2 sec, false for 0 sec, num for other (ms);
 * options.display: display the target should have - true for flex, false for block, string for other;
 * options.fadeTime: time for the fadeIn/fadeOut effects, defaults to 250;
 * options.toggleVisibility: true if using visibility:hidden instead of display:none for fadeOut;
 */
function slideFadeIn(fadeInTarget, callback = function () {}, options = []) {
    debugConsoleLog('slideFadeIn');

    // check cb
    if(typeof callback !== 'function') {
        callback = function() {};
    }

    // check target
    if(typeof fadeInTarget === 'string') {
        fadeInTarget = document.getElementById(fadeInTarget);
    }

    // default options
    options.waitTime = options.waitTime ? options.waitTime : false;
    options.display = options.display ? options.display : false;
    options.fadeTime = options.fadeTime ? options.fadeTime : 250;
    options.toggleVisibility = options.toggleVisibility ? options.toggleVisibility : false;

    // option values
    options.display = options.display === false ? 'block' : options.display;
    options.display = options.display === true ? 'flex' : options.display;
    var isVisible = options.toggleVisibility ? function(element) { return element.style.visibility !== "hidden"; } : function(element) {return element.style.display !== "none";};
    var makeVisible = options.toggleVisibility ? function(element) { element.style.visibility = "visible"; } : function(element) { element.style.display = options.display; };
    options.fadeTime = typeof options.fadeTime === 'number' ? options.fadeTime : 250;

    if(fadeInTarget) {
        if (!isVisible(fadeInTarget)) {
            if (options.waitTime) {
                options.waitTime = options.waitTime === true ? 2000 : options.waitTime;
                setTimeout(function () {
                    options.waitTime = false;
                    slideFadeIn(fadeInTarget, callback, options);
                }, options.waitTime);
            } else {
                if (fadeInTarget) {
                    var opacityInterval = 25 / options.fadeTime;
                    fadeInTarget.style.opacity = 0;
                    makeVisible(fadeInTarget);
                    var fadeInEffect = setInterval(function () {
                        if (fadeInTarget.style.opacity < 1) {
                            fadeInTarget.style.opacity = parseFloat(fadeInTarget.style.opacity) + parseFloat(opacityInterval);
                        } else {
                            clearInterval(fadeInEffect);
                            callback();
                        }
                    }, options.fadeTime * opacityInterval);
                }
            }
        } else {
            callback();
            // setTimeout(callback, options.fadeTime);
        }
    } else {
        debugConsoleError('fadeIn error: no such element exists: ');
    }
}
