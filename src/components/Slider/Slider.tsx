import * as PropTypes from 'prop-types';
import * as React from 'react';
import {
  FixedSizeList,
  ListChildComponentProps,
} from 'react-window';

interface ISliderProps {
  autofocus?: boolean;
  carouselName?: string;
  carouselRef: React.RefObject<FixedSizeList>;
  children: React.ComponentType<ListChildComponentProps>;
  currentIndex: number;
  height: string | number;
  initialScrollOffset?: number;
  innerClassName?: string;
  isMounted: boolean;
  itemCount: number;
  itemData?: any;
  itemSize: number;
  outerClassName?: string;
  outerStyle?: object;
  overscanCount?: number;
  slideCount?: number;
  style?: object;
  width: number;
  // TODO: add types
  onMouseClick?(): any;
  onKeyDown?(): any;
  onMouseDown?(): any;
  onMouseMove?(): any;
  onTouchCancel?(): any;
  onTouchEnd?(): any;
  onTouchMove?(): any;
  onTouchStart?(): any;
  onItemsRendered?(items: any): any;
  setContainerRef(): void;
}

class Slider extends React.Component<
  ISliderProps
> {
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

  constructor(props) {
    super(props);
  }

  public componentDidUpdate(prevProps: ISliderProps) {
    if (this.props.currentIndex && prevProps.currentIndex !== this.props.currentIndex) {
      this.scrollToItem(this.props.currentIndex);
    }
  }

  public render() {
    return (
      <div
        className={this.props.outerClassName}
        onClick={this.props.onMouseClick}
        onKeyDown={this.props.onKeyDown}
        onMouseDown={this.props.onMouseDown}
        onMouseMove={this.props.onMouseMove}
        onTouchCancel={this.props.onTouchCancel}
        onTouchEnd={this.props.onTouchEnd}
        onTouchMove={this.props.onTouchMove}
        onTouchStart={this.props.onTouchStart}
        ref={this.props.setContainerRef}
        role='listbox'
        style={{
          height: this.props.height || '100%',
          width: this.props.width || '100%',
        }}
      >
        {this.props.isMounted ? (
          <FixedSizeList
            className={this.props.innerClassName}
            direction='horizontal'
            height={this.props.height}
            initialScrollOffset={this.props.initialScrollOffset}
            itemCount={this.props.itemCount}
            itemData={this.props.itemData}
            itemSize={this.props.itemSize}
            onItemsRendered={this.props.onItemsRendered && this.props.onItemsRendered('main')}
            overscanCount={this.props.overscanCount}
            style={this.props.style}
            width={this.props.width}
            ref={this.props.carouselRef}
          >
            {this.props.children}
          </FixedSizeList>
        ) : null}
      </div>
    );
  }

  private scrollToItem(index: number) {
    if (this.props.carouselRef.current) {
      this.props.carouselRef.current.scrollToItem(index, 'center');
    }
  }
}

export { Slider };
