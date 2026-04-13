function Input({ label, id, hint, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()} htmlFor={id}>
      <span>{label}</span>
      <input id={id} {...props} />
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

export default Input
