import { createContext, useContext, useEffect, useState } from 'react';
import { EVENTO_SESION_EXPIRADA, tokens } from '../services/api';
import { authService } from '../services/authService';
import { usuarioService } from '../services/usuarioService';

const AuthContext = createContext(null);

const SESSION_KEY = 'storego_session';

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }) {
  // La sesión sobrevive a recargas: los datos de la sesión y los tokens están en localStorage.
  const [session, setSession] = useState(() => readJSON(SESSION_KEY, null));

  // api.js avisa cuando el token venció y no se pudo renovar: se cierra la sesión.
  useEffect(() => {
    const alExpirar = () => {
      localStorage.removeItem(SESSION_KEY);
      setSession(null);
    };
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
  }, []);

  // Devuelve la sesión, o null si el correo o la contraseña son incorrectos.
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      setSession(data);
      return data;
    } catch (error) {
      if (error?.response?.status === 401) return null;
      throw error;
    }
  };

  const logout = () => {
    tokens.borrar();
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  // Tienda: registro público (CLIENTE). Panel: el administrador crea el usuario con su rol.
  const registerUser = (user, { admin = false } = {}) =>
    admin ? usuarioService.crear(user) : authService.registro(user);

  return (
    <AuthContext.Provider value={{ session, login, logout, registerUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
