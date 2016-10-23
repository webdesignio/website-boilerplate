import { connect } from 'react-redux'

import SaveSuccessIndicator from './save_success_indicator.jsx'

function mapStateToProps ({ flash }) {
  if (!flash) return { isVisible: false }
  return {
    isVisible: true,
    children: flash.message,
    type: flash.type
  }
}

export default connect(mapStateToProps)(SaveSuccessIndicator)
