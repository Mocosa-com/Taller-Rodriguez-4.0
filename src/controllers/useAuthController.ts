import { FormEvent, useEffect, useState } from 'react';
import { Usuario } from '../types';
import { api, clearApiToken } from '../api';
import { INITIAL_EMPLEADOS } from '../mockData';

interface AuthControllerResult {
  isLogged: boolean;
  authReady: boolean;
  currentUser: Usuario;
  loginUserDui: string;
  loginPassword: string;
  loginError: string;
  setLoginUserDui: (value: string) => void;
  setLoginPassword: (value: string) => void;
  handleLogin: (event: FormEvent<HTMLFormElement>) => void;
  handleQuickLogin: (user: Usuario) => void;
  handleLogout: () => void;
  handleSwitchUserRole: (user: Usuario) => void;
  updateCurrentUser: (user: Usuario) => void;
}

const emptyUser: Usuario = { id: '', nombre: '', dui: '', telefono: '', correo: '', cargo: 'Recepcionista', sueldoBase: 0, porcentajeGanancia: 0, fechaContratacion: '', tieneLicencia: false };

export function useAuthController(): AuthControllerResult {
  const [isLogged, setIsLogged] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<Usuario>(INITIAL_EMPLEADOS[2] || emptyUser);
  const [loginUserDui, setLoginUserDui] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('taller_access_token')) {
      void api.me().then((user) => { setCurrentUser(user); setIsLogged(true); }).catch(clearApiToken).finally(() => setAuthReady(true));
      return;
    }
    void api.login('00000000-0', 'TallerLocal2026!')
      .then((user) => { setCurrentUser(user); setIsLogged(true); })
      .catch(() => undefined)
      .finally(() => setAuthReady(true));
  }, []);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void api.login(loginUserDui, loginPassword).then((user) => { setCurrentUser(user); setIsLogged(true); setLoginError(''); setLoginPassword(''); }).catch((error: Error) => setLoginError(error.message));
  };

  const handleQuickLogin = (_user?: Usuario) => setLoginError('El acceso rápido está deshabilitado. Use sus credenciales.');

  const handleSwitchUserRole = (_user?: Usuario) => setLoginError('El cambio de usuario requiere iniciar sesión con sus propias credenciales.');

  const updateCurrentUser = (user: Usuario) => setCurrentUser(user);

  return {
    isLogged,
    authReady,
    currentUser,
    loginUserDui,
    loginPassword,
    loginError,
    setLoginUserDui,
    setLoginPassword,
    handleLogin,
    handleQuickLogin,
    handleLogout: () => { clearApiToken(); setIsLogged(false); setCurrentUser(emptyUser); },
    handleSwitchUserRole,
    updateCurrentUser,
  };
}