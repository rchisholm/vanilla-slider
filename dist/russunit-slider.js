"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jshint esversion:6 */

/**
 * slider class
 */
var Slider = function Slider(options) {
  var _this = this;

  _classCallCheck(this, Slider);

  this.transitionStyles = ['overlay']; // available transition styles

  this.containerId = options.containerId; // id of container div

  this.imageURLs = options.imageURLs; // array or URLs of images

  this.transitionStyle = options.transitionStyle; // style of transition, one of transitionStyles

  this.transitionTime = options.transitionTime; // time for transition to take place

  this.currentIndex = 0; // index of currently shown image 

  this.sliderLock = false; // slider is locked and can't transition

  this.images = []; // image elements
  // adjusting values

  this.transitionStyle = this.transitionStyles.includes(this.transitionStyle) ? this.transitionStyle : false;
  this.transitionTime = this.transitionTime ? this.transitionTime : 250;

  if (!Array.isArray(this.imageURLs)) {
    throw "Slider error: imageURLs must be an array of strings";
  }

  if (!document.getElementById(this.containerId)) {
    throw "Slider error: conatinerId must be a valid element's id";
  }

  var image;
  this.container = document.getElementById(this.containerId);
  this.imageURLs.forEach(function (imageURL, index) {
    image = document.createElement('IMG');
    image.id = _this.containerId + "-slide-" + index;
    image.src = imageURL;
    image.classList.add('russunit-slider-image');

    if (index > 0) {
      image.style.visibility = 'hidden';
      image.style.zIndex = 0;
    } else {
      image.style.zIndex = 2;
    }

    _this.container.appendChild(image);

    _this.images[index] = image;
  });
  this.container.classList.add('russunit-slider-container');
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

  this.resizeContainer = function () {
    _this.container.style.width = _this.images[0].clientWidth;
    _this.container.style.height = _this.images[0].clientHeight;
  };
  /**
   * get the index of the next slide
   */


  this.getNextIndex = function () {
    return (_this.currentIndex + 1) % _this.images.length;
  };
  /**
   * get the index of the previous slide
   */


  this.getPrevIndex = function () {
    return _this.currentIndex < 1 ? _this.images.length - 1 : _this.currentIndex - 1;
  };
  /**
   * go to the next slide, then execute the callback
   */


  this.nextSlide = function () {
    var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _this.goToSlide(_this.getNextIndex(), callback);
  };
  /**
   * go to the previous slide, then execute the callback
   */


  this.prevSlide = function () {
    var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _this.goToSlide(_this.getPrevIndex(), callback);
  };
  /**
   * go to the slide at index (if possible), then execute the callback
   */


  this.goToSlide = function (newIndex) {
    var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    if (typeof newIndex !== 'number' || newIndex < 0 || newIndex + 1 > _this.images.length) {
      console.log('Slider error: invalid index in goToSlide: ' + newIndex);

      if (typeof callback === 'function') {
        callback();
      }
    } else if (newIndex === _this.currentIndex) {
      console.log('Slider error: current index in goToSlide: ' + newIndex);

      if (typeof callback === 'function') {
        callback();
      }
    } else if (!_this.sliderLock) {
      var finishSlide = function finishSlide() {
        _this.currentIndex = newIndex;
        _this.sliderLock = false;

        if (typeof callback === 'function') {
          callback();
        }
      };

      _this.sliderLock = true;

      if (!_this.transitionStyle) {
        slideFadeReplace(_this.images[_this.currentIndex], _this.images[newIndex], finishSlide, {
          toggleVisibility: true,
          fadeTime: _this.transitionTime / 2
        });
      } else if (_this.transitionStyle === 'overlay') {
        _this.images[newIndex].style.zIndex = 1;
        _this.images[newIndex].style.opacity = 1;
        _this.images[newIndex].style.visibility = 'visible';
        slideFadeOut(_this.images[_this.currentIndex], function () {
          _this.images[_this.currentIndex].style.zIndex = 0;
          _this.images[newIndex].style.zIndex = 2;
          finishSlide();
        }, {
          toggleVisibility: true,
          fadeTime: _this.transitionTime
        });
      }
    } else {
      console.log('Slider error: slider is locked.');
    }
  };

  window.addEventListener('resize', this.resizeContainer);
};
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


function slideFadeReplace(fadeOutTarget, fadeInTarget) {
  var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  // static values
  var defaultWaitTime = 2000;
  var defaultFadeTime = 250; // default options

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


function slideFadeOut(fadeOutTarget) {
  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  // check cb
  if (typeof callback !== 'function') {
    callback = function callback() {};
  } // check target


  if (typeof fadeOutTarget === 'string') {
    fadeOutTarget = document.getElementById(fadeOutTarget);
  } // static values


  var defaultWaitTime = 2000;
  var defaultFadeTime = 250;
  var opacityIntervalDividend = 25; // default options

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
      callback(); // setTimeout(callback, options.fadeTime);
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


function slideFadeIn(fadeInTarget) {
  var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  // check cb
  if (typeof callback !== 'function') {
    callback = function callback() {};
  } // check target


  if (typeof fadeInTarget === 'string') {
    fadeInTarget = document.getElementById(fadeInTarget);
  } // static values


  var defaultWaitTime = 2000;
  var defaultFadeTime = 250;
  var opacityIntervalDividend = 25; // default options

  options.waitTime = options.waitTime ? options.waitTime : false;
  options.display = options.display ? options.display : false;
  options.fadeTime = options.fadeTime ? options.fadeTime : defaultFadeTime;
  options.toggleVisibility = options.toggleVisibility ? options.toggleVisibility : false; // option values

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
      callback(); // setTimeout(callback, options.fadeTime);
    }
  } else {
    console.log('fadeIn error: no such element exists: ');
  }
}