import * as React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import * as ReactTestRenderer from 'react-test-renderer';
import { CarouselVirtualized } from '../../../src';

describe('CarouselVirtualized', () => {
  let slideRenderer;
  let defaultProps;
  let onItemsRendered;

  class Slide extends React.PureComponent<{}, {}> {
    public render() {
      return slideRenderer(this.props);
    }
  }

  beforeEach(() => {
    jest.useFakeTimers();

    onItemsRendered = jest.fn();

    slideRenderer = jest.fn(({ style, ...rest }) => (
      <div style={style}>{JSON.stringify(rest, null, 2)}</div>
    ));

    defaultProps = {
      children: Slide,
      height: 100,
      itemCount: 100,
      itemSize: 25,
      onItemsRendered,
      width: 50,
    };
  });

  it('should render an empty list', () => {
    ReactTestRenderer.create(<CarouselVirtualized {...defaultProps} itemCount={0} />);
    expect(slideRenderer).not.toHaveBeenCalled();
    expect(onItemsRendered).not.toHaveBeenCalled();
  });

  it('should render slides', () => {
    ReactTestRenderer.create(<CarouselVirtualized {...defaultProps} />);
    console.log(slideRenderer, <CarouselVirtualized {...defaultProps} />);
    expect(slideRenderer).toHaveBeenCalledTimes(5);
    expect(onItemsRendered.mock.calls).toMatchSnapshot();
  });
});
