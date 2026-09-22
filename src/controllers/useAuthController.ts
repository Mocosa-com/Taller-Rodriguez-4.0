import { FormEvent, useEffect, useState } from 'react';
import { Usuario } from '../types';
import { LocalDataBase } from '../mockData';
import { authenticateUser } from '../models/authModel';

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

export function useAuthController(employees: Usuario[]): AuthControllerResult {
  const [isLogged, setIsLogged] = useState(() => LocalDataBase.isLogged());
  const [currentUser, setCurrentUser] = useState(() => LocalDataBase.getCurrentUser());
  const [loginUserDui, setLoginUserDui] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    LocalDataBase.saveLogged(isLogged);
  }, [isLogged]);

  useEffect(() => {
    LocalDataBase.saveCurrentUser(currentUser);
  }, [currentUser]);

  const setAuthenticatedUser = (employee: Usuario) => {
    setCurrentUser(employee);
    setIsLogged(true);
    setLoginError('');
  };

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    const employee = authenticateUser(employees, {
      identifier: loginUserDui,
      password: loginPassword
    });

    if (!employee) {
      const matchingEmployee = employees.find((candidate) =>
        candidate.dui.replace(/\D/g, '') === loginUserDui.replace(/\D/g, '') ||
        candidate.nombre.toLowerCase() === loginUserDui.trim().toLowerCase()
      );
      setLoginError(matchingEmployee
        ? 'Contraseña incorrecta. (Pruebe con "123").'
        : 'DUI o nombre de empleado no identificado.');
      return;
    }

    setAuthenticatedUser(employee);
  };

  const handleQuickLogin = (employee: Usuario) => setAuthenticatedUser(employee);

  const handleSwitchUserRole = (employee: Usuario) => {
    setCurrentUser(employee);
    alert(`Sincronizado perfil de sesión: Se cambió a rol de [${employee.cargo}] con éxito.`);
  };

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
    handleLogout: () => setIsLogged(false),
    handleSwitchUserRole,
    updateCurrentUser: setCurrentUser
  };
}