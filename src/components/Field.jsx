// Campo de formulario con clases de Bootstrap (form-label, form-control / form-select,
// is-valid / is-invalid e invalid-feedback). Con `children` se dibuja un <select>.
export default function Field({ name, label, hint, error, value, full, as, children, ...props }) {
  const status = error ? 'is-invalid' : value.trim() !== '' ? 'is-valid' : '';
  const isSelect = !as && Boolean(children);
  const Control = as || (isSelect ? 'select' : 'input');
  const base = isSelect ? 'form-select' : 'form-control';

  return (
    <div className={full ? 'col-12' : 'col-md-6'}>
      <label htmlFor={name} className="form-label">{label}</label>
      <Control id={name} name={name} value={value} className={`${base} ${status}`.trim()} {...props}>
        {children}
      </Control>
      {hint && <div className="form-text">{hint}</div>}
      <div className="invalid-feedback" id={`${name}-error`}>{error}</div>
    </div>
  );
}
