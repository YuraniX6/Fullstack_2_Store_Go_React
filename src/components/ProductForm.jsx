import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Field from './Field';
import { useProducts } from '../context/ProductsContext';
import { useToast } from '../context/ToastContext';
import { useForm } from '../hooks/useForm';
import { CATEGORIAS } from '../data/categorias';
import { PRODUCT_RULES, validarImagen } from '../utils/validators';
import { PLACEHOLDER_IMG, fileToDataUrl } from '../utils/imagen';
import { mensajeDeError } from '../services/api';

const INITIAL = { name: '', category: '', price: '', stock: '', desc: '' };

export default function ProductForm() {
  const { products, addProduct } = useProducts();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const form = useForm(INITIAL, PRODUCT_RULES);
  const { values, errors, handleChange, handleBlur } = form;

  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [inputKey, setInputKey] = useState(0); // para limpiar el <input type="file">

  const common = name => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: handleChange,
    onBlur: handleBlur
  });

  const handleImage = async e => {
    const file = e.target.files[0];
    const problem = validarImagen(file);
    setImageError(problem);
    if (!file || problem) {
      setImageUrl('');
      return;
    }
    try {
      setImageUrl(await fileToDataUrl(file));
    } catch (err) {
      setImageUrl('');
      setImageError(err.message);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.validateAll() || imageError) {
      showToast('Revisa los campos marcados en rojo');
      return;
    }
    const name = values.name.trim();
    if (products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      form.setError('name', 'Ya existe un producto con este nombre');
      return;
    }
    try {
      await addProduct({
        name,
        category: values.category,
        price: parseInt(values.price, 10),
        stock: parseInt(values.stock, 10),
        desc: values.desc.trim(),
        img: imageUrl || PLACEHOLDER_IMG
      });
    } catch (error) {
      if (error?.response?.status === 409) {
        form.setError('name', 'Ya existe un producto con este nombre');
      } else {
        showToast(mensajeDeError(error, 'No se pudo guardar el producto'));
      }
      return;
    }
    showToast('Producto creado correctamente');
    form.reset();
    setImageUrl('');
    setInputKey(k => k + 1);
    navigate('/admin/productos');
  };

  return (
    <form className="auth-card wide" onSubmit={handleSubmit} noValidate>
      <div className="row g-3">
        <Field {...common('name')} label="Nombre del producto" type="text" placeholder="Ej: Control DualSense" />
        <Field {...common('category')} label="Categoría">
          <option value="">-- Seleccione la categoría --</option>
          {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </Field>
        <Field {...common('price')} label="Precio (CLP)" type="text" inputMode="numeric" placeholder="49990"
          hint="Solo números, sin puntos" />
        <Field {...common('stock')} label="Stock" type="text" inputMode="numeric" placeholder="10" />
        <Field {...common('desc')} as="textarea" rows={4} label="Descripción" full
          hint="Máximo 300 caracteres" />

        <div className="col-12">
          <label htmlFor="imagen" className="form-label">Imagen (opcional)</label>
          <input
            key={inputKey}
            id="imagen"
            name="imagen"
            type="file"
            accept="image/*"
            className={`form-control ${imageError ? 'is-invalid' : imageUrl ? 'is-valid' : ''}`.trim()}
            onChange={handleImage}
          />
          <div className="form-text">JPG, PNG, WEBP o AVIF, hasta 5 MB. Se reduce automáticamente.</div>
          <div className="invalid-feedback">{imageError}</div>
          {imageUrl && <img className="image-preview" src={imageUrl} alt="Vista previa del producto" />}
        </div>
      </div>
      <div className="auth-actions">
        <button type="submit" className="btn btn-primary">Crear producto</button>
      </div>
    </form>
  );
}
