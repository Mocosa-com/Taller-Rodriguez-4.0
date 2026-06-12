import React, { useState } from 'react';
import { Cliente, Vehiculo, ReporteTrabajador, Usuario } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  UserPlus, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  X, 
  FileCheck,
  Check,
  Car,
  ChevronDown
} from 'lucide-react';

interface ClientesProps {
  clientes: Cliente[];
  vehiculos: Vehiculo[];
  currentUser: Usuario;
  onAddCliente: (c: Omit<Cliente, 'id'>) => void;
  onUpdateCliente: (c: Cliente) => void;
  onDeleteCliente: (id: string) => void;
  onAddReporteCliente: (rep: Omit<ReporteTrabajador, 'id' | 'fecha'>) => void;
}

export function Clientes({ 
  clientes, 
  vehiculos, 
  currentUser,
  onAddCliente, 
  onUpdateCliente, 
  onDeleteCliente,
  onAddReporteCliente
}: ClientesProps) {

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [freqFilter, setFreqFilter] = useState<string>('todos');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    dui: '',
    correo: '',
    nit: '',
    nrc: '',
    frecuenciaVisita: 'Regular' as 'Frecuente' | 'Regular' | 'Muy poco',
    direccion: '',
    activo: true
  });

  // Report state (for filing client logs)
  const [reportNotes, setReportNotes] = useState('');
  const [reportType, setReportType] = useState('Incidencia');

  // Filter clients
  const filteredClientes = clientes.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = c.nombre.toLowerCase().includes(q) ||
                          c.telefono.includes(q) ||
                          c.dui.includes(q) ||
                          c.correo.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (freqFilter !== 'todos' && c.frecuenciaVisita !== freqFilter) return false;

    return true;
  });

  // Add opens
  const handleOpenAdd = () => {
    setFormData({
      nombre: '',
      telefono: '',
      dui: '',
      correo: '',
      nit: '',
      nrc: '',
      frecuenciaVisita: 'Regular',
      direccion: '',
      activo: true
    });
    setIsAddOpen(true);
  };

  // Edit opens
  const handleOpenEdit = (cli: Cliente) => {
    setSelectedCliente(cli);
    setFormData({
      nombre: cli.nombre,
      telefono: cli.telefono,
      dui: cli.dui,
      correo: cli.correo,
      nit: cli.nit || '',
      nrc: cli.nrc || '',
      frecuenciaVisita: cli.frecuenciaVisita,
      direccion: cli.direccion,
      activo: cli.activo
    });
    setIsEditOpen(true);
  };

  // Report opens (Pages 9 & 17)
  const handleOpenReport = (cli: Cliente) => {
    setSelectedCliente(cli);
    setReportNotes('');
    setReportType('Comportamiento');
    setIsReportOpen(true);
  };

  // Submits
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre) return;
    onAddCliente(formData);
    setIsAddOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCliente) return;
    onUpdateCliente({
      ...selectedCliente,
      ...formData
    });
    setIsEditOpen(false);
  };

  // Create report loop (pipes into Reports database table -> Displays on Dashboard!)
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCliente || !reportNotes.trim()) return;

    onAddReporteCliente({
      empleadoId: currentUser.id,
      empleadoNombre: selectedCliente.nombre, // We can store customer name as key for lookup
      tipo: reportType,
      resumen: `Reporte de Cliente: ${selectedCliente.nombre}`,
      notas: reportNotes
    });

    setIsReportOpen(false);
    alert('Incidencia guardada con éxito. Se verá en la sección de "Reportes guardados" de la página principal.');
  };

  // Frequency badge color guide
  const getFreqBadgeColor = (freq: string) => {
    switch (freq) {
      case 'Frecuente':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'Regular':
        return 'bg-amber-50 text-amber-700 border border-amber-100';
      default:
        return 'bg-red-50 text-red-700 border border-red-100';
    }
  };

  return (
    <div className="space-y-6 relative z-10">

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-slate-800 shadow-sm">
        <div>
          <h2 className="font-display font-medium text-white text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400 animate-pulse" />
            Base de Clientes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registro total de clientes, frecuencias de visitas y lookup rápido de vehículos activos en el taller.
          </p>
        </div>

        <button
          id="btn-open-add-cliente"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 text-xs font-black text-white bg-gradient-to-r from-orange-500 to-red-650 hover:brightness-105 px-4 py-3 rounded-xl shadow-lg shadow-orange-505/10 cursor-pointer uppercase tracking-wider scale-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Agregar cliente</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl border border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            id="search-clientes"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, teléfono, DUI o correo..."
            className="w-full text-xs font-semibold bg-slate-950 border border-slate-850 text-white rounded-xl py-2.5 pl-9 pr-4 outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <select
          id="freq-filter"
          value={freqFilter}
          onChange={(e) => setFreqFilter(e.target.value)}
          className="text-xs bg-slate-950 text-slate-300 border border-slate-850 rounded-xl py-2 px-3 outline-none cursor-pointer font-bold focus:border-orange-500"
        >
          <option value="todos" className="bg-slate-950 text-slate-200">Todas las frecuencias</option>
          <option value="Frecuente" className="bg-slate-950 text-slate-200">Frecuente</option>
          <option value="Regular" className="bg-slate-950 text-slate-200">Regular</option>
          <option value="Muy poco" className="bg-slate-950 text-slate-200">Muy poco</option>
        </select>
      </div>

      {/* Client List Grid/Table (Page 17) */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800 shadow-sm overflow-hidden">

        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-slate-800/80">
          {filteredClientes.map((c) => {
            const associatedVeh = vehiculos.find(v => v.clienteId === c.id);
            return (
              <div key={c.id} className="p-4 space-y-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-extrabold text-white text-sm">{c.nombre}</div>
                    <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5 flex-wrap">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{c.telefono}</span>
                      {c.correo && (
                        <>
                          <span className="text-slate-300">•</span>
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[140px]" title={c.correo}>{c.correo}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="font-mono text-slate-300 font-bold text-[11px] flex-shrink-0">
                    {c.dui}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${getFreqBadgeColor(c.frecuenciaVisita)}`}>
                    {c.frecuenciaVisita}
                  </span>
                  {associatedVeh ? (
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold text-[10px]">
                      <Car className="w-3.5 h-3.5" />
                      <span>{associatedVeh.marca} ({associatedVeh.placa})</span>
                    </div>
                  ) : (
                    <span className="text-slate-500 italic text-[10px]">Sin vehículo asignado</span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-2 text-orange-600 hover:text-white bg-slate-950 hover:bg-orange-600 border border-slate-800 rounded-xl transition-all cursor-pointer"
                    title="Editar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Seguro que desea eliminar a ${c.nombre}?`)) {
                        onDeleteCliente(c.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:text-white bg-slate-950 hover:bg-red-600 border border-slate-800 rounded-xl transition-all cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenReport(c)}
                    className="p-2 text-indigo-600 hover:text-white bg-slate-950 hover:bg-indigo-600 border border-slate-800 rounded-xl transition-all cursor-pointer"
                    title="Reportar comportamiento"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredClientes.length === 0 && (
            <div className="text-center py-10 font-medium text-slate-400 italic text-xs">
              Sin clientes encontrados en este momento.
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800">
                <th className="py-4 px-5 text-slate-400">Nombre / Teléfono</th>
                <th className="py-4 px-5 text-slate-400">DUI</th>
                <th className="py-4 px-5 text-slate-400">Frecuencia de visita</th>
                <th className="py-4 px-5 text-slate-400">Vehículo Asociado</th>
                <th className="py-4 px-2.5 text-right text-slate-400">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredClientes.map((c) => {
                // Page 11 constraint: "si cliente tiene vehículo que aparezca como opción"
                const associatedVeh = vehiculos.find(v => v.clienteId === c.id);

                return (
                  <tr key={c.id} className="hover:bg-slate-850/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-extrabold text-white text-sm">{c.nombre}</div>
                      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{c.telefono}</span>
                        {c.correo && (
                          <>
                            <span className="text-slate-300">•</span>
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[120px]" title={c.correo}>{c.correo}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-300 font-bold">
                      {c.dui}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${getFreqBadgeColor(c.frecuenciaVisita)}`}>
                        {c.frecuenciaVisita}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {/* Live vehicle indicator lookup (Page 11 detail) */}
                      {associatedVeh ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold">
                          <Car className="w-3.5 h-3.5" />
                          <span>{associatedVeh.marca} ({associatedVeh.placa})</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Sin vehículo asignado</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Editar */}
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-2 text-orange-600 hover:text-white bg-slate-950 hover:bg-orange-600 border border-slate-800 rounded-xl transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Eliminar (optional admin) */}
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Seguro que desea eliminar a ${c.nombre}?`)) {
                              onDeleteCliente(c.id);
                            }
                          }}
                          className="p-2 text-red-600 hover:text-white bg-slate-950 hover:bg-red-600 border border-slate-800 rounded-xl transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Reportar (Inserts customer logs, Page 3/17) */}
                        <button
                          onClick={() => handleOpenReport(c)}
                          className="p-2 text-indigo-600 hover:text-white bg-slate-950 hover:bg-indigo-600 border border-slate-800 rounded-xl transition-all cursor-pointer"
                          title="Reportar comportamiento"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredClientes.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 font-medium text-slate-400 italic">
                    Sin clientes encontrados en este momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Modal 1: Agregar Cliente (Page 18) */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 shadow-2xl w-full max-w-lg rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-200">
            
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-base flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Agregar Cliente Nuevo
                </h3>
                <p className="text-[11px] opacity-90 mt-0.5">Control de registros fiscales del adquirente.</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-white hover:opacity-80 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej. Santiago"
                    className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl p-2.5 outline-none focus:border-orange-550 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    placeholder="Ej. 7850-2412"
                    className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl p-2.5 outline-none focus:border-orange-550 text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">DUI *</label>
                  <input
                    type="text"
                    required
                    value={formData.dui}
                    onChange={(e) => setFormData(prev => ({ ...prev, dui: e.target.value }))}
                    placeholder="Ej. 05128362-9"
                    className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl p-2.5 outline-none focus:border-orange-550 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData(prev => ({ ...prev, correo: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                    className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl p-2.5 outline-none focus:border-orange-550 text-white"
                  />
                </div>
              </div>

              {/* Fiscal additions */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">NIT (mínimo para Crédito Fiscal)</label>
                  <input
                    type="text"
                    value={formData.nit}
                    onChange={(e) => setFormData(prev => ({ ...prev, nit: e.target.value }))}
                    placeholder="0614-230985-102-1"
                    className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl p-2.5 outline-none focus:border-orange-550 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">NRC (Nº Registro Contribuyente)</label>
                  <input
                    type="text"
                    value={formData.nrc}
                    onChange={(e) => setFormData(prev => ({ ...prev, nrc: e.target.value }))}
                    placeholder="Ej. 123456-7"
                    className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl p-2.5 outline-none focus:border-orange-550 text-white font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <label className="block text-xs font-semibold text-slate-400 mb-1">Frecuencia de visita</label>
                <select
                  value={formData.frecuenciaVisita}
                  onChange={(e) => setFormData(prev => ({ ...prev, frecuenciaVisita: e.target.value as any }))}
                  className="w-full text-xs bg-slate-950 border border-slate-850 text-slate-200 rounded-xl p-2.5 outline-none focus:border-orange-550 font-semibold"
                >
                  <option value="Frecuente" className="bg-slate-950 text-white">Frecuente</option>
                  <option value="Regular" className="bg-slate-950 text-white">Regular</option>
                  <option value="Muy poco" className="bg-slate-950 text-white">Muy poco</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Dirección fiscal / residencia</label>
                <textarea
                  value={formData.direccion}
                  rows={2}
                  onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                  placeholder="Dirección del cliente..."
                  className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl p-3 outline-none focus:border-orange-550 text-white"
                />
              </div>

              <div className="flex items-center gap-2 border-t border-slate-800 pt-3">
                <input
                  type="checkbox"
                  id="cli-activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                  className="w-4 h-4 text-orange-500 bg-slate-950 border-slate-800 rounded focus:ring-orange-500"
                />
                <label htmlFor="cli-activo" className="text-xs font-semibold text-slate-300 cursor-pointer select-none">
                  Cliente activo en el taller
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="text-xs font-semibold text-slate-300 bg-slate-850 hover:bg-slate-800 border border-slate-800 px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-xs font-black text-white bg-gradient-to-r from-orange-500 to-red-600 hover:brightness-105 px-5 py-2.5 rounded-xl shadow-lg cursor-pointer uppercase tracking-wider"
                >
                  Agregar cliente
                </button>
              </div>

            </form>

          </div>
        </div>
      )}


      {/* Modal 2: Editar Cliente */}
      {isEditOpen && selectedCliente && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden rounded-3xl animate-in fade-in zoom-in-95 duration-250 text-slate-200">
            
            <div className="bg-slate-950 p-5 flex justify-between items-center border-b border-slate-800">
              <div>
                <h3 className="font-display font-medium text-base flex items-center gap-2 text-white">
                  <Edit3 className="w-5 h-5 text-orange-400" />
                  Editar Registro de Cliente
                </h3>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-violet-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl p-2.5 outline-none focus:border-orange-550 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl p-2.5 outline-none focus:border-orange-550 text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">DUI</label>
                  <input
                    type="text"
                    required
                    value={formData.dui}
                    onChange={(e) => setFormData(prev => ({ ...prev, dui: e.target.value }))}
                    className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl p-2.5 outline-none focus:border-orange-550 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Correo</label>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData(prev => ({ ...prev, correo: e.target.value }))}
                    className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl p-2.5 outline-none focus:border-orange-550 text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">NIT</label>
                  <input
                    type="text"
                    value={formData.nit}
                    onChange={(e) => setFormData(prev => ({ ...prev, nit: e.target.value }))}
                    className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl p-2.5 outline-none focus:border-orange-550 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">NRC</label>
                  <input
                    type="text"
                    value={formData.nrc}
                    onChange={(e) => setFormData(prev => ({ ...prev, nrc: e.target.value }))}
                    className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl p-2.5 outline-none focus:border-orange-550 text-white font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <label className="block text-xs font-semibold text-slate-400 mb-1">Frecuencia</label>
                <select
                  value={formData.frecuenciaVisita}
                  onChange={(e) => setFormData(prev => ({ ...prev, frecuenciaVisita: e.target.value as any }))}
                  className="w-full text-xs bg-slate-950 border border-slate-850 text-slate-200 rounded-xl p-2.5 outline-none focus:border-orange-550 font-semibold"
                >
                  <option value="Frecuente" className="bg-slate-950 text-white">Frecuente</option>
                  <option value="Regular" className="bg-slate-950 text-white">Regular</option>
                  <option value="Muy poco" className="bg-slate-950 text-white">Muy poco</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Dirección fiscal</label>
                <textarea
                  value={formData.direccion}
                  rows={2}
                  onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                  className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl p-3 outline-none focus:border-orange-550 text-white font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="text-xs font-semibold text-slate-300 bg-slate-850 hover:bg-slate-800 border border-slate-800 px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="text-xs font-black text-white bg-gradient-to-r from-orange-500 to-red-655 hover:brightness-105 px-5 py-2.5 rounded-xl shadow-lg cursor-pointer uppercase tracking-wider"
                >
                  Guardar cambios
                </button>
              </div>

            </form>

          </div>
        </div>
      )}


      {/* Modal 3: Reportar comportamiento Cliente (Page 9/17 style) */}
      {isReportOpen && selectedCliente && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-slate-200">
          <div className="bg-slate-900 border border-slate-800 shadow-2xl w-full max-w-md rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-250">
            
            <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
                <div>
                  <h3 className="font-display font-bold text-base">
                    Reporte – {selectedCliente.nombre}
                  </h3>
                  <p className="text-[11px] opacity-90 mt-0.5">Log de incidencias disciplinarias o mala paga.</p>
                </div>
              </div>
              <button onClick={() => setIsReportOpen(false)} className="text-white hover:opacity-85 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
              
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-xs text-slate-300 space-y-1">
                <p><span className="font-bold text-slate-500">Cliente:</span> {selectedCliente.nombre}</p>
                <p><span className="font-bold text-slate-500">Teléfono:</span> {selectedCliente.telefono}</p>
                <p><span className="font-bold text-slate-500">DUI:</span> {selectedCliente.dui}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">Tipo de reporte</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 text-slate-200 rounded-xl p-2.5 outline-none focus:border-red-500 font-semibold"
                >
                  <option value="Mala conducta" className="bg-slate-950 text-white">Mala conducta</option>
                  <option value="Mala paga" className="bg-slate-950 text-white">Mala paga (Moroso)</option>
                  <option value="Reclamaciones injustificadas" className="bg-slate-950 text-white">Reclamaciones injustificadas</option>
                  <option value="Insolvente" className="bg-slate-950 text-white">Insolvente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Notas del reporte</label>
                <textarea
                  required
                  rows={4}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="Escribe observaciones, motivo del reporte o comportamiento en el taller..."
                  className="w-full text-xs bg-slate-950 border border-slate-850 text-white rounded-xl p-3 outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReportOpen(false)}
                  className="text-xs font-semibold text-slate-300 bg-slate-850 hover:bg-slate-800 border border-slate-800 px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-xs font-black text-white bg-red-650 hover:brightness-105 px-5 py-2.5 rounded-xl shadow-lg cursor-pointer uppercase tracking-wider"
                >
                  Guardar reporte
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
