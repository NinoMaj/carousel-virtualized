import throttle from 'lodash/throttle';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { FixedSizeList } from 'react-window';

import { RESIZE_THROTTLE_THRESHOLD } from '../../consts';
import { Direction } from '../../enums/Direction';
import { EventName } from '../../enums/EventName';
import { KeyboardButton } from '../../enums/KeyboardButton';

declare const window: Window;

interface IRenderComponentProps<T = any> {
  [key: string]: T;
}

type RenderComponent = (props: IRenderComponentProps) => React.ReactNode;

interface ICarouselProps {
  autofocus?: boolean;
  carouselName?: string;
  children: RenderComponent;
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
  currentIndex?: number;
  style?: object;
  width?: number;
  onItemsRendered?(items: any): any; // TODO: add type
}

interface ICarouselState {
  currentIndex: number;
  deltaX: number;
  eventName: string;
  height: number;
  isMounted: boolean;
  isMouseDragActive: boolean;
  isTouchDragActive: boolean;
  mouseIsMoving: boolean;
  startX: number;
  startY: number;
  width: number;
}

class Carousel extends React.Component<
  ICarouselProps,
  ICarouselState
> {
  public static propTypes = {
    autofocus: PropTypes.bool,
    carouselName: PropTypes.string,
    children: PropTypes.func.isRequired,
    currentIndex: PropTypes.number,
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
    onItemsRendered: PropTypes.func,
    outerClassName: PropTypes.string,
    outerStyle: PropTypes.object,
    overscanCount: PropTypes.number,
    slideCount: PropTypes.number,
    style: PropTypes.object,
    width: PropTypes.number,
  };

  public static defaultProps = {
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
    onItemsRendered: () => { return; },
    outerClassName: null,
    outerStyle: {},
    overscanCount: 1,
    slideCount: null,
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

  private containerRef: HTMLDivElement | null = null;
  private carouselRef = React.createRef<FixedSizeList>();

  private throttledResize = throttle(
    () => {
      if (this.containerRef) {
        this.setState(
          {
            eventName: EventName.Resize,
            height: this.containerRef.offsetHeight,
            width: this.containerRef.offsetWidth,
          },
          () => this.carouselRef.current && this.carouselRef.current.scrollToItem(this.state.currentIndex, 'center'),
        );
      }
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
      currentIndex: this.props.currentIndex || 0,
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
  }

  public componentDidMount() {
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
  }

  public componentDidUpdate(prevProps: ICarouselProps) {
    if (this.props.currentIndex && prevProps.currentIndex !== this.props.currentIndex) {
      this.setState({ currentIndex: this.props.currentIndex });
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
      itemCount,
      outerStyle,
      width,
    } = this.props;

    const calculatedWidth: number =
      this.itemSize() && this.props.slideCount
        ? this.itemSize() * this.props.slideCount
        : this.state.width;

    const calculatedInitialScrollOffset: number = this.itemSize() || this.state.width * this.state.currentIndex;

    return (
      children({
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
          itemCount,
          itemSize: this.itemSize(),
          onItemsRendered: this.onItemsRendered,
          setContainerRef: this.setContainerRef,
          style: { overflow: 'hidden'},
          width: calculatedWidth,
        },
      })
    );
  }

  private setContainerRef = (ref) => {
    this.containerRef = ref;
  }

  private onResize = () => {
    this.throttledResize();
  }

  private itemSize() {
    return this.props.slideCount
        ? this.state.width / this.props.slideCount
        : this.state.width;
  }

  private handleOnKeyDown = (
    event: React.KeyboardEvent,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (
      event.which === KeyboardButton.LeftArrow ||
      event.which === KeyboardButton.RightArrow
    ) {
      this.changeSlide(
        event.which === KeyboardButton.LeftArrow
          ? Direction.Left
          : Direction.Right,
        EventName.KeyDown,
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

    this.onDragEnd('mouseDrag');
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
    this.onDragEnd('touchDrag');
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

  private onDragEnd(eventName) {
    window.cancelAnimationFrame.call(window, this.moveTimer);
    this.computeNextSlide();
    this.setState({
      deltaX: 0,
      eventName,
      isMouseDragActive: false,
      isTouchDragActive: false,
      mouseIsMoving: false,
    });
  }

  private computeNextSlide() {
    const slidesMoved = Carousel.slidesMoved(
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
  }

  private onItemsRendered = (carouselName) => ({
    overscanStartIndex,
    overscanStopIndex,
    visibleStartIndex,
    visibleStopIndex,
  }) => {
    return this.props.onItemsRendered && this.props.onItemsRendered({
      carouselName: carouselName || this.props.carouselName,
      eventName: this.state.eventName,
      overscanStartIndex,
      overscanStopIndex,
      visibleStartIndex,
      visibleStopIndex,
    });
  }
}

export { Carousel };
