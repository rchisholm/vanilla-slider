"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* jshint esversion:6 */

/**
 * slider class
 */
var VanillaSlider = /*#__PURE__*/function () {
  /**
   * @param {any} containerId element or id of element which shall be the container for the slider;
   * @param {{images: Array<any>, transitionTime: number, transitionDirectionX: string, transitionDirectionY: string, transitionZoom: string, swipe: boolean, auto: boolean, autoTime: number}} options options object for slider:
   * options.images: array of images, either strings (URLs) or objects with imageUrl, linkUrl, linkNewTab, textTitle, textBody, textPosition
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
   * options.autoPauseOnHover: whether to pause auto on mouse hover
   */
  function VanillaSlider(containerId) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, VanillaSlider);

    this.webpSupported(function (isWebpSupported) {
      _this.containerId = containerId;
      _this.images = options.images;
      _this.transitionTime = options.transitionTime;
      _this.transitionDirectionX = options.transitionDirectionX;
      _this.transitionDirectionY = options.transitionDirectionY;
      _this.transitionZoom = options.transitionZoom;
      _this.bullets = options.bullets;
      _this.bulletColor = options.bulletColor;
      _this.bulletsHide = options.bulletsHide;
      _this.arrows = options.arrows;
      _this.arrowsHide = options.arrowsHide;
      _this.swipe = options.swipe;
      _this.auto = options.auto;
      _this.autoTime = options.autoTime;
      _this.autoPauseOnHover = options.autoPauseOnHover;
      _this.webp = options.webp;
      _this.staticTextTitle = options.staticTextTitle;
      _this.staticTextBody = options.staticTextBody;
      _this.staticTextPosition = options.staticTextPosition;
      _this.currentIndex = 0; // index of currently shown image 

      _this.sliderLock = false; // slider is locked and can't transition

      _this.imageElements = []; // image elements

      _this.hover = false; // true on mouse in, false on mouse out

      _this.autoPaused = false;
      _this.touch = 'ontouchstart' in document.documentElement; // true if browser supports touch
      // adjusting values

      _this.transitionTime = _this.transitionTime ? _this.transitionTime : 250;
      _this.bullets = typeof _this.bullets === 'boolean' ? _this.bullets : false;
      _this.bulletsHide = typeof _this.bulletsHide === 'boolean' && _this.bullets ? _this.bulletsHide : false;
      _this.arrows = typeof _this.arrows === 'boolean' ? _this.arrows : true;
      _this.arrowsHide = typeof _this.arrowsHide === 'boolean' && _this.arrows ? _this.arrowsHide : true;
      _this.swipe = typeof _this.swipe === 'boolean' ? _this.swipe : true;
      _this.auto = typeof _this.auto === 'boolean' ? _this.auto : false;
      _this.autoTime = typeof _this.autoTime === 'number' ? _this.autoTime : 10000;
      _this.autoPauseOnHover = typeof _this.autoPauseOnHover === 'boolean' ? _this.autoPauseOnHover : true;
      _this.webp = (typeof _this.webp === 'boolean' ? _this.webp : false) && isWebpSupported;
      _this.staticTextPosition = typeof _this.staticTextPosition === 'string' ? _this.staticTextPosition : "SW"; // check color

      if (_this.bulletColor) {
        var isColor = function isColor(strColor) {
          var s = new Option().style;
          s.color = strColor;
          return s.color !== '';
        };

        _this.bulletColor = isColor(_this.bulletColor) ? _this.bulletColor : 'red';
      } else {
        _this.bulletColor = 'red'; // default bulletColor
      }

      if (!Array.isArray(_this.images)) {
        _this.images = null;
      }

      if (typeof _this.containerId !== 'string') {
        if (_this.containerId.id) {
          _this.containerId = _this.containerId.id;
        }
      }

      if (!document.getElementById(_this.containerId)) {
        throw "Slider error: conatinerId must be a valid element or id";
      } // place images in container


      var imageElement;
      var imageAnchor;
      var imagesIndex = 0;
      _this.container = document.getElementById(_this.containerId);

      if (!_this.images) {
        _this.images = [];
        var containerChildren = _this.container.children;
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

            if (containerChild.hasAttribute('text-title')) {
              _this.images[imagesIndex].textTitle = containerChild.getAttribute('text-title');
            }

            if (containerChild.hasAttribute('text-body')) {
              _this.images[imagesIndex].textBody = containerChild.getAttribute('text-body');
            }

            if (containerChild.hasAttribute('text-position')) {
              _this.images[imagesIndex].textPosition = containerChild.getAttribute('text-position');
            }

            if (containerChild.hasAttribute('webp-url')) {
              _this.images[imagesIndex].webpUrl = containerChild.getAttribute('webp-url');
            }

            if (containerChild.hasAttribute('alt')) {
              _this.images[imagesIndex].alt = containerChild.getAttribute('alt');
            }

            if (containerChild.hasAttribute('title')) {
              _this.images[imagesIndex].title = containerChild.getAttribute('title');
            }

            imagesIndex++;
          } else {
            console.log('Slider error: invalid container child tag name: ' + containerChild.tagName);
          }
        });
      }

      _this.container.innerHTML = '';

      _this.images.forEach(function (image, index) {
        if (typeof image === 'string') {
          image = {
            imageUrl: image,
            linkUrl: null,
            linkNewTab: null
          };
        }

        imageElement = document.createElement('IMG');
        imageElement.id = _this.containerId + "-slide-" + index;

        if (_this.webp && image.webpUrl) {
          imageElement.src = image.webpUrl;
        } else {
          imageElement.src = image.imageUrl;
        }

        imageElement.classList.add('vanilla-slider-image');
        imageElement.style.margin = 'auto';
        imageElement.style.width = '100%';
        imageElement.style.maxWidth = '100%';
        imageElement.style.position = 'absolute';
        imageElement.style.top = 0;
        imageElement.style.left = 0;

        if (image.alt) {
          imageElement.alt = image.alt;
        }

        if (image.title) {
          imageElement.title = image.title;
        }

        if (index > 0) {
          imageElement.style.visibility = 'hidden';
          imageElement.style.zIndex = 0;
        } else {
          imageElement.style.zIndex = 2;
        }

        _this.container.appendChild(imageElement);

        _this.imageElements[index] = imageElement;
      });

      if (_this.images.length < 1) {
        throw 'Slider error: no images found for slides.';
      }

      var isIE = function isIE() {
        return navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.indexOf("Trident/") > -1;
      }; // style container


      _this.container.classList.add('vanilla-slider-container');

      _this.container.style.marginLeft = 'auto';
      _this.container.style.marginRight = 'auto';
      _this.container.style.maxWidth = '100%';
      _this.container.style.display = 'flex';
      _this.container.style.overflow = 'hidden';
      _this.container.style.position = 'relative';

      if (isIE()) {
        _this.container.style.alignItems = 'flex-end';
      }

      var addArrowStyles = function addArrowStyles(arrow) {
        arrow.style.zIndex = 6;
        arrow.style.color = '#fff';
        arrow.style.fontSize = '2.5em';
        arrow.style.fontWeight = 'bold';
        arrow.style.cursor = 'pointer';
        arrow.style.transition = 'all 0.3s linear';
        arrow.style.textShadow = '0px 0px 10px rgba(0,0,0,0.5)';
        return arrow;
      };

      if (_this.arrows) {
        // create left arrow
        _this.leftArrow = document.createElement('SPAN');
        _this.leftArrow.id = _this.containerId + '-arrow-left';

        _this.leftArrow.classList.add('vanilla-slider-arrow');

        _this.leftArrow.classList.add('vanilla-slider-arrow-left');

        _this.leftArrow = addArrowStyles(_this.leftArrow);
        _this.leftArrow.style.margin = 'auto auto auto 10px';
        _this.leftArrow.innerHTML = '&#10094;';

        _this.leftArrow.addEventListener('click', function (event) {
          _this.prevSlide();

          event.stopPropagation();
        });

        if (isIE()) {
          _this.leftArrow.style.marginTop = '45%';
          _this.leftArrow.style.transform = 'translateY(-55%)';
        } // this.leftArrow.addEventListener('mouseover', () => {
        //     this.leftArrow.style.transform = 'scale(1.2)';
        // });
        // this.leftArrow.addEventListener('mouseout', () => {
        //     this.leftArrow.style.transform = 'scale(1.0)';
        // });


        _this.container.appendChild(_this.leftArrow);
      }

      if (_this.bullets) {
        // create bullet container
        _this.bulletContainer = document.createElement('DIV');
        _this.bulletContainer.id = _this.containerId + '-bullet-container';

        _this.bulletContainer.classList.add('vanilla-slider-bullet-container');

        _this.bulletContainer.style.zIndex = 6;
        _this.bulletContainer.style.position = 'relative';
        _this.bulletContainer.style.margin = 'auto auto 0';
        _this.bulletContainer.style.textAlign = 'center';

        if (isIE()) {
          _this.bulletContainer.style.marginTop = '65%';
        }

        _this.container.appendChild(_this.bulletContainer); // create bullets


        _this.bullets = [];
        var bullet;

        _this.imageElements.forEach(function (element, index) {
          bullet = document.createElement('SPAN');
          bullet.id = _this.containerId + '-bullet-' + index;
          bullet.classList.add('vanilla-slider-bullet');
          bullet.style.color = '#fff';
          bullet.style.zIndex = 10;
          bullet.style.fontSize = '2em';
          bullet.style.margin = '0 5px';
          bullet.style.cursor = 'pointer';
          bullet.style.transition = 'all ' + _this.transitionTime / 1000 + 's linear';
          bullet.style.textShadow = '0px 0px 5px rgba(0,0,0,0.5)';
          bullet.innerHTML = '&bull;';
          bullet.addEventListener('click', function (event) {
            _this.goToSlide(index);

            event.stopPropagation();
          });

          if (index === 0) {
            bullet.style.color = _this.bulletColor;
          }

          _this.bullets[index] = bullet;

          _this.bulletContainer.appendChild(bullet);
        }); // hide bullets


        if (_this.bulletsHide) {
          _this.bulletContainer.style.visibility = 'hidden';
          _this.bulletContainer.style.opacity = 0;
          _this.bulletContainer.style.transition = 'visibility 0.3s linear,opacity 0.3s linear';

          _this.container.addEventListener('mouseenter', function () {
            _this.bulletContainer.style.visibility = 'visible';
            _this.bulletContainer.style.opacity = 1;
          });

          _this.container.addEventListener('mouseleave', function () {
            _this.bulletContainer.style.visibility = 'hidden';
            _this.bulletContainer.style.opacity = 0;
          });
        }
      }

      if (_this.arrows) {
        // create right arrow
        _this.rightArrow = document.createElement('SPAN');
        _this.rightArrow.id = _this.containerId + '-arrow-right';

        _this.rightArrow.classList.add('vanilla-slider-arrow');

        _this.rightArrow.classList.add('vanilla-slider-arrow-right');

        _this.rightArrow = addArrowStyles(_this.rightArrow);
        _this.rightArrow.style.margin = 'auto 10px auto auto';
        _this.rightArrow.innerHTML = '&#10095;';

        _this.rightArrow.addEventListener('click', function (event) {
          _this.nextSlide();

          event.stopPropagation();
        });

        if (isIE()) {
          _this.rightArrow.style.marginTop = '45%';
          _this.rightArrow.style.transform = 'translateY(-55%)';
        } // this.rightArrow.addEventListener('mouseover', () => {
        //     this.rightArrow.style.transform = 'scale(1.2)';
        // });
        // this.rightArrow.addEventListener('mouseout', () => {
        //     this.rightArrow.style.transform = 'scale(1.0)';
        // });


        _this.container.appendChild(_this.rightArrow); // hide arrows


        if (_this.arrowsHide) {
          _this.leftArrow.style.visibility = 'hidden';
          _this.leftArrow.style.opacity = 0;
          _this.rightArrow.style.visibility = 'hidden';
          _this.rightArrow.style.opacity = 0;

          _this.container.addEventListener('mouseenter', function () {
            _this.leftArrow.style.visibility = 'visible';
            _this.leftArrow.style.opacity = 1;
            _this.rightArrow.style.visibility = 'visible';
            _this.rightArrow.style.opacity = 1;
          });

          _this.container.addEventListener('mouseleave', function () {
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


      _this.resizeContainer = function () {
        _this.container.style.width = _this.container.parentNode.clientWidth + 'px';
        var imageXYRatio = _this.imageElements[0].naturalWidth / _this.imageElements[0].naturalHeight;
        _this.container.style.height = parseFloat(_this.container.style.width.replace('px', '')) / imageXYRatio + 'px';
      };

      window.addEventListener('resize', _this.resizeContainer);
      /**
       * fades the target out
       * @param {element||string} fadeOutTarget element to fade out, or its id
       * @param {function} callback function executed when fade is finished
       * @param {{waitTime: any, fadeTime: number, direction: string, zoom: string}} options options object for fade:
       * options.waitTime: wait before executing - true for 2 sec, false for 0 sec, num for other (ms);
       * options.fadeTime: time for the fadeIn/fadeOut effects, defaults to 250;
       * options.direction: direction for the fading out element to fly away if position:aboslute (left, right, up, down) - null to stay still;
       * options.zoom: direction for the fading element to zoom if position:absolute (in, out) - null to stay same size
       */

      _this.slideFadeOut = function (fadeOutTarget) {
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
        options.directionX = options.directionX ? options.directionX : null;
        options.directionY = options.directionY ? options.directionY : null;
        options.zoom = options.zoom ? options.zoom : null;

        var isVisible = function isVisible(element) {
          return element.style.visibility !== "hidden";
        };

        var makeInvisible = function makeInvisible(element) {
          element.style.visibility = "hidden";
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
                    fadeOutTarget.style.left = parseFloat(fadeOutTarget.style.left.replace('px', '')) + xDirectionInterval + 'px';
                  }

                  if (options.directionY) {
                    fadeOutTarget.style.top = parseFloat(fadeOutTarget.style.top.replace('px', '')) + yDirectionInterval + 'px';
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


      _this.getNextIndex = function () {
        return (_this.currentIndex + 1) % _this.imageElements.length;
      };
      /**
       * get the index of the previous slide
       */


      _this.getPrevIndex = function () {
        return _this.currentIndex < 1 ? _this.imageElements.length - 1 : _this.currentIndex - 1;
      };
      /**
       * go to the next slide, then execute the callback
       */


      _this.nextSlide = function () {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        _this.goToSlide(_this.getNextIndex(), callback);
      };
      /**
       * go to the previous slide, then execute the callback
       */


      _this.prevSlide = function () {
        var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        _this.goToSlide(_this.getPrevIndex(), callback);
      };
      /**
       * go to the slide at index (if possible), then execute the callback
       */


      _this.goToSlide = function (newIndex) {
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
          _this.pauseAuto();

          if (_this.bullets) {
            _this.bullets[_this.currentIndex].style.color = '#fff';
            _this.bullets[newIndex].style.color = _this.bulletColor;
          }

          var finishSlide = function finishSlide() {
            _this.currentIndex = newIndex;

            _this.setSlideLink(newIndex);

            _this.setSlideText(newIndex);

            _this.sliderLock = false;

            if (typeof callback === 'function') {
              callback();
            }

            if (!_this.autoPauseOnHover || !_this.hover || _this.touch) {
              _this.resumeAuto();
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


      _this.startAuto = function () {
        _this.auto = true;
        _this.autoInterval = setInterval(_this.nextSlide, _this.autoTime);
      };
      /**
       * pause automatic slide movement until slides move
       */


      _this.pauseAuto = function () {
        if (_this.auto && !_this.autoPaused) {
          clearInterval(_this.autoInterval);
          _this.autoPaused = true;
        }
      };
      /**
       * pause automatic slide movement until slides move
       */


      _this.resumeAuto = function () {
        if (_this.auto && _this.autoPaused) {
          _this.autoInterval = setInterval(_this.nextSlide, _this.autoTime);
          _this.autoPaused = false;
        }
      };
      /**
       * stop automatic slide movement
       */


      _this.stopAuto = function () {
        clearInterval(_this.autoInterval);
        _this.auto = false;
      };
      /**
       * clear the link div for the slide, and if the next slide has a link, create the link div
       */


      _this.setSlideLink = function (index) {
        if (_this.linkOverlay) {
          _this.container.removeChild(_this.linkOverlay);

          _this.linkOverlay = null;
        }

        if (_this.images[index].linkUrl) {
          _this.linkOverlay = document.createElement('DIV');
          _this.linkOverlay.id = _this.containerId + '-link-overlay';

          _this.linkOverlay.classList.add('vanilla-slider-link-overlay');

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
       * clear the link div for the slide, and if the next slide has a link, create the link div
       */


      _this.setSlideText = function (index) {
        var appendTextOverlay = function appendTextOverlay(title, body, position, index) {
          _this.textOverlay = document.createElement('DIV');
          _this.textOverlay.id = _this.containerId + '-text-overlay';

          _this.textOverlay.classList.add('vanilla-slider-text-overlay');

          _this.textOverlay.style.zIndex = 6;
          _this.textOverlay.style.position = 'absolute';
          _this.textOverlay.style.padding = "0 20px";
          _this.textOverlay.style.textAlign = 'left';
          _this.textOverlay.style.color = '#fff';
          _this.textOverlay.style.textShadow = '0 0 20px black';
          _this.textOverlay.style.backgroundColor = 'rgba(0,0,0,0.3)';
          _this.textOverlay.style.opacity = 0;
          _this.textOverlay.style.transition = 'all 0.5s linear';
          var textOverlayContent = '';

          if (title) {
            textOverlayContent += '<h1>' + title + '</h1>';
          }

          if (body) {
            textOverlayContent += '<h3>' + body + '</h3>';
          }

          position = typeof position === 'string' ? position : 'SW';

          switch (position) {
            case 'NW':
              _this.textOverlay.style.top = '20px';
              _this.textOverlay.style.left = '20px';
              break;

            case 'NE':
              _this.textOverlay.style.top = '20px';
              _this.textOverlay.style.right = '20px';
              break;

            case 'SE':
              _this.textOverlay.style.bottom = '20px';
              _this.textOverlay.style.right = '20px';
              break;

            default:
              // SW
              _this.textOverlay.style.bottom = '20px';
              _this.textOverlay.style.left = '20px';
              break;
          }

          _this.textOverlay.innerHTML = textOverlayContent;

          if (index) {
            if (_this.images[index].linkUrl) {
              _this.textOverlay.style.cursor = 'pointer';

              if (_this.images[index].linkNewTab) {
                _this.textOverlay.addEventListener('click', function () {
                  window.open(_this.images[index].linkUrl, '_blank');
                });
              } else {
                _this.textOverlay.addEventListener('click', function () {
                  window.location.href = _this.images[index].linkUrl;
                });
              }
            }
          }

          _this.container.appendChild(_this.textOverlay);
        };

        if (_this.staticTextBody || _this.staticTextTitle) {
          if (!_this.textOverlay) {
            appendTextOverlay(_this.staticTextTitle, _this.staticTextBody, _this.staticTextPosition, null);
          }
        } else {
          if (_this.textOverlay) {
            _this.container.removeChild(_this.textOverlay);

            _this.textOverlay = null;
          }

          if (_this.images[index].textTitle || _this.images[index].textBody) {
            appendTextOverlay(_this.images[index].textTitle, _this.images[index].textBody, _this.images[index].textPosition, index);
          }
        }
      };

      _this.revealSlideText = function () {
        if (_this.textOverlay) {
          var revealEffect = setInterval(function () {
            _this.textOverlay.style.opacity = parseFloat(_this.textOverlay.style.opacity) + parseFloat(0.1);

            if (_this.textOverlay.style.opacity >= 1) {
              clearInterval(revealEffect);
            }
          }, 5);
        }
      };
      /**
       * transition from one slide to another
       */


      _this.transitionSlide = function (newIndex, callback) {
        _this.imageElements[newIndex].style.zIndex = 1;
        _this.imageElements[newIndex].style.opacity = 1;
        _this.imageElements[newIndex].style.visibility = 'visible';

        _this.setSlideText(newIndex);

        _this.slideFadeOut(_this.imageElements[_this.currentIndex], function () {
          _this.imageElements[_this.currentIndex].style.zIndex = 0;
          _this.imageElements[newIndex].style.zIndex = 2;
          callback();

          _this.revealSlideText(newIndex);
        }, {
          fadeTime: _this.transitionTime,
          directionX: _this.transitionDirectionX,
          directionY: _this.transitionDirectionY,
          zoom: _this.transitionZoom
        });
      }; // set link of 1st slide


      _this.setSlideLink(_this.currentIndex); // set text of 1st slide


      _this.setSlideText(_this.currentIndex);

      _this.revealSlideText(_this.currentIndex); // set swipe listener


      if (_this.swipe) {
        _this.swiper = {};
        _this.swiper.xDown = null;
        _this.swiper.yDown = null;

        _this.container.addEventListener('touchstart', function (evt) {
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

        _this.container.addEventListener('touchmove', function (evt) {
          handleTouchMove(evt);
        }, false);
      } // start automatic slide movement


      if (_this.auto) {
        _this.startAuto(); // place mouse listeners for auto pause/resume


        if (_this.autoPauseOnHover) {
          _this.container.addEventListener('mouseenter', function () {
            _this.pauseAuto();
          });

          _this.container.addEventListener('mouseleave', function () {
            _this.resumeAuto();
          });
        }
      }

      if (!_this.touch) {
        // set listeners for hover property
        _this.container.addEventListener('mouseenter', function () {
          _this.hover = true;
        });

        _this.container.addEventListener('mouseleave', function () {
          _this.hover = false;
        });
      } // resize once first image is loaded


      if (_this.imageElements[0]) {
        _this.imageElements[0].addEventListener('load', _this.resizeContainer);
      }
    });
  }

  _createClass(VanillaSlider, [{
    key: "webpSupported",
    value: function webpSupported(callback) {
      var img = new Image();

      img.onload = function () {
        var result = img.width > 0 && img.height > 0;
        callback(result);
      };

      img.onerror = function () {
        callback(false);
      };

      img.src = "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA";
    }
  }]);

  return VanillaSlider;
}();
/**
 * Returns a VanillaSlider created from containerId and options
 * @param {string|Node} containerId element or id of element to be the slider container
 * @param {object} options slider options object for slider configuration
 */


function createSlider(containerId, options) {
  return new VanillaSlider(containerId, options);
}
/**
 * includes polyfill
 */


if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, "includes", {
    enumerable: false,
    value: function value(obj) {
      var newArr = this.filter(function (el) {
        return el == obj;
      });
      return newArr.length > 0;
    }
  });
}