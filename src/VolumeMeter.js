'use strict'

import React, { PropTypes } from 'react'

const draw = (width, height, canvasCtx, volume) => {
  canvasCtx.clearRect(0, 0, width, height)
  for (let i = 0; i < 5; i++) {
    canvasCtx.fillStyle = (i * 255 / 5 < volume) ? 'green' : 'grey'
    const x = width * i / 5
    const y = height * 0.6 - height * i * 0.15
    canvasCtx.fillRect(x, y, width / 6, height - y)
  }
}

const VolumeMeter = React.createClass({
  getVolume () {
    this.analyser.getByteFrequencyData(this.array)
    const length = this.array.length
    let total = 0

    for (let i = 0; i < length; i++) {
      total += this.array[i]
    }
    return total / length
  },

  start () {
    const { width, height } = this.props
    const canvasCtx = this.refs.canvas.getContext('2d')

    const drawLoop = () => {
      if (this.analyser.ended) return
      draw(width, height, canvasCtx, this.getVolume())
      this.rafId = window.requestAnimationFrame(drawLoop)
    }

    drawLoop()
  },

  stop () {
    window.cancelAnimationFrame(this.rafId)
  },

  componentDidMount () {
    const { width, height } = this.props
    const canvasCtx = this.refs.canvas.getContext('2d')

    draw(width, height, canvasCtx, 0)
  },

  componentWillUpdate (nextProps) {
    if (!this.props.src && nextProps.src) {
      const { audioContext, src } = this.props
      this.analyser = audioContext.createAnalyser()
      src.connect(this.analyser)
      this.array = new Uint8Array(this.analyser.frequencyBinCount)
    }
  },

  componentDidUpdate (prevProps) {
    if (this.props.command && this.props.command !== 'none' && this.prevProps.command !== this.props.command) {
      this[this.props.command]()
    }
  },

  render () {
    const { width, height } = this.props
    const st = {
      width: width,
      height: height
    }

    return (
      <canvas
        ref='canvas'
        style={st}
      />
    )
  },

  propTypes: {
    command: PropTypes.oneOf(['start', 'stop', 'none']),
    audioContext: PropTypes.object.isRequired,
    src: PropTypes.object,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
  }
})

export default VolumeMeter
