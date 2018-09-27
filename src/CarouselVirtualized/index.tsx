import * as React from "react";
import * as PropTypes from 'prop-types';
import throttle from "lodash.throttle";
import {
  FixedSizeList as Carousel,
  FixedSizeList,
  ListChildComponentProps,
} from "react-window";

import { DIRECTION } from "../enums/direction";
import { EVENT_NAME } from "../enums/eventName";
import { KEYBOARD_EVENT } from "../enums/keyboardEvent";
import { RESIZE_THROTTLE_THRESHOLD } from "../consts";

type CarouselVirtualizedProps = {
  autofocus?: boolean;
  carouselName?: string;
  children: React.ComponentType<ListChildComponentProps>;
  disableDrag?: boolean;
  disableTouch?: boolean;
  height?: string | number;
  initialScrollOffset?: number;
  innerClassName?: string;
  itemCount: number;
  itemData?: any;
  itemSize?: number;
  leftArrow?(any): any; // TODO: add type
  onItemsRendered?(any): any; // TODO: add type
  outerClassName?: string;
  outerStyle?: object;
  overscanCount?: number;
  rightArrow?(any): any; // TODO: add type
  slideCount?: number;
  slideIndex?: number;
  style?: object;
  width?: number;
};

interface CarouselVirtualizedState {
  containerHeight: number;
  containerWidth: number;
  currentIndex: number;
  deltaX: number;
  eventName: string;
  isMounted: boolean;
  isMouseDragActive: boolean;
  isTouchDragActive: boolean;
  mouseIsMoving: boolean;
  startX: number;
  startY: number;
}

class CarouselVirtualized extends React.Component<
  CarouselVirtualizedProps,
  CarouselVirtualizedState
> {
  public static propTypes = {
    autofocus: PropTypes.bool,
    carouselName: PropTypes.string,
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
    leftArrow: PropTypes.func,
    rightArrow: PropTypes.func,
    onItemsRendered: PropTypes.func,
    outerClassName: PropTypes.string,
    outerStyle: PropTypes.object,
    overscanCount: PropTypes.number,
    slideCount: PropTypes.number.isRequired,
    slideIndex: PropTypes.number,
    style: PropTypes.object,
    width: PropTypes.number,
  }

  public static defaultProps = {
    autofocus: false,
    carouselName: '', 
    disableDrag: false,
    disableTouch: false,
    height: null,
    initialScrollOffset: 0,
    innerClassName: null,
    itemSize: null,
    itemData: null,
    leftArrow: () => {},
    rightArrow: () => {},
    onItemsRendered: () => {},
    outerClassName: null,
    outerStyle: {},
    overscanCount: 1,
    style: {},
    slideCount: null,
    slideIndex: 0,
    width: null,
  }

  public static slidesMoved(deltaX, itemSize) {
    const threshold = 0.1;
    const bigDrag = Math.abs(Math.round(deltaX / itemSize));
    const smallDrag = Math.abs(deltaX) >= itemSize * threshold ? 1 : 0;
    return deltaX < 0
      ? Math.max(smallDrag, bigDrag)
      : -Math.max(bigDrag, smallDrag);
  }

  state = {
    containerHeight: null,
    containerWidth: null,
    currentIndex: this.props.slideIndex,
    deltaX: 0,
    eventName: EVENT_NAME.INITIAL,
    isMounted: false,
    isMouseDragActive: false,
    isTouchDragActive: false,
    mouseIsMoving: false,
    startX: 0,
    startY: 0,
  };

  private moveTimer: number | null = null;

  private containerRef: React.RefObject<HTMLDivElement> = React.createRef();
  // TODO: add type, something like
  // private carouselRef: React.Ref<FixedSizeList> = React.createRef();
  private carouselRef: any = React.createRef();

  public componentDidMount() {
    this.setState({
      containerWidth: this.containerRef.current.clientWidth,
      containerHeight: this.containerRef.current.clientHeight,
      isMounted: true
    });

    if (this.props.autofocus) {
      this.containerRef.current.focus();
    }

    window.addEventListener("resize", this.onResize);
  }

  public componentDidUpdate(prevProps: CarouselVirtualizedProps) {
    if (prevProps.slideIndex !== this.props.slideIndex) {
      this.setState({ currentIndex: this.props.slideIndex });
      this.scrollToItem(this.props.slideIndex);
    }
  }

  public componentWillUnmount() {
    window.removeEventListener("resize", this.onResize);
    window.cancelAnimationFrame.call(window, this.moveTimer);
    this.moveTimer = null;
  }

  private onResize() {
    this.throttledResize();
  }

  private throttledResize = throttle(
    () => {
      this.setState(
        {
          containerWidth: this.containerRef.current.clientWidth,
          containerHeight: this.containerRef.current.clientHeight,
          eventName: EVENT_NAME.RESIZE,
        },
        () => this.scrollToItem(this.props.slideIndex)
      );
    },
    RESIZE_THROTTLE_THRESHOLD,
    {
      leading: false,
      trailing: true
    },
  );

  private handleOnKeyDown: React.KeyboardEventHandler = (
    event: React.KeyboardEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (
      event.which === KEYBOARD_EVENT.LEFT_ARROW ||
      event.which === KEYBOARD_EVENT.RIGHT_ARROW
    ) {
      this.changeSlide(
        event.which === KEYBOARD_EVENT.LEFT_ARROW
          ? DIRECTION.LEFT
          : DIRECTION.RIGHT,
        EVENT_NAME.KEYDOWN,
      );
    }
  };

  private handleOnMouseDown: React.MouseEventHandler = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (this.props.disableDrag) {
      return;
    }
    event.preventDefault();
    this.onDragStart(event.screenX, true, false);
  };

  private handleOnMouseMove: React.MouseEventHandler = (event: React.MouseEvent) => {
    if (this.props.disableDrag || !this.state.isMouseDragActive) {
      return;
    }

    event.preventDefault();
    event.persist();
    this.onDragMove(event.screenX);
  };

  private handleOnMouseClick: React.MouseEventHandler = () => {
    if (this.props.disableDrag || !this.state.isMouseDragActive) {
      return;
    }

    if (this.state.mouseIsMoving) {
      event.preventDefault();
    }

    this.onDragEnd();
  };

  private handleTouchStart: React.TouchEventHandler = (event: React.TouchEvent) => {
    if (this.props.disableTouch) {
      return;
    }
    const touch = event.targetTouches[0];
    this.onDragStart(touch.screenX, false, true);
  }

  private handleTouchMove: React.TouchEventHandler = (event: React.TouchEvent) => {
    if (this.props.disableTouch) {
      return;
    }
    window.cancelAnimationFrame.call(window, this.moveTimer);
    const touch = event.targetTouches[0];
    this.onDragMove(touch.screenX);
  }

  private handleTouchEnd: React.TouchEventHandler = () => {
    this.endTouchMove();
  }

  private handleTouchCancel: React.TouchEventHandler = () => {
    this.endTouchMove();
  }

  private endTouchMove() {
    if (this.props.disableTouch) {
      return;
    }
    this.onDragEnd();
  }

  private onDragStart(startX: number, isMouseDragActive: boolean, isTouchDragActive: boolean) {
    window.cancelAnimationFrame.call(window, this.moveTimer);
    this.setState({
      isMouseDragActive,
      isTouchDragActive,
      startX,
    });
  }

  private onDragMove(screenX: number) {
    this.moveTimer = window.requestAnimationFrame.call(window, () => {
      this.setState(state => ({
        deltaX: screenX - state.startX,
        mouseIsMoving: state.isMouseDragActive,
      }));
    });
  }

  private onDragEnd() {
    window.cancelAnimationFrame.call(window, this.moveTimer);
    this.computeNextSlide();
    this.setState({
      deltaX: 0,
      isMouseDragActive: false,
      isTouchDragActive: false,
      mouseIsMoving: false
    });
  }

  private computeNextSlide() {
    const slidesMoved = CarouselVirtualized.slidesMoved(
      this.state.deltaX,
      this.itemSize()
    );
    this.changeSlide(slidesMoved, this.state.eventName);
  }

  private changeSlide(change: number, eventName: string) {
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

  private onItemsRendered({
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

  private scrollToItem(index: number) {
    this.carouselRef.current.scrollToItem(index, "center");
  }

  private handleLeftArrowClick() {
    this.changeSlide(DIRECTION.LEFT, EVENT_NAME.LEFT_ARROW_CLICK);
  }

  private handleRightArrowClick() {
    this.changeSlide(DIRECTION.RIGHT, EVENT_NAME.RIGHT_ARROW_CLICK);
  }

  private itemSize() {
    const { itemSize, width, slideCount } = this.props;
    return itemSize
      ? itemSize
      : slideCount
        ? width / slideCount
        : this.state.containerWidth || 0;
  }

  public render() {
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
      width
    } = this.props;
    const dataForRenderer = {
      width,
      height,
      containerHeight: this.state.containerHeight,
      containerWidth: this.state.containerWidth,
      itemData,
    };
    const calculatedItemSize: number = itemSize
      ? itemSize
      : slideCount
        ? width / slideCount
        : this.state.containerWidth || 0;
    const calculatedHeight: number|string = height || this.state.containerHeight || 0;
    const calculatedWidth: number =
      itemSize && slideCount
        ? itemSize * slideCount
        : width || this.state.containerWidth || 0;
    const calculatedInitialScrollOffset: number = initialScrollOffset
      ? initialScrollOffset
      : (itemSize || this.state.containerWidth) * this.state.currentIndex;

    return (
      <React.Fragment>
        {this.props.leftArrow &&
          this.props.leftArrow({ onClick: this.handleLeftArrowClick })}
        <div
          className={outerClassName}
          onClick={this.handleOnMouseClick}
          onKeyDown={this.handleOnKeyDown}
          onMouseDown={this.handleOnMouseDown}
          onMouseMove={this.handleOnMouseMove}
          onTouchCancel={this.handleTouchCancel}
          onTouchEnd={this.handleTouchEnd}
          onTouchMove={this.handleTouchMove}
          onTouchStart={this.handleTouchStart}
          ref={this.containerRef}
          role="listbox"
          style={{
            width: width ? "auto" : "100%",
            height: height && typeof height === "number" ? "auto" : "100%",
            ...outerStyle
          }}
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
              ref={this.carouselRef}
              style={{ overflow: "hidden", ...style }}
              width={calculatedWidth}
            >
              {children}
            </Carousel>
          ) : null}
        </div>
        {this.props.rightArrow &&
          this.props.rightArrow({ onClick: this.handleRightArrowClick })}
      </React.Fragment>
    );
  }
}
export default CarouselVirtualized;
