import Field from './Field';
import { mount } from '../test/helpers';

describe('Field (Bootstrap)', () => {
  let view;
  const noop = () => {};
  afterEach(() => view.unmount());

  it('dibuja un input con form-control y su etiqueta enlazada', () => {
    view = mount(<Field name="nombre" label="Nombre" value="" onChange={noop} />);
    const input = view.container.querySelector('input#nombre');
    expect(input.className).toContain('form-control');
    expect(view.container.querySelector('label.form-label').getAttribute('for')).toBe('nombre');
  });

  it('marca is-invalid y muestra el mensaje de error', () => {
    view = mount(<Field name="nombre" label="Nombre" value="" error="Este campo es obligatorio" onChange={noop} />);
    expect(view.container.querySelector('input').className).toContain('is-invalid');
    expect(view.container.querySelector('.invalid-feedback').textContent).toBe('Este campo es obligatorio');
  });

  it('marca is-valid cuando hay valor y no hay error', () => {
    view = mount(<Field name="nombre" label="Nombre" value="Ana" onChange={noop} />);
    expect(view.container.querySelector('input').className).toContain('is-valid');
  });

  it('no marca nada si está vacío y sin error', () => {
    view = mount(<Field name="nombre" label="Nombre" value="" onChange={noop} />);
    const cls = view.container.querySelector('input').className;
    expect(cls).not.toContain('is-valid');
    expect(cls).not.toContain('is-invalid');
  });

  it('dibuja un select con form-select cuando recibe opciones', () => {
    view = mount(
      <Field name="categoria" label="Categoría" value="" onChange={noop}>
        <option value="">Elige</option>
        <option value="a">A</option>
      </Field>
    );
    const select = view.container.querySelector('select#categoria');
    expect(select.className).toContain('form-select');
    expect(select.options.length).toBe(2);
  });

  it('muestra la ayuda (form-text) y usa la grilla de Bootstrap', () => {
    view = mount(<Field name="a" label="A" value="" hint="Ayuda" onChange={noop} />);
    expect(view.container.querySelector('.form-text').textContent).toBe('Ayuda');
    expect(view.container.firstChild.className).toBe('col-md-6');
  });

  it('ocupa todo el ancho (col-12) con la propiedad full', () => {
    view = mount(<Field name="a" label="A" value="" full onChange={noop} />);
    expect(view.container.firstChild.className).toBe('col-12');
  });
});
