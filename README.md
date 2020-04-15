# VanillaSlider

VanillaSlider is a simple, lightweight, responsive slider using vanilla JavaScript, requiring no third-party libraries.

## Usage

To use VanillaSlider, first, embed the script in HTML:
```html
<script type='text/javascript' src='vanilla-slider.js'></script>
```
Then, define the slider container's id and the `options` object, and call `createSlider`:
```html
<script>
    var containerId = 'slider-1';

    var options = {
        transitionTime: 500,
        transitionZoom: 'in',
        bullets: true,
        arrows:true,
        arrowsHide: true,
        images: [
            'img/1.jpg',
            'img/2.jpg',
            'img/3.jpg',
            'img/4.jpg'
        ]
    }

    var slider = createSlider(containerId, options);
</script>
<div id='slider-1'></div>
```

## Live Examples
- <a href="https://rchisholm.github.io/vanilla-slider/sample/custom-options.html" target="_blank">Slider using all custom options</a>
- <a href="https://rchisholm.github.io/vanilla-slider/sample/no-options.html" target="_blank">Slider using only default options</a>
- <a href="https://rchisholm.github.io/vanilla-slider/sample/full-width.html" target="_blank">Slider using the full browser width</a>
- <a href="https://rchisholm.github.io/vanilla-slider/sample/max-width.html" target="_blank">Slider inside a div with a max width</a>

## Parameters

### containerId
`containerId` is a required parameter. It can either be the element to be used as the container for the slider, or the element's id:
```javascript
var containerId = document.getElementById('slider-1');
```
```javascript
var containerId = 'slider-1';
```

### options
`options` is an optional parameter. If omitted, default values are used.
| Option | Type | Description | Default |
| --- | --- | --- | --- |
| images | Array<string\|object> | array of images, either strings (URLs) or objects with imageUrl, linkUrl, linkNewTab, textTitle, textBody, textPosition | null |
| transitionTime | number | time in ms until transition is finished; | 250 |
| transitionDirectionX | string | x direction for fading out element to move - 'left', 'right', or 'random' | null |
| transitionDirectionY | string | y direction for fading out element to move - 'up', 'down', or 'random' | null |
| transitionZoom | string | direction for zooming the fading out element - 'in', 'out', or 'random' | null |
| bullets | boolean | whether to show bullets | false |
| bulletsHide | boolean | whether to hide bullets on mouse out | false |
| bulletColor | string | color of active bullet | 'red' |
| arrows | boolean | whether to show arrows | true |
| arrowsHide | boolean | whether to hide arrow on mouse out | true |
| swipe | boolean | whether to allow swipe support | true |
| auto | boolean | whether to automatically move slides | false |
| autoTime | number | time in ms for slides to automatically move | 10000 | 
| autoPauseOnHover | boolean | whether to pause auto when hovering | true |  

### options.images
`options.images` is a property of the `options` parameter. It is an array of strings or objects, and can be used to determine the images used for the slider. Each element in the images array can either be a string (used for imageUrl) or an object with the following properties:
| Property | Type | Description | Default |
| --- | --- | --- | --- |
| imageUrl | string | URL of the image to be used in the slide | _(required)_ |
| linkUrl | string | URL of the link to be placed on the slide | _no default - if omitted, no link is used_ |
| linkNewTab | boolean | determines whether this slide's link will open in a new tab | false |
| textTitle | string | title for the text overlay placed on the slide | _no default - if omitted, title is not shown_ |
| textBody | string | title for the text overlay placed on the slide | _no default - if omitted, body is not shown_ |
| textPosition | string | position for text overlay; 'SW', 'NW', 'NE', or 'SE' | 'SW' |

#### Sample of all options
```javascript
var options = {
    transitionTime: 1000,
    transitionDirectionX: 'left',
    transitionDirectionY: 'up',
    transitionZoom: 'in',
    bullets: true,
    bulletColor: 'blue',
    bulletsHide: true,
    arrows: true,
    arrowsHide: true,
    swipe: true,
    auto: true,
    autoTime: 5000,
    autoPauseOnHover: true,
    images: [
        'img/1.png',
        {
            imageUrl: 'img/2.png',
            linkUrl: 'https://www.github.com/'
        },
        'img/3.png',
        {
            imageUrl: 'img/4.jpg',
            linkUrl: 'https://www.github.com',
            linkNewTab: true
        },
        'img/5.jpg',
        {
            imageUrl: 'img/6.jpg',
            textTitle: 'Hello World!',
            textBody: 'This is some body text for the slide.',
            textPosition: 'NW'
        }
    ]
};
```

## Images
Images can be declared either by the `options.images` array or by images placed inside the container div:
```javascript
images: [
    'img/1.jpg',
    'img/2.jpg',
    'img/3.jpg'
]
```
```html
<div id='slider-1'>
    <img src='img/1.jpg'>
    <img src='img/2.jpg'>
    <img src='img/3.jpg'>
</div>
```

## Image Links
Images can have links associated with them. These links have the option of opening in a new tab. These can be declared either by properties in the `options.images` array or by anchor tags placed inside the container div:
```javascript
images: [
    'img/1.jpg',
    {
        imageUrl: 'img/2.jpg',
        linkUrl: 'https://www.github.com/'
    },
    {
        imageUrl: 'img/2.jpg',
        linkUrl: 'https://www.github.com/'
        linkNewTab: true
    }
]
```
```html
<div id='slider-1'>
    <img src='img/1.jpg'>
    <a href='https://www.github.com'>
        <img src='img/2.jpg'>
    </a>
    <a href='https://www.github.com' target='_blank'>
        <img src='img/3.jpg'>
    </a>
</div>
```

## Image Text
Images can have a text overlay that appears when the slide is active.. This text can be positioned in any of the four corners of the slide (default is bottom-left). This can be declared either by properties in the `options.images` array:
```javascript
images: [
    'img/1.jpg',
    {
        imageUrl: 'img/2.jpg',
        textTitle: 'Title1',
        textPosition: 'NE'
    },
    {
        imageUrl: 'img/2.jpg',
        textTitle: 'Title2',
        textBody: 'This is the text for slide 2.'
    }
]
```

## Methods

#### getNextIndex
Get the index of the next slide.
```javascript
console.log(slider.getNextIndex());
// output:
// 1
```

#### getPrevIndex
Get the index of the previous slide.
```javascript
console.log(slider.getPrevSlide());
// output:
// 3
```

#### nextSlide
Go to the next slide, then call an optional callback.
```javascript
slider.nextSlide(() => { console.log('moved to next slide'); });
// output:
// moved to next slide
```

#### prevSlide
Go to the previous slide, then call an optional callback.
```javascript
slider.prevSlide(() => { console.log('moved to previous slide'); });
// output: 
// moved to previous slide
```

#### goToSlide
Go to the slide at the indicated index, then call an optional callback.
```javascript
slider.goToSlide(2, () => { console.log('moved to slide at index 2'); });
// output:
// moved to slide at index 2
```

#### startAuto
Begin automatic slide movement.
```javascript
slider.startAuto();
// starts auto slide movement
```

#### pauseAuto
Pause automatic slide movement until slides move manually.
```javascript
slider.pauseAuto();
// pauses auto slide movement until slides move 
```

#### stopAuto
Stop automatic slide movement.
```javascript
slider.stopAuto();
// stops auto slide movement
```

## Properties
Properties can be accessed after the VanillaSlider has been instantiated:

```javascript
console.log(slider.containerId);
// slider-1

console.log(slider);
// VanillaSlider {...}
```


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.


## License
[ISC](https://choosealicense.com/licenses/isc/)
