import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { Slider } from '../../../src/components/Slider/Slider';

test('Slider is rendered', () => {
  const component = renderer.create(
    <Slider
      carouselRef={React.createRef()}
      currentIndex={1}
      height={100}
      isMounted
      itemCount={1}
      itemSize={100}
      width={100}
    >
      {() => (<div>slide</div>)}
    </Slider>,
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
