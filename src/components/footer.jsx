import React from 'react'
import { Provider } from 'react-redux'
import Inplace from '@webdesignio/inplace/react'

export default function Footer ({ store }) {
  return (
    <Provider store={store}>
      <footer className='footer'>
        <div className='container'>
          <div className='row'>
            <div className='col-md-3 col-sm-4 col-xs-12'>
              <Inplace
                tagName='h5'
                name='get-in-touch'
                className='text-white mb-20'
              >
                Get In Touch
              </Inplace>
              <p><a href>hello@webdesignio.com</a></p>
              <p className='mt-20'>
                websites einfach smart,<br />
                Björn Schmidtke<br />
                Gustav-Jourdan-Weg 10<br />
                72534 Hayingen<br />
                Germany
              </p>
            </div>
            <div className='col-md-6 col-sm-4 footer-logo hidden-xs'></div>
            <div className='col-md-3 col-sm-4 col-xs-12 text-right mt-xs-30'>
              <h5 className='text-white mb-20'>Share The Love</h5>
              <ul className='social list-inline'>
                <li><a className='social-icon icon-twitter' href></a></li>
                <li><a className='social-icon icon-facebook' href></a></li>
                <li><a className='social-icon icon-linkedin' href></a></li>
              </ul>
            </div>
            <div className='col-xs-12 text-center mt-60 mt-xs-40'>
              <p className='op-02'>© Webdesign.io — All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </Provider>
  )
}
