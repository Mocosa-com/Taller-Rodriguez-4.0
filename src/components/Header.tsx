import React, { useState, useEffect } from 'react';
import { Usuario, TurnoCaja } from '../types';
import { Shield, Clock, Landmark, User, RefreshCw, LogOut, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';

interface HeaderProps {
  currentUser: Usuario;
  activeTurno: TurnoCaja | null;
  employees: Usuario[];
  onChangeUser: (user: Usuario) => void;
  onLogout: () => void;
}

export function Header({ currentUser, activeTurno, employees, onChangeUser, onLogout }: HeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSystemTime = () => {
    // Return a neat local-looking string
    return time.toLocaleTimeString('es-SV', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Súper Usuario':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      case 'Administrador':
        return 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30';
      case 'Recepcionista':
        return 'bg-violet-500/20 text-violet-400 border border-violet-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-450 border border-emerald-500/30';
    }
  };

  return (
    <header id="app-header" className="bg-slate-900/40 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 relative">
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-violet-500/5 blur-[80px] rounded-full pointer-events-none"></div>

      {/* Welcome Left Row */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="p-2 bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white rounded-xl shadow-md shadow-violet-500/20">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display font-semibold text-lg text-white leading-tight">
            ¡Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">{currentUser.nombre}</span>!
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-wide uppercase ${getRoleBadgeColor(currentUser.cargo)}`}>
              {currentUser.cargo}
            </span>
            <span className="text-slate-800">|</span>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-violet-400" />
              <span className="font-mono font-bold">{formatSystemTime()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbox on the Right */}
      <div className="flex flex-wrap items-center gap-3 relative z-10">
        {/* Quick Role Tester Switcher */}
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-xl p-1.5 px-3">
          <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider hidden sm:inline flex-shrink-0">
            Vista Rápida:
          </span>
          <select
            id="role-quick-switcher"
            value={currentUser.id}
            onChange={(e) => {
              const selected = employees.find(emp => emp.id === e.target.value);
              if (selected) onChangeUser(selected);
            }}
            className="text-xs bg-slate-900 text-slate-200 border border-slate-800 rounded-lg py-1 px-2 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none cursor-pointer font-medium"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id} className="bg-slate-950 text-slate-300">
                {emp.nombre} ({emp.cargo})
              </option>
            ))}
          </select>
        </div>

        {/* Caja State Badge */}
        {activeTurno && activeTurno.estado === 'Abierta' ? (
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl px-3 py-1.5 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <Landmark className="w-3.5 h-3.5 text-emerald-400" />
            <span>Caja Abierta (T-{activeTurno.turnoNumero})</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl px-3 py-1.5 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-rose-450"></span>
            <Landmark className="w-3.5 h-3.5 text-rose-450" />
            <span>Caja Cerrada</span>
          </div>
        )}

        {/* Logout button */}
        <button
          id="btn-logout"
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-400 transition-colors bg-slate-950/40 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/35 px-3 py-2 rounded-xl cursor-pointer"
          title="Cerrar sesión"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
