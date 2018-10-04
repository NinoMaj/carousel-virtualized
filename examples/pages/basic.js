import React from 'react';
import { CarouselVirtualized } from '../../dist/index.esm.js';

const containerStyles = {
  margin: '50px auto 0',
  // width: '800px',
  maxWidth: '80%',
  height: '400px',
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
  // height: '100%',
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
      <img
        alt="placehoder"
        src={'https://picsum.photos/800/400/?random'}
        style={imageStyles}
      />
      
      <button
        onClick={() => alert('TODO')}
        style={buttonRight}>⇨</button>
    </div>
  </div>
);

class Basic extends React.Component {
  constructor(props) {
    super(props);

    this.state = { currentIndex: 0 };
  }

  handlePositionChange = ({ newIndex }) => {
    this.setState({ currentIndex: newIndex });
  }

  leftArrow = ({ onClick }) => <button onClick={onClick} style={buttonLeft}>⇦</button>

  render() {
    return (
    <div style={containerStyles}>
      <CarouselVirtualized
        autofocus
        itemCount={500}
        onPositionChange={this.handlePositionChange}
        overscanCount={1}
        currentIndex={this.state.currentIndex}
        leftArrow={this.leftArrow}
      >
        {slide}
      </CarouselVirtualized>
    </div>
    );
  }
}

export default Basic
