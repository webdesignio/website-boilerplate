export function dom (C) {
  return (props, el) => {
    new C(props, el)
  }
}

export function string (C) {
  return props => {
    const c = new C(props)
    return c.render(props)
  }
}
