export function createValueSelector (name) {
  return ({ record: { data } }) => data[name]
}
