import React from 'react'
import styled from 'styled-components'

const rootModifiers = {
  success: `
    color: #3c763d;
    background-color: #dff0d8;
    border-color: #d6e9c6;
  `
}

const Root = styled.div`
  position: fixed;
  top: 5px;
  right: 10px;
  width: 200px;

  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid transparent;
  border-radius: 4px;
  box-sizing: border-box;

  font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
  font-size: 14px;
  line-height: 1.42857143;

  &:after, &:before {
    box-sizing: border-box;
  }

  ${props => rootModifiers[props.type || 'success']}
`

export default function SaveSuccessIndicator ({ isVisible, type, children }) {
  if (!isVisible) return null
  return (
    <Root type={type}>
      {children}
    </Root>
  )
}
