import throttle from 'lodash.throttle';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import {
  FixedSizeList as Carousel,
  ListChildComponentProps,
} from 'react-window';

import { RESIZE_THROTTLE_THRESHOLD } from '../consts';
import { DIRECTION } from '../enums/direction';
import { EVENT_NAME } from '../enums/eventName';
import { KEYBOARD_EVENT } from '../enums/keyboardEvent';

interface ICarouselVirtualizedProps {
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
  outerClassName?: string;
  outerStyle?: object;
  overscanCount?: number;
  slideCount?: number;
  slideIndex?: number;
  style?: object;
  width?: number;
  leftArrow?(any): any; // TODO: add type
  onItemsRendered?(any): any; // TODO: add type
  rightArrow?(any): any; // TODO: add type
}

interface ICarouselVirtualizedState {
  containerHeight: number | null;
  containerWidth: number | null;
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
  ICarouselVirtualizedProps,
  ICarouselVirtualizedState
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
    onItemsRendered: PropTypes.func,
    outerClassName: PropTypes.string,
    outerStyle: PropTypes.object,
    overscanCount: PropTypes.number,
    rightArrow: PropTypes.func,
    slideCount: PropTypes.number.isRequired,
    slideIndex: PropTypes.number,
    style: PropTypes.object,
    width: PropTypes.number,
  };

  public static defaultProps = {
    autofocus: false,
    carouselName: '',
    disableDrag: false,
    disableTouch: false,
    height: null,
    initialScrollOffset: 0,
    innerClassName: null,
    itemData: null,
    itemSize: null,
    leftArrow: () => { return; },
    onItemsRendered: () => { return; },
    outerClassName: null,
    outerStyle: {},
    overscanCount: 1,
    rightArrow: () => { return; },
    slideCount: null,
    slideIndex: 0,
    style: {},
    width: null,
  };

  public static slidesMoved(deltaX, itemSize) {
    const threshold = 0.1;
    const bigDrag = Math.abs(Math.round(deltaX / itemSize));
    const smallDrag = Math.abs(deltaX) >= itemSize * threshold ? 1 : 0;

    return deltaX < 0
      ? Math.max(smallDrag, bigDrag)
      : -Math.max(bigDrag, smallDrag);
  }

  private moveTimer: number | null = null;

  private containerRef: any = React.createRef();
  // TODO: add type, something like
  // private carouselRef: React.Ref<FixedSizeList> = React.createRef();
  private carouselRef: any = React.createRef();

  private throttledResize = throttle(
    () => {
      this.setState(
        {
          containerHeight: this.containerRef.current.clientHeight,
          containerWidth: this.containerRef.current.clientWidth,
          eventName: EVENT_NAME.RESIZE,
        },
        () => this.scrollToItem(this.props.slideIndex || 0)
      );
    },
    RESIZE_THROTTLE_THRESHOLD,
    {
      leading: false,
      trailing: true,
    },
  );

  constructor(props) {
    super(props);

    this.state = {
      containerHeight: 0,
      containerWidth: 0,
      currentIndex: this.props.slideIndex || 0,
      deltaX: 0,
      eventName: EVENT_NAME.INITIAL,
      isMounted: false,
      isMouseDragActive: false,
      isTouchDragActive: false,
      mouseIsMoving: false,
      startX: 0,
      startY: 0,
    };
  }

  public componentDidMount() {
    this.setState({
      containerHeight: this.containerRef.current.clientHeight,
      containerWidth: this.containerRef.current.clientWidth,
      isMounted: true,
    });

    if (this.props.autofocus) {
      this.containerRef.current.focus();
    }

    window.addEventListener('resize', this.onResize);
  }

  public componentDidUpdate(prevProps: ICarouselVirtualizedProps) {
    if (this.props.slideIndex && prevProps.slideIndex !== this.props.slideIndex) {
      this.setState({ currentIndex: this.props.slideIndex });
      this.scrollToItem(this.props.slideIndex);
    }
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
    window.cancelAnimationFrame.call(window, this.moveTimer);
    this.moveTimer = null;
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
      width,
    } = this.props;
    const dataForRenderer = {
      containerHeight: this.state.containerHeight,
      containerWidth: this.state.containerWidth,
      height,
      itemData,
      width,
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
          role='listbox'
          style={{
            height: height && typeof height === 'number' ? 'auto' : '100%',
            width: width ? 'auto' : '100%',
            ...outerStyle,
          }}
        >
          {this.state.isMounted ? (
            <Carousel
              className={innerClassName}
              direction='horizontal'
              height={calculatedHeight}
              initialScrollOffset={calculatedInitialScrollOffset}
              itemCount={itemCount}
              itemData={dataForRenderer}
              itemSize={calculatedItemSize}
              onItemsRendered={this.onItemsRendered}
              overscanCount={overscanCount}
              ref={this.carouselRef}
              style={{ overflow: 'hidden', ...style }}
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

  private onResize() {
    this.throttledResize();
  }

  private handleOnKeyDown: React.KeyboardEventHandler = (
    event: React.KeyboardEvent,
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
  }

  private handleOnMouseDown: React.MouseEventHandler = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (this.props.disableDrag) {
      return;
    }
    event.preventDefault();
    this.onDragStart(event.screenX, true, false);
  }

  private handleOnMouseMove: React.MouseEventHandler = (event: React.MouseEvent) => {
    if (this.props.disableDrag || !this.state.isMouseDragActive) {
      return;
    }

    event.preventDefault();
    event.persist();
    this.onDragMove(event.screenX);
  }

  private handleOnMouseClick: React.MouseEventHandler = (event: React.MouseEvent) => {
    if (this.props.disableDrag || !this.state.isMouseDragActive) {
      return;
    }

    if (this.state.mouseIsMoving) {
      event.preventDefault();
    }

    this.onDragEnd();
  }

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
      this.setState((state) => ({
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
      mouseIsMoving: false,
    });
  }

  private computeNextSlide() {
    const slidesMoved = CarouselVirtualized.slidesMoved(
      this.state.deltaX,
      this.itemSize(),
    );
    this.changeSlide(slidesMoved, this.state.eventName);
  }

  private changeSlide(change: number, eventName: string) {
    const { itemCount } = this.props;
    const adjustedIdx = this.state.currentIndex + change;
    let newIdx: number;
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

  private onItemsRendered = ({
    overscanStartIndex,
    overscanStopIndex,
    visibleStartIndex,
    visibleStopIndex,
  }) => {
    return this.props.onItemsRendered && this.props.onItemsRendered({
      carouselName: this.props.carouselName,
      eventName: this.state.eventName,
      overscanStartIndex,
      overscanStopIndex,
      visibleStartIndex,
      visibleStopIndex,
    });
  }

  private scrollToItem(index: number) {
    this.carouselRef.current.scrollToItem(index, 'center');
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
        ? width || this.state.containerWidth as number / slideCount
        : this.state.containerWidth || 0;
  }
}

export { CarouselVirtualized };
