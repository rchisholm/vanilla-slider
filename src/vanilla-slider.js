/* jshint esversion:6 */

/**
 * slider class
 */
class VanillaSlider {

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
    constructor(containerId, options = {}) {

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
        this.autoPauseOnHover = options.autoPauseOnHover;
        this.webp = options.webp;

        this.currentIndex = 0; // index of currently shown image 
        this.sliderLock = false; // slider is locked and can't transition
        this.imageElements = []; // image elements
        this.hover = false; // true on mouse in, false on mouse out
        this.autoPaused = false;
        this.touch = 'ontouchstart' in document.documentElement; // true if browser supports touch

        // adjusting values
        this.transitionTime = this.transitionTime ? this.transitionTime : 250;
        this.bullets = typeof this.bullets === 'boolean' ? this.bullets : false;
        this.bulletsHide = typeof this.bulletsHide === 'boolean' && this.bullets ? this.bulletsHide : false;
        this.arrows = typeof this.arrows === 'boolean' ? this.arrows : true;
        this.arrowsHide = typeof this.arrowsHide === 'boolean' && this.arrows ? this.arrowsHide : true;
        this.swipe = typeof this.swipe === 'boolean' ? this.swipe : true;
        this.auto = typeof this.auto === 'boolean' ? this.auto : false;
        this.autoTime = typeof this.autoTime === 'number' ? this.autoTime : 10000;
        this.autoPauseOnHover = typeof this.autoPauseOnHover === 'boolean' ? this.autoPauseOnHover : true;
        this.webp = typeof this.webp === 'boolean' ? this.webp : false;
        if (this.webp) {
            var ff = window.navigator.userAgent.match(/Firefox\/([0-9]+)\./);
            var ffVer = ff ? parseInt(ff[1]) : 0;
            var ffSupport = ffVer > 64;

            var ua = window.navigator.userAgent;
            var edge = ua.indexOf('Edge/');
            var ieSupport = parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10) > 17;

            var webpTest;
            var elem = document.createElement('canvas');
            if (!!(elem.getContext && elem.getContext('2d'))) {
                // was able or not to get WebP representation
                webpTest = elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
            }
            this.webp = (webpTest || ffSupport || ieSupport);
        }

        // check color
        if (this.bulletColor) {
            const isColor = (strColor) => {
                const s = new Option().style;
                s.color = strColor;
                return s.color !== '';
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
            throw ("Slider error: conatinerId must be a valid element or id");
        }

        // place images in container
        var imageElement;
        var imageAnchor;
        var imagesIndex = 0;
        this.container = document.getElementById(this.containerId);
        if (!this.images) {
            this.images = [];
            var containerChildren = this.container.children;

            [].forEach.call(containerChildren, (containerChild) => {
                imageAnchor = null;
                if (containerChild.tagName === 'A') {
                    imageAnchor = containerChild;
                    containerChild = containerChild.firstElementChild;
                }
                if (containerChild.tagName === 'IMG') {
                    this.images[imagesIndex] = {};
                    this.images[imagesIndex].imageUrl = containerChild.src;
                    if (imageAnchor) {
                        this.images[imagesIndex].linkUrl = imageAnchor.href;
                        this.images[imagesIndex].linkNewTab = imageAnchor.target === '_blank';
                    }
                    if (containerChild.hasAttribute('text-title')) {
                        this.images[imagesIndex].textTitle = containerChild.getAttribute('text-title');
                    }
                    if (containerChild.hasAttribute('text-body')) {
                        this.images[imagesIndex].textBody = containerChild.getAttribute('text-body');
                    }
                    if (containerChild.hasAttribute('text-position')) {
                        this.images[imagesIndex].textPosition = containerChild.getAttribute('text-position');
                    }
                    if (containerChild.hasAttribute('webp-url')) {
                        this.images[imagesIndex].webpUrl = containerChild.getAttribute('webp-url');
                    }
                    if (containerChild.hasAttribute('alt')) {
                        this.images[imagesIndex].alt = containerChild.getAttribute('alt');
                    }
                    if (containerChild.hasAttribute('title')) {
                        this.images[imagesIndex].title = containerChild.getAttribute('title');
                    }
                    imagesIndex++;
                } else {
                    console.log('Slider error: invalid container child tag name: ' + containerChild.tagName);
                }
            });
        }

        this.container.innerHTML = '';

        this.images.forEach((image, index) => {
            if (typeof image === 'string') {
                image = {
                    imageUrl: image,
                    linkUrl: null,
                    linkNewTab: null
                };
            }
            imageElement = document.createElement('IMG');
            imageElement.id = this.containerId + "-slide-" + index;
            if (this.webp && image.webpUrl) {
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
            if(image.alt) {
                imageElement.alt = image.alt;
            }
            if(image.title) {
                imageElement.title = image.title;
            }

            if (index > 0) {
                imageElement.style.visibility = 'hidden';
                imageElement.style.zIndex = 0;
            } else {
                imageElement.style.zIndex = 2;
            }
            this.container.appendChild(imageElement);
            this.imageElements[index] = imageElement;
        });
        if (this.images.length < 1) {
            throw ('Slider error: no images found for slides.');
        }

        const isIE = () => {
            return navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.indexOf("Trident/") > -1;
        };

        // style container
        this.container.classList.add('vanilla-slider-container');
        this.container.style.marginLeft = 'auto';
        this.container.style.marginRight = 'auto';
        this.container.style.maxWidth = '100%';
        this.container.style.display = 'flex';
        this.container.style.overflow = 'hidden';
        this.container.style.position = 'relative';
        if(isIE()) {
            this.container.style.alignItems = 'flex-end';
        }

        const addArrowStyles = (arrow) => {
            arrow.style.zIndex = 6;
            arrow.style.color = '#fff';
            arrow.style.fontSize = '2.5em';
            arrow.style.fontWeight = 'bold';
            arrow.style.cursor = 'pointer';
            arrow.style.transition = 'all 0.3s linear';
            arrow.style.textShadow = '0px 0px 10px rgba(0,0,0,0.5)';
            return arrow;
        };

        if (this.arrows) {
            // create left arrow
            this.leftArrow = document.createElement('SPAN');
            this.leftArrow.id = this.containerId + '-arrow-left';
            this.leftArrow.classList.add('vanilla-slider-arrow');
            this.leftArrow.classList.add('vanilla-slider-arrow-left');
            this.leftArrow = addArrowStyles(this.leftArrow);
            this.leftArrow.style.margin = 'auto auto auto 10px';
            this.leftArrow.innerHTML = '&#10094;';
            this.leftArrow.addEventListener('click', (event) => {
                this.prevSlide();
                event.stopPropagation();
            });
            if (isIE()) {
                this.leftArrow.style.marginTop = '45%';
                this.leftArrow.style.transform = 'translateY(-55%)';
            }
            // this.leftArrow.addEventListener('mouseover', () => {
            //     this.leftArrow.style.transform = 'scale(1.2)';
            // });
            // this.leftArrow.addEventListener('mouseout', () => {
            //     this.leftArrow.style.transform = 'scale(1.0)';
            // });
            this.container.appendChild(this.leftArrow);
        }

        if (this.bullets) {
            // create bullet container
            this.bulletContainer = document.createElement('DIV');
            this.bulletContainer.id = this.containerId + '-bullet-container';
            this.bulletContainer.classList.add('vanilla-slider-bullet-container');
            this.bulletContainer.style.zIndex = 6;
            this.bulletContainer.style.position = 'relative';
            this.bulletContainer.style.margin = 'auto auto 0';
            this.bulletContainer.style.textAlign = 'center';
            if (isIE()) {
                this.bulletContainer.style.marginTop = '65%';
            }
            this.container.appendChild(this.bulletContainer);
            // create bullets
            this.bullets = [];
            var bullet;
            this.imageElements.forEach((element, index) => {
                bullet = document.createElement('SPAN');
                bullet.id = this.containerId + '-bullet-' + index;
                bullet.classList.add('vanilla-slider-bullet');
                bullet.style.color = '#fff';
                bullet.style.zIndex = 10;
                bullet.style.fontSize = '2em';
                bullet.style.margin = '0 5px';
                bullet.style.cursor = 'pointer';
                bullet.style.transition = 'all ' + (this.transitionTime / 1000) + 's linear';
                bullet.style.textShadow = '0px 0px 5px rgba(0,0,0,0.5)';
                bullet.innerHTML = '&bull;';
                bullet.addEventListener('click', (event) => {
                    this.goToSlide(index);
                    event.stopPropagation();
                });
                if (index === 0) {
                    bullet.style.color = this.bulletColor;
                }
                this.bullets[index] = bullet;
                this.bulletContainer.appendChild(bullet);
            });
            // hide bullets
            if (this.bulletsHide) {
                this.bulletContainer.style.visibility = 'hidden';
                this.bulletContainer.style.opacity = 0;
                this.bulletContainer.style.transition = 'visibility 0.3s linear,opacity 0.3s linear';
                this.container.addEventListener('mouseenter', () => {
                    this.bulletContainer.style.visibility = 'visible';
                    this.bulletContainer.style.opacity = 1;
                });
                this.container.addEventListener('mouseleave', () => {
                    this.bulletContainer.style.visibility = 'hidden';
                    this.bulletContainer.style.opacity = 0;
                });
            }
        }

        if (this.arrows) {
            // create right arrow
            this.rightArrow = document.createElement('SPAN');
            this.rightArrow.id = this.containerId + '-arrow-right';
            this.rightArrow.classList.add('vanilla-slider-arrow');
            this.rightArrow.classList.add('vanilla-slider-arrow-right');
            this.rightArrow = addArrowStyles(this.rightArrow);
            this.rightArrow.style.margin = 'auto 10px auto auto';
            this.rightArrow.innerHTML = '&#10095;';
            this.rightArrow.addEventListener('click', (event) => {
                this.nextSlide();
                event.stopPropagation();
            });
            if (isIE()) {
                this.rightArrow.style.marginTop = '45%';
                this.rightArrow.style.transform = 'translateY(-55%)';
            }
            // this.rightArrow.addEventListener('mouseover', () => {
            //     this.rightArrow.style.transform = 'scale(1.2)';
            // });
            // this.rightArrow.addEventListener('mouseout', () => {
            //     this.rightArrow.style.transform = 'scale(1.0)';
            // });
            this.container.appendChild(this.rightArrow);

            // hide arrows
            if (this.arrowsHide) {
                this.leftArrow.style.visibility = 'hidden';
                this.leftArrow.style.opacity = 0;
                this.rightArrow.style.visibility = 'hidden';
                this.rightArrow.style.opacity = 0;
                this.container.addEventListener('mouseenter', () => {
                    this.leftArrow.style.visibility = 'visible';
                    this.leftArrow.style.opacity = 1;
                    this.rightArrow.style.visibility = 'visible';
                    this.rightArrow.style.opacity = 1;
                });
                this.container.addEventListener('mouseleave', () => {
                    this.leftArrow.style.visibility = 'hidden';
                    this.leftArrow.style.opacity = 0;
                    this.rightArrow.style.visibility = 'hidden';
                    this.rightArrow.style.opacity = 0;
                });
            }
        }

        /**
         * resize container, called on resizing browser window
         */
        this.resizeContainer = () => {
            this.container.style.width = this.container.parentNode.clientWidth + 'px';
            var imageXYRatio = this.imageElements[0].naturalWidth / this.imageElements[0].naturalHeight;
            this.container.style.height = parseFloat(this.container.style.width.replace('px', '')) / imageXYRatio + 'px';
        };

        window.addEventListener('resize', this.resizeContainer);

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
        this.slideFadeOut = (fadeOutTarget, callback = () => {}, options = []) => {

            // check cb
            if (typeof callback !== 'function') {
                callback = () => {};
            }

            // check target
            if (typeof fadeOutTarget === 'string') {
                fadeOutTarget = document.getElementById(fadeOutTarget);
            }

            // static values
            const defaultWaitTime = 2000;
            const defaultFadeTime = 500;
            const intervalTime = 20;
            const xDirections = ['left', 'right', 'random'];
            const yDirections = ['up', 'down', 'random'];
            const zooms = ['in', 'out', 'random'];

            // default options
            options.waitTime = options.waitTime ? options.waitTime : false;
            options.fadeTime = options.fadeTime ? options.fadeTime : defaultFadeTime;
            options.directionX = options.directionX ? options.directionX : null;
            options.directionY = options.directionY ? options.directionY : null;
            options.zoom = options.zoom ? options.zoom : null;


            var isVisible = (element) => {
                return element.style.visibility !== "hidden";
            };
            var makeInvisible = (element) => {
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
                        setTimeout(() => {
                            options.waitTime = false;
                            this.slideFadeOut(fadeOutTarget, callback, options);
                        }, options.waitTime);
                    } else {
                        options.fadeTime = typeof options.fadeTime === 'number' ? options.fadeTime : defaultFadeTime;
                        var opacityInterval = intervalTime / options.fadeTime;
                        fadeOutTarget.style.opacity = 1;
                        var fadeOutEffect = setInterval(() => {
                            if (fadeOutTarget.style.opacity > 0) {
                                // fade out a little bit
                                fadeOutTarget.style.opacity -= opacityInterval;
                                // move a little bit in directions
                                if (options.directionX) {
                                    fadeOutTarget.style.left = (parseFloat(fadeOutTarget.style.left.replace('px', '')) + xDirectionInterval) + 'px';
                                }
                                if (options.directionY) {
                                    fadeOutTarget.style.top = (parseFloat(fadeOutTarget.style.top.replace('px', '')) + yDirectionInterval) + 'px';
                                }
                                // zoom a little bit
                                if (options.zoom) {
                                    if (!fadeOutTarget.style.transform) {
                                        fadeOutTarget.style.transform = 'scale(1)';
                                    }
                                    fadeOutTarget.style.transform = 'scale(' + (parseFloat(fadeOutTarget.style.transform.replace('scale(', '').replace(')', '')) + zoomInterval) + ')';
                                }
                            } else {
                                clearInterval(fadeOutEffect);
                                makeInvisible(fadeOutTarget);
                                // console.log('top: ' + fadeOutTarget.style.top);
                                // console.log('left: ' + fadeOutTarget.style.left);
                                fadeOutTarget.style.top = 0;
                                fadeOutTarget.style.left = 0;
                                fadeOutTarget.style.transform = 'scale(1)';
                                callback();
                            }
                        }, intervalTime);
                    }
                } else {
                    callback();
                    // setTimeout(callback, options.fadeTime);
                }
            } else {
                console.log('fadeOut error: no such element exists.');
            }
        };

        /**
         * get the index of the next slide
         */
        this.getNextIndex = () => {
            return (this.currentIndex + 1) % this.imageElements.length;
        };

        /**
         * get the index of the previous slide
         */
        this.getPrevIndex = () => {
            return this.currentIndex < 1 ? this.imageElements.length - 1 : this.currentIndex - 1;
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

        /**
         * go to the slide at index (if possible), then execute the callback
         */
        this.goToSlide = (newIndex, callback = null) => {
            if (typeof newIndex !== 'number' || newIndex < 0 || newIndex + 1 > this.imageElements.length) {
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
                this.pauseAuto();
                if (this.bullets) {
                    this.bullets[this.currentIndex].style.color = '#fff';
                    this.bullets[newIndex].style.color = this.bulletColor;
                }
                var finishSlide = () => {
                    this.currentIndex = newIndex;
                    this.setSlideLink(newIndex);
                    this.setSlideText(newIndex);
                    this.sliderLock = false;
                    if (typeof callback === 'function') {
                        callback();
                    }
                    if (!this.autoPauseOnHover || !this.hover || this.touch) {
                        this.resumeAuto();
                    }
                };
                this.sliderLock = true;
                this.transitionSlide(newIndex, finishSlide);
            } else {
                console.log('Slider error: slider is locked.');
            }
        };

        /**
         * start automatic slide movement
         */
        this.startAuto = () => {
            this.auto = true;
            this.autoInterval = setInterval(this.nextSlide, this.autoTime);
        };

        /**
         * pause automatic slide movement until slides move
         */
        this.pauseAuto = () => {
            if (this.auto && !this.autoPaused) {
                clearInterval(this.autoInterval);
                this.autoPaused = true;
            }
        };

        /**
         * pause automatic slide movement until slides move
         */
        this.resumeAuto = () => {
            if (this.auto && this.autoPaused) {
                this.autoInterval = setInterval(this.nextSlide, this.autoTime);
                this.autoPaused = false;
            }
        };

        /**
         * stop automatic slide movement
         */
        this.stopAuto = () => {
            clearInterval(this.autoInterval);
            this.auto = false;
        };

        /**
         * clear the link div for the slide, and if the next slide has a link, create the link div
         */
        this.setSlideLink = (index) => {
            if (this.linkOverlay) {
                this.container.removeChild(this.linkOverlay);
                this.linkOverlay = null;
            }
            if (this.images[index].linkUrl) {
                this.linkOverlay = document.createElement('DIV');
                this.linkOverlay.id = this.containerId + '-link-overlay';
                this.linkOverlay.classList.add('vanilla-slider-link-overlay');
                this.linkOverlay.style.zIndex = 5;
                this.linkOverlay.style.position = 'absolute';
                this.linkOverlay.style.top = 0;
                this.linkOverlay.style.left = 0;
                this.linkOverlay.style.width = '100%';
                this.linkOverlay.style.height = '100%';
                this.linkOverlay.style.cursor = 'pointer';
                if (this.images[index].linkNewTab) {
                    this.linkOverlay.addEventListener('click', () => {
                        window.open(this.images[index].linkUrl, '_blank');
                    });
                } else {
                    this.linkOverlay.addEventListener('click', () => {
                        window.location.href = this.images[index].linkUrl;
                    });
                }
                this.container.appendChild(this.linkOverlay);
            }
        };

        /**
         * clear the link div for the slide, and if the next slide has a link, create the link div
         */
        this.setSlideText = (index) => {
            if (this.textOverlay) {
                this.container.removeChild(this.textOverlay);
                this.textOverlay = null;
            }
            if (this.images[index].textTitle || this.images[index].textBody) {
                this.textOverlay = document.createElement('DIV');
                this.textOverlay.id = this.containerId + '-text-overlay';
                this.textOverlay.classList.add('vanilla-slider-text-overlay');
                this.textOverlay.style.zIndex = 6;
                this.textOverlay.style.position = 'absolute';
                this.textOverlay.style.padding = "0 20px";
                this.textOverlay.style.textAlign = 'left';
                this.textOverlay.style.color = '#fff';
                this.textOverlay.style.textShadow = '0 0 20px black';
                this.textOverlay.style.backgroundColor = 'rgba(0,0,0,0.3)';
                this.textOverlay.style.opacity = 0;
                this.textOverlay.style.transition = 'all 0.5s linear';
                var textOverlayContent = '';
                if (this.images[index].textTitle) {
                    textOverlayContent += '<h1>' + this.images[index].textTitle + '</h1>';
                }
                if (this.images[index].textBody) {
                    textOverlayContent += '<h3>' + this.images[index].textBody + '</h3>';
                }
                this.images[index].textPosition = typeof this.images[index].textPosition === 'string' ? this.images[index].textPosition : 'SW';
                switch (this.images[index].textPosition) {
                    case 'NW':
                        this.textOverlay.style.top = '20px';
                        this.textOverlay.style.left = '20px';
                        break;
                    case 'NE':
                        this.textOverlay.style.top = '20px';
                        this.textOverlay.style.right = '20px';
                        break;
                    case 'SE':
                        this.textOverlay.style.bottom = '20px';
                        this.textOverlay.style.right = '20px';
                        break;
                    default: // SW
                        this.textOverlay.style.bottom = '20px';
                        this.textOverlay.style.left = '20px';
                        break;
                }

                this.textOverlay.innerHTML = textOverlayContent;
                if (this.images[index].linkUrl) {
                    this.textOverlay.style.cursor = 'pointer';
                    if (this.images[index].linkNewTab) {
                        this.textOverlay.addEventListener('click', () => {
                            window.open(this.images[index].linkUrl, '_blank');
                        });
                    } else {
                        this.textOverlay.addEventListener('click', () => {
                            window.location.href = this.images[index].linkUrl;
                        });
                    }
                }
                this.container.appendChild(this.textOverlay);
            }
        };

        this.revealSlideText = (index) => {
            if ((this.images[index].textTitle || this.images[index].textBody) && this.textOverlay) {
                var revealEffect = setInterval(() => {
                    this.textOverlay.style.opacity = parseFloat(this.textOverlay.style.opacity) + parseFloat(0.1);
                    if (this.textOverlay.style.opacity >= 1) {
                        clearInterval(revealEffect);
                    }
                }, 5);
            }
        };

        /**
         * transition from one slide to another
         */
        this.transitionSlide = (newIndex, callback) => {
            this.imageElements[newIndex].style.zIndex = 1;
            this.imageElements[newIndex].style.opacity = 1;
            this.imageElements[newIndex].style.visibility = 'visible';
            this.setSlideText(newIndex);
            this.slideFadeOut(this.imageElements[this.currentIndex], () => {
                this.imageElements[this.currentIndex].style.zIndex = 0;
                this.imageElements[newIndex].style.zIndex = 2;
                callback();
                this.revealSlideText(newIndex);
            }, {
                fadeTime: this.transitionTime,
                directionX: this.transitionDirectionX,
                directionY: this.transitionDirectionY,
                zoom: this.transitionZoom
            });
        };

        // set link of 1st slide
        this.setSlideLink(this.currentIndex);

        // set text of 1st slide
        this.setSlideText(this.currentIndex);
        this.revealSlideText(this.currentIndex);


        // set swipe listener
        if (this.swipe) {

            this.swiper = {};

            this.swiper.xDown = null;
            this.swiper.yDown = null;

            this.container.addEventListener('touchstart', (evt) => {
                this.swiper.xDown = evt.touches[0].clientX;
                this.swiper.yDown = evt.touches[0].clientY;
            }, false);

            var handleTouchMove = (evt) => {
                if (!this.swiper.xDown || !this.swiper.yDown) {
                    return;
                }

                var xUp = evt.touches[0].clientX;
                var yUp = evt.touches[0].clientY;

                this.swiper.xDiff = this.swiper.xDown - xUp;
                this.swiper.yDiff = this.swiper.yDown - yUp;

                if (Math.abs(this.swiper.xDiff) > Math.abs(this.swiper.yDiff)) { // Most significant.
                    var transition = {};
                    if (this.swiper.xDiff > 0) {
                        transition = {
                            x: this.transitionDirectionX,
                            y: this.transitionDirectionY,
                            z: this.transitionZoom
                        };
                        this.transitionDirectionX = 'left';
                        this.transitionDirectionY = false;
                        this.transitionZoom = false;
                        this.nextSlide(() => {
                            this.transitionDirectionX = transition.x;
                            this.transitionDirectionY = transition.y;
                            this.transitionZoom = transition.z;
                        });
                    } else {
                        transition = {
                            x: this.transitionDirectionX,
                            y: this.transitionDirectionY,
                            z: this.transitionZoom
                        };
                        this.transitionDirectionX = 'right';
                        this.transitionDirectionY = false;
                        this.transitionZoom = false;
                        this.prevSlide(() => {
                            this.transitionDirectionX = transition.x;
                            this.transitionDirectionY = transition.y;
                            this.transitionZoom = transition.z;
                        });
                    }
                }

                // Reset values.
                this.swiper.xDown = null;
                this.swiper.yDown = null;
            };

            this.container.addEventListener('touchmove', (evt) => {
                handleTouchMove(evt);
            }, false);
        }

        // start automatic slide movement
        if (this.auto) {
            this.startAuto();

            // place mouse listeners for auto pause/resume
            if (this.autoPauseOnHover) {
                this.container.addEventListener('mouseenter', () => {
                    this.pauseAuto();
                });
                this.container.addEventListener('mouseleave', () => {
                    this.resumeAuto();
                });
            }
        }

        if(!this.touch) {
            // set listeners for hover property
            this.container.addEventListener('mouseenter', () => {
                this.hover = true;
            });
            this.container.addEventListener('mouseleave', () => {
                this.hover = false;
            });
        }

        // resize once first image is loaded
        if(this.imageElements[0]) {
            this.imageElements[0].addEventListener(
                'load', 
                this.resizeContainer
            );
        }

    }
}

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
        value: function (obj) {
            var newArr = this.filter(function (el) {
                return el == obj;
            });
            return newArr.length > 0;
        }
    });
}
