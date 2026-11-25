import { useCallback, useEffect, useState } from 'react';
import { mensajeDeError } from '../services/api';

// Carga datos al montar (y cuando cambian las dependencias).
// Devuelve { datos, cargando, error, recargar }. recargar() vuelve a pedir los datos.
export function useCarga(cargar, dependencias = []) {
  const [version, setVersion] = useState(0);
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: '' });

  useEffect(() => {
    let activo = true;
    Promise.resolve()
      .then(cargar)
      .then(datos => activo && setEstado({ datos, cargando: false, error: '' }))
      .catch(e => activo && setEstado({ datos: null, cargando: false, error: mensajeDeError(e) }));
    return () => { activo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, version]);

  const recargar = useCallback(() => setVersion(v => v + 1), []);
  return { ...estado, recargar };
}
