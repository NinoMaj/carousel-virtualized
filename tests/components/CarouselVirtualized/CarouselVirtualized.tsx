import * as React from 'react';
import { fireEvent, render } from 'react-testing-library';
import 'react-testing-library/cleanup-after-each';

import { CarouselVirtualized } from '../../../src';

describe('CarouselVirtualized', () => {
  let slideRenderer;
  let defaultProps;
  let onEvent;
  let onItemsRendered;

  class Slide extends React.PureComponent {
    public render() {
      return slideRenderer(this.props);
    }
  }

  beforeEach(() => {
    jest.useFakeTimers();

    onEvent = jest.fn();
    onItemsRendered = jest.fn();

    slideRenderer = jest.fn(({ style, index, ...rest }) => (
      <div style={style} data-testid={`slide-${index}`}>{`slide-${index}`}</div>
    ));

    defaultProps = {
      children: Slide,
      itemCount: 100,
      onEvent,
      onItemsRendered,
    };
  });

  it('should render an empty list', () => {
    render(
      <CarouselVirtualized
        {...defaultProps}
        itemCount={0}
        height={400}
        width={800}
        itemSize={400}
      />,
    );
    expect(slideRenderer).not.toHaveBeenCalled();
    expect(onItemsRendered).not.toHaveBeenCalled();
  });

  it('should render slides', () => {
    render(
      <CarouselVirtualized
        {...defaultProps}
        height={400}
        width={800}
        itemSize={400}
      />,
    );
    expect(slideRenderer).toHaveBeenCalledTimes(4);
    expect(onItemsRendered.mock.calls).toMatchSnapshot();
  });

  it('if height is not provided should have height of it\'s container', () => {
    const { getByTestId } = render(
      <div style={{ width: '800px', height: '400px' }}>
        <CarouselVirtualized
          {...defaultProps}
          width={800}
          itemSize={25}
        />
      </div>,
    );
    const container = getByTestId('carouselVirtualizedContainer');

    expect(container.style.height).toBe('100%');
  });

  it('if width is not provided should have width of it\'s container', () => {
    const { getByTestId } = render(
      <div style={{ width: '800px', height: '400px' }}>
        <CarouselVirtualized
          {...defaultProps}
          height={400}
          itemSize={25}
        />
      </div>,
    );
    const container = getByTestId('carouselVirtualizedContainer');

    expect(container.style.width).toBe('100%');
    });

  it('should render current index', () => {
    const { getByTestId } = render(
      <CarouselVirtualized
        {...defaultProps}
        currentIndex={5}
        height={400}
        width={800}
        itemSize={800}
      />,
    );
    const container = getByTestId('carouselVirtualizedContainer');
    const secondSlideInDom = container.children[0].children[0].children[1];

    expect(secondSlideInDom.innerHTML).toBe('slide-5');
    expect(onItemsRendered.mock.calls).toMatchSnapshot();
  });

  it('should fire onEvent with new index when arrow is clicked', () => {
    const rightArrow = ({ onClick }) => <button onClick={onClick}>RightArrow</button>;
    const { getByText } = render(
      <CarouselVirtualized
        {...defaultProps}
        currentIndex={5}
        height={400}
        width={800}
        itemSize={800}
        rightArrow={rightArrow}
      />,
    );
    expect(onEvent).not.toHaveBeenCalled();
    fireEvent.click(getByText('RightArrow'));
    expect(onEvent).toHaveBeenCalled();
    expect(onEvent.mock.calls[0][0].newIndex).toBe(6);
    expect(onEvent.mock.calls).toMatchSnapshot();
  });
});
