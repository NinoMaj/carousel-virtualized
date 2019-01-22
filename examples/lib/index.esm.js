import { __extends, __assign } from 'tslib';
import { throttle } from 'lodash';
import { bool, string, func, number, oneOfType, any, object } from 'prop-types';
import { createRef, Component, createElement, Fragment, PureComponent } from 'react';
import { FixedSizeList } from 'react-window';

// tslint:disable-next-line:export-name
var RESIZE_THROTTLE_THRESHOLD = 500;

var Direction;
(function (Direction) {
    Direction[Direction["Left"] = -1] = "Left";
    Direction[Direction["Right"] = 1] = "Right";
})(Direction || (Direction = {}));

var EventName;
(function (EventName) {
    EventName["Initial"] = "initial";
    EventName["LeftArrowClick"] = "leftarrowclick";
    EventName["KeyDown"] = "keydown";
    EventName["MouseClick"] = "mouseclick";
    EventName["MouseDrag"] = "mousedrag";
    EventName["Resize"] = "resize";
    EventName["RightArrowClick"] = "rightarrowclick";
    EventName["TouchDrag"] = "touchdrag";
})(EventName || (EventName = {}));

var KeyboardButton;
(function (KeyboardButton) {
    KeyboardButton[KeyboardButton["LeftArrow"] = 37] = "LeftArrow";
    KeyboardButton[KeyboardButton["RightArrow"] = 39] = "RightArrow";
})(KeyboardButton || (KeyboardButton = {}));

var Carousel = /** @class */ (function (_super) {
    __extends(Carousel, _super);
    function Carousel(props) {
        var _this = _super.call(this, props) || this;
        _this.moveTimer = null;
        _this.containerRef = null;
        _this.carouselRef = createRef();
        _this.throttledResize = throttle(function () {
            if (_this.containerRef) {
                _this.setState({
                    eventName: EventName.Resize,
                    height: _this.containerRef.offsetHeight,
                    width: _this.containerRef.offsetWidth,
                }, function () { return _this.carouselRef.current && _this.carouselRef.current.scrollToItem(_this.state.currentIndex, 'center'); });
            }
        }, RESIZE_THROTTLE_THRESHOLD, {
            leading: false,
            trailing: true,
        });
        _this.setContainerRef = function (ref) {
            _this.containerRef = ref;
        };
        _this.onResize = function () {
            _this.throttledResize();
        };
        _this.handleOnKeyDown = function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (event.which === KeyboardButton.LeftArrow ||
                event.which === KeyboardButton.RightArrow) {
                _this.changeSlide(event.which === KeyboardButton.LeftArrow
                    ? Direction.Left
                    : Direction.Right, EventName.KeyDown);
            }
        };
        _this.handleOnMouseDown = function (event) {
            event.stopPropagation();
            if (_this.props.disableDrag) {
                return;
            }
            event.preventDefault();
            _this.onDragStart(event.screenX, true, false);
        };
        _this.handleOnMouseMove = function (event) {
            if (_this.props.disableDrag || !_this.state.isMouseDragActive) {
                return;
            }
            event.preventDefault();
            event.persist();
            _this.onDragMove(event.screenX);
        };
        _this.handleOnMouseClick = function (event) {
            if (_this.props.disableDrag || !_this.state.isMouseDragActive) {
                return;
            }
            if (_this.state.mouseIsMoving) {
                event.preventDefault();
            }
            _this.onDragEnd('mouseDrag');
        };
        _this.handleTouchStart = function (event) {
            if (_this.props.disableTouch) {
                return;
            }
            var touch = event.targetTouches[0];
            _this.onDragStart(touch.screenX, false, true);
        };
        _this.handleTouchMove = function (event) {
            if (_this.props.disableTouch) {
                return;
            }
            window.cancelAnimationFrame.call(window, _this.moveTimer);
            var touch = event.targetTouches[0];
            _this.onDragMove(touch.screenX);
        };
        _this.handleTouchEnd = function () {
            _this.endTouchMove();
        };
        _this.handleTouchCancel = function () {
            _this.endTouchMove();
        };
        _this.onItemsRendered = function (carouselName) { return function (_a) {
            var overscanStartIndex = _a.overscanStartIndex, overscanStopIndex = _a.overscanStopIndex, visibleStartIndex = _a.visibleStartIndex, visibleStopIndex = _a.visibleStopIndex;
            return _this.props.onItemsRendered && _this.props.onItemsRendered({
                carouselName: carouselName || _this.props.carouselName,
                eventName: _this.state.eventName,
                overscanStartIndex: overscanStartIndex,
                overscanStopIndex: overscanStopIndex,
                visibleStartIndex: visibleStartIndex,
                visibleStopIndex: visibleStopIndex,
            });
        }; };
        _this.state = {
            currentIndex: _this.props.currentIndex || 0,
            deltaX: 0,
            eventName: EventName.Initial,
            height: 0,
            isMounted: false,
            isMouseDragActive: false,
            isTouchDragActive: false,
            mouseIsMoving: false,
            startX: 0,
            startY: 0,
            width: 0,
        };
        return _this;
    }
    Carousel.slidesMoved = function (deltaX, itemSize) {
        var threshold = 0.1;
        var bigDrag = Math.abs(Math.round(deltaX / itemSize));
        var smallDrag = Math.abs(deltaX) >= itemSize * threshold ? 1 : 0;
        return deltaX < 0
            ? Math.max(smallDrag, bigDrag)
            : -Math.max(bigDrag, smallDrag);
    };
    Carousel.prototype.componentDidMount = function () {
        if (this.containerRef) {
            this.setState({
                height: this.containerRef.offsetHeight,
                isMounted: true,
                width: this.containerRef.offsetWidth,
            });
        }
        if (this.props.autofocus && this.containerRef) {
            this.containerRef.focus();
        }
        window.addEventListener('resize', this.onResize);
    };
    Carousel.prototype.componentDidUpdate = function (prevProps) {
        if (this.props.currentIndex && prevProps.currentIndex !== this.props.currentIndex) {
            this.setState({ currentIndex: this.props.currentIndex });
        }
    };
    Carousel.prototype.componentWillUnmount = function () {
        window.removeEventListener('resize', this.onResize);
        window.cancelAnimationFrame.call(window, this.moveTimer);
        this.moveTimer = null;
    };
    Carousel.prototype.render = function () {
        var _a = this.props, children = _a.children, outerClassName = _a.outerClassName, height = _a.height, itemCount = _a.itemCount, outerStyle = _a.outerStyle, width = _a.width;
        var calculatedWidth = this.itemSize() && this.props.slideCount
            ? this.itemSize() * this.props.slideCount
            : this.state.width;
        var calculatedInitialScrollOffset = this.itemSize() || this.state.width * this.state.currentIndex;
        return (children({
            enableKeyboard: {
                onKeyDown: this.handleOnKeyDown,
            },
            enableMouse: {
                onClick: this.handleOnMouseClick,
                onMouseDown: this.handleOnMouseDown,
                onMouseMove: this.handleOnMouseMove,
            },
            enableTouch: {
                onTouchCancel: this.handleTouchCancel,
                onTouchEnd: this.handleTouchEnd,
                onTouchMove: this.handleTouchMove,
                onTouchStart: this.handleTouchStart,
            },
            sliderProps: {
                carouselRef: this.carouselRef,
                currentIndex: this.state.currentIndex,
                height: this.state.height,
                initialScrollOffset: calculatedInitialScrollOffset,
                isMounted: this.state.isMounted,
                itemCount: itemCount,
                itemSize: this.itemSize(),
                onItemsRendered: this.onItemsRendered,
                setContainerRef: this.setContainerRef,
                style: { overflow: 'hidden' },
                width: calculatedWidth,
            },
        }));
    };
    Carousel.prototype.itemSize = function () {
        return this.props.slideCount
            ? this.state.width / this.props.slideCount
            : this.state.width;
    };
    Carousel.prototype.endTouchMove = function () {
        if (this.props.disableTouch) {
            return;
        }
        this.onDragEnd('touchDrag');
    };
    Carousel.prototype.onDragStart = function (startX, isMouseDragActive, isTouchDragActive) {
        window.cancelAnimationFrame.call(window, this.moveTimer);
        this.setState({
            isMouseDragActive: isMouseDragActive,
            isTouchDragActive: isTouchDragActive,
            startX: startX,
        });
    };
    Carousel.prototype.onDragMove = function (screenX) {
        var _this = this;
        this.moveTimer = window.requestAnimationFrame.call(window, function () {
            _this.setState(function (state) { return ({
                deltaX: screenX - state.startX,
                mouseIsMoving: state.isMouseDragActive,
            }); });
        });
    };
    Carousel.prototype.onDragEnd = function (eventName) {
        window.cancelAnimationFrame.call(window, this.moveTimer);
        this.computeNextSlide();
        this.setState({
            deltaX: 0,
            eventName: eventName,
            isMouseDragActive: false,
            isTouchDragActive: false,
            mouseIsMoving: false,
        });
    };
    Carousel.prototype.computeNextSlide = function () {
        var slidesMoved = Carousel.slidesMoved(this.state.deltaX, this.itemSize());
        this.changeSlide(slidesMoved, this.state.eventName);
    };
    Carousel.prototype.changeSlide = function (change, eventName) {
        var itemCount = this.props.itemCount;
        var adjustedIdx = this.state.currentIndex + change;
        var newIdx;
        if (adjustedIdx >= itemCount) {
            newIdx = 0;
        }
        else if (adjustedIdx < 0) {
            newIdx = itemCount - 1;
        }
        else {
            newIdx = adjustedIdx;
        }
        this.setState({ currentIndex: newIdx, eventName: eventName });
    };
    Carousel.propTypes = {
        autofocus: bool,
        carouselName: string,
        children: func.isRequired,
        currentIndex: number,
        disableDrag: bool,
        disableTouch: bool,
        height: oneOfType([
            string,
            number,
        ]),
        initialScrollOffset: number,
        innerClassName: bool,
        itemCount: number.isRequired,
        itemData: any,
        itemSize: number,
        onItemsRendered: func,
        outerClassName: string,
        outerStyle: object,
        overscanCount: number,
        slideCount: number,
        style: object,
        width: number,
    };
    Carousel.defaultProps = {
        autofocus: false,
        carouselName: '',
        currentIndex: 0,
        disableDrag: false,
        disableTouch: false,
        height: null,
        initialScrollOffset: 0,
        innerClassName: null,
        itemData: null,
        itemSize: null,
        onItemsRendered: function () { return; },
        outerClassName: null,
        outerStyle: {},
        overscanCount: 1,
        slideCount: null,
        style: {},
        width: null,
    };
    return Carousel;
}(Component));

var Alignment;
(function (Alignment) {
    Alignment["Start"] = "start";
    Alignment["Center"] = "center";
    Alignment["End"] = "end";
})(Alignment || (Alignment = {}));

var ArrowStep;
(function (ArrowStep) {
    ArrowStep["All"] = "ALL";
})(ArrowStep || (ArrowStep = {}));

// tslint:disable:object-literal-sort-keys
// tslint:disable:binary-expression-operand-order
// tslint:disable:no-parameter-reassignment
var Easing = {
    // accelerating from zero velocity
    EaseInQuad: function (t) { return t * t; },
    // decelerating to zero velocity
    EaseOutQuad: function (t) { return t * (2 - t); },
    // accelerating from zero velocity
    EaseInCubic: function (t) { return t * t * t; },
    // acceleration until halfway, then deceleration
    EaseInOutQuad: function (t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
    // decelerating to zero velocity
    EaseOutCubic: function (t) { return (--t) * t * t + 1; },
    // acceleration until halfway, then deceleration
    EaseInOutCubic: function (t) { return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; },
    // accelerating from zero velocity
    EaseInQuart: function (t) { return t * t * t * t; },
    // decelerating to zero velocity
    EaseOutQuart: function (t) { return 1 - (--t) * t * t * t; },
    // acceleration until halfway, then deceleration
    EaseInOutQuart: function (t) { return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t; },
    // accelerating from zero velocity
    EaseInQuint: function (t) { return t * t * t * t * t; },
    // decelerating to zero velocity
    EaseOutQuint: function (t) { return 1 + (--t) * t * t * t * t; },
    // acceleration until halfway, then deceleration
    EaseInOutQuint: function (t) { return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t; },
    // no easing, no acceleration
    Linear: function (t) { return t; },
};

var CarouselVirtualized = /** @class */ (function (_super) {
    __extends(CarouselVirtualized, _super);
    function CarouselVirtualized(props) {
        var _this = _super.call(this, props) || this;
        // Timer for resize
        _this.moveTimer = null;
        // Refs
        _this.containerRef = null;
        _this.carouselRef = createRef();
        // Offset for animation
        _this.scrollOffsetInitial = 0;
        _this.scrollOffsetFinal = 0;
        _this.animationStartTime = 0;
        _this.throttledResize = throttle(function () { return _this.onResize(); }, RESIZE_THROTTLE_THRESHOLD, {
            leading: false,
            trailing: true,
        });
        _this.setContainerRefs = function (ref) {
            var outerRef = _this.props.outerRef;
            _this.containerRef = ref;
            if (typeof outerRef === 'function') {
                outerRef(ref);
            }
            else if (outerRef !== null &&
                typeof outerRef === 'object' &&
                outerRef.hasOwnProperty('current')) {
                outerRef.current = ref;
            }
        };
        _this.onResize = function () {
            if (_this.containerRef) {
                _this.setState({
                    containerHeight: _this.containerRef.offsetHeight,
                    containerWidth: _this.containerRef.offsetWidth,
                    eventName: EventName.Resize,
                }, function () { return _this.scrollToItem(_this.props.currentIndex || 0); });
            }
        };
        _this.onThrottleResize = function () {
            _this.throttledResize();
        };
        _this.onScroll = function (_a) {
            var scrollOffset = _a.scrollOffset, scrollUpdateWasRequested = _a.scrollUpdateWasRequested;
            if (!scrollUpdateWasRequested) {
                _this.scrollOffsetInitial = scrollOffset;
            }
        };
        _this.handleKeyDown = function (event) {
            if (event.which === KeyboardButton.LeftArrow ||
                event.which === KeyboardButton.RightArrow) {
                _this.onEvent(event.which === KeyboardButton.LeftArrow
                    ? Direction.Left
                    : Direction.Right, EventName.KeyDown);
            }
        };
        _this.handleOnDragStart = function (event) {
            event.stopPropagation();
            if (_this.props.disableMouseDrag) {
                return;
            }
            event.preventDefault();
            _this.onDragStart(event.screenX, true, false);
        };
        _this.handleOnMouseMove = function (event) {
            if (_this.props.disableMouseDrag || !_this.state.isMouseDragActive) {
                return;
            }
            if (_this.state.mouseIsMoving) {
                event.preventDefault();
            }
            _this.onDragMove(event.screenX);
        };
        _this.handleOnMouseUp = function (event) {
            if (_this.props.disableMouseDrag || !_this.state.isMouseDragActive || !_this.state.mouseIsMoving) {
                return;
            }
            event.preventDefault();
            _this.onDragEnd(EventName.MouseDrag);
        };
        _this.handleTouchStart = function (event) {
            if (_this.props.disableTouchDrag) {
                return;
            }
            var touch = event.targetTouches[0];
            _this.onDragStart(touch.screenX, false, true);
        };
        _this.handleTouchMove = function (event) {
            if (_this.props.disableTouchDrag) {
                return;
            }
            window.cancelAnimationFrame.call(window, _this.moveTimer);
            var touch = event.targetTouches[0];
            _this.onDragMove(touch.screenX);
        };
        _this.handleTouchEnd = function () {
            _this.endTouchMove(EventName.TouchDrag);
        };
        _this.handleTouchCancel = function () {
            _this.endTouchMove(EventName.TouchDrag);
        };
        _this.onItemsRendered = function (_a) {
            var overscanStartIndex = _a.overscanStartIndex, overscanStopIndex = _a.overscanStopIndex, visibleStartIndex = _a.visibleStartIndex, visibleStopIndex = _a.visibleStopIndex;
            return _this.props.onItemsRendered && _this.props.onItemsRendered({
                carouselName: _this.props.carouselName,
                eventName: _this.state.eventName,
                overscanStartIndex: overscanStartIndex,
                overscanStopIndex: overscanStopIndex,
                visibleStartIndex: visibleStartIndex,
                visibleStopIndex: visibleStopIndex,
            });
        };
        _this.scrollTo = function (scrollOffset) {
            if (_this.carouselRef.current && scrollOffset) {
                _this.carouselRef.current.scrollTo(_this.boundScrollPosition(scrollOffset));
            }
        };
        _this.handleLeftArrowClick = function () {
            var _a = _this.props, _b = _a.arrowStep, arrowStep = _b === void 0 ? 1 : _b, _c = _a.arrowStepOffset, arrowStepOffset = _c === void 0 ? 0 : _c;
            var slidesMoved = CarouselVirtualized.slidesMoved({
                arrowClick: true,
                arrowStep: arrowStep,
                arrowStepOffset: arrowStepOffset,
                itemSize: _this.itemSize,
                width: _this.width,
            });
            _this.onEvent(slidesMoved * Direction.Left, EventName.LeftArrowClick);
        };
        _this.handleRightArrowClick = function () {
            var _a = _this.props, _b = _a.arrowStep, arrowStep = _b === void 0 ? 1 : _b, _c = _a.arrowStepOffset, arrowStepOffset = _c === void 0 ? 0 : _c;
            var slidesMoved = CarouselVirtualized.slidesMoved({
                arrowClick: true,
                arrowStep: arrowStep,
                arrowStepOffset: arrowStepOffset,
                itemSize: _this.itemSize,
                width: _this.width,
            });
            _this.onEvent(slidesMoved * Direction.Right, EventName.RightArrowClick);
        };
        _this.state = {
            containerHeight: 0,
            containerWidth: 0,
            deltaX: 0,
            eventName: EventName.Initial,
            isMounted: false,
            isMouseDragActive: false,
            isTouchDragActive: false,
            mouseIsMoving: false,
            startX: 0,
        };
        return _this;
    }
    CarouselVirtualized.slidesMoved = function (_a) {
        var arrowClick = _a.arrowClick, arrowStep = _a.arrowStep, _b = _a.arrowStepOffset, arrowStepOffset = _b === void 0 ? 0 : _b, _c = _a.deltaX, deltaX = _c === void 0 ? 0 : _c, itemSize = _a.itemSize, _d = _a.width, width = _d === void 0 ? 0 : _d;
        if (arrowClick) {
            // TODO: add others steps
            var slidesMoved = void 0;
            switch (arrowStep) {
                case ArrowStep.All:
                    slidesMoved = Math.round((width / itemSize) + arrowStepOffset);
                    break;
                default:
                    slidesMoved = arrowStep;
            }
            return slidesMoved;
        }
        // Drag calculation
        var threshold = 0.1;
        var bigDrag = Math.abs(Math.round(deltaX / itemSize));
        var smallDrag = Math.abs(deltaX) >= itemSize * threshold ? 1 : 0;
        return deltaX < 0
            ? Math.max(smallDrag, bigDrag)
            : -Math.max(bigDrag, smallDrag);
    };
    CarouselVirtualized.prototype.componentDidMount = function () {
        var _this = this;
        if (this.containerRef) {
            this.setState({
                containerHeight: this.containerRef.offsetHeight,
                containerWidth: this.containerRef.offsetWidth,
                isMounted: true,
            }, function () {
                _this.setInitiallOffset();
            });
        }
        window.addEventListener(EventName.Resize, this.onThrottleResize);
        if (this.props.enableKeyboard) {
            document.addEventListener(EventName.KeyDown, this.handleKeyDown);
        }
        this.scrollToItem(this.props.currentIndex || 0);
    };
    CarouselVirtualized.prototype.componentDidUpdate = function (prevProps) {
        var _a = this.props, currentIndex = _a.currentIndex, disableAnimation = _a.disableAnimation;
        if (prevProps.currentIndex !== currentIndex) {
            if (this.shouldAnimate(disableAnimation, currentIndex, prevProps.currentIndex)) {
                this.initAnimation();
                return;
            }
            this.scrollToItem(this.props.currentIndex || 0);
        }
    };
    CarouselVirtualized.prototype.componentWillUnmount = function () {
        window.removeEventListener(EventName.Resize, this.onResize);
        document.addEventListener(EventName.KeyDown, this.handleKeyDown);
        window.cancelAnimationFrame.call(window, this.moveTimer);
        this.moveTimer = null;
        this.scrollOffsetInitial = 0;
        this.scrollOffsetFinal = 0;
        this.animationStartTime = 0;
    };
    CarouselVirtualized.prototype.render = function () {
        var _a = this.props, children = _a.children, _b = _a.currentIndex, currentIndex = _b === void 0 ? 0 : _b, outerClassName = _a.outerClassName, height = _a.height, leftArrow = _a.leftArrow, initialScrollOffset = _a.initialScrollOffset, innerClassName = _a.innerClassName, itemCount = _a.itemCount, itemData = _a.itemData, itemSize = _a.itemSize, _c = _a.overscanCount, overscanCount = _c === void 0 ? 1 : _c, slideCount = _a.slideCount, innerStyle = _a.innerStyle, outerStyle = _a.outerStyle, rightArrow = _a.rightArrow, width = _a.width;
        var dataForRenderer = {
            containerHeight: this.state.containerHeight,
            containerWidth: this.state.containerWidth,
            height: height,
            itemData: itemData,
            width: width,
        };
        var calculatedItemSize = itemSize || (slideCount
            ? (width || this.state.containerWidth || 0) / slideCount
            : this.state.containerWidth || 0);
        var calculatedHeight = height || this.state.containerHeight || 0;
        var calculatedWidth = calculatedItemSize && slideCount
            ? calculatedItemSize * slideCount
            : width || this.state.containerWidth || 0;
        var calculatedInitialScrollOffset = initialScrollOffset || this.itemSize * currentIndex;
        return (createElement(Fragment, null,
            leftArrow &&
                leftArrow({ onClick: this.handleLeftArrowClick, currentIndex: currentIndex }),
            createElement("div", { className: outerClassName, "data-testid": 'carouselVirtualizedContainer', draggable: true, onDragStart: this.handleOnDragStart, onMouseMove: this.handleOnMouseMove, onMouseUp: this.handleOnMouseUp, onTouchCancel: this.handleTouchCancel, onTouchEnd: this.handleTouchEnd, onTouchMove: this.handleTouchMove, onTouchStart: this.handleTouchStart, ref: this.setContainerRefs, role: 'listbox', style: __assign({ height: height && typeof height === 'number' ? 'auto' : '100%', width: width ? 'auto' : '100%' }, outerStyle) }, this.state.isMounted ? (createElement(FixedSizeList, { className: innerClassName, "data-testid": 'carouselVirtualized', direction: 'horizontal', height: calculatedHeight, initialScrollOffset: calculatedInitialScrollOffset, itemCount: itemCount, itemData: dataForRenderer, itemSize: calculatedItemSize, onItemsRendered: this.onItemsRendered, onScroll: this.onScroll, overscanCount: overscanCount, ref: this.carouselRef, style: __assign({ overflow: 'hidden' }, innerStyle), width: calculatedWidth }, children)) : null),
            rightArrow &&
                rightArrow({ onClick: this.handleRightArrowClick, currentIndex: currentIndex })));
    };
    CarouselVirtualized.prototype.shouldAnimate = function (disableAnimation, currentIndex, previousIndex) {
        if (!currentIndex || !previousIndex) {
            return;
        }
        var indexDiff = Math.abs(currentIndex - previousIndex);
        // If disableAnimation props is number, we want to skip animation
        // if index change is higher than that number
        return Number.isInteger(disableAnimation) ? disableAnimation > indexDiff : !disableAnimation;
    };
    CarouselVirtualized.prototype.initAnimation = function () {
        if (this.animationStartTime) {
            return;
        }
        var _a = this.props, _b = _a.alignment, alignment = _b === void 0 ? Alignment.Center : _b, _c = _a.currentIndex, currentIndex = _c === void 0 ? 0 : _c;
        var alignmentOffSet = this.calucateAlignmentOffSet(alignment);
        this.scrollOffsetFinal = this.boundScrollPosition((currentIndex * this.itemSize) - alignmentOffSet);
        this.animationStartTime = performance.now();
        this.animate();
    };
    CarouselVirtualized.prototype.animate = function () {
        var _this = this;
        requestAnimationFrame(function () {
            var _a = _this.props, _b = _a.animationDuration, animationDuration = _b === void 0 ? 500 : _b, _c = _a.easing, easing = _c === void 0 ? Easing.EaseInOutQuint : _c, _d = _a.onAnimationComplete, onAnimationComplete = _d === void 0 ? function () { return; } : _d;
            var now = performance.now();
            var ellapsed = now - _this.animationStartTime;
            var scrollDelta = _this.scrollOffsetFinal - _this.scrollOffsetInitial;
            var easedTime = easing(Math.min(1, ellapsed / animationDuration));
            var scrollOffset = _this.scrollOffsetInitial + (scrollDelta * easedTime);
            _this.scrollTo(scrollOffset);
            if (ellapsed < animationDuration) {
                _this.animate();
            }
            else {
                _this.animationStartTime = 0;
                _this.scrollOffsetInitial = _this.scrollOffsetFinal;
                onAnimationComplete();
            }
        });
    };
    CarouselVirtualized.prototype.calucateAlignmentOffSet = function (alignment) {
        if (this.width === this.itemSize) {
            return 0;
        }
        var alignmentOffSet;
        switch (alignment) {
            case Alignment.Start:
                alignmentOffSet = 0;
                break;
            case Alignment.Center:
                alignmentOffSet = this.width / 2;
                break;
            case Alignment.End:
                alignmentOffSet = this.width - this.itemSize;
                break;
            default:
                alignmentOffSet = 0;
        }
        return alignmentOffSet;
    };
    CarouselVirtualized.prototype.setInitiallOffset = function () {
        if (this.props.alignment) {
            var alignmentOffSet = this.calucateAlignmentOffSet(this.props.alignment);
            this.scrollTo(((this.props.currentIndex || 0) * this.itemSize) - alignmentOffSet);
        }
    };
    CarouselVirtualized.prototype.endTouchMove = function (eventName) {
        if (this.props.disableTouchDrag) {
            return;
        }
        this.onDragEnd(eventName);
    };
    CarouselVirtualized.prototype.onDragStart = function (startX, isMouseDragActive, isTouchDragActive) {
        window.cancelAnimationFrame.call(window, this.moveTimer);
        this.setState({
            isMouseDragActive: isMouseDragActive,
            isTouchDragActive: isTouchDragActive,
            startX: startX,
        });
    };
    CarouselVirtualized.prototype.onDragMove = function (screenX) {
        var _this = this;
        this.moveTimer = window.requestAnimationFrame.call(window, function () {
            _this.setState(function (state) { return ({
                deltaX: screenX - state.startX,
                mouseIsMoving: state.isMouseDragActive,
            }); });
        });
    };
    CarouselVirtualized.prototype.onDragEnd = function (eventName) {
        window.cancelAnimationFrame.call(window, this.moveTimer);
        this.computeNextSlide(eventName);
        this.setState({
            deltaX: 0,
            eventName: eventName,
            isMouseDragActive: false,
            isTouchDragActive: false,
            mouseIsMoving: false,
        });
    };
    CarouselVirtualized.prototype.computeNextSlide = function (eventName) {
        var slidesMoved = CarouselVirtualized.slidesMoved({
            arrowClick: false,
            deltaX: this.state.deltaX,
            itemSize: this.itemSize,
        });
        this.onEvent(slidesMoved, eventName);
    };
    CarouselVirtualized.prototype.boundScrollPosition = function (scrollPosition) {
        var _a = this.props.currentIndex;
        if (scrollPosition < 0) {
            return 0;
        }
        if (scrollPosition > (this.props.itemCount * this.itemSize) - this.width) {
            return (this.props.itemCount * this.itemSize) - this.width;
        }
        return scrollPosition;
    };
    CarouselVirtualized.prototype.boundIndex = function (index) {
        var _a = this.props, itemCount = _a.itemCount, wrapAround = _a.wrapAround;
        if (index >= itemCount) {
            return wrapAround
                ? 0
                : itemCount - 1;
        }
        if (index < 0) {
            return wrapAround
                ? itemCount - 1
                : 0;
        }
        return index;
    };
    CarouselVirtualized.prototype.onEvent = function (change, eventName) {
        var _a = this.props, _b = _a.currentIndex, currentIndex = _b === void 0 ? 0 : _b, _c = _a.onEvent, onEvent = _c === void 0 ? function () { return; } : _c;
        var adjustedIdx = currentIndex + change;
        var newIndex = this.boundIndex(adjustedIdx);
        onEvent({ newIndex: newIndex, eventName: eventName });
    };
    CarouselVirtualized.prototype.scrollToItem = function (index) {
        var _a = this.props.alignment, alignment = _a === void 0 ? Alignment.Center : _a;
        if (this.carouselRef.current) {
            this.carouselRef.current.scrollToItem(this.boundIndex(index), alignment);
        }
    };
    Object.defineProperty(CarouselVirtualized.prototype, "width", {
        get: function () {
            return this.itemSize && this.props.slideCount
                ? this.itemSize * this.props.slideCount
                : this.props.width || this.state.containerWidth || 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CarouselVirtualized.prototype, "itemSize", {
        get: function () {
            var _a = this.props, itemSize = _a.itemSize, width = _a.width, slideCount = _a.slideCount;
            return itemSize || (slideCount
                ? (width || this.state.containerWidth || 0) / slideCount
                : this.state.containerWidth || 0);
        },
        enumerable: true,
        configurable: true
    });
    CarouselVirtualized.propTypes = {
        alignment: string,
        animationDuration: number,
        arrowStep: oneOfType([string, number]),
        arrowStepOffset: number,
        carouselName: string,
        children: func.isRequired,
        currentIndex: number,
        disableAnimation: oneOfType([bool, number]),
        disableMouseDrag: bool,
        disableTouchDrag: bool,
        easing: func,
        enableKeyboard: bool,
        height: oneOfType([string, number]),
        initialScrollOffset: number,
        innerClassName: bool,
        innerStyle: object,
        itemCount: number.isRequired,
        itemData: any,
        itemSize: number,
        leftArrow: func,
        onAnimationComplete: func,
        onEvent: func,
        onItemsRendered: func,
        outerClassName: string,
        outerRef: oneOfType([func, object]),
        outerStyle: object,
        overscanCount: number,
        rightArrow: func,
        slideCount: number,
        width: number,
        wrapAround: bool,
    };
    CarouselVirtualized.defaultProps = {
        alignment: Alignment.Center,
        animationDuration: 500,
        arrowStep: 1,
        arrowStepOffset: 0,
        carouselName: '',
        currentIndex: 0,
        disableAnimation: false,
        disableMouseDrag: false,
        disableTouchDrag: false,
        easing: Easing.EaseInOutQuint,
        enableKeyboard: false,
        height: 0,
        initialScrollOffset: 0,
        innerClassName: undefined,
        innerStyle: {},
        itemData: undefined,
        itemSize: undefined,
        leftArrow: function () { return; },
        onAnimationComplete: function () { return; },
        onEvent: function () { return; },
        onItemsRendered: function () { return; },
        outerClassName: undefined,
        outerRef: undefined,
        outerStyle: {},
        overscanCount: 1,
        rightArrow: function () { return; },
        slideCount: undefined,
        width: undefined,
        wrapAround: false,
    };
    return CarouselVirtualized;
}(PureComponent));

var Slider = /** @class */ (function (_super) {
    __extends(Slider, _super);
    // TODO: align PropTypes with Typescript types
    // public static propTypes = {
    //   autofocus: PropTypes.bool,
    //   carouselName: PropTypes.string,
    //   currentIndex: PropTypes.number,
    //   children: PropTypes.func.isRequired,
    //   disableDrag: PropTypes.bool,
    //   disableTouch: PropTypes.bool,
    //   height: PropTypes.oneOfType([
    //     PropTypes.string,
    //     PropTypes.number,
    //   ]).isRequired,
    //   initialScrollOffset: PropTypes.number,
    //   innerClassName: PropTypes.bool,
    //   isMounted: PropTypes.bool.isRequired,
    //   itemCount: PropTypes.number.isRequired,
    //   itemData: PropTypes.any,
    //   itemSize: PropTypes.number,
    //   leftArrow: PropTypes.func,
    //   onItemsRendered: PropTypes.func,
    //   outerClassName: PropTypes.string,
    //   outerStyle: PropTypes.object,
    //   overscanCount: PropTypes.number,
    //   rightArrow: PropTypes.func,
    //   slideCount: PropTypes.number,
    //   style: PropTypes.object,
    //   width: PropTypes.number.isRequired,
    // };
    // public static defaultProps = {
    //   autofocus: false,
    //   carouselName: '',
    //   currentIndex: 0,
    //   disableDrag: false,
    //   disableTouch: false,
    //   initialScrollOffset: 0,
    //   innerClassName: null,
    //   itemData: null,
    //   itemSize: null,
    //   onItemsRendered: () => { return; },
    //   outerClassName: null,
    //   outerStyle: {},
    //   overscanCount: 1,
    //   slideCount: null,
    //   style: {},
    // };
    function Slider(props) {
        return _super.call(this, props) || this;
    }
    Slider.prototype.componentDidUpdate = function (prevProps) {
        if (this.props.currentIndex && prevProps.currentIndex !== this.props.currentIndex) {
            this.scrollToItem(this.props.currentIndex);
        }
    };
    Slider.prototype.render = function () {
        return (createElement("div", { className: this.props.outerClassName, onClick: this.props.onMouseClick, onKeyDown: this.props.onKeyDown, onMouseDown: this.props.onMouseDown, onMouseMove: this.props.onMouseMove, onTouchCancel: this.props.onTouchCancel, onTouchEnd: this.props.onTouchEnd, onTouchMove: this.props.onTouchMove, onTouchStart: this.props.onTouchStart, ref: this.props.setContainerRef, role: 'listbox', style: {
                height: this.props.height || '100%',
                width: this.props.width || '100%',
            } }, this.props.isMounted ? (createElement(FixedSizeList, { className: this.props.innerClassName, direction: 'horizontal', height: this.props.height, initialScrollOffset: this.props.initialScrollOffset, itemCount: this.props.itemCount, itemData: this.props.itemData, itemSize: this.props.itemSize, onItemsRendered: this.props.onItemsRendered && this.props.onItemsRendered('main'), overscanCount: this.props.overscanCount, style: this.props.style, width: this.props.width, ref: this.props.carouselRef }, this.props.children)) : null));
    };
    Slider.prototype.scrollToItem = function (index) {
        if (this.props.carouselRef.current) {
            this.props.carouselRef.current.scrollToItem(index, 'center');
        }
    };
    return Slider;
}(Component));

export { Alignment, ArrowStep, Carousel, Direction, EventName, Slider, KeyboardButton, CarouselVirtualized };
