import React from 'react';
import { CarouselVirtualized } from '../lib/index.esm.js';

const containerStyles = {
  height: '400px',
  margin: '50px auto 0',
  maxWidth: '80%',
  position: 'relative',
  width: '800px',
};

const slideStyles = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  position: 'relative',
};

const slideNumberStyles = {
  alignItems: 'center',
  color: 'white',
  display: 'flex',
  fontSize: "6em",
  height: '100%',
  justifyContent: 'center',
  position: 'absolute',
  width: '100%',
};

const imageStyles = {
  maxWidth: '100%'
}

const buttonStyles = {
  backgroundColor: 'rgba(230,230,230,.2)',
  border: '0',
  color: "#eeeeee",
  cursor: 'pointer',
  fontSize: "2em",
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 1,
};

const buttonLeft = { ...buttonStyles, left: '0px' };
const buttonRight = { ...buttonStyles, right: '0px' };

const slide = ({ index, style }) => (
  <div style={style}>
    <div style={slideStyles}>
      <div style={slideNumberStyles}>{index}</div>
      <img
        alt="placehoder"
        src='https://picsum.photos/800/400/?random'
        style={imageStyles}
      />
    
    </div>
  </div>
);

class Basic extends React.Component {
  constructor(props) {
    super(props);

    this.state = { currentIndex: 1 };
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
