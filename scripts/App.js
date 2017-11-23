import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { setInterval } from 'timers'

const styles = {
  topBarStyle: {

  },

  mainAreaStyle: {
  },
  figuresAreaStyle: {

  },
  lineStyle: {
    stroke: 'black',
    strokeWidth: 1
  },
  cellStyle: {
    stroke: 'black',
    strokeWidth: 1,
    fill: 'blue'
  }
}

const getNeighboursCount = (world, x, y, width, height) => {
  let c = 0;

  for (let i = x - 1; i < x + 2; i++) {
    for (let j = y - 1; j < y + 2; j++) {
      if (
        !(
          (i < 0 || j < 0) ||
          (i >= width || j >= height) ||
          (i == x && j == y)
        )
      ) {
        if (world[i][j]) {
          c++
        }
      }
    }
  }

  return c
}

const getEmptyWorld = (width, height) => {
  const world = []
  for (var i = 0; i < width; i++) {
    world[i] = []
    for (var j = 0; j < height; j++) {
      world[i][j] = 0
    }
  }

  return world
}

const getRandomWorld = (width, height, seed) => {
  const world = []
  for (var i = 0; i < width; i++) {
    world[i] = []
    for (var j = 0; j < height; j++) {
      world[i][j] = Math.random() >= seed
    }
  }

  return world
}

const getNextWorld = (world, width, height) => {
  const n = [];
  for (let i = 0; i < width; i++) {
    n[i] = []
    for (let j = 0; j < height; j++) {
      n[i][j] = getNeighboursCount(world, i, j, width, height)
    }
  }

  const nextWorld = [];
  for (let i = 0; i < width; i++) {
    nextWorld[i] = [];
    for (let j = 0; j < height; j++) {
      let c = n[i][j]
      nextWorld[i][j] = world[i][j]
      if (world[i][j] == 1 && (c < 2 || c > 3)) {
        nextWorld[i][j] = 0
      } else if (world[i][j] == 0 && c == 3) {
        nextWorld[i][j] = 1
      }
    }
  }

  return nextWorld;
}

const getNextWorldWithToggledCell = (world, x, y, width, height) => {
  const nextWorld = []
  for (var i = 0; i < width; i++) {
    nextWorld[i] = []
    for (var j = 0; j < height; j++) {
      nextWorld[i][j] = world[i][j]
    }
  }

  nextWorld[x][y] = !world[x][y]
  return nextWorld
}

const getLines = (width, height, size) => {
  const result = []
  for (let i = 0; i <= width; i++) {
    result.push(<line
      key={`line-x-${i}`}
      x1={i * size}
      y1={0}
      x2={i * size}
      y2={height * size}
      style={styles.lineStyle} />
    )
  }

  for (let j = 0; j <= height; j++) {
    result.push(<line
      key={`line-y-${j}`}
      x1={0}
      y1={j * size}
      x2={width * size}
      y2={j * size}
      style={styles.lineStyle} />
    )
  }

  return result
}

const getCells = (world, width, height, size) => {
  const result = [];
  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      if (!world[i][j]) {
        continue;
      }

      result.push(<circle
        key={`cell-${i}-${j}`}
        cy={j * size + (size / 2)}
        cx={i * size + (size / 2)}
        r={(size / 2) - (size / 10)}
        style={styles.cellStyle} />)
    }
  }

  return result;
}

const getSvgObjects = (world, width, height, size) => {
  return [
    ...getLines(width, height, size),
    ...getCells(world, width, height, size)
  ]
}

export default class App extends Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      timerHandler: 0,
      isRunning: true,
      step: 0,
      cellX: 0,
      cellY: 0,
      world: getRandomWorld(this.props.width, this.props.height, 0.75)
    }
  }

  componentDidMount() {
    const timerHandler = setInterval(() => {
      if (this.state.isRunning) {
        this.handleNextStep();
      }
    }, 1000)

    this.setState({ timerHandler })
  }

  handleNextStep = () => {
    this.setState((prevState, props) => {
      const nextWorld = getNextWorld(prevState.world, props.width, props.height)
      return {
        step: prevState.step + 1,
        world: nextWorld
      }
    })
  }

  handleStartStopClicked = (e) => {
    this.setState((prevState, props) => ({ isRunning: !prevState.isRunning }))
  }

  handleClearAllClick = (e) => {
    this.setState((prevState, props) => {
      const nextWorld = getEmptyWorld(props.width, props.height)
      return { world: nextWorld }
    })
  }

  handleClick = (e) => {
    this.setState((prevState, props) => {
      const nextWorld = getNextWorldWithToggledCell(this.state.world, this.state.cellX, this.state.cellY, this.props.width, this.props.height)
      return { world: nextWorld }
    })
  }

  handleMouseMove = (e) => {
    this.setState({
      cellX: Math.floor(e.nativeEvent.offsetX / this.props.size),
      cellY: Math.floor(e.nativeEvent.offsetY / this.props.size)
    })
  }

  render() {
    return (
      <div>
        <div style={styles.topBarStyle}>        
          <div>
            Cell: [{this.state.cellX}, {this.state.cellY}]
          </div>
          <div>
            Step: {this.state.step}
          </div>
          <div>
            <input type='button' value={this.state.isRunning ? 'Stop' : 'Continue'} onClick={this.handleStartStopClicked} />
            <input type='button' value={'Clear'} onClick={this.handleClearAllClick} />
          </div>
        </div>
        <div style={styles.mainAreaStyle}>
          <svg
            ref={ref => this.svg = ref}
            height={this.props.height * this.props.size}
            width={this.props.width * this.props.size}
            onClick={this.handleClick}
            onMouseMove={this.handleMouseMove} >
            {getSvgObjects(this.state.world, this.props.width, this.props.height, this.props.size)}
          </svg>
        </div>
      </div >
    )
  }
}
