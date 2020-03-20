"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jshint esversion:6 */

/**
 * slider class
 */
var Slider =
/**
 * 
 * @param {{containerId: string, imageURLs: Array<string>, transitionStyle: string, transitionTime: number, containerPosition: string}} options options object for slider:
 * options.containerId: id of element which shall be the container for the slider;
 * options.containerPosition: position style property for the container - 'relative', etc;
 * options.imageURLs: array of URLs for images;
 * options.transitionStyle: style of transition - 'default' or 'overlay';
 * options.transitionTime: time in ms until transition is finished;
 * options.transitionDirectionX: x direction for fading out element to move - 'left', 'right', or 'random'
 * options.transitionDirectionY: y direction for fading out element to move - 'up', 'down', or 'random'
 * options.transitionZoom: direction for zooming the fading out element - 'in', 'out', or 'random'
 */
function Slider(options) {
  var _this = this;

  _classCallCheck(this, Slider);

  this.transitionStyles = ['default', 'overlay']; // available transition styles

  this.containerId = options.containerId; // id of container div

  this.containerPosition = options.containerPosition; // position style property for the container (if defined)

  this.imageURLs = options.imageURLs; // array or URLs of images

  this.transitionStyle = options.transitionStyle; // style of transition, one of transitionStyles

  this.transitionTime = options.transitionTime; // time for transition to take place

  this.transitionDirectionX = options.transitionDirectionX; // 

  this.transitionDirectionY = options.transitionDirectionY; // 

  this.transitionZoom = options.transitionZoom; // 

  this.currentIndex = 0; // index of currently shown image 

  this.sliderLock = false; // slider is locked and can't transition

  this.images = []; // image elements
  // adjusting values

  this.transitionStyle = this.transitionStyles.includes(this.transitionStyle) ? this.transitionStyle : 'default';
  this.transitionTime = this.transitionTime ? this.transitionTime : 250;
  this.containerPosition = typeof this.containerPosition === 'string' ? this.containerPosition : null;

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

    _this.container.appendChild(image);

    if (index === _this.imageURLs.length - 1) {
      image.onload = function () {
        _this.container.style.width = Math.min(image.naturalWidth, window.innerWidth);
        _this.container.style.height = Math.min(image.naturalHeight, window.innerHeight);
        _this.container.style.width = image.clientWidth;
        _this.container.style.height = image.clientHeight;
      };
    }

    _this.images[index] = image;
  });
  this.container.classList.add('russunit-slider-container');
  this.container.style.marginLeft = 'auto';
  this.container.style.marginRight = 'auto';
  this.container.style.maxWidth = '100%';
  this.container.style.display = 'block';
  this.container.style.overflow = 'hidden';
  this.container.style.position = 'relative';
  /**
   * resize container, called on resizing browser window
   */

  this.resizeContainer = function () {
    _this.container.style.width = _this.container.parentNode.clientWidth;
    var imageXYRatio = _this.images[0].naturalWidth / _this.images[0].naturalHeight;
    _this.container.style.height = parseFloat(_this.container.style.width.replace('px', '')) / imageXYRatio;
  };

  window.addEventListener('resize', this.resizeContainer);
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
  }; // this.resetSlide = (index) => {
  //     this.images[index].
  // }


  this.transitionSlide = {
    'default': function _default(newIndex, callback) {
      slideFadeReplace(_this.images[_this.currentIndex], _this.images[newIndex], callback, {
        toggleVisibility: true,
        fadeTime: _this.transitionTime / 2
      });
    },
    'overlay': function overlay(newIndex, callback) {
      _this.images[newIndex].style.zIndex = 1;
      _this.images[newIndex].style.opacity = 1;
      _this.images[newIndex].style.visibility = 'visible';
      slideFadeOut(_this.images[_this.currentIndex], function () {
        _this.images[_this.currentIndex].style.zIndex = 0;
        _this.images[newIndex].style.zIndex = 2;
        callback();
      }, {
        toggleVisibility: true,
        fadeTime: _this.transitionTime,
        directionX: _this.transitionDirectionX,
        directionY: _this.transitionDirectionY,
        zoom: _this.transitionZoom
      });
    }
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

      _this.transitionSlide[_this.transitionStyle](newIndex, finishSlide);
    } else {
      console.log('Slider error: slider is locked.');
    }
  };
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
 * @param {{waitTime: any, fadeTime: number, toggleVisibility: boolean, direction: string, zoom: string}} options options object for fade:
 * options.waitTime: wait before executing - true for 2 sec, false for 0 sec, num for other (ms);
 * options.fadeTime: time for the fadeIn/fadeOut effects, defaults to 250;
 * options.toggleVisibility: true if using visibility:hidden instead of display:none for fadeOut;
 * options.direction: direction for the fading out element to fly away if position:aboslute (left, right, up, down) - null to stay still;
 * options.zoom: direction for the fading element to zoom if position:absolute (in, out) - null to stay same size
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
  var defaultFadeTime = 500;
  var intervalTime = 20;
  var xDirections = ['left', 'right', 'random'];
  var yDirections = ['up', 'down', 'random'];
  var zooms = ['in', 'out', 'random']; // default options

  options.waitTime = options.waitTime ? options.waitTime : false;
  options.fadeTime = options.fadeTime ? options.fadeTime : defaultFadeTime;
  options.toggleVisibility = options.toggleVisibility ? options.toggleVisibility : false;
  options.directionX = options.directionX ? options.directionX : null;
  options.directionY = options.directionY ? options.directionY : null;
  options.zoom = options.zoom ? options.zoom : null;
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
      // set zoom/direction
      if (options.directionX) {
        options.directionX = xDirections.includes(options.directionX) ? options.directionX : null;

        if (options.directionX === 'random') {
          options.directionX = ['right', 'left', null][Math.floor(Math.random() * 3)];
        }

        var xDirectionInterval;

        switch (options.directionX) {
          case 'right':
            xDirectionInterval = 1;
            break;

          case 'left':
            xDirectionInterval = -1;
            break;
        }
      }

      if (options.directionY) {
        options.directionY = yDirections.includes(options.directionY) ? options.directionY : null;

        if (options.directionY === 'random') {
          options.directionY = ['up', 'down', null][Math.floor(Math.random() * 3)];
        }

        var yDirectionInterval;

        switch (options.directionY) {
          case 'up':
            yDirectionInterval = -1;
            break;

          case 'down':
            yDirectionInterval = 1;
            break;
        }
      }

      if (options.zoom) {
        options.zoom = zooms.includes(options.zoom) ? options.zoom : null;

        if (options.zoom === 'random') {
          options.zoom = ['in', 'out', null][Math.floor(Math.random() * 3)];
        }

        var zoomInterval;

        switch (options.zoom) {
          case 'in':
            zoomInterval = 0.005;
            break;

          case 'out':
            zoomInterval = -0.005;
            break;
        }
      }

      if (options.waitTime) {
        options.waitTime = options.waitTime === true ? defaultWaitTime : options.waitTime;
        options.waitTime = typeof options.waitTime === 'number' ? options.waitTime : defaultWaitTime;
        setTimeout(function () {
          options.waitTime = false;
          slideFadeOut(fadeOutTarget, callback, options);
        }, options.waitTime);
      } else {
        options.fadeTime = typeof options.fadeTime === 'number' ? options.fadeTime : defaultFadeTime;
        var opacityInterval = intervalTime / options.fadeTime;
        fadeOutTarget.style.opacity = 1;
        var fadeOutEffect = setInterval(function () {
          if (fadeOutTarget.style.opacity > 0) {
            // fade out a little bit
            fadeOutTarget.style.opacity -= opacityInterval; // move a little bit in directions

            if (options.directionX) {
              fadeOutTarget.style.left = parseFloat(fadeOutTarget.style.left.replace('px', '')) + xDirectionInterval + "px";
            }

            if (options.directionY) {
              fadeOutTarget.style.top = parseFloat(fadeOutTarget.style.top.replace('px', '')) + yDirectionInterval + "px";
            } // zoom a little bit


            if (options.zoom) {
              if (!fadeOutTarget.style.transform) {
                fadeOutTarget.style.transform = 'scale(1)';
              }

              fadeOutTarget.style.transform = 'scale(' + (parseFloat(fadeOutTarget.style.transform.replace('scale(', '').replace(')', '')) + zoomInterval) + ')';
            }
          } else {
            clearInterval(fadeOutEffect);
            makeInvisible(fadeOutTarget); // console.log('top: ' + fadeOutTarget.style.top);
            // console.log('left: ' + fadeOutTarget.style.left);

            fadeOutTarget.style.top = 0;
            fadeOutTarget.style.left = 0;
            fadeOutTarget.style.transform = 'scale(1)';
            callback();
          }
        }, intervalTime);
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
  var intervalTime = 20; // default options

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
          var opacityInterval = intervalTime / options.fadeTime;
          fadeInTarget.style.opacity = 0;
          makeVisible(fadeInTarget);
          var fadeInEffect = setInterval(function () {
            if (fadeInTarget.style.opacity < 1) {
              fadeInTarget.style.opacity = parseFloat(fadeInTarget.style.opacity) + parseFloat(opacityInterval);
            } else {
              clearInterval(fadeInEffect);
              callback();
            }
          }, intervalTime);
        }
      }
    } else {
      callback(); // setTimeout(callback, options.fadeTime);
    }
  } else {
    console.log('fadeIn error: no such element exists: ');
  }
}