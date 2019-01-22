# Carousel-virtualized (in active development)
Highly performant react carousel built with virtualization (thanks to [react-window](https://github.com/bvaughn/react-window "react-window github page"))

# Motivation
After trying most of carousels out there, we couldn't find one that would allow us to load large number of slide (e.g. >10k) and had all the features that one carousel needs.

# Features
...

# Todo
- [ ] add documentation
- [ ] make demos on codesandbox
- [ ] tests
- [ ] Improve a11y
- [ ] autoplay - should we support this
- [ ] dots  - should we support this
- [ ] Finish modular architecture
- [ ] add variable width items in carousel

# Done
- [x] auto container sizer
- [x] basic mouse, touch and keyboard navigation (improvements needed)
- [x] auto resizes
- [x] convert to typescript
- [x] build/bundling
- [x] basic example
- [x] mouse, touch and keyboard navigation
- [x] add animation

# Table of contents
  * [Installation](#-installation)
  * [Basic usage](#-basic-usage)
  * [Advance usage](#-advance-usage)
  * [Examples/demos](#-examples/demos)
  * [License](#-license)

## Basic usage
```javascript
class Basic extends React.Component {
  this.state = { currentIndex: 0 };

  handleOnEvent = ({ newIndex }) => {
    this.setState({ currentIndex: newIndex });
  }

  leftArrow = ({ onClick }) => <button onClick={onClick}>Left</button>
  rightArrow = ({ onClick }) => <button onClick={onClick}>Right</button>

  render() {
    return (
    <div style={containerStyles}>
      <CarouselVirtualized
        itemCount={500}
        onEvent={this.handleOnEvent}
        currentIndex={this.state.currentIndex}
        leftArrow={this.leftArrow}
        rightArrow={this.rightArrow}
      >
        {slide}
      </CarouselVirtualized>
    </div>
    );
  }
}

const slide = ({ style }) => (
  <div style={style}>
    <img src='https://picsum.photos/800/400/?random' />
  </div>
);
```

## Advance usage

## Examples/demos
- [basic example](https://carousel-virtualized.now.sh/basic "Demo of basic example")

## API
### Props
| property | type | default | required | purpose |
| -------- | ---- | ------- | -------- | ------- |
| alignment | [string] | 'start' | No | It tells carousel where to position current slide relative to other visible slides. Should be used when there are multiple slides on the screen in one carousel. Possible values: 'start' (selected slide will be first in carousel), 'center' (selected slide will be in the middle of carousel) and 'end' (selected slide will be last in carousel).
| animationDuration | [number] | 500 | No | Animation duration in ms.
| arrowStep | [string&#124;number] | 1 | No |string&#124;nullstring&#124;nullstring&#124;null How many slides to move on arrow button click. Possible string values: 'all' slides to move is equal to number of visible slides on the screen.
| arrowStepOffset | [number] | 0 | No | Intended to use with arrowStep prop. To move equal to number of all visible slide on the screen minus onem arrowStep should be set to 'all' and arrowStepOffset to -1.
| carouselName | [string] | '' | No | When there are multiple carousel on the screen this prop is used for easier detecion in which carousel change has happend.
| **children** | [React component] | - | Yes | Slide component to render.
| **currentIndex** | [number] | 0 | No | Slide number to show.
| disableAnimation | [boolean] | false | No | Disabling animation.
| disableMouseDrag | [boolean] | false | No | Disabling mouse drag.
| disableTouchDrag | [boolean] | false | No | Disabling touch drag.
| easing | [function] | EaseInOutQuint | No | Easing function for animation.
| enableKeyboard | [boolean] | false | No | Used for moving through carousel with keyboard. If enabled carousel will set event listener to document and will react on left and right arrow keydown events.
| height | [number&#124;string] | false | No | Set height of carousel in pixels [number] or as percentage ([string], eg. 50%). If this value is not set, carousel will have height of it's parent element.
| initialScrollOffset | [number] | 0 | No | Start position of carousel in px.
| innerClassName | [string] | undefined | No | Optional CSS class that will be applied on slide outermost element.
| innerStyle | [object] | empty object | No | Inline style that will be applied on slide outermost element.
| **itemCount** | [number] | - | Yes | Number of slides in carousel.
| itemData | [any] | undefined | No | Data that will be passed to children component as _data_ prop.
| itemSize | [number] | undefined | No | Width of slide in px. If _itemSize_ is not set and and  _slideCount_ is _itemSize_ will equal to width of carousel divide by _slideCount_. If _itemSize_ and _slideCount_ are not set, _itemSize_ will be equal to carousel, meaning that only one slide will be visible in carousel.
| leftArrow | [function] | undefined | No | It takes function that should return left arrrow button component. Function will receive onClick argument that should be attached to button component.
| onAnimationComplete | [function] | () => {} | No | Function that will be envoked when animation is done.
| onEvent | [function] | () => {} | No | Function that will be called when event is triggers. Function will recieve object with eventName property and newIndex that should be used as next currentIndex.
| onItemsRendered | [function] | () => {} | No | Function that will be envoked when new slides are rendered on the screen. Function will recieve single argument object with following properties: carouselName, eventName (that causes new render), visibleStartIndex (first visible slide), visibleStopIndex (last visible slide), overscanStartIndex and overscanStopIndex.
| outerClassName | [string] | undefined | No | Optional CSS class that will be applied to carousel's container.
| outerRef | [object&#124;function ] | undefined | No | Ref to attach to carousel's container.
| outerStyle | [object] | empty object | No | Inline style that will be applied to carousel's container.
| overscanCount | [number] | 1 | No | The number of slides to render outside of the visible area. This property can be important for two reasons:
- Overscanning by one slide allows the tab key to focus on the next (not yet visible) slide.
- Overscanning slightly can reduce or prevent a flash of empty space when a user first starts scrolling.
| rightArrow | [function] | undefined | No | It takes function that should return left arrrow button component. Function will receive onClick argument that should be attached to button component.
| slideCount | [number] | undefined | No | How many slides to show on the screen at once.
| width | [number] | undefined | No | Set width of carousel in pixels. If this value is not set, carousel will have width of it's parent element.
| wrapAround | [boolean] | false | No | Should carousel go in circle or should it stop at first or last slide.

### Methods


## Creators
[Nino Majder](https://github.com/NinoMaj "Nino Majder's github page")

[Ivica Batinić](https://github.com/isBatak "Ivica Batinić's github page")

## License
This is open source software [licensed as MIT].
