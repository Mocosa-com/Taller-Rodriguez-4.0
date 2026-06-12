import React, { useState } from 'react';
import { Usuario } from '../types';
import { 
  User, 
  Phone, 
  KeyRound, 
  Image, 
  Check, 
  Lock, 
  Unlock,
  Shield,
  Briefcase,
  DollarSign,
  Calendar,
  LogOut,
  Mail
} from 'lucide-react';

interface PerfilEditarProps {
  currentUser: Usuario;
  onUpdateCurrentUser: (user: Usuario) => void;
  onLogout: () => void;
}

export function PerfilEditar({ currentUser, onUpdateCurrentUser, onLogout }: PerfilEditarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState(currentUser.nombre);
  const [telefono, setTelefono] = useState(currentUser.telefono);
  const [correo, setCorreo] = useState(currentUser.correo || '');
  const [password, setPassword] = useState(currentUser.password || '123');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCurrentUser({
      ...currentUser,
      nombre,
      telefono,
      correo: correo || undefined,
      password,
      avatarUrl
    });
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 relative z-10">
      
      {/* Upper Title Block */}
      <div className="bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-slate-800 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"></div>
        <h2 className="font-display font-medium text-white text-lg flex items-center justify-center gap-2">
          <User className="w-5 h-5 text-violet-400 animate-pulse" />
          Mi Perfil de Usuario
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Visualice su credencial de taller y actualice su contraseña o información de contacto.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-800 space-y-6 relative">
        {showSuccess && (
          <div className="absolute top-4 left-4 right-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-3 rounded-2xl text-xs flex items-center gap-2 justify-center font-bold animate-bounce z-20">
            <Check className="w-4 h-4 text-emerald-400" />
            ¡Perfil y contraseña actualizados con éxito!
          </div>
        )}

        {/* Big Avatar */}
        <div className="text-center space-y-3">
          <div className="relative inline-block group/avatar">
            <img 
              src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
              alt={nombre} 
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-violet-500 shadow-xl transition-transform hover:scale-105 duration-300"
            />
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-slate-900"></span>
            <button
              type="button"
              onClick={() => alert("Simulación: Cambiar foto de perfil")}
              className="absolute inset-0 rounded-full bg-black/50 text-white flex items-center justify-center gap-1 text-[10px] font-black opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
            >
              <Image className="w-4 h-4" />
              Editar
            </button>
          </div>
          <div>
            <h3 className="font-display font-black text-white text-xl tracking-tight">{currentUser.nombre}</h3>
            <span className="inline-flex items-center gap-1 bg-violet-500/10 text-violet-300 border border-violet-500/20 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest mt-1">
              <Shield className="w-3.5 h-3.5" />
              {currentUser.cargo}
            </span>
          </div>
        </div>

        {!isEditing ? (
          /* View mode information */
          <div className="space-y-4">
            <div className="bg-slate-950/60 p-4 rounded-2xl space-y-3 border border-slate-800 text-xs font-semibold text-slate-300 divide-y divide-slate-850/60">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Cargo:
                </span>
                <span className="text-white">{currentUser.cargo}</span>
              </div>
              <div className="flex justify-between items-center pt-2.5">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" /> DUI Tributario:
                </span>
                <span className="text-white font-mono">{currentUser.dui}</span>
              </div>
              <div className="flex justify-between items-center pt-2.5">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> Teléfono:
                </span>
                <span className="text-white font-mono">{currentUser.telefono || 'No registrado'}</span>
              </div>
              <div className="flex justify-between items-center pt-2.5">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> Correo electrónico:
                </span>
                <span className="text-white lowercase">{currentUser.correo || 'No registrado'}</span>
              </div>
              <div className="flex justify-between items-center pt-2.5">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" /> Contraseña Secreta:
                </span>
                <span className="text-white font-mono tracking-widest">••••••</span>
              </div>
              <div className="flex justify-between items-center pt-2.5">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500" /> Sueldo Nominal:
                </span>
                <span className="text-emerald-400 font-mono font-bold">${currentUser.sueldoBase}</span>
              </div>
              <div className="flex justify-between items-center pt-2.5">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Alta de Contrato:
                </span>
                <span className="text-slate-400 font-mono">{currentUser.fechaContratacion}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full text-center text-xs font-black py-3 text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 rounded-xl cursor-pointer uppercase transition-all tracking-wider shadow-lg shadow-violet-500/10"
            >
              Editar datos & Contraseña
            </button>
          </div>
        ) : (
          /* Editable mode form */
          <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-slate-300">
            
            <div>
              <label className="block mb-1.5 text-slate-400">Nombre Completo</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 pl-9 outline-none focus:border-violet-500 transition-colors"
                />
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-slate-400">Teléfono móvil</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 pl-9 outline-none focus:border-violet-500 transition-colors font-mono"
                />
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-slate-400">Correo electrónico</label>
              <div className="relative">
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 pl-9 outline-none focus:border-violet-500 transition-colors"
                  placeholder="correo@ejemplo.com"
                />
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-slate-400">Contraseña de acceso *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduzca nueva contraseña"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 pl-9 pr-10 outline-none focus:border-violet-500 transition-colors font-mono font-bold"
                />
                <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-violet-600"
                >
                  {showPassword ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Con esta clave podrá entrar al taller en la pantalla de inicio.</p>
            </div>

            <div>
              <label className="block mb-2 text-slate-400">Foto / Avatar</label>
              <div className="flex justify-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="relative inline-block group/avatar">
                  <img 
                    src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                    alt="Avatar" 
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-full object-cover border-4 border-violet-500"
                  />
                  <button
                    type="button"
                    onClick={() => alert("Simulación: Cambiar foto de perfil")}
                    className="absolute inset-0 rounded-full bg-black/50 text-white flex items-center justify-center gap-1 text-[9px] font-black opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Image className="w-3.5 h-3.5" />
                    Editar
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setNombre(currentUser.nombre);
                  setTelefono(currentUser.telefono);
                  setCorreo(currentUser.correo || '');
                  setPassword(currentUser.password || '123');
                  setAvatarUrl(currentUser.avatarUrl || '');
                  setIsEditing(false);
                }}
                className="flex-1 py-3 text-center text-slate-300 bg-slate-850 hover:bg-slate-800 border border-slate-800 font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 text-center text-white font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 rounded-xl shadow-lg shadow-emerald-500/10 uppercase tracking-wider"
              >
                Guardar Cambios
              </button>
            </div>

          </form>
        )}

        {/* Separator logout */}
        <div className="pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-red-500/10 border border-slate-850 hover:border-red-500/20 text-red-400 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            Cerrar sesión activa
          </button>
        </div>

      </div>

    </div>
  );
}
