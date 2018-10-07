import React from 'react';
import { CarouselVirtualized } from '../../dist/index.esm.js';

const containerStyles = {
  margin: '50px auto 0',
  maxWidth: '80%',
  height: '400px',
  position: 'relative',
};

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

const imageStyles = {
  maxWidth: '100%'
}

const buttonStyles = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  color: "#eeeeee",
  fontSize: "2em",
  backgroundColor: 'rgba(230,230,230,.2)',
  border: '0',
  cursor: 'pointer',
  zIndex: 1,
};

const buttonLeft = { ...buttonStyles, left: '0px' };
const buttonRight = { ...buttonStyles, right: '0px' };

const RIGHT = '-1';
const LEFT = '+1';

const slide = ({ index, style }) => (
  <div style={style}>
    <div style={slideStyles}>
      <div style={slideNumberStyles}>{index}</div>
      <img
        alt="placehoder"
        src={'https://picsum.photos/800/400/?random'}
        style={imageStyles}
      />
    
    </div>
  </div>
);

class Basic extends React.Component {
  constructor(props) {
    super(props);

    this.state = { currentIndex: 0 };
  }

  handleOnEvent = ({ newIndex }) => {
    this.setState({ currentIndex: newIndex });
  }

  leftArrow = ({ onClick }) => <button onClick={onClick} style={buttonLeft}>⇦</button>
  rightArrow = ({ onClick }) => <button onClick={onClick} style={buttonRight}>⇨</button>

  render() {
    return (
    <div style={containerStyles}>
      <CarouselVirtualized
        itemCount={500}
        onEvent={this.handleOnEvent}
        currentIndex={this.state.currentIndex}
        leftArrow={this.leftArrow}
        rightArrow={this.rightArrow}
      >
        {slide}
      </CarouselVirtualized>
    </div>
    );
  }
}

export default Basic
