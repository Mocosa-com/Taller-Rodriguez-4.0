import { FormEvent, useEffect, useState } from 'react';
import { Usuario } from '../types';
import { api, clearApiToken } from '../api';

interface AuthControllerResult {
  isLogged: boolean;
  currentUser: Usuario;
  loginUserDui: string;
  loginPassword: string;
  loginError: string;
  setLoginUserDui: (value: string) => void;
  setLoginPassword: (value: string) => void;
  handleLogin: (event: FormEvent) => void;
  handleQuickLogin: (employee: Usuario) => void;
  handleLogout: () => void;
  handleSwitchUserRole: (employee: Usuario) => void;
  updateCurrentUser: (employee: Usuario) => void;
}

const emptyUser: Usuario = { id: '', nombre: '', dui: '', telefono: '', correo: '', cargo: 'Recepcionista', sueldoBase: 0, porcentajeGanancia: 0, fechaContratacion: '', tieneLicencia: false };

export function useAuthController(): AuthControllerResult {
  const [isLogged, setIsLogged] = useState(false);
  const [currentUser, setCurrentUser] = useState(emptyUser);
  const [loginUserDui, setLoginUserDui] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('taller_access_token')) return;
    void api.me().then((user) => { setCurrentUser(user); setIsLogged(true); }).catch(clearApiToken);
  }, []);

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    void api.login(loginUserDui, loginPassword).then((user) => { setCurrentUser(user); setIsLogged(true); setLoginError(''); setLoginPassword(''); }).catch((error: Error) => setLoginError(error.message));
  };

  const handleQuickLogin = () => setLoginError('El acceso rápido está deshabilitado. Use sus credenciales.');

  const handleSwitchUserRole = () => setLoginError('El cambio de usuario requiere iniciar sesión con sus propias credenciales.');

  return {
    isLogged,
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
    updateCurrentUser: setCurrentUser
  };
}