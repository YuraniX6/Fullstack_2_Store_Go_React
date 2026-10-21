// Campo de formulario con etiqueta, ayuda y mensaje de error.
// Si recibe `children`, se dibuja un <select>; con as="textarea", un <textarea>.
export default function Field({ name, label, hint, error, value, full, as, children, ...props }) {
  const status = error ? 'invalid' : value.trim() !== '' ? 'valid' : '';
  const Control = as || (children ? 'select' : 'input');

  return (
    <div className={`form-field${full ? ' full' : ''}`}>
      <label htmlFor={name}>{label}</label>
      <Control id={name} name={name} value={value} className={status} {...props}>
        {children}
      </Control>
      {hint && <small className="field-hint">{hint}</small>}
      <small className="field-error" id={`${name}-error`}>{error}</small>
    </div>
  );
}
