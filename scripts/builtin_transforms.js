/* global React, ReactDOM */

module.exports = {
  react: {
    imports: [
      ['React', 'react'],
      ['ReactDOM', 'react-dom']
    ],
    dom: C => (props, el) => ReactDOM.render(React.createElement(C, props), el),
    string: C =>
      props =>
        ReactDOM.renderToStaticMarkup(React.createElement($component_name, props))
  }
}
