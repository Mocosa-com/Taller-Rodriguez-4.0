import React, { useState } from 'react';
import { Vehiculo, Cliente, Usuario } from '../types';
import { 
  Car, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  Edit3, 
  Trash2, 
  Wrench, 
  Calendar, 
  Tag, 
  User, 
  Image as ImageIcon,
  Check,
  X,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';

interface VehiculosProps {
  vehiculos: Vehiculo[];
  clientes: Cliente[];
  empleados: Usuario[];
  currentUser: Usuario;
  onAddVehiculo: (v: Omit<Vehiculo, 'id' | 'trabajosRealizados'>) => void;
  onUpdateVehiculo: (v: Vehiculo) => void;
  onAddClienteRapido: (c: { nombre: string; telefono: string; dui: string; correo: string }) => string;
}

export function Vehiculos({ 
  vehiculos, 
  clientes, 
  empleados, 
  currentUser,
  onAddVehiculo, 
  onUpdateVehiculo,
  onAddClienteRapido
}: VehiculosProps) {
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [showDelivered, setShowDelivered] = useState<boolean>(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);

  // Form states for Add/Edit
  const [formData, setFormData] = useState({
    modelo: '',
    marca: '',
    placa: '',
    clienteId: '',
    empleadoId: '',
    año: 2020,
    estado: 'En revisión' as 'En revisión' | 'En espera' | 'Entregado',
    fechaIngreso: new Date().toISOString().split('T')[0],
    fechaSalida: '',
    diagnostico: '',
    fotoUrl: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=400',
    tarjetaUrlFront: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400',
    tarjetaUrlBack: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400'
  });

  // Client quick creation modal inside Add modal
  const [showQuickClient, setShowQuickClient] = useState(false);
  const [quickClientForm, setQuickClientForm] = useState({
    nombre: '',
    telefono: '',
    dui: '',
    correo: ''
  });

  // Jobs uploader state for Edit Modal
  const [newCompletedJob, setNewCompletedJob] = useState('');

  // Year restrictions (Page 4: Año del vehículo: Restringir no futuro, no muy al pasado)
  const currentYear = 2026;
  const minYear = 1950;

  // Mechanics list (empleados with role Mecánico or any)
  const mecanicos = empleados.filter(e => e.cargo === 'Mecánico' || e.cargo === 'Súper Usuario');

  // Filter & Search active list of vehicles
  const filteredVehiculos = vehiculos.filter(v => {
    // Delivered history toggle matching Page 3 Switch
    const matchesDeliverToggle = showDelivered ? v.estado === 'Entregado' : v.estado !== 'Entregado';
    if (!matchesDeliverToggle) return false;

    // Search query matches: Placa, Modelo, Marca or Client Name
    const client = clientes.find(c => c.id === v.clienteId);
    const clientName = client ? client.nombre.toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = v.placa.toLowerCase().includes(query) ||
                          v.marca.toLowerCase().includes(query) ||
                          v.modelo.toLowerCase().includes(query) ||
                          clientName.includes(query);
    if (!matchesSearch) return false;

    // Status filter dropdown
    if (statusFilter !== 'todos') {
      if (v.estado !== statusFilter) return false;
    }

    return true;
  });

  // Handle open Add Modal
  const handleOpenAddModal = () => {
    setFormData({
      modelo: '',
      marca: '',
      placa: '', // Empty initially so required input forces either plate number or "En trámite"
      clienteId: clientes[0]?.id || '',
      empleadoId: mecanicos[0]?.id || '',
      año: 2020,
      estado: 'En revisión',
      fechaIngreso: new Date().toISOString().split('T')[0],
      fechaSalida: '',
      diagnostico: '',
      fotoUrl: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=400',
      tarjetaUrlFront: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400',
      tarjetaUrlBack: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400'
    });
    setIsAddModalOpen(true);
  };

  // Handle open Edit Modal (Page 5)
  const handleOpenEditModal = (veh: Vehiculo) => {
    setSelectedVehiculo(veh);
    setFormData({
      modelo: veh.modelo,
      marca: veh.marca,
      placa: veh.placa,
      clienteId: veh.clienteId,
      empleadoId: veh.empleadoId || '',
      año: veh.año,
      estado: veh.estado,
      fechaIngreso: veh.fechaIngreso,
      fechaSalida: veh.fechaSalida || '',
      diagnostico: veh.diagnostico,
      fotoUrl: veh.fotoUrl || 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=400',
      tarjetaUrlFront: veh.tarjetaUrlFront || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400',
      tarjetaUrlBack: veh.tarjetaUrlBack || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400'
    });
    setNewCompletedJob('');
    setIsEditModalOpen(true);
  };

  // Handle open View Details
  const handleOpenViewModal = (veh: Vehiculo) => {
    setSelectedVehiculo(veh);
    setIsViewModalOpen(true);
  };

  // Quick client creation trigger
  const handleCreateQuickClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickClientForm.nombre) return;
    const newId = onAddClienteRapido({
      nombre: quickClientForm.nombre,
      telefono: quickClientForm.telefono || '0000-0000',
      dui: quickClientForm.dui || '00000000-0',
      correo: quickClientForm.correo || 'rapido@gmail.com'
    });
    setFormData(prev => ({ ...prev, clienteId: newId }));
    setShowQuickClient(false);
    setQuickClientForm({ nombre: '', telefono: '', dui: '', correo: '' });
  };

  // Form Submition - Add Car
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.modelo || !formData.marca) {
      alert('Por favor complete Modelo y Marca obligatorios.');
      return;
    }

    // Constraints checklist check:
    if (formData.año < minYear || formData.año > currentYear) {
      alert(`Año del vehículo debe estar entre ${minYear} y ${currentYear}.`);
      return;
    }

    // Date constraints checklist:
    if (formData.fechaSalida && formData.fechaSalida < formData.fechaIngreso) {
      alert('La fecha de salida estimada no puede ser previa a la fecha de ingreso.');
      return;
    }

    onAddVehiculo({
      ...formData,
      placa: formData.placa || 'Pendiente'
    });

    setIsAddModalOpen(false);
  };

  // Form Submition - Edit Car
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehiculo) return;

    if (formData.año < minYear || formData.año > currentYear) {
      alert(`Año del vehículo debe estar entre ${minYear} y ${currentYear}.`);
      return;
    }

    if (formData.fechaSalida && formData.fechaSalida < formData.fechaIngreso) {
      alert('La fecha de salida estimada no puede ser previa a la fecha de ingreso.');
      return;
    }

    onUpdateVehiculo({
      ...selectedVehiculo,
      ...formData,
      placa: formData.placa || 'Pendiente'
    });

    setIsEditModalOpen(false);
  };

  // Add a completed individual job note (Page 5: Diagnosis y trabajos realizados)
  const handleAddJobBullet = () => {
    if (!newCompletedJob.trim() || !selectedVehiculo) return;
    const updatedJobs = [...(selectedVehiculo.trabajosRealizados || []), newCompletedJob.trim()];
    
    const updatedVeh = {
      ...selectedVehiculo,
      trabajosRealizados: updatedJobs
    };
    setSelectedVehiculo(updatedVeh);
    onUpdateVehiculo(updatedVeh);
    setNewCompletedJob('');
  };

  const handleRemoveJobBullet = (idx: number) => {
    if (!selectedVehiculo) return;
    const updatedJobs = [...(selectedVehiculo.trabajosRealizados || [])];
    updatedJobs.splice(idx, 1);
    
    const updatedVeh = {
      ...selectedVehiculo,
      trabajosRealizados: updatedJobs
    };
    setSelectedVehiculo(updatedVeh);
    onUpdateVehiculo(updatedVeh);
  };

  // Change state to "Entregado" (moving it to History, instead of delete)
  const handleDeliverVehicleNow = (veh: Vehiculo) => {
    const confirmation = window.confirm(`¿Confirmar entrega del vehículo ${veh.marca} ${veh.modelo} [${veh.placa}]? Se archivará en el historial de entregados.`);
    if (confirmation) {
      onUpdateVehiculo({
        ...veh,
        estado: 'Entregado',
        fechaSalida: new Date().toISOString().split('T')[0]
      });
    }
  };

  return (
    <div className="space-y-6 relative z-10">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-slate-800 shadow-sm">
        <div>
          <h2 className="font-display font-medium text-white text-lg flex items-center gap-2">
            <Car className="w-5 h-5 text-orange-400 animate-bounce" />
            Control de Vehículos en Taller
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualización activa, diagnósticos mecánicos preliminares, trabajos realizados y carga del taller.
          </p>
        </div>

        {/* Page 3 Toggle: "Cambiar a entregados" Switch component */}
        <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-850 p-2 rounded-xl">
          <span className="text-xs font-semibold text-slate-300">
            {showDelivered ? 'Mostrando Entregados (Historial)' : 'Mostrando en Taller (Activos)'}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={showDelivered} 
              onChange={() => setShowDelivered(!showDelivered)} 
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>
      </div>

      {/* Filter and search row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl border border-slate-800 shadow-sm">
        
        {/* Search Input widget */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            id="search-vehiculos"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por placa, modelo, marca o cliente..."
            className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-orange-500 outline-none"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-400">Filtrar por:</span>
          
          <select
            id="status-filter-vehículos"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-950 text-slate-200 border border-slate-850 rounded-xl py-2 px-3 outline-none cursor-pointer font-semibold"
          >
            <option value="todos" className="bg-slate-950 text-white">Todos los Estados</option>
            <option value="En revisión" className="bg-slate-950 text-white">En revisión</option>
            <option value="En espera" className="bg-slate-950 text-white">En espera</option>
            {showDelivered && <option value="Entregado" className="bg-slate-950 text-white">Entregado</option>}
          </select>

          {/* Page 3: "Agregar vehículo" Trigger */}
          <button
            id="btn-open-add-vehiculo"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 text-xs font-black text-white bg-gradient-to-r from-orange-500 to-red-555 hover:brightness-105 px-4 py-2.5 rounded-xl shadow-lg shadow-orange-505/15 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar vehículo</span>
          </button>
        </div>
      </div>

      {/* Grid of cards (mobile) or Table (desktop) */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800 shadow-sm overflow-hidden">

        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-slate-800/80">
          {filteredVehiculos.map((v) => {
            const client = clientes.find(c => c.id === v.clienteId);
            const mechanic = empleados.find(e => e.id === v.empleadoId);
            return (
              <div key={v.id} className="p-4 space-y-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-extrabold text-white text-sm">
                      {v.marca || 'S/M'} {v.modelo}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Año: {v.año} • Asignado: {mechanic ? mechanic.nombre : 'Sin asignar'}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md font-mono font-bold border text-[10px] flex-shrink-0 ${
                    v.placa === 'Pendiente' || v.placa === 'En trámite'
                      ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                      : 'bg-slate-950 border-slate-850 text-slate-300'
                  }`}>
                    {v.placa}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">{client ? client.nombre : 'Consumidor Final'}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{client ? client.telefono : ''}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1 border ${
                    v.estado === 'En revisión'
                      ? 'bg-amber-505/10 text-amber-400 border-amber-500/20'
                      : v.estado === 'En espera'
                      ? 'bg-blue-505/10 text-blue-400 border-blue-500/20'
                      : 'bg-emerald-505/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    <Wrench className="w-3 h-3" />
                    {v.estado}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span className="font-mono text-slate-500 font-semibold">#{v.id.split('-')[1] || v.id}</span>
                  <span className="font-semibold text-slate-400">{v.fechaIngreso}</span>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    onClick={() => handleOpenViewModal(v)}
                    className="p-2 text-indigo-400 bg-slate-950 hover:bg-indigo-500/20 border border-slate-850 hover:border-indigo-500 rounded-xl transition-all cursor-pointer"
                    title="Visualizar Diagnóstico"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(v)}
                    className="p-2 text-orange-400 bg-slate-950 hover:bg-orange-500/20 border border-slate-850 hover:border-orange-500 rounded-xl transition-all cursor-pointer"
                    title="Editar Trabajos"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {v.estado !== 'Entregado' && v.estado !== 'En revisión' && (
                    <button
                      onClick={() => onUpdateVehiculo({ ...v, estado: 'En revisión' })}
                      className="p-2 text-amber-500 bg-slate-950 hover:bg-amber-500/20 border border-slate-850 hover:border-amber-500 rounded-xl transition-all cursor-pointer"
                      title="Cambiar estado a: En revisión"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {v.estado !== 'Entregado' && v.estado !== 'En espera' && (
                    <button
                      onClick={() => onUpdateVehiculo({ ...v, estado: 'En espera' })}
                      className="p-2 text-blue-500 bg-slate-950 hover:bg-blue-500/20 border border-slate-850 hover:border-blue-500 rounded-xl transition-all cursor-pointer"
                      title="Cambiar estado a: En espera"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {v.estado !== 'Entregado' && (
                    <button
                      onClick={() => handleDeliverVehicleNow(v)}
                      className="p-2 text-emerald-400 bg-slate-950 hover:bg-emerald-500/20 border border-slate-850 hover:border-emerald-500 rounded-xl transition-all cursor-pointer"
                      title="Entregar Vehículo (guardar en historial)"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredVehiculos.length === 0 && (
            <div className="text-center py-12 text-slate-500 font-medium bg-slate-950/20 text-xs">
              No se encontraron vehículos {showDelivered ? 'entregados' : 'activos'} en este momento.
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-5 text-slate-400">ID</th>
                <th className="py-4 px-5 text-slate-400">Placa</th>
                <th className="py-4 px-5 text-slate-400">Marca / Modelo</th>
                <th className="py-4 px-5 text-slate-400">Cliente</th>
                <th className="py-4 px-5 text-slate-400">Estado</th>
                <th className="py-4 px-5 text-slate-400">Ingreso</th>
                <th className="py-4 px-5 text-right text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredVehiculos.map((v, index) => {
                const client = clientes.find(c => c.id === v.clienteId);
                const mechanic = empleados.find(e => e.id === v.empleadoId);

                return (
                  <tr key={v.id} className="hover:bg-slate-850/30 transition-colors">
                    <td className="py-4 px-5 font-mono text-slate-500 font-semibold">
                      #{v.id.split('-')[1] || v.id}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-md font-mono font-bold border ${
                        v.placa === 'Pendiente' || v.placa === 'En trámite'
                          ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                          : 'bg-slate-950 border-slate-850 text-slate-300'
                      }`}>
                        {v.placa}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-extrabold text-white text-sm">
                        {v.marca || 'S/M'} {v.modelo}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Año: {v.año} • Asignado: {mechanic ? mechanic.nombre : 'Sin asignar'}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-200">{client ? client.nombre : 'Consumidor Final'}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{client ? client.telefono : ''}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1 border ${
                        v.estado === 'En revisión'
                          ? 'bg-amber-505/10 text-amber-400 border-amber-500/20'
                          : v.estado === 'En espera'
                          ? 'bg-blue-505/10 text-blue-400 border-blue-500/20'
                          : 'bg-emerald-505/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        <Wrench className="w-3 h-3" />
                        {v.estado}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-400 font-mono">
                      {v.fechaIngreso}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Visualizar */}
                        <button
                          onClick={() => handleOpenViewModal(v)}
                          className="p-2 text-indigo-400 bg-slate-950 hover:bg-indigo-500/20 border border-slate-850 hover:border-indigo-500 rounded-xl transition-all cursor-pointer"
                          title="Visualizar Diagnóstico"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => handleOpenEditModal(v)}
                          className="p-2 text-orange-400 bg-slate-950 hover:bg-orange-500/20 border border-slate-850 hover:border-orange-500 rounded-xl transition-all cursor-pointer"
                          title="Editar Trabajos"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Poner en revisión */}
                        {v.estado !== 'Entregado' && v.estado !== 'En revisión' && (
                          <button
                            onClick={() => {
                              onUpdateVehiculo({
                                ...v,
                                estado: 'En revisión'
                              });
                            }}
                            className="p-2 text-amber-500 bg-slate-950 hover:bg-amber-500/20 border border-slate-850 hover:border-amber-500 rounded-xl transition-all cursor-pointer"
                            title="Cambiar estado a: En revisión"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Poner en espera */}
                        {v.estado !== 'Entregado' && v.estado !== 'En espera' && (
                          <button
                            onClick={() => {
                              onUpdateVehiculo({
                                ...v,
                                estado: 'En espera'
                              });
                            }}
                            className="p-2 text-blue-500 bg-slate-950 hover:bg-blue-500/20 border border-slate-850 hover:border-blue-500 rounded-xl transition-all cursor-pointer"
                            title="Cambiar estado a: En espera"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Page 3: RED X IS CROSSED OUT! Deliver replace delete! */}
                        {v.estado !== 'Entregado' && (
                          <button
                            onClick={() => handleDeliverVehicleNow(v)}
                            className="p-2 text-emerald-400 bg-slate-950 hover:bg-emerald-500/20 border border-slate-850 hover:border-emerald-500 rounded-xl transition-all cursor-pointer"
                            title="Entregar Vehículo (guardar en historial)"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredVehiculos.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 font-medium bg-slate-950/20">
                    No se encontraron vehículos {showDelivered ? 'entregados' : 'activos'} en este momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Modal 1: Agregar Vehículo (Page 4) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden my-8 text-slate-200">
            
            <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-base flex items-center gap-2">
                  <Car className="w-5 h-5 animate-pulse" />
                  Agregar Vehículo al Taller
                </h3>
                <p className="text-[11px] opacity-90 mt-0.5">Asignación de placas, clientes, diagnósticos iniciales y archivos.</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Marca del vehículo *</label>
                  <input
                    type="text"
                    required
                    value={formData.marca}
                    onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                    placeholder="Ej. Honda"
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-medium text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Modelo del vehículo *</label>
                  <input
                    type="text"
                    required
                    value={formData.modelo}
                    onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                    placeholder="Ej. NSX"
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-medium text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Placa (Núm o 'En trámite') *</label>
                  <input
                    type="text"
                    required
                    value={formData.placa}
                    onChange={(e) => setFormData(prev => ({ ...prev, placa: e.target.value }))}
                    placeholder="Ej. P-123456 o En trámite"
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-medium font-mono text-slate-100"
                  />
                </div>
              </div>

              {/* Row 2: Client section and mechanic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/80 pt-3">
                
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Cliente propietario *</label>
                    <button
                      type="button"
                      onClick={() => setShowQuickClient(!showQuickClient)}
                      className="text-[10px] text-violet-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3 h-3" />
                      + Agregar nuevo
                    </button>
                  </div>

                  {!showQuickClient ? (
                    <select
                      value={formData.clienteId}
                      onChange={(e) => setFormData(prev => ({ ...prev, clienteId: e.target.value }))}
                      className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-medium [&>option]:bg-slate-950"
                    >
                      {clientes.map(cli => (
                        <option key={cli.id} value={cli.id}>{cli.nombre} - {cli.telefono}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-slate-950 p-3 rounded-xl border border-dashed border-slate-800 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400">Registro rápido cliente:</p>
                      <input 
                        type="text" 
                        placeholder="Nombre completo" 
                        value={quickClientForm.nombre}
                        onChange={(e) => setQuickClientForm(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full text-[11px] bg-slate-900 border border-slate-800 rounded p-1.5 outline-none text-white font-semibold"
                      />
                      <input 
                        type="text" 
                        placeholder="Teléfono" 
                        value={quickClientForm.telefono}
                        onChange={(e) => setQuickClientForm(prev => ({ ...prev, telefono: e.target.value }))}
                        className="w-full text-[11px] bg-slate-900 border border-slate-800 rounded p-1.5 outline-none text-white font-semibold"
                      />
                      <div className="flex justify-end gap-2.5 pt-1">
                        <button 
                          type="button" 
                          onClick={() => setShowQuickClient(false)}
                          className="text-[10px] text-slate-400 font-semibold cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="button" 
                          onClick={handleCreateQuickClient}
                          className="bg-violet-600 text-white text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mecánico asignado</label>
                  <select
                    value={formData.empleadoId}
                    onChange={(e) => setFormData(prev => ({ ...prev, empleadoId: e.target.value }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-medium [&>option]:bg-slate-950"
                  >
                    <option value="">Seleccionar empleado asignado...</option>
                    {mecanicos.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.nombre} ({emp.cargo})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-slate-800/80 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Año del vehículo *</label>
                  <input
                    type="number"
                    min={minYear}
                    max={currentYear}
                    required
                    value={formData.año}
                    onChange={(e) => setFormData(prev => ({ ...prev, año: parseInt(e.target.value) }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-medium text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Estado inicial</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as any }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-medium [&>option]:bg-slate-950"
                  >
                    <option value="En revisión">En revisión</option>
                    <option value="En espera">En espera</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Fecha de ingreso</label>
                  <input
                    type="date"
                    required
                    value={formData.fechaIngreso}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaIngreso: e.target.value }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-sans font-medium text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Fecha de salida (est.)</label>
                  <input
                    type="date"
                    value={formData.fechaSalida}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaSalida: e.target.value }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-sans font-medium text-slate-100"
                  />
                </div>
              </div>

              {/* Textarea */}
              <div className="border-t border-slate-800/80 pt-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Diagnóstico y observaciones preliminares</label>
                <textarea
                  value={formData.diagnostico}
                  rows={3}
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnostico: e.target.value }))}
                  placeholder="Escriba el diagnóstico inicial del vehículo..."
                  className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none"
                />
              </div>

              {/* Page 4 File buttons: Photo and Circulation Card */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-550 block mb-2 uppercase">FOTO DE LA UNIDAD</span>
                  <div className="relative rounded-xl overflow-hidden border border-dashed border-slate-800 h-24 bg-slate-950 flex items-center justify-center group/imgadd">
                    <img 
                      src={formData.fotoUrl} 
                      alt="Foto de la unidad" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <button 
                      type="button"
                      onClick={() => alert("Simulación: Cámara/Carga de Foto")}
                      className="absolute inset-0 bg-black/50 text-white text-[10px] flex items-center justify-center gap-1.5 font-black opacity-0 group-hover/imgadd:opacity-100 transition-opacity cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Editar Imagen
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-550 block mb-2 uppercase">TARJETA DE CIRCULACIÓN</span>
                  <div className="relative rounded-xl overflow-hidden border border-dashed border-slate-800 h-24 bg-slate-950 flex items-center justify-center group/cardadd">
                    <img 
                      src={formData.tarjetaUrlFront} 
                      alt="Tarjeta de circulación" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <button 
                      type="button"
                      onClick={() => alert("Simulación: Escanear Tarjeta Frente / Reverso")}
                      className="absolute inset-0 bg-black/50 text-white text-[10px] flex items-center justify-center gap-1.5 font-black opacity-0 group-hover/cardadd:opacity-100 transition-opacity cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Editar Imagen
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs font-semibold text-slate-300 bg-slate-850 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-xs font-black text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-105 px-6 py-2.5 rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
                >
                  Agregar vehículo
                </button>
              </div>

            </form>

          </div>
        </div>
      )}


      {/* Modal 2: Editar Vehículo / Modificar trabajos (Page 5) */}
      {isEditModalOpen && selectedVehiculo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-4xl overflow-hidden my-8">
            
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-base flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Editar Vehículo / Reporte de Trabajos – {selectedVehiculo.marca} {selectedVehiculo.modelo}
                </h3>
                <p className="text-[11px] opacity-90 mt-0.5">Control de bitácora y registros del mecánico.</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
              
              {/* Left Column Form inputs (8 spans) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Marca *</label>
                    <input
                      type="text"
                      required
                      value={formData.marca}
                      onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-semibold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Modelo *</label>
                    <input
                      type="text"
                      required
                      value={formData.modelo}
                      onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-semibold text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Placa (Núm o 'En trámite') *</label>
                    <input
                      type="text"
                      required
                      value={formData.placa}
                      onChange={(e) => setFormData(prev => ({ ...prev, placa: e.target.value }))}
                      placeholder="Ej. P-123456 o En trámite"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Año</label>
                    <input
                      type="number"
                      required
                      value={formData.año}
                      onChange={(e) => setFormData(prev => ({ ...prev, año: parseInt(e.target.value) }))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as any }))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-semibold"
                    >
                      <option value="En revisión">En revisión</option>
                      <option value="En espera">En espera</option>
                      <option value="Entregado">Entregado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 font-sans">Fecha de ingreso</label>
                    <input
                      type="date"
                      value={formData.fechaIngreso}
                      onChange={(e) => setFormData(prev => ({ ...prev, fechaIngreso: e.target.value }))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 font-sans">Fecha de salida</label>
                    <input
                      type="date"
                      value={formData.fechaSalida}
                      onChange={(e) => setFormData(prev => ({ ...prev, fechaSalida: e.target.value }))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnóstico inicial</label>
                  <textarea
                    value={formData.diagnostico}
                    rows={2}
                    onChange={(e) => setFormData(prev => ({ ...prev, diagnostico: e.target.value }))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-medium text-slate-600"
                  />
                </div>

                {/* Submit row */}
                <div className="flex justify-end gap-3.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    Salir
                  </button>
                  <button
                    type="submit"
                    className="text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:brightness-105 px-5 py-2.5 rounded-xl cursor-pointer shadow-md shadow-orange-500/10"
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>

              {/* Right Column Uploader, image and Trabajos Realizados tracker (5 spans) */}
              <div className="lg:col-span-5 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-250">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest block mb-2">
                    Diagnósticos y Trabajos Realizados
                  </h4>
                  
                  {/* Bullet inputs */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newCompletedJob}
                      onChange={(e) => setNewCompletedJob(e.target.value)}
                      placeholder="Registrar un nuevo trabajo realizado..."
                      className="flex-1 text-[11px] bg-white border border-slate-200 rounded-lg p-2 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddJobBullet}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-3 py-1.5 text-xs font-black flex items-center justify-center cursor-pointer"
                    >
                      Agregar
                    </button>
                  </div>

                  {/* Bullet list */}
                  <div className="space-y-1.5 mt-3 max-h-40 overflow-y-auto">
                    {(selectedVehiculo.trabajosRealizados || []).map((work, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200 text-xs">
                        <span className="text-slate-600 font-medium">✓ {work}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveJobBullet(idx)}
                          className="hover:text-red-500 text-slate-400 font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {(selectedVehiculo.trabajosRealizados || []).length === 0 && (
                      <p className="text-[11px] text-slate-400 italic py-2 text-center">
                        Ningún trabajo completado registrado aún.
                      </p>
                    )}
                  </div>
                </div>

                {/* Displaying visual pictures like Page 5 */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase mb-1">Carga visual de la unidad</span>
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 h-24 bg-white flex items-center justify-center group/img">
                      <img 
                        src={formData.fotoUrl} 
                        alt="Unidad de carro" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <button 
                        type="button"
                        onClick={() => alert("Cambiar imagen unidad mecánica seleccionada")}
                        className="absolute inset-0 bg-black/50 text-white text-[10px] items-center justify-center font-bold opacity-0 group-hover/img:flex transition-opacity"
                      >
                        ✓ Cambiar Imagen
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase mb-1">Tarjeta de circulación (Frente / Posterior)</span>
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 h-24 bg-white flex items-center justify-center group/card">
                      <img 
                        src={formData.tarjetaUrlFront} 
                        alt="Unidad de tarjeta" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <button 
                        type="button"
                        onClick={() => alert("Cambiar imagen de tarjeta de circulación")}
                        className="absolute inset-0 bg-black/50 text-white text-[10px] items-center justify-center font-bold opacity-0 group-hover/card:flex transition-opacity"
                      >
                        ✓ Cambiar Imagen
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </form>

          </div>
        </div>
      )}


      {/* Modal 3: Visualizar Diagnóstico Detallado */}
      {isViewModalOpen && selectedVehiculo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-250 text-slate-200">
            
            <div className="bg-slate-950 text-white p-5 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-violet-400 animate-pulse" />
                <div>
                  <h3 className="font-display font-bold text-base">
                    Especificación de Vehículo
                  </h3>
                  <p className="text-[11px] text-slate-400">Detalle integral del estado de la unidad.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="p-1.5 bg-slate-900 text-slate-400 hover:text-violet-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              
              <div className="flex gap-4">
                <img 
                  src={selectedVehiculo.fotoUrl} 
                  alt="Car" 
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-xl object-cover border border-slate-800"
                />
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PLACAS DE LA UNIDAD</span>
                  <div className="text-xl font-mono font-black text-rose-400 mt-0.5">{selectedVehiculo.placa}</div>
                  
                  <div className="text-base font-bold text-white mt-1">
                    {selectedVehiculo.marca} {selectedVehiculo.modelo}
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Modelo año: {selectedVehiculo.año}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-800/60 py-3 text-xs">
                <div>
                  <span className="font-bold text-slate-500 block mb-1">PROPIETARIO</span>
                  <span className="font-semibold text-slate-200">
                    {clientes.find(c => c.id === selectedVehiculo.clienteId)?.nombre || 'Consumidor Final'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block mb-1">MECÁNICO ASIGNADO</span>
                  <span className="font-semibold text-slate-200">
                    {empleados.find(e => e.id === selectedVehiculo.empleadoId)?.nombre || 'Sin mecánico'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">DIAGNÓSTICO INICIAL</span>
                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/60 italic">
                  "{selectedVehiculo.diagnostico || 'Sin observaciones especificadas.'}"
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1.5">BITÁCORA DE TRABAJOS COMPLETADOS</span>
                <div className="space-y-1.5">
                  {(selectedVehiculo.trabajosRealizados || []).map((work, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-900/40">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{work}</span>
                    </div>
                  ))}
                  {(selectedVehiculo.trabajosRealizados || []).length === 0 && (
                    <p className="text-xs text-slate-450 italic text-center py-2.5 bg-slate-950 rounded-xl border border-slate-850/40">
                      Ningún trabajo registrado todavía por el mecánico.
                    </p>
                  )}
                </div>
              </div>

            </div>

            <div className="bg-slate-950 p-4 border-t border-slate-850 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-xs font-black text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-105 px-5 py-2.5 rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
              >
                Entendido, cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
