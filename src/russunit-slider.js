/* jshint esversion:6 */

/**
 * slider class
 */
class Slider {

    /**
     * 
     * @param {{containerId: string, imageURLs: Array<string>, transitionStyle: string, transitionTime: number, containerPosition: string}} options options object for slider:
     * options.containerId: id of element which shall be the container for the slider;
     * options.imageURLs: array of URLs for images;
     * options.transitionStyle: style of transition - 'default' or 'overlay';
     * options.transitionTime: time in ms until transition is finished;
     * options.containerPosition: position style property for the container - 'relative', etc;
     */
    constructor(options) {

        this.transitionStyles = ['default', 'overlay']; // available transition styles

        this.containerId = options.containerId; // id of container div
        this.imageURLs = options.imageURLs; // array or URLs of images
        this.transitionStyle = options.transitionStyle; // style of transition, one of transitionStyles
        this.transitionTime = options.transitionTime; // time for transition to take place
        this.containerPosition = options.containerPosition // position style property for the container (if defined)

        this.currentIndex = 0; // index of currently shown image 
        this.sliderLock = false; // slider is locked and can't transition
        this.images = []; // image elements

        // adjusting values
        this.transitionStyle = this.transitionStyles.includes(this.transitionStyle) ? this.transitionStyle : 'default';
        this.transitionTime = this.transitionTime ? this.transitionTime : 250;
        this.containerPosition = typeof this.containerPosition === 'string' ? this.containerPosition : null;

        if (!Array.isArray(this.imageURLs)) {
            throw ("Slider error: imageURLs must be an array of strings");
        }
        if (!document.getElementById(this.containerId)) {
            throw ("Slider error: conatinerId must be a valid element's id");
        }

        var image;
        this.container = document.getElementById(this.containerId);
        this.imageURLs.forEach((imageURL, index) => {
            image = document.createElement('IMG');
            image.id = this.containerId + "-slide-" + index;
            image.src = imageURL;
            image.classList.add('russunit-slider-image');
            image.style.margin = 'auto';
            image.style.maxWidth = '100%';
            image.style.position = 'absolute';
            image.style.top = 0;
            image.style.left = 0;

            if (index > 0) {
                image.style.visibility = 'hidden';
                image.style.zIndex = 0;
            } else {
                image.style.zIndex = 2;
            }
            this.container.appendChild(image);
            this.images[index] = image;
        });
        this.container.classList.add('russunit-slider-container');
        this.container.style.marginLeft = 'auto';
        this.container.style.marginRight = 'auto';
        this.container.style.maxWidth = '100%';
        this.container.style.display = 'block';
        if(this.containerPosition) {
            this.container.style.position = this.containerPosition;
        }

        /* initially set dynamic container size*/
        this.container.style.width = this.images[0].clientWidth;
        this.container.style.height = this.images[0].clientHeight;

        /* alternative to above 2 lines if container loads with width/height 0 */
        // var count = 0;
        // do {
        //     console.log('asjusting container size...');
        //     this.containerWidth = this.images[0].clientWidth;
        //     this.containerHeight = this.images[0].clientHeight;
        //     count++;
        // } while (this.containerWidth < 1 && count < 500);
        // this.container.style.width = this.containerWidth;
        // this.container.style.height = this.containerHeight;


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
            this.goToSlide(this.getNextIndex(), callback);
        };


        /**
         * go to the previous slide, then execute the callback
         */
        this.prevSlide = (callback = null) => {
            this.goToSlide(this.getPrevIndex(), callback);
        };

        // this.resetSlide = (index) => {
        //     this.images[index].
        // }

        this.transitionSlide = {
            'default': (newIndex, callback) => {
                slideFadeReplace(this.images[this.currentIndex], this.images[newIndex], callback, {
                    toggleVisibility: true,
                    fadeTime: (this.transitionTime / 2)
                });
            },
            'overlay': (newIndex, callback) => {
                this.images[newIndex].style.zIndex = 1;
                this.images[newIndex].style.opacity = 1;
                this.images[newIndex].style.visibility = 'visible';
                slideFadeOut(this.images[this.currentIndex], () => {
                    this.images[this.currentIndex].style.zIndex = 0;
                    this.images[newIndex].style.zIndex = 2;
                    callback();
                }, {
                    toggleVisibility: true,
                    fadeTime: this.transitionTime
                });
            }
        }


        /**
         * go to the slide at index (if possible), then execute the callback
         */
        this.goToSlide = (newIndex, callback = null) => {
            if (typeof newIndex !== 'number' || newIndex < 0 || newIndex + 1 > this.images.length) {
                console.log('Slider error: invalid index in goToSlide: ' + newIndex);
                if (typeof callback === 'function') {
                    callback();
                }
            } else if (newIndex === this.currentIndex) {
                console.log('Slider error: current index in goToSlide: ' + newIndex);
                if (typeof callback === 'function') {
                    callback();
                }
            } else if (!this.sliderLock) {
                var finishSlide = () => {
                    this.currentIndex = newIndex;
                    this.sliderLock = false;
                    if (typeof callback === 'function') {
                        callback();
                    }
                };
                this.sliderLock = true;
                this.transitionSlide[this.transitionStyle](newIndex, finishSlide);
            } else {
                console.log('Slider error: slider is locked.');
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

    // static values
    const defaultWaitTime = 2000;
    const defaultFadeTime = 250;

    // default options
    options.waitTime = options.waitTime ? options.waitTime : false;
    options.display = options.display ? options.display : false;
    options.fadeTime = options.fadeTime ? options.fadeTime : defaultFadeTime;
    options.toggleVisibility = options.toggleVisibility ? options.toggleVisibility : false;

    if (options.waitTime) {
        options.waitTime = options.waitTime === true ? defaultWaitTime : options.waitTime;
        setTimeout(function () {
            options.waitTime = false;
            slideFadeReplace(fadeOutTarget, fadeInTarget, callback, options);
        }, options.waitTime);
    } else {
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

    // check cb
    if (typeof callback !== 'function') {
        callback = function () {};
    }

    // check target
    if (typeof fadeOutTarget === 'string') {
        fadeOutTarget = document.getElementById(fadeOutTarget);
    }

    // static values
    const defaultWaitTime = 2000;
    const defaultFadeTime = 250;
    const opacityIntervalDividend = 25;

    // default options
    options.waitTime = options.waitTime ? options.waitTime : false;
    options.fadeTime = options.fadeTime ? options.fadeTime : defaultFadeTime;
    options.toggleVisibility = options.toggleVisibility ? options.toggleVisibility : false;

    var isVisible = options.toggleVisibility ? function (element) {
        return element.style.visibility !== "hidden";
    } : function (element) {
        return element.style.display !== "none";
    };
    var makeInvisible = options.toggleVisibility ? function (element) {
        element.style.visibility = "hidden";
    } : function (element) {
        element.style.display = "none";
    };

    if (fadeOutTarget) {
        if (isVisible(fadeOutTarget)) {
            if (options.waitTime) {
                options.waitTime = options.waitTime === true ? defaultWaitTime : options.waitTime;
                options.waitTime = typeof options.waitTime === 'number' ? options.waitTime : defaultWaitTime;
                setTimeout(function () {
                    options.waitTime = false;
                    slideFadeOut(fadeOutTarget, callback, options);
                }, options.waitTime);
            } else {
                if (fadeOutTarget) {
                    options.fadeTime = typeof options.fadeTime === 'number' ? options.fadeTime : defaultFadeTime;
                    var opacityInterval = opacityIntervalDividend / options.fadeTime;
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
        console.log('fadeOut error: no such element exists.');
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

    // check cb
    if (typeof callback !== 'function') {
        callback = function () {};
    }

    // check target
    if (typeof fadeInTarget === 'string') {
        fadeInTarget = document.getElementById(fadeInTarget);
    }

    // static values
    const defaultWaitTime = 2000;
    const defaultFadeTime = 250;
    const opacityIntervalDividend = 25;

    // default options
    options.waitTime = options.waitTime ? options.waitTime : false;
    options.display = options.display ? options.display : false;
    options.fadeTime = options.fadeTime ? options.fadeTime : defaultFadeTime;
    options.toggleVisibility = options.toggleVisibility ? options.toggleVisibility : false;

    // option values
    options.display = options.display === false ? 'block' : options.display;
    options.display = options.display === true ? 'flex' : options.display;
    var isVisible = options.toggleVisibility ? function (element) {
        return element.style.visibility !== "hidden";
    } : function (element) {
        return element.style.display !== "none";
    };
    var makeVisible = options.toggleVisibility ? function (element) {
        element.style.visibility = "visible";
    } : function (element) {
        element.style.display = options.display;
    };
    options.fadeTime = typeof options.fadeTime === 'number' ? options.fadeTime : defaultFadeTime;

    if (fadeInTarget) {
        if (!isVisible(fadeInTarget)) {
            if (options.waitTime) {
                options.waitTime = options.waitTime === true ? defaultWaitTime : options.waitTime;
                options.waitTime = typeof options.waitTime === 'number' ? options.waitTime : defaultWaitTime;
                setTimeout(function () {
                    options.waitTime = false;
                    slideFadeIn(fadeInTarget, callback, options);
                }, options.waitTime);
            } else {
                if (fadeInTarget) {
                    var opacityInterval = opacityIntervalDividend / options.fadeTime;
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
        console.log('fadeIn error: no such element exists: ');
    }
}