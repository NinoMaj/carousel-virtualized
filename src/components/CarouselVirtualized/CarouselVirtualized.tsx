import { throttle } from 'lodash';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { FixedSizeList as Carousel } from 'react-window';

import { RESIZE_THROTTLE_THRESHOLD } from '../../consts';
import { Alignment } from '../../enums/Alignment';
import { ArrowStep } from '../../enums/ArrowStep';
import { Direction } from '../../enums/Direction';
import { Easing } from '../../enums/Easing';
import { EventName } from '../../enums/EventName';
import { KeyboardButton } from '../../enums/KeyboardButton';
import { OnItemsRendered } from '../../typings/OnItemsRendered';

declare const window: Window;

import { RenderComponent } from '../../typings/RenderComponent';

type IArrowButton = ({
  onClick,
  currentIndex,
}: {
  onClick: any;
  currentIndex: number;
}) => any;

interface ICarouselVirtualizedProps {
  alignment?: Alignment;
  animationDuration?: number;
  arrowStep?: string | number;
  arrowStepOffset?: number;
  carouselName?: string;
  children: RenderComponent<unknown>;
  currentIndex?: number;
  disableAnimation?: boolean | number;
  disableMouseDrag?: boolean;
  disableTouchDrag?: boolean;
  enableKeyboard?: boolean;
  height?: string | number;
  initialScrollOffset?: number;
  innerClassName?: string;
  innerStyle?: object;
  itemCount: number;
  itemData?: any;
  itemSize?: number;
  leftArrow?: IArrowButton;
  onItemsRendered?: OnItemsRendered;
  outerClassName?: string;
  outerRef?: any;
  outerStyle?: object;
  overscanCount?: number;
  rightArrow?: IArrowButton;
  slideCount?: number;
  width?: number;
  wrapAround?: boolean;
  easing?(t): number;
  onAnimationComplete?(): unknown;
  onEvent?({ newIndex, eventName }: { newIndex: number; eventName: string }): unknown;
}

interface ICarouselVirtualizedState {
  containerHeight: number | null;
  containerWidth: number | null;
  deltaX: number;
  eventName: string;
  isMounted: boolean;
  isMouseDragActive: boolean;
  isTouchDragActive: boolean;
  mouseIsMoving: boolean;
  startX: number;
}

interface ISlidesMoved {
  arrowClick?: boolean;
  arrowStep?: ArrowStep | number | string;
  arrowStepOffset?: number;
  deltaX?: number;
  itemSize: number;
  width?: number | null;
}

class CarouselVirtualized extends React.PureComponent<
  ICarouselVirtualizedProps,
  ICarouselVirtualizedState
> {
  public static propTypes = {
    alignment: PropTypes.string,
    animationDuration: PropTypes.number,
    arrowStep: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    arrowStepOffset: PropTypes.number,
    carouselName: PropTypes.string,
    children: PropTypes.func.isRequired,
    currentIndex: PropTypes.number,
    disableAnimation: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    disableMouseDrag: PropTypes.bool,
    disableTouchDrag: PropTypes.bool,
    easing: PropTypes.func,
    enableKeyboard: PropTypes.bool,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    initialScrollOffset: PropTypes.number,
    innerClassName: PropTypes.bool,
    innerStyle: PropTypes.object,
    itemCount: PropTypes.number.isRequired,
    itemData: PropTypes.any,
    itemSize: PropTypes.number,
    leftArrow: PropTypes.func,
    onAnimationComplete: PropTypes.func,
    onEvent: PropTypes.func,
    onItemsRendered: PropTypes.func,
    outerClassName: PropTypes.string,
    outerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    outerStyle: PropTypes.object,
    overscanCount: PropTypes.number,
    rightArrow: PropTypes.func,
    slideCount: PropTypes.number,
    width: PropTypes.number,
    wrapAround: PropTypes.bool,
  };

  public static defaultProps = {
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
    leftArrow: () => { return; },
    onAnimationComplete: () => { return; },
    onEvent: () => { return; },
    onItemsRendered: () => { return; },
    outerClassName: undefined,
    outerRef: undefined,
    outerStyle: {},
    overscanCount: 1,
    rightArrow: () => { return; },
    slideCount: undefined,
    width: undefined,
    wrapAround: false,
  };

  public static slidesMoved({
    arrowClick,
    arrowStep,
    arrowStepOffset = 0,
    deltaX = 0,
    itemSize,
    width = 0,
  }: ISlidesMoved): number {
    if (arrowClick) {
      // TODO: add others steps
      let slidesMoved;
      switch (arrowStep) {
        case ArrowStep.All:
          slidesMoved = Math.round((width as number / itemSize) + arrowStepOffset as number);
          break;
        default:
          slidesMoved = arrowStep;
      }

      return slidesMoved;
    }

    // Drag calculation
    const threshold = 0.1;
    const bigDrag = Math.abs(Math.round(deltaX / itemSize));
    const smallDrag = Math.abs(deltaX) >= itemSize * threshold ? 1 : 0;

    return deltaX < 0
      ? Math.max(smallDrag, bigDrag)
      : -Math.max(bigDrag, smallDrag);
  }

  // Timer for resize
  private moveTimer: number | null = null;

  // Refs
  private containerRef: HTMLDivElement | null = null;
  private carouselRef = React.createRef<Carousel>();

  // Offset for animation
  private scrollOffsetInitial: number = 0;
  private scrollOffsetFinal: number = 0;
  private animationStartTime: number = 0;

  private throttledResize = throttle(
    () => this.onResize(),
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
      deltaX: 0,
      eventName: EventName.Initial,
      isMounted: false,
      isMouseDragActive: false,
      isTouchDragActive: false,
      mouseIsMoving: false,
      startX: 0,
    };
  }

  public componentDidMount() {
    if (this.containerRef) {
      this.setState({
        containerHeight: this.containerRef.offsetHeight,
        containerWidth: this.containerRef.offsetWidth,
        isMounted: true,
      }, () => {
        this.setInitiallOffset();
      });
    }

    window.addEventListener(EventName.Resize, this.onThrottleResize);

    if (this.props.enableKeyboard) {
      document.addEventListener(EventName.KeyDown, this.handleKeyDown);
    }

    this.scrollToItem(this.props.currentIndex || 0);
  }

  public componentDidUpdate(prevProps: ICarouselVirtualizedProps) {
    const { currentIndex, disableAnimation } = this.props;

    if (prevProps.currentIndex !== currentIndex) {
      if (this.shouldAnimate(disableAnimation, currentIndex, prevProps.currentIndex)) {
        this.initAnimation();

        return;
      }
      this.scrollToItem(this.props.currentIndex || 0);
    }
  }

  public componentWillUnmount() {
    window.removeEventListener(EventName.Resize, this.onResize);
    document.addEventListener(EventName.KeyDown, this.handleKeyDown);
    window.cancelAnimationFrame.call(window, this.moveTimer);
    this.moveTimer = null;
    this.scrollOffsetInitial = 0;
    this.scrollOffsetFinal = 0;
    this.animationStartTime = 0;
  }

  public render() {
    const {
      children,
      currentIndex = 0,
      outerClassName,
      height,
      leftArrow,
      initialScrollOffset,
      innerClassName,
      itemCount,
      itemData,
      itemSize,
      overscanCount = 1,
      slideCount,
      innerStyle,
      outerStyle,
      rightArrow,
      width,
    } = this.props;
    const dataForRenderer = {
      containerHeight: this.state.containerHeight,
      containerWidth: this.state.containerWidth,
      height,
      itemData,
      width,
    };

    const calculatedItemSize: number = itemSize || (slideCount
      ? (width || this.state.containerWidth || 0) / slideCount
      : this.state.containerWidth || 0);
    const calculatedHeight: number|string = height || this.state.containerHeight || 0;
    const calculatedWidth: number = calculatedItemSize && slideCount
      ? calculatedItemSize * slideCount
      : width || this.state.containerWidth || 0;
    const calculatedInitialScrollOffset: number = initialScrollOffset || this.itemSize * currentIndex;

    return (
      <React.Fragment>
        {leftArrow &&
          leftArrow({ onClick: this.handleLeftArrowClick, currentIndex })}
        <div
          className={outerClassName}
          data-testid='carouselVirtualizedContainer'
          draggable
          onDragStart={this.handleOnDragStart}
          onMouseMove={this.handleOnMouseMove}
          onMouseUp={this.handleOnMouseUp}
          onTouchCancel={this.handleTouchCancel}
          onTouchEnd={this.handleTouchEnd}
          onTouchMove={this.handleTouchMove}
          onTouchStart={this.handleTouchStart}
          ref={this.setContainerRefs}
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
              data-testid='carouselVirtualized'
              direction='horizontal'
              height={calculatedHeight}
              initialScrollOffset={calculatedInitialScrollOffset}
              itemCount={itemCount}
              itemData={dataForRenderer}
              itemSize={calculatedItemSize}
              onItemsRendered={this.onItemsRendered}
              onScroll={this.onScroll}
              overscanCount={overscanCount}
              ref={this.carouselRef}
              style={{ overflow: 'hidden', ...innerStyle }}
              width={calculatedWidth}
            >
              {children}
            </Carousel>
          ) : null}
        </div>
        {rightArrow &&
          rightArrow({ onClick: this.handleRightArrowClick, currentIndex })}
      </React.Fragment>
    );
  }

  private setContainerRefs = (ref) => {
    const { outerRef } = this.props;
    this.containerRef = ref;

    if (typeof outerRef === 'function') {
      outerRef(ref);
    } else if (
      outerRef !== null &&
      typeof outerRef === 'object' &&
      outerRef.hasOwnProperty('current')
    ) {
      outerRef.current = ref as HTMLDivElement;
    }
  }

  private shouldAnimate(disableAnimation, currentIndex, previousIndex) {
    if (!currentIndex || !previousIndex) {
      return;
    }

    const indexDiff = Math.abs(currentIndex - previousIndex);

    // If disableAnimation props is number, we want to skip animation
    // if index change is higher than that number
    return Number.isInteger(disableAnimation) ? disableAnimation > indexDiff : !disableAnimation;
  }

  private initAnimation() {
    if (this.animationStartTime) {
      return;
    }

    const { alignment = Alignment.Center, currentIndex = 0 } = this.props;
    const alignmentOffSet = this.calucateAlignmentOffSet(alignment);
    this.scrollOffsetFinal = this.boundScrollPosition((currentIndex * this.itemSize) - alignmentOffSet);
    this.animationStartTime = performance.now();
    this.animate();
  }

  private animate() {
    requestAnimationFrame(() => {
      const {
        animationDuration = 500,
        easing = Easing.EaseInOutQuint,
        onAnimationComplete = () => { return; },
      } = this.props;
      const now = performance.now();
      const ellapsed = now - this.animationStartTime;
      const scrollDelta = this.scrollOffsetFinal - this.scrollOffsetInitial;
      const easedTime = easing(Math.min(1, ellapsed / animationDuration));
      const scrollOffset = this.scrollOffsetInitial + (scrollDelta * easedTime);

      this.scrollTo(scrollOffset);

      if (ellapsed < animationDuration) {
        this.animate();
      } else {
        this.animationStartTime = 0;
        this.scrollOffsetInitial = this.scrollOffsetFinal;
        onAnimationComplete();
      }
    });
  }

  private calucateAlignmentOffSet(alignment: Alignment) {
    if (this.width === this.itemSize) {
      return 0;
    }

    let alignmentOffSet;
    switch (alignment) {
      case Alignment.Start:
        alignmentOffSet = 0;
        break;
      case Alignment.Center:
        alignmentOffSet = this.width as number / 2;
        break;
      case Alignment.End:
        alignmentOffSet = this.width as number - this.itemSize;
        break;
      default:
        alignmentOffSet = 0;
    }

    return alignmentOffSet;
  }

  private setInitiallOffset() {
    if (this.props.alignment) {
      const alignmentOffSet = this.calucateAlignmentOffSet(this.props.alignment);
      this.scrollTo(((this.props.currentIndex || 0) * this.itemSize) - alignmentOffSet);
    }
  }

  private onResize = () => {
    if (this.containerRef) {
      this.setState(
        {
          containerHeight: this.containerRef.offsetHeight,
          containerWidth: this.containerRef.offsetWidth,
          eventName: EventName.Resize,
        },
        () => this.scrollToItem(this.props.currentIndex || 0),
      );
    }
  }

  private onThrottleResize = () => {
    this.throttledResize();
  }

  private onScroll = ({ scrollOffset, scrollUpdateWasRequested }) => {
    if (!scrollUpdateWasRequested) {
      this.scrollOffsetInitial = scrollOffset;
    }
  }

  private handleKeyDown = (
    event: KeyboardEvent,
  ) => {
    if (
      event.which === KeyboardButton.LeftArrow ||
      event.which === KeyboardButton.RightArrow
    ) {
      this.onEvent(
        event.which === KeyboardButton.LeftArrow
          ? Direction.Left
          : Direction.Right,
        EventName.KeyDown,
      );
    }
  }

  private handleOnDragStart: React.MouseEventHandler = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (this.props.disableMouseDrag) {
      return;
    }
    event.preventDefault();
    this.onDragStart(event.screenX, true, false);
  }

  private handleOnMouseMove: React.MouseEventHandler = (event: React.MouseEvent) => {
    if (this.props.disableMouseDrag || !this.state.isMouseDragActive) {
      return;
    }
    if (this.state.mouseIsMoving) {
      event.preventDefault();
    }

    this.onDragMove(event.screenX);
  }

  private handleOnMouseUp: React.MouseEventHandler = (event: React.MouseEvent) => {
    if (this.props.disableMouseDrag || !this.state.isMouseDragActive || !this.state.mouseIsMoving) {
      return;
    }

    event.preventDefault();

    this.onDragEnd(EventName.MouseDrag);
  }

  private handleTouchStart: React.TouchEventHandler = (event: React.TouchEvent) => {
    if (this.props.disableTouchDrag) {
      return;
    }
    const touch = event.targetTouches[0];
    this.onDragStart(touch.screenX, false, true);
  }

  private handleTouchMove: React.TouchEventHandler = (event: React.TouchEvent) => {
    if (this.props.disableTouchDrag) {
      return;
    }
    window.cancelAnimationFrame.call(window, this.moveTimer);
    const touch = event.targetTouches[0];
    this.onDragMove(touch.screenX);
  }

  private handleTouchEnd: React.TouchEventHandler = () => {
    this.endTouchMove(EventName.TouchDrag);
  }

  private handleTouchCancel: React.TouchEventHandler = () => {
    this.endTouchMove(EventName.TouchDrag);
  }

  private endTouchMove(eventName) {
    if (this.props.disableTouchDrag) {
      return;
    }
    this.onDragEnd(eventName);
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

  private onDragEnd(eventName: EventName) {
    window.cancelAnimationFrame.call(window, this.moveTimer);
    this.computeNextSlide(eventName);
    this.setState({
      deltaX: 0,
      eventName,
      isMouseDragActive: false,
      isTouchDragActive: false,
      mouseIsMoving: false,
    });
  }

  private computeNextSlide(eventName: EventName) {
    const slidesMoved = CarouselVirtualized.slidesMoved({
      arrowClick: false,
      deltaX: this.state.deltaX,
      itemSize: this.itemSize,
    });

    this.onEvent(slidesMoved, eventName);
  }

  private boundScrollPosition(scrollPosition: number) {
    const { currentIndex = 0} = this.props;
    if (scrollPosition < 0) {
      return 0;
    }

    if (scrollPosition > (this.props.itemCount * this.itemSize) - this.width) {
      return (this.props.itemCount * this.itemSize) - this.width;
    }

    return scrollPosition;
  }

  private boundIndex(index: number) {
    const { itemCount, wrapAround } = this.props;

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
  }

  private onEvent(change: number, eventName: string) {
    const { currentIndex = 0, onEvent = () => { return; } } = this.props;
    const adjustedIdx = currentIndex + change;
    const newIndex = this.boundIndex(adjustedIdx);
    onEvent({ newIndex, eventName });
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

  private scrollTo = (scrollOffset) => {
    if (this.carouselRef.current && scrollOffset) {
      this.carouselRef.current.scrollTo(this.boundScrollPosition(scrollOffset));
    }
  }

  private scrollToItem(index: number) {
    const { alignment = Alignment.Center } = this.props;
    if (this.carouselRef.current) {
      this.carouselRef.current.scrollToItem(this.boundIndex(index), alignment as any);
    }
  }

  private handleLeftArrowClick = () => {
    const { arrowStep = 1, arrowStepOffset = 0 } = this.props;
    const slidesMoved = CarouselVirtualized.slidesMoved({
      arrowClick: true,
      arrowStep,
      arrowStepOffset,
      itemSize: this.itemSize,
      width: this.width,
    });
    this.onEvent(slidesMoved * Direction.Left, EventName.LeftArrowClick);
  }

  private handleRightArrowClick = () => {
    const { arrowStep = 1, arrowStepOffset = 0 } = this.props;
    const slidesMoved = CarouselVirtualized.slidesMoved({
      arrowClick: true,
      arrowStep,
      arrowStepOffset,
      itemSize: this.itemSize,
      width: this.width,
    });
    this.onEvent(slidesMoved * Direction.Right, EventName.RightArrowClick);
  }

  private get width() {
    return this.itemSize && this.props.slideCount
      ? this.itemSize * this.props.slideCount
      : this.props.width || this.state.containerWidth || 0;
  }

  private get itemSize() {
    const { itemSize, width, slideCount } = this.props;

    return itemSize || (slideCount
      ? (width || this.state.containerWidth || 0) / slideCount
      : this.state.containerWidth || 0);
  }
}

export { CarouselVirtualized };
