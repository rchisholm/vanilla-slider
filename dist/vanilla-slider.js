"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jshint esversion:6 */

/**
 * slider class
 */
var VanillaSlider =
/**
 * @param {any} containerId element or id of element which shall be the container for the slider;
 * @param {{images: Array<any>, transitionTime: number, transitionDirectionX: string, transitionDirectionY: string, transitionZoom: string, swipe: boolean, auto: boolean, autoTime: number}} options options object for slider:
 * options.images: array of images, either strings (URLs) or objects with imageUrl, linkUrl, linkNewTab
 * options.transitionTime: time in ms until transition is finished;
 * options.transitionDirectionX: x direction for fading out element to move - 'left', 'right', or 'random'
 * options.transitionDirectionY: y direction for fading out element to move - 'up', 'down', or 'random'
 * options.transitionZoom: direction for zooming the fading out element - 'in', 'out', or 'random'
 * options.bullets: whether to show bullets
 * options.bulletColor: color for active bullet
 * options.bulletsHide: whether to hide bullets on mouse out
 * options.arrows: whether to show arrows
 * options.arrowsHide: whether to hide arrows on mouse out
 * options.swipe: whether to allow swipe support
 * options.auto: whether to automatically move slides
 * options.autoTime: time in ms for slides to automatically move
 */
function VanillaSlider(containerId) {
  var _this = this;

  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  _classCallCheck(this, VanillaSlider);

  this.containerId = containerId;
  this.images = options.images;
  this.transitionTime = options.transitionTime;
  this.transitionDirectionX = options.transitionDirectionX;
  this.transitionDirectionY = options.transitionDirectionY;
  this.transitionZoom = options.transitionZoom;
  this.bullets = options.bullets;
  this.bulletColor = options.bulletColor;
  this.bulletsHide = options.bulletsHide;
  this.arrows = options.arrows;
  this.arrowsHide = options.arrowsHide;
  this.swipe = options.swipe;
  this.auto = options.auto;
  this.autoTime = options.autoTime;
  this.currentIndex = 0; // index of currently shown image 

  this.sliderLock = false; // slider is locked and can't transition

  this.imageElements = []; // image elements
  // adjusting values

  this.transitionTime = this.transitionTime ? this.transitionTime : 250;
  this.bullets = typeof this.bullets === 'boolean' ? this.bullets : false;
  this.bulletsHide = typeof this.bulletsHide === 'boolean' && this.bullets ? this.bulletsHide : false;
  this.arrows = typeof this.arrows === 'boolean' ? this.arrows : true;
  this.arrowsHide = typeof this.arrowsHide === 'boolean' && this.arrows ? this.arrowsHide : true;
  this.swipe = typeof this.swipe === 'boolean' ? this.swipe : true;
  this.auto = typeof this.auto === 'boolean' ? this.auto : false;
  this.autoTime = typeof this.autoTime === 'number' ? this.autoTime : 10000; // check color

  if (this.bulletColor) {
    var isColor = function isColor(strColor) {
      var s = new Option().style;
      s.color = strColor;
      return s.color == strColor;
    };

    this.bulletColor = isColor(this.bulletColor) ? this.bulletColor : 'red';
  } else {
    this.bulletColor = 'red'; // default bulletColor
  }

  if (!Array.isArray(this.images)) {
    this.images = null;
  }

  if (typeof this.containerId !== 'string') {
    if (this.containerId.id) {
      this.containerId = this.containerId.id;
    }
  }

  if (!document.getElementById(this.containerId)) {
    throw "Slider error: conatinerId must be a valid element or id";
  } // place images in cointainer


  var imageElement;
  var imageAnchor;
  var imagesIndex = 0;
  this.container = document.getElementById(this.containerId);

  if (!this.images) {
    this.images = [];
    var containerChildren = this.container.children;
    [].forEach.call(containerChildren, function (containerChild) {
      imageAnchor = null;

      if (containerChild.tagName === 'A') {
        imageAnchor = containerChild;
        containerChild = containerChild.firstElementChild;
      }

      if (containerChild.tagName === 'IMG') {
        _this.images[imagesIndex] = {};
        _this.images[imagesIndex].imageUrl = containerChild.src;

        if (imageAnchor) {
          _this.images[imagesIndex].linkUrl = imageAnchor.href;
          _this.images[imagesIndex].linkNewTab = imageAnchor.target === '_blank';
        }

        imagesIndex++;
      } else {
        console.log('Slider error: invalid container child tag name: ' + containerChild.tagName);
      }
    });
  }

  this.container.innerHTML = '';
  this.images.forEach(function (image, index) {
    if (typeof image === 'string') {
      image = {
        imageUrl: image,
        linkUrl: null,
        linkNewTab: null
      };
    }

    imageElement = document.createElement('IMG');
    imageElement.id = _this.containerId + "-slide-" + index;
    imageElement.src = image.imageUrl;
    imageElement.classList.add('russunit-slider-image');
    imageElement.style.margin = 'auto';
    imageElement.style.maxWidth = '100%';
    imageElement.style.position = 'absolute';
    imageElement.style.top = 0;
    imageElement.style.left = 0;

    if (index > 0) {
      imageElement.style.visibility = 'hidden';
      imageElement.style.zIndex = 0;
    } else {
      imageElement.style.zIndex = 2;
    }

    _this.container.appendChild(imageElement);

    if (index === _this.images.length - 1) {
      imageElement.onload = function () {
        _this.container.style.width = Math.min(imageElement.naturalWidth, window.innerWidth);
        _this.container.style.height = Math.min(imageElement.naturalHeight, window.innerHeight);
        _this.container.style.width = imageElement.clientWidth;
        _this.container.style.height = imageElement.clientHeight;
      };
    }

    _this.imageElements[index] = imageElement;
  });

  if (this.images.length < 1) {
    throw 'Slider error: no images found for slides.';
  } // style container


  this.container.classList.add('russunit-slider-container');
  this.container.style.marginLeft = 'auto';
  this.container.style.marginRight = 'auto';
  this.container.style.maxWidth = '100%';
  this.container.style.display = 'flex';
  this.container.style.overflow = 'hidden';
  this.container.style.position = 'relative';

  if (this.arrows) {
    // create left arrow
    this.leftArrow = document.createElement('SPAN');
    this.leftArrow.id = this.containerId + '-arrow-left';
    this.leftArrow.classList.add('russunit-slider-arrow');
    this.leftArrow.classList.add('russunit-slider-arrow-left');
    this.leftArrow.style.zIndex = 6;
    this.leftArrow.style.color = '#fff';
    this.leftArrow.style.fontSize = '2em';
    this.leftArrow.style.margin = 'auto auto auto 10px';
    this.leftArrow.style.cursor = 'pointer';
    this.leftArrow.innerHTML = '&lt;';
    this.container.appendChild(this.leftArrow);
  }

  if (this.bullets) {
    // create bullet container
    this.bulletContainer = document.createElement('DIV');
    this.bulletContainer.id = this.containerId + '-bullet-container';
    this.bulletContainer.classList.add('russunit-slider-bullet-container');
    this.bulletContainer.style.zIndex = 6;
    this.bulletContainer.style.position = 'relative';
    this.bulletContainer.style.margin = 'auto auto 0';
    this.bulletContainer.style.textAlign = 'center';
    this.container.appendChild(this.bulletContainer); // create bullets

    this.bullets = [];
    var bullet;
    this.imageElements.forEach(function (element, index) {
      bullet = document.createElement('SPAN');
      bullet.id = _this.containerId + '-bullet-' + index;
      bullet.classList.add('russunit-slider-bullet');
      bullet.style.color = '#fff';
      bullet.style.zIndex = 10;
      bullet.style.fontSize = '2em';
      bullet.style.margin = '0 5px';
      bullet.style.cursor = 'pointer';
      bullet.style.transition = 'all 0.3s ease-in-out';
      bullet.innerHTML = '&bull;';

      if (index === 0) {
        bullet.style.color = _this.bulletColor;
      }

      _this.bullets[index] = bullet;

      _this.bulletContainer.appendChild(bullet);
    }); // hide bullets

    if (this.bulletsHide) {
      this.bulletContainer.style.visibility = 'hidden';
      this.bulletContainer.style.opacity = 0;
      this.bulletContainer.style.transition = 'visibility 0.3s linear,opacity 0.3s linear';
      this.container.addEventListener('mouseenter', function () {
        _this.bulletContainer.style.visibility = 'visible';
        _this.bulletContainer.style.opacity = 1;
      });
      this.container.addEventListener('mouseleave', function () {
        _this.bulletContainer.style.visibility = 'hidden';
        _this.bulletContainer.style.opacity = 0;
      });
    }
  }

  if (this.arrows) {
    // create right arrow
    this.rightArrow = document.createElement('SPAN');
    this.rightArrow.id = this.containerId + '-arrow-right';
    this.rightArrow.classList.add('russunit-slider-arrow');
    this.rightArrow.classList.add('russunit-slider-arrow-right');
    this.rightArrow.style.zIndex = 6;
    this.rightArrow.style.color = '#fff';
    this.rightArrow.style.fontSize = '2em';
    this.rightArrow.style.margin = 'auto 10px auto auto';
    this.rightArrow.style.cursor = 'pointer';
    this.rightArrow.innerHTML = '&gt;';
    this.container.appendChild(this.rightArrow);
  }

  if (this.arrows) {
    // hide arrows
    if (this.arrowsHide) {
      this.leftArrow.style.visibility = 'hidden';
      this.leftArrow.style.opacity = 0;
      this.leftArrow.style.transition = 'visibility 0.3s linear,opacity 0.3s linear';
      this.rightArrow.style.visibility = 'hidden';
      this.rightArrow.style.opacity = 0;
      this.rightArrow.style.transition = 'visibility 0.3s linear,opacity 0.3s linear';
      this.container.addEventListener('mouseenter', function () {
        _this.leftArrow.style.visibility = 'visible';
        _this.leftArrow.style.opacity = 1;
        _this.rightArrow.style.visibility = 'visible';
        _this.rightArrow.style.opacity = 1;
      });
      this.container.addEventListener('mouseleave', function () {
        _this.leftArrow.style.visibility = 'hidden';
        _this.leftArrow.style.opacity = 0;
        _this.rightArrow.style.visibility = 'hidden';
        _this.rightArrow.style.opacity = 0;
      });
    }
  }
  /**
   * resize container, called on resizing browser window
   */


  this.resizeContainer = function () {
    _this.container.style.width = _this.container.parentNode.clientWidth;
    var imageXYRatio = _this.imageElements[0].naturalWidth / _this.imageElements[0].naturalHeight;
    _this.container.style.height = parseFloat(_this.container.style.width.replace('px', '')) / imageXYRatio;
  };

  window.addEventListener('resize', this.resizeContainer);
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

  this.slideFadeOut = function (fadeOutTarget) {
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

            _this.slideFadeOut(fadeOutTarget, callback, options);
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
  };
  /**
   * get the index of the next slide
   */


  this.getNextIndex = function () {
    return (_this.currentIndex + 1) % _this.imageElements.length;
  };
  /**
   * get the index of the previous slide
   */


  this.getPrevIndex = function () {
    return _this.currentIndex < 1 ? _this.imageElements.length - 1 : _this.currentIndex - 1;
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

    if (typeof newIndex !== 'number' || newIndex < 0 || newIndex + 1 > _this.imageElements.length) {
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
      if (_this.auto) {
        _this.pauseAuto();
      }

      if (_this.bullets) {
        _this.bullets[_this.currentIndex].style.color = '#fff';
        _this.bullets[newIndex].style.color = _this.bulletColor;
      }

      var finishSlide = function finishSlide() {
        _this.currentIndex = newIndex;

        _this.setSlideLink(newIndex);

        _this.sliderLock = false;

        if (typeof callback === 'function') {
          callback();
        }

        if (_this.auto) {
          _this.autoInterval = setInterval(_this.nextSlide, _this.autoTime);
        }
      };

      _this.sliderLock = true;

      _this.transitionSlide(newIndex, finishSlide);
    } else {
      console.log('Slider error: slider is locked.');
    }
  };
  /**
   * start automatic slide movement
   */


  this.startAuto = function () {
    _this.auto = true;
    _this.autoInterval = setInterval(_this.nextSlide, _this.autoTime);
  };
  /**
   * pause automatic slide movement until slides move
   */


  this.pauseAuto = function () {
    clearInterval(_this.autoInterval);
  };
  /**
   * stop automatic slide movement
   */


  this.stopAuto = function () {
    clearInterval(_this.autoInterval);
    _this.auto = false;
  };
  /**
   * clear the link div for the slide, and if the next slide has a link, create the link div
   */


  this.setSlideLink = function (index) {
    if (_this.linkOverlay) {
      _this.container.removeChild(_this.linkOverlay);

      _this.linkOverlay = null;
    }

    if (_this.images[index].linkUrl) {
      _this.linkOverlay = document.createElement('DIV');
      _this.linkOverlay.id = _this.containerId + '-link-overlay';

      _this.linkOverlay.classList.add('russunit-slider-link-overlay');

      _this.linkOverlay.style.zIndex = 5;
      _this.linkOverlay.style.position = 'absolute';
      _this.linkOverlay.style.top = 0;
      _this.linkOverlay.style.left = 0;
      _this.linkOverlay.style.width = '100%';
      _this.linkOverlay.style.height = '100%';
      _this.linkOverlay.style.cursor = 'pointer';

      if (_this.images[index].linkNewTab) {
        _this.linkOverlay.addEventListener('click', function () {
          window.open(_this.images[index].linkUrl, '_blank');
        });
      } else {
        _this.linkOverlay.addEventListener('click', function () {
          window.location.href = _this.images[index].linkUrl;
        });
      }

      _this.container.appendChild(_this.linkOverlay);
    }
  };
  /**
   * transition from one slide to another
   */


  this.transitionSlide = function (newIndex, callback) {
    _this.imageElements[newIndex].style.zIndex = 1;
    _this.imageElements[newIndex].style.opacity = 1;
    _this.imageElements[newIndex].style.visibility = 'visible';

    _this.slideFadeOut(_this.imageElements[_this.currentIndex], function () {
      _this.imageElements[_this.currentIndex].style.zIndex = 0;
      _this.imageElements[newIndex].style.zIndex = 2;
      callback();
    }, {
      toggleVisibility: true,
      fadeTime: _this.transitionTime,
      directionX: _this.transitionDirectionX,
      directionY: _this.transitionDirectionY,
      zoom: _this.transitionZoom
    });
  };

  if (this.bullets) {
    this.imageElements.forEach(function (element, index) {
      _this.bullets[index].addEventListener('click', function (event) {
        _this.goToSlide(index);

        event.stopPropagation();
      });
    });
  }

  if (this.arrows) {
    this.leftArrow.addEventListener('click', function (event) {
      _this.prevSlide();

      event.stopPropagation();
    });
    this.rightArrow.addEventListener('click', function (event) {
      _this.nextSlide();

      event.stopPropagation();
    });
  }

  this.setSlideLink(this.currentIndex);

  if (this.swipe) {
    this.swiper = {};
    this.swiper.xDown = null;
    this.swiper.yDown = null;
    this.container.addEventListener('touchstart', function (evt) {
      _this.swiper.xDown = evt.touches[0].clientX;
      _this.swiper.yDown = evt.touches[0].clientY;
    }, false);

    var handleTouchMove = function handleTouchMove(evt) {
      if (!_this.swiper.xDown || !_this.swiper.yDown) {
        return;
      }

      var xUp = evt.touches[0].clientX;
      var yUp = evt.touches[0].clientY;
      _this.swiper.xDiff = _this.swiper.xDown - xUp;
      _this.swiper.yDiff = _this.swiper.yDown - yUp;

      if (Math.abs(_this.swiper.xDiff) > Math.abs(_this.swiper.yDiff)) {
        // Most significant.
        var transition = {};

        if (_this.swiper.xDiff > 0) {
          transition = {
            x: _this.transitionDirectionX,
            y: _this.transitionDirectionY,
            z: _this.transitionZoom
          };
          _this.transitionDirectionX = 'left';
          _this.transitionDirectionY = false;
          _this.transitionZoom = false;

          _this.nextSlide(function () {
            _this.transitionDirectionX = transition.x;
            _this.transitionDirectionY = transition.y;
            _this.transitionZoom = transition.z;
          });
        } else {
          transition = {
            x: _this.transitionDirectionX,
            y: _this.transitionDirectionY,
            z: _this.transitionZoom
          };
          _this.transitionDirectionX = 'right';
          _this.transitionDirectionY = false;
          _this.transitionZoom = false;

          _this.prevSlide(function () {
            _this.transitionDirectionX = transition.x;
            _this.transitionDirectionY = transition.y;
            _this.transitionZoom = transition.z;
          });
        }
      } // Reset values.


      _this.swiper.xDown = null;
      _this.swiper.yDown = null;
    };

    this.container.addEventListener('touchmove', function (evt) {
      handleTouchMove(evt);
    }, false);
  }

  if (this.auto) {
    this.startAuto();
  }
};

function createSlider(containerId, options) {
  return new VanillaSlider(containerId, options);
}