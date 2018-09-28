import throttle from 'lodash.throttle';
import { CarouselVirtualized } from './CarouselVirtualized/CarouselVirtualized';
import { KEYBOARD_EVENT } from './enums/keyboardEvent';

const resize = throttle(() => {
  // tslint:disable-next-line:no-console
  console.log('throttle');
}, 500, { leading: false, trailing: true });

resize();
resize();
resize();
resize();
resize();
resize();
resize();
resize();
resize();
resize();

export { CarouselVirtualized, KEYBOARD_EVENT };
