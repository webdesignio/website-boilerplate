import React from 'react'
import { Provider, connect } from 'react-redux'
import { isEditable } from '@webdesignio/floorman/selectors'

const renderSave = ({ onClickSave }) =>
  <li><a href onClick={onClickSave}>SAVE</a></li>

function Header ({ store, isEditable, onClickSave }) {
  return (
    <Provider store={store}>
      <div className='container'>
        <div className='row'>
          <div className='col-sm-4'>
            <h1 className='logo'>Webdesign.io</h1>
          </div>
          <div className='burger-menu'><span></span><span></span><span></span><span></span></div>
          <nav className='header-nav col-sm-8 col-xs-12 text-right'>
            <ul className='list-inline'>
              <li><a href='https://www.github.com/webdesignio/webdesignio/wiki'>Documentation</a></li>
              {isEditable
                ? renderSave({ onClickSave })
                : null}
            </ul>
          </nav>
        </div>
      </div>
    </Provider>
  )
}

function mapStateToProps (state) {
  return { isEditable: isEditable(state) }
}

function mapDispatchToProps (dispatch, props) {
  return {
    onClickSave (e) {
      e.preventDefault()
      props.onSave()
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
