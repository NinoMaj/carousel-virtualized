import throttle from 'lodash.throttle';

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
