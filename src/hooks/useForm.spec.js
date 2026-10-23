import { act } from 'react';
import { useForm } from './useForm';
import { mount } from '../test/helpers';

const required = v => (v === '' ? 'obligatorio' : '');
const RULES = {
  name: required,
  email: required,
  emailConfirm: (v, vals) => (v === vals.email ? '' : 'no coinciden')
};
const INITIAL = { name: '', email: '', emailConfirm: '', comuna: '' };

describe('useForm', () => {
  let api;
  let view;

  function Probe() {
    api = useForm(INITIAL, RULES, { email: 'emailConfirm' });
    return null;
  }

  beforeEach(() => { view = mount(<Probe />); });
  afterEach(() => view.unmount());

  it('parte con los valores iniciales y sin errores', () => {
    expect(api.values).toEqual(INITIAL);
    expect(api.errors).toEqual({});
  });

  it('no muestra error al escribir en un campo vacío que aún no se tocó', () => {
    act(() => api.change('name', ''));
    expect(api.errors.name).toBeUndefined();
  });

  it('valida mientras se escribe cuando el campo ya tiene texto', () => {
    act(() => api.change('emailConfirm', 'x'));
    expect(api.values.emailConfirm).toBe('x');
    expect(api.errors.emailConfirm).toBe('no coinciden');
  });

  it('valida al salir del campo (blur)', () => {
    act(() => api.handleBlur({ target: { name: 'name' } }));
    expect(api.errors.name).toBe('obligatorio');
  });

  it('revalida el campo vinculado cuando cambia el original', () => {
    act(() => api.change('emailConfirm', 'a@duoc.cl'));
    expect(api.errors.emailConfirm).toBe('no coinciden');
    act(() => api.change('email', 'a@duoc.cl'));
    expect(api.errors.emailConfirm).toBe('');
  });

  it('al cambiar un campo puede limpiar el error de otros (extra)', () => {
    act(() => api.handleBlur({ target: { name: 'name' } }));
    act(() => api.change('email', 'a@duoc.cl', { name: '' }));
    expect(api.errors.name).toBe('');
  });

  it('validateAll devuelve el primer campo inválido y le da el foco (mock de getElementById)', () => {
    const focus = jasmine.createSpy('focus');
    const spy = spyOn(document, 'getElementById').and.returnValue({ focus });
    let first;
    act(() => { first = api.validateAll(); });
    expect(first).toBe('name');
    expect(spy).toHaveBeenCalledWith('name');
    expect(focus).toHaveBeenCalled();
    expect(api.errors.email).toBe('obligatorio');
  });

  it('validateAll devuelve null cuando todo es válido', () => {
    act(() => api.change('name', 'Ana'));
    act(() => api.change('email', 'a@duoc.cl'));
    act(() => api.change('emailConfirm', 'a@duoc.cl'));
    let first;
    act(() => { first = api.validateAll(); });
    expect(first).toBeNull();
  });

  it('setError muestra un mensaje y enfoca el campo', () => {
    const focus = jasmine.createSpy('focus');
    spyOn(document, 'getElementById').and.returnValue({ focus });
    act(() => api.setError('email', 'ya existe'));
    expect(api.errors.email).toBe('ya existe');
    expect(focus).toHaveBeenCalled();
  });

  it('reset deja los valores iniciales y borra los errores', () => {
    act(() => api.change('name', 'Ana'));
    act(() => api.handleBlur({ target: { name: 'email' } }));
    act(() => api.reset());
    expect(api.values).toEqual(INITIAL);
    expect(api.errors).toEqual({});
  });
});
