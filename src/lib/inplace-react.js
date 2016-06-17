'use strict'

const React = require('react')

export function connect (Child) {
  class Connector extends React.Component {
    constructor (props) {
      super()
      this.onUpdate = this.setState.bind(this)
      this.state = props.initialState
    }

    componentDidMount () {
      this._subscription = this.props.store.subscribe(this.onUpdate)
    }

    componentWillUnmount () {
      this._subscription()
    }

    render () {
      const props = Object.assign({}, this.props, this.state)
      return React.createElement(Child, props)
    }
  }

  Connector.propTypes = {
    store: React.PropTypes.shape({
      subscribe: React.PropTypes.func.isRequired
    }),
    initialState: React.PropTypes.object.isRequired,
    onUpdate: React.PropTypes.func
  }

  return Connector
}
