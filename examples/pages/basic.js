import React from 'react';
import { CarouselVirtualized } from '../../dist/index.esm.js';

const slideStyles = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
};

const slideNumberStyles = {
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: "6em",
  color: 'white',
  width: '100%',
  height: '100%',
};

const buttonStyles = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  height: '100%',
  color: "#eeeeee",
  fontSize: "2em",
  backgroundColor: 'rgba(230,230,230,.2)',
  border: '0',
  cursor: 'pointer',
};

const buttonLeft = { ...buttonStyles, left: '0px' };
const buttonRight = { ...buttonStyles, right: '0px' };

const navButtonLeft = { ...buttonLeft, color: '#999' };
const navButtonRight = { ...buttonRight, color: '#999' };

const RIGHT = '-1';
const LEFT = '+1';

const slide = ({ index, isScrolling, style, data }) => (
  <div style={style}>
    <div style={slideStyles}>
      <div style={slideNumberStyles}>{index}</div>
      <img src={'https://picsum.photos/800/400/?random'} alt="placehoder" />
      <button
        onClick={() => alert('TODO')}
        style={buttonLeft}>⇦</button>
      <button
        onClick={() => alert('TODO')}
        style={buttonRight}>⇨</button>
    </div>
  </div>
);

const Basic = () => (
  <div style={{ width: '800px', height: '400px', margin: '50px auto 0' }}>
    Try swiping cause arrows aren't working yet :)
    <CarouselVirtualized
      itemCount={500}
      overscanCount={1}
    >
      {slide}
    </CarouselVirtualized>
  </div>
)

export default Basic