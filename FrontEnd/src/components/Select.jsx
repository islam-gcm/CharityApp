function Select({ label, id, children, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()} htmlFor={id}>
      <span>{label}</span>
      <select id={id} {...props}>
        {children}
      </select>
    </label>
  )
}

export default Select
