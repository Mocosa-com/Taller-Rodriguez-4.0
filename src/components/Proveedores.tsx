import React, { useState } from 'react';
import { Proveedor } from '../types';
import { 
  Truck, 
  Plus, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  X, 
  Edit3
} from 'lucide-react';

interface ProveedoresProps {
  proveedores: Proveedor[];
  onAddProveedor: (p: Omit<Proveedor, 'id'>) => void;
  onUpdateProveedor: (p: Proveedor) => void;
  onDeleteProveedor: (id: string) => void;
}

export function Proveedores({ 
  proveedores, 
  onAddProveedor, 
  onUpdateProveedor, 
  onDeleteProveedor 
}: ProveedoresProps) {

  // Left form
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [locacion, setLocacion] = useState('San Salvador');
  const [correo, setCorreo] = useState('');
  const [tipo, setTipo] = useState<'Nacional' | 'Internacional'>('Nacional');
  const [pais, setPais] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState<'Todos' | 'Nacional' | 'Internacional'>('Todos');

  // Modals
  const [selectedProv, setSelectedProv] = useState<Proveedor | null>(null);

  // Departments list El Salvador
  const departamentos = [
    'San Salvador', 'Santa Ana', 'San Miguel', 'La Libertad', 'Sonsonate', 
    'Ahuachapán', 'La Paz', 'La Unión', 'Cuscatlán', 'Chalatenango', 
    'Cabañas', 'San Vicente', 'Usulután', 'Morazán'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) return;
    onAddProveedor({
      nombre,
      telefono: telefono || '2200-0000',
      locacion: tipo === 'Nacional' ? locacion : (pais || 'Externo'),
      correo: correo || 'ventas@proveedor.com',
      tipo,
      pais: tipo === 'Internacional' ? (pais || 'Internacional') : undefined
    });

    setNombre('');
    setTelefono('');
    setCorreo('');
    setPais('');
    setTipo('Nacional');
    setLocacion('San Salvador');
    alert('Proveedor registrado con éxito.');
  };

  const handleOpenEdit = (prov: Proveedor) => {
    setSelectedProv(prov);
    setNombre(prov.nombre);
    setTelefono(prov.telefono);
    setLocacion(prov.locacion);
    setCorreo(prov.correo);
    setTipo(prov.tipo || 'Nacional');
    setPais(prov.pais || '');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProv) return;
    onUpdateProveedor({
      ...selectedProv,
      nombre,
      telefono,
      locacion: tipo === 'Nacional' ? locacion : (pais || 'Externo'),
      correo,
      tipo,
      pais: tipo === 'Internacional' ? pais : undefined
    });

    setSelectedProv(null);
    setNombre('');
    setTelefono('');
    setCorreo('');
    setPais('');
    setTipo('Nacional');
  };

  return (
    <div className="space-y-6 relative z-10">

      <div className="bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-slate-800">
        <h2 className="font-display font-medium text-white text-lg flex items-center gap-2">
          <Truck className="w-5 h-5 text-violet-400 animate-pulse" />
          Módulo de Proveedores de Almacén
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Registro de socios comerciales de distribución, locaciones geográficas en El Salvador e información tributaria de contactos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Form: "Agregar proveedor" (Page 17) */}
        <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-sm text-white pb-3 border-b border-slate-800/80 uppercase tracking-widest">
            {selectedProv ? 'Editar Proveedor' : 'Agregar proveedor'}
          </h3>

          <form onSubmit={selectedProv ? handleEditSubmit : handleSubmit} className="space-y-4 text-xs font-semibold text-slate-300">
            <div>
              <label className="block mb-1.5 text-slate-400">Nombre del proveedor *</label>
              <input
                type="text"
                required
                value={nombre}
                 onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Taller Supply SV"
                className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-slate-400">Tipo de Proveedor</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setTipo('Nacional')}
                  className={`py-1.5 rounded-lg text-center font-bold transition-all ${
                    tipo === 'Nacional' 
                      ? 'bg-violet-600 text-white' 
                      : 'text-slate-400 hover:text-white hover:bg-violet-600'
                  }`}
                >
                  Nacional
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('Internacional')}
                  className={`py-1.5 rounded-lg text-center font-bold transition-all ${
                    tipo === 'Internacional' 
                      ? 'bg-violet-600 text-white' 
                      : 'text-slate-400 hover:text-white hover:bg-violet-600'
                  }`}
                >
                  Internacional
                </button>
              </div>
            </div>

            {tipo === 'Nacional' ? (
              <div>
                <label className="block mb-1.5 font-sans text-slate-400">Locación de entrega / departamento</label>
                <select
                  value={locacion}
                  onChange={(e) => setLocacion(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-250 rounded-xl p-2.5 outline-none focus:border-violet-500 transition-colors font-semibold"
                >
                  {departamentos.map(dep => (
                    <option key={dep} value={dep} className="bg-slate-950 text-slate-100">{dep}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block mb-1.5 font-sans text-slate-400">País de origen / procedencia *</label>
                <input
                  type="text"
                  required
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  placeholder="Ej. Alemania, Japón, España, etc."
                  className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-violet-500 transition-colors font-semibold"
                />
                <p className="text-[10px] text-slate-500 mt-1">Si es internacional, se registrará bajo el país indicado.</p>
              </div>
            )}

            <div>
              <label className="block mb-1.5 font-sans text-slate-400">Número de Teléfono</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="2234-9871"
                className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-violet-500 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-slate-400">Correo electrónico corporativo</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="contacto@empresa.com"
                className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="flex gap-2">
              {selectedProv && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProv(null);
                    setNombre('');
                    setTelefono('');
                    setCorreo('');
                    setPais('');
                    setTipo('Nacional');
                    setLocacion('San Salvador');
                  }}
                  className="flex-1 py-3 text-center text-slate-300 bg-slate-850 hover:bg-slate-800 border border-slate-800 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 text-center text-white font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-105 rounded-xl shadow-lg shadow-violet-500/15 cursor-pointer uppercase tracking-wider text-xs"
              >
                {selectedProv ? 'Guardar' : 'Agregar'}
              </button>
            </div>

          </form>
        </div>

        {/* Right Table View list (8 spans) */}
        <div className="lg:col-span-8 bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-slate-800 flex flex-col space-y-4 shadow-sm">
          
          {/* Filters & Search Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            {/* National / International selector */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 gap-1">
              {(['Todos', 'Nacional', 'Internacional'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterTipo(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterTipo === t 
                      ? 'bg-violet-600 text-white' 
                      : 'text-slate-400 hover:text-white hover:bg-violet-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Dynamic Search by Country/Name */}
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={filterTipo === 'Internacional' ? 'Buscar país (ej. Alemania)...' : 'Buscar por nombre o locación...'}
                className="w-full text-xs font-semibold bg-slate-950 border border-slate-800 text-white rounded-xl py-2 pl-3.5 pr-4 outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/40 text-[10px] font-bold text-slate-450 uppercase tracking-widest border-b border-slate-800">
                  <th className="py-3.5 px-4 text-slate-400">Proveedor</th>
                  <th className="py-3.5 px-4 text-slate-400">Tipo</th>
                  <th className="py-3.5 px-4 text-slate-400">Locación / País</th>
                  <th className="py-3.5 px-4 text-right text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {proveedores.filter(p => {
                  const provTipo = p.tipo || 'Nacional';
                  if (filterTipo !== 'Todos' && provTipo !== filterTipo) return false;
                  
                  const query = searchQuery.toLowerCase();
                  if (!query) return true;
                  
                  const matchesNombre = p.nombre.toLowerCase().includes(query);
                  const matchesLocacion = p.locacion.toLowerCase().includes(query);
                  const matchesPais = p.pais ? p.pais.toLowerCase().includes(query) : false;
                  const matchesCorreo = p.correo ? p.correo.toLowerCase().includes(query) : false;
                  
                  return matchesNombre || matchesLocacion || matchesPais || matchesCorreo;
                }).map((p) => {
                  const provTipo = p.tipo || 'Nacional';
                  return (
                    <tr key={p.id} className="hover:bg-slate-850/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-white text-sm">{p.nombre}</div>
                        <div className="text-[10px] text-slate-450 font-semibold flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 bg-slate-950/80 border border-slate-850 px-2 py-0.5 rounded-md text-slate-100 font-mono">
                            <Phone className="w-3 h-3 text-violet-500" />
                            <span>{p.telefono}</span>
                          </span>
                          {p.correo && (
                            <span className="flex items-center gap-1 bg-slate-950/80 border border-slate-850 px-2 py-0.5 rounded-md text-slate-100">
                              <Mail className="w-3.5 h-3.5 text-violet-500" />
                              <span>{p.correo}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-300">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          provTipo === 'Nacional' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                            : 'bg-violet-500/10 text-violet-300 border border-violet-500/15'
                        }`}>
                          {provTipo}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-300">
                        {p.tipo === 'Internacional' ? (
                          <span className="inline-flex items-center gap-1 bg-violet-500/10 text-violet-300 border border-violet-500/15 px-3 py-1 rounded-full text-[10px]">
                            <MapPin className="w-3.5 h-3.5 text-violet-400 font-bold" />
                            {p.pais || 'No especificado'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-950/80 text-slate-3 w-max border border-slate-800 px-3 py-1 rounded-full text-[10px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            El Salvador ({p.locacion})
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right animate-none">
                        <div className="flex justify-end gap-1.5">
                          
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-2 text-orange-400 bg-slate-950 hover:bg-orange-650/30 border border-slate-800 rounded-xl transition-all cursor-pointer"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
  
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Seguro que desea eliminar al proveedor ${p.nombre}?`)) {
                                onDeleteProveedor(p.id);
                              }
                            }}
                            className="p-2 text-red-400 bg-slate-950 hover:bg-red-650/30 border border-slate-800 rounded-xl transition-all cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
  
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
