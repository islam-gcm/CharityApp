function Textarea({ label, id, hint, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()} htmlFor={id}>
      <span>{label}</span>
      <textarea id={id} {...props} />
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

export default Textarea
