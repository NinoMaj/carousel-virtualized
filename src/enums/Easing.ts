// tslint:disable:object-literal-sort-keys
// tslint:disable:binary-expression-operand-order
// tslint:disable:no-parameter-reassignment
export const Easing = {
  // accelerating from zero velocity
  EaseInQuad: (t) => t * t,
  // decelerating to zero velocity
  EaseOutQuad: (t) => t * (2 - t),
  // accelerating from zero velocity
  EaseInCubic: (t) => t * t * t,
  // acceleration until halfway, then deceleration
  EaseInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  // decelerating to zero velocity
  EaseOutCubic: (t) => (--t) * t * t + 1,
  // acceleration until halfway, then deceleration
  EaseInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  // accelerating from zero velocity
  EaseInQuart: (t) => t * t * t * t,
  // decelerating to zero velocity
  EaseOutQuart: (t) => 1 - (--t) * t * t * t,
  // acceleration until halfway, then deceleration
  EaseInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  // accelerating from zero velocity
  EaseInQuint: (t) => t * t * t * t * t,
  // decelerating to zero velocity
  EaseOutQuint: (t) => 1 + (--t) * t * t * t * t,
  // acceleration until halfway, then deceleration
  EaseInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
  // no easing, no acceleration
  Linear: (t) => t,
};
