/* eslint-disable */
import React from 'react';
import { PropTypes } from 'prop-types';
import { FixedSizeList as Carousel } from 'react-window';
import throttle from 'lodash/throttle';

import { DIRECTION } from '../enums/direction';
import { EVENT_NAME } from '../enums/eventName';
import { KEYBOARD_EVENT } from '../enums/keyboardEvent';
import { RESIZE_THROTTLE_THRESHOLD } from '../consts';


class CarouselVirtualized extends React.PureComponent {
  static propTypes = {
    children: PropTypes.func.isRequired,
    disableDrag: PropTypes.bool,
    disableTouch: PropTypes.bool,
    height: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    initialScrollOffset: PropTypes.number,
    innerClassName: PropTypes.bool,
    itemCount: PropTypes.number.isRequired,
    itemData: PropTypes.any,
    itemSize: PropTypes.number,
    outerClassName: PropTypes.string,
    outerStyle: PropTypes.string,
    overscanCount: PropTypes.number,
    slideCount: PropTypes.number,
    style: PropTypes.object,
    width: PropTypes.number,
  }

  static defaultProps = {
    disableDrag: false,
    disableTouch: false,
    height: null,
    initialScrollOffset: 0,
    innerClassName: null,
    outerClassName: null,
    overscanCount: 1,
    style: {},
    slideCount: null,
    width: null,
  }

  static slidesMoved(deltaX, deltaY, itemSize) {
    const threshold = 0.1;
    const bigDrag = Math.abs(Math.round(deltaX / itemSize));
    const smallDrag = (Math.abs(deltaX) >= (itemSize * threshold)) ? 1 : 0;

    return deltaX < 0
      ? Math.max(smallDrag, bigDrag)
      : -Math.max(bigDrag, smallDrag);
  }

  constructor(props) {
    super(props);
    this.state = {
      containerHeight: null,
      containerWidth: null,
      currentIndex: this.props.slideIndex,
      eventName: EVENT_NAME.INITIAL,
      isMounted: false,
      isMouseDragActive: false,
      isTouchDragActive: false,
      startX: 0,
      startY: 0,
    };

    this.moveTimer = null;

    this.containerRef = React.createRef();
    this.listRef = React.createRef();

    this.scrollToItem = this.scrollToItem.bind(this);
    this.onItemsRendered = this.onItemsRendered.bind(this);
    this.onResize = this.onResize.bind(this);

    this.handleOnKeyDown = this.handleOnKeyDown.bind(this);

    this.handleLeftArrowClick = this.handleLeftArrowClick.bind(this);
    this.handleRightArrowClick = this.handleRightArrowClick.bind(this);

    this.handleOnMouseDown = this.handleOnMouseDown.bind(this);
    this.handleOnMouseMove = this.handleOnMouseMove.bind(this);
    this.handleOnMouseClick = this.handleOnMouseClick.bind(this);

    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTouchCancel = this.handleTouchCancel.bind(this);
    this.itemSize = this.itemSize.bind(this);
  }

  componentDidMount() {
    this.setState({
      containerWidth: this.containerRef.current.clientWidth,
      containerHeight: this.containerRef.current.clientHeight,
      isMounted: true,
    });

    if (this.props.autofocus) {
      this.containerRef.current.focus();
    }

    window.addEventListener('resize', this.onResize);
  }


  componentDidUpdate(prevProps) {
    if (prevProps.slideIndex !== this.props.slideIndex) {
      this.setState({ currentIndex: this.props.slideIndex });
      this.scrollToItem(this.props.slideIndex);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
    window.cancelAnimationFrame.call(window, this.moveTimer);
    this.moveTimer = null;
  }

  onResize() {
    this.throttledResize();
  }

  throttledResize = throttle(() => {
    this.setState({
      containerWidth: this.containerRef.current.clientWidth,
      containerHeight: this.containerRef.current.clientHeight,
      eventName: EVENT_NAME.RESIZE,
    }, () => this.scrollToItem(this.props.slideIndex));
    // throttle time, option, leading timeout, trailing timout
  }, RESIZE_THROTTLE_THRESHOLD, {}, false, true);

  handleOnKeyDown(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.which === KEYBOARD_EVENT.LEFT_ARROW || event.which === KEYBOARD_EVENT.RIGHT_ARROW) {
      this.changeSlide(event.which === KEYBOARD_EVENT.LEFT_ARROW ? DIRECTION.LEFT : DIRECTION.RIGHT, EVENT_NAME.KEYDOWN);
    }
  }

  handleOnMouseDown(event) {
    event.stopPropagation();
    if (this.props.disableDrag) {
      return;
    }

    event.preventDefault();
    this.onDragStart(event.screenX, event.screenY, true, false);
  }

  handleOnMouseMove(event) {
    if (this.props.disableDrag || !this.state.isMouseDragActive) {
      return;
    }

    event.preventDefault();
    event.persist();

    this.onDragMove(event.screenX, event.screenY);
  }

  handleOnMouseClick() {
    if (this.props.disableDrag || !this.state.isMouseDragActive) {
      return
    };

    if (this.state.mouseIsMoving) {
      event.preventDefault();
    }

    this.onDragEnd();
  }

  handleTouchStart(event) {
    if (this.props.disableTouch) {
      return;
    }

    const touch = event.targetTouches[0];
    this.onDragStart(touch.screenX, touch.screenY, false, true);
  }

  handleTouchMove(event) {
    if (this.props.disableTouch) {
      return;
    }

    window.cancelAnimationFrame.call(window, this.moveTimer);

    const touch = event.targetTouches[0];
    this.onDragMove(touch.screenX, touch.screenY);
  }

  handleTouchEnd() {
    this.endTouchMove();
  }
  handleTouchCancel() {
    this.endTouchMove();
  }

  endTouchMove() {
    if (this.props.disableTouch) return;
    this.onDragEnd();
  }

  onDragStart(startX, startY, isMouseDragActive, isTouchDragActive) {
    window.cancelAnimationFrame.call(window, this.moveTimer);

    this.setState({
      isMouseDragActive,
      isTouchDragActive,
      startX,
      startY,
    });
  }

  onDragMove(screenX, screenY) {
    this.moveTimer = window.requestAnimationFrame.call(window, () => {
      this.setState({
        deltaX: screenX - this.state.startX,
        deltaY: screenY - this.state.startY,
        mouseIsMoving: this.state.isMouseDragActive,
      });
    });
  }

  onDragEnd() {
    window.cancelAnimationFrame.call(window, this.moveTimer);

    this.computeNextSlide();

    this.setState({
      deltaX: 0,
      deltaY: 0,
      isMouseDragActive: false,
      isTouchDragActive: false,
      mouseIsMoving: false,
    });
  }

  computeNextSlide() {
    const slidesMoved = CarouselVirtualized.slidesMoved(
      this.state.deltaX,
      this.state.deltaY,
      this.itemSize(),
    );

    this.changeSlide(slidesMoved);
  }

  changeSlide(change, eventName) {
    const { itemCount } = this.props;
    const adjustedIdx = this.state.currentIndex + change;
    let newIdx;
    if (adjustedIdx >= itemCount) {
      newIdx = 0;
    } else if (adjustedIdx < 0) {
      newIdx = itemCount - 1;
    } else {
      newIdx = adjustedIdx;
    }
    this.setState({ currentIndex: newIdx, eventName });
    this.scrollToItem(newIdx);
  }

  onItemsRendered({
    overscanStartIndex,
    overscanStopIndex,
    visibleStartIndex,
    visibleStopIndex,
  }) {
    return this.props.onItemsRendered({
      eventName: this.state.eventName,
      carouselName: this.props.carouselName,
      overscanStartIndex,
      overscanStopIndex,
      visibleStartIndex,
      visibleStopIndex,
    });
  }

  scrollToItem(index) {
    this.listRef.current.scrollToItem(index, 'center');
  }

  handleLeftArrowClick() {
    this.changeSlide(DIRECTION.LEFT, EVENT_NAME.LEFT_ARROW_CLICK);
  }

  handleRightArrowClick() {
    this.changeSlide(DIRECTION.RIGHT, EVENT_NAME.RIGHT_ARROW_CLICK);
  }

  itemSize() {
    const { itemSize, width, slideCount } = this.props;

    return itemSize
      ? itemSize
      : slideCount
        ? width / slideCount
        : this.state.containerWidth || 0;
  }

  render() {
    const {
      children,
      outerClassName,
      height,
      initialScrollOffset,
      innerClassName,
      itemCount,
      itemData,
      itemSize,
      overscanCount,
      slideCount,
      style,
      outerStyle,
      width,
    } = this.props;

    const dataForRenderer = {
      width,
      height,
      containerHeight: this.state.containerHeight,
      containerWidth: this.state.containerWidth,
      itemData,
    };

    const calculatedItemSize = itemSize
      ? itemSize
      : slideCount
        ? width / slideCount
        : this.state.containerWidth || 0;
    const calculatedHeight = height || this.state.containerHeight || 0;
    const calculatedWidth = itemSize && slideCount
      ? itemSize * slideCount
      : width || this.state.containerWidth || 0;
    const calculatedInitialScrollOffset = initialScrollOffset
      ? initialScrollOffset
      : (itemSize || this.state.containerWidth) * this.state.currentIndex;

    return (
      <React.Fragment>
        {this.props.leftArrow && this.props.leftArrow({ onClick: this.handleLeftArrowClick })}
        <div
          onClick={this.handleOnMouseClick}
          onTouchCancel={this.handleTouchCancel}
          onTouchEnd={this.handleTouchEnd}
          onTouchMove={this.handleTouchMove}
          onTouchStart={this.handleTouchStart}
          className={outerClassName}
          onKeyDown={this.handleOnKeyDown}
          onMouseDown={this.handleOnMouseDown}
          onMouseMove={this.handleOnMouseMove}
          ref={this.containerRef}
          role="listbox"
          style={{
            width: width ? 'auto' : '100%',
            height: height && typeof height === 'number' ? 'auto' : '100%',
            ...outerStyle,
          }}
          tabIndex={0}
        >
          {this.state.isMounted ? (
            <Carousel
              className={innerClassName}
              direction="horizontal"
              height={calculatedHeight}
              initialScrollOffset={calculatedInitialScrollOffset}
              itemCount={itemCount}
              itemData={dataForRenderer}
              itemSize={calculatedItemSize}
              onItemsRendered={this.onItemsRendered}
              overscanCount={overscanCount}
              ref={this.listRef}
              style={{ overflow: 'hidden', ...style }}
              width={calculatedWidth}
            >
              {children}
            </Carousel>
          ) : null}
        </div>
        {this.props.rightArrow && this.props.rightArrow({ onClick: this.handleRightArrowClick })}
      </React.Fragment>
    );
  }
}

export default CarouselVirtualized;
