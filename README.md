# Carousel-virtualized (in active development)
Highly performant react carousel built with virtualization (thanks to [react-window](https://github.com/bvaughn/react-window "react-window github page")

# Motivation
After trying most of carousels out there, we couldn't find one that would allow us to load large number of slide (e.g. >10k) and had all the features that one carousel needs.

# Features
...

# Todo
- outerTagName and innerTagName, now is always div
- utalize render prop
- add animation
- add documentation
- make demos on codesandbox
- add typescript typings
- build/bundling
- add variable items in carousel
- tests
- a11y

Discuss before implementation:
- autoplay - should we support this
- dots  - should we support this
- lockOnWindowScroll and documentScroll - do we need this
- wrapAround - we probably need this

# Done
 - auto container sizer
 - mouse, touch and keyboard navigation (improvements needed)
 - auto resizer



# Table of contents
  * [Installation](#-installation)
  * [Basic usage](#-basic-usage)
  * [Advance usage](#-advance-usage)
  * [Examples/demos](#-examples/demos)
  * [License](#-license)

## Basic usage

## Advance usage

## Examples/demos

## API
### Props
| property | type | default | required | purpose |
| -------- | ---- | ------- | -------- | ------- |
| outerClassName| [string&#124;null] | null | No | Optional className string that will be appended to the component's outer most element string. |
| innerClassName| [string&#124;null] | null | No | Optional className string that will be 

### Methods


## Creators
[Nino Majder](https://github.com/NinoMaj "Nino Majder's github page")
[Ivica Batinić](https://github.com/isBatak "Ivica Batinić's github page")

## License
This is open source software [licensed as MIT].
