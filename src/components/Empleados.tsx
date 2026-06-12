import React, { useState } from 'react';
import { Usuario, Vehiculo, ReporteTrabajador, Factura, RegistroSueldo, RegistroVacacion } from '../types';
import { 
  Briefcase, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  FileText, 
  CheckCircle, 
  DollarSign, 
  UserCheck, 
  Wrench, 
  Lock, 
  Clock, 
  Calendar, 
  X,
  CreditCard,
  UserX,
  LockKeyhole,
  Image as ImageIcon
} from 'lucide-react';

interface EmpleadosProps {
  empleados: Usuario[];
  vehiculos: Vehiculo[];
  facturas: Factura[];
  currentUser: Usuario;
  reportesTrabajadores: ReporteTrabajador[];
  onAddEmpleado: (u: Usuario) => void;
  onUpdateEmpleado: (u: Usuario) => void;
  onDeleteEmpleado: (id: string) => void;
  onAddReporte: (r: Omit<ReporteTrabajador, 'id' | 'fecha'>) => void;
}

export function Empleados({ 
  empleados, 
  vehiculos, 
  facturas, 
  currentUser,
  reportesTrabajadores,
  onAddEmpleado, 
  onUpdateEmpleado, 
  onDeleteEmpleado,
  onAddReporte
}: EmpleadosProps) {

  // Table filters
  const [searchQuery, setSearchQuery] = useState('');

  // Local state for payroll records
  const [pagosSueldos, setPagosSueldos] = useState<RegistroSueldo[]>(() => {
    const saved = localStorage.getItem('taller_rod_pagos_sueldos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing payroll:", e);
      }
    }
    
    // Default initial mock payments if nothing in localStorage
    return [
      { id: 'pay-mock-1', empleadoId: 'emp-2', monto: 400.00 + 45.50, mes: 'Mayo 2026', porcentaje: 10, fechaPago: '2026-05-30', detalle: 'Sueldo base + 10% de comisiones por servicios' },
      { id: 'pay-mock-2', empleadoId: 'emp-2', monto: 400.00 + 35.00, mes: 'Abril 2026', porcentaje: 10, fechaPago: '2026-04-28', detalle: 'Sueldo base + 10% comisiones por reparaciones' },
      { id: 'pay-mock-3', empleadoId: 'emp-1', monto: 500.00, mes: 'Mayo 2026', porcentaje: 0, fechaPago: '2026-05-30', detalle: 'Sueldo base asegurado - Administración' }
    ];
  });

  const [isPaying, setIsPaying] = useState(false);
  const [payMonth, setPayMonth] = useState('Junio 2026');
  const [payDetail, setPayDetail] = useState('Sueldo base + comisiones por servicios');
  const [payAmount, setPayAmount] = useState<string>('');

  const [vacaciones, setVacaciones] = useState<RegistroVacacion[]>(() => {
    const saved = localStorage.getItem('taller_rod_vacaciones');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing vacations:", e);
      }
    }
    return [
      { id: 'vac-mock-1', empleadoId: 'emp-2', empleadoNombre: 'Leonel Rodríguez', fechaInicio: '2026-06-15', fechaFin: '2026-06-25', tipo: 'Vacación Anual', estado: 'Aprobado', comentarios: 'Período ordinario de descanso anual.', totalDias: 10 },
      { id: 'vac-mock-2', empleadoId: 'emp-1', empleadoNombre: 'Marlon Chicas', fechaInicio: '2026-07-20', fechaFin: '2026-07-30', tipo: 'Permiso Especial', estado: 'Pendiente', comentarios: 'Solicitado por motivos familiares.', totalDias: 10 }
    ];
  });

  const [isVacacionesOpen, setIsVacacionesOpen] = useState(false);
  const [vacForm, setVacForm] = useState({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    tipo: 'Vacación Anual',
    estado: 'Pendiente' as 'Pendiente' | 'Aprobado' | 'Gozado' | 'Rechazado',
    comentarios: ''
  });

  React.useEffect(() => {
    localStorage.setItem('taller_rod_pagos_sueldos', JSON.stringify(pagosSueldos));
  }, [pagosSueldos]);

  React.useEffect(() => {
    localStorage.setItem('taller_rod_vacaciones', JSON.stringify(vacaciones));
  }, [vacaciones]);

  const getCurrentMonthYear = () => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const d = new Date();
    return `${meses[d.getMonth()]} ${d.getFullYear()}`;
  };

  const confirmPayment = (emp: Usuario) => {
    const finalMonto = parseFloat(payAmount);
    if (isNaN(finalMonto) || finalMonto < 0) {
      alert("Por favor, ingrese un monto de pago válido mayor o igual a cero.");
      return;
    }

    const nuevoPago: RegistroSueldo = {
      id: `pay-${Date.now()}`,
      empleadoId: emp.id,
      monto: finalMonto,
      mes: payMonth,
      porcentaje: emp.porcentajeGanancia || 0,
      fechaPago: new Date().toISOString().split('T')[0],
      detalle: payDetail
    };

    setPagosSueldos(prev => [nuevoPago, ...prev]);
    setIsPaying(false);
    alert(`Se ha registrado y guardado el pago de sueldo de $${finalMonto.toFixed(2)} correspondiente a ${payMonth} para ${emp.nombre}.`);
  };

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Focus targets
  const [selectedEmp, setSelectedEmp] = useState<Usuario | null>(null);

  // Form entries
  const [formData, setFormData] = useState({
    nombre: '',
    dui: '',
    telefono: '',
    correo: '',
    cargo: 'Mecánico' as 'Administrador' | 'Recepcionista' | 'Mecánico' | 'Súper Usuario',
    sueldoBase: 400.00,
    porcentajeGanancia: 0,
    fechaContratacion: new Date().toISOString().split('T')[0],
    tieneLicencia: true,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    password: ''
  });

  // Report Form state (Page 9: "Reporte - Marlon Chicas")
  const [reportNotes, setReportNotes] = useState('');
  const [reportType, setReportType] = useState('Incidencia');

  // Filter list
  const filteredEmpleados = empleados.filter(e => {
    const q = searchQuery.toLowerCase();
    return (
      e.nombre.toLowerCase().includes(q) || 
      e.telefono.includes(q) || 
      e.cargo.toLowerCase().includes(q) ||
      (e.correo && e.correo.toLowerCase().includes(q))
    );
  });

  const isSuperUser = currentUser.cargo === 'Súper Usuario';

  // Handlers
  const handleOpenAdd = () => {
    setFormData({
      nombre: '',
      dui: '00000000-0', // default Page 7
      telefono: '',
      correo: '',
      cargo: 'Mecánico',
      sueldoBase: 400.00,
      porcentajeGanancia: 0,
      fechaContratacion: new Date().toISOString().split('T')[0],
      tieneLicencia: true,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      password: '' // default same as dui which we will populate in submit
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (emp: Usuario) => {
    setSelectedEmp(emp);
    setFormData({
      nombre: emp.nombre,
      dui: emp.dui,
      telefono: emp.telefono,
      correo: emp.correo || '',
      cargo: emp.cargo,
      sueldoBase: emp.sueldoBase,
      porcentajeGanancia: emp.porcentajeGanancia || 0,
      fechaContratacion: emp.fechaContratacion,
      tieneLicencia: emp.tieneLicencia,
      avatarUrl: emp.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      password: emp.password || ''
    });
    setIsEditOpen(true);
  };

  const handleOpenReport = (emp: Usuario) => {
    setSelectedEmp(emp);
    setReportNotes('');
    setReportType('Comportamiento');
    setIsReportOpen(true);
  };

  const handleOpenStats = (emp: Usuario) => {
    setSelectedEmp(emp);
    setIsStatsOpen(true);
  };

  const handleOpenVacaciones = (emp: Usuario) => {
    setSelectedEmp(emp);
    setVacForm({
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: new Date().toISOString().split('T')[0],
      tipo: 'Vacación Anual',
      estado: 'Pendiente',
      comentarios: ''
    });
    setIsVacacionesOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.dui) return;

    // Constraint checklist: "El cargo ADMIN solo lo puede configurar super usuario (root- pre asignado por nosotros)"
    if (formData.cargo === 'Administrador' && !isSuperUser) {
      alert('Error de Permisos: El cargo Administrador/Admin solo lo puede configurar un Súper Usuario.');
      return;
    }

    onAddEmpleado({
      id: `emp-${Date.now()}`,
      nombre: formData.nombre,
      dui: formData.dui,
      telefono: formData.telefono || '2200-0000',
      correo: formData.correo || undefined,
      cargo: formData.cargo,
      sueldoBase: formData.sueldoBase,
      porcentajeGanancia: formData.porcentajeGanancia > 0 ? formData.porcentajeGanancia : undefined,
      fechaContratacion: formData.fechaContratacion,
      tieneLicencia: formData.tieneLicencia,
      avatarUrl: formData.avatarUrl,
      // Page 7 constraint: "contraseña será el mismo dui"
      password: formData.password || formData.dui.replace('-', '')
    });

    setIsAddOpen(false);
    alert('Empleado agregado correctamente. Contraseña inicial por defecto asocida al DUI.');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    if (formData.cargo === 'Administrador' && selectedEmp.cargo !== 'Administrador' && !isSuperUser) {
      alert('Error de Permisos: El cargo Administrador solo lo puede configurar un Súper Usuario.');
      return;
    }

    onUpdateEmpleado({
      ...selectedEmp,
      nombre: formData.nombre,
      dui: formData.dui,
      telefono: formData.telefono,
      correo: formData.correo || undefined,
      cargo: formData.cargo,
      sueldoBase: formData.sueldoBase,
      porcentajeGanancia: formData.porcentajeGanancia > 0 ? formData.porcentajeGanancia : undefined,
      fechaContratacion: formData.fechaContratacion,
      tieneLicencia: formData.tieneLicencia,
      avatarUrl: formData.avatarUrl,
      password: formData.password
    });

    setIsEditOpen(false);
    alert('Ficha editada correctamente.');
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !reportNotes.trim()) return;

    onAddReporte({
      empleadoId: selectedEmp.id,
      empleadoNombre: selectedEmp.nombre,
      tipo: reportType,
      resumen: `Reporte de cargo: ${selectedEmp.cargo}`,
      notas: reportNotes
    });

    setIsReportOpen(false);
    alert(`Nota guardada y sincronizada correctamente para ${selectedEmp.nombre}.`);
  };

  const handleAddVacacionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    const start = new Date(vacForm.fechaInicio);
    const end = new Date(vacForm.fechaFin);

    if (end < start) {
      alert("Error: La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    const timeDiff = Math.abs(end.getTime() - start.getTime());
    const totalDias = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;

    const nuevaVac: RegistroVacacion = {
      id: `vac-${Date.now()}`,
      empleadoId: selectedEmp.id,
      empleadoNombre: selectedEmp.nombre,
      fechaInicio: vacForm.fechaInicio,
      fechaFin: vacForm.fechaFin,
      tipo: vacForm.tipo,
      estado: vacForm.estado,
      comentarios: vacForm.comentarios || 'Sin observaciones adicionales.',
      totalDias
    };

    setVacaciones(prev => [nuevaVac, ...prev]);
    setVacForm(prev => ({
      ...prev,
      comentarios: ''
    }));
    alert(`Se ha registrado el período de vacaciones (${totalDias} días) para ${selectedEmp.nombre}.`);
  };

  const handleUpdateVacacionEstado = (id: string, nuevoEstado: 'Pendiente' | 'Aprobado' | 'Gozado' | 'Rechazado') => {
    setVacaciones(prev => prev.map(vac => vac.id === id ? { ...vac, estado: nuevoEstado } : vac));
  };

  const handleDeleteVacacion = (id: string) => {
    if (window.confirm("¿Está seguro de eliminar esta vacación o permiso registrado?")) {
      setVacaciones(prev => prev.filter(vac => vac.id !== id));
    }
  };

  // Helper helper stats calculations
  const getEmployeeStats = (emp: Usuario) => {
    // 1. Cars currently working on
    const assignedCars = vehiculos.filter(v => v.empleadoId === emp.id && v.estado !== 'Entregado');
    
    // 2. Services processed on facturas where this mechanic was associated
    const clientAssignedCarsIds = vehiculos.filter(v => v.empleadoId === emp.id).map(v => v.id);
    const assignedFacts = facturas.filter(f => f.vehiculoId && clientAssignedCarsIds.includes(f.vehiculoId) && f.estado === 'Activa');
    
    const serviceSalesTotal = assignedFacts.flatMap(f => f.items).reduce((acc, it) => acc + (it.precioUnitario * it.cantidad), 0);
    
    // Sueldo estimado = Base + Bonificacion%
    const pct = emp.porcentajeGanancia || 0;
    const bonus = pct > 0 ? (serviceSalesTotal * pct) / 100 : 0;
    const estimatedTotalWage = emp.sueldoBase + bonus;

    // Filter from our pagosSueldos state
    const payrollHistory = pagosSueldos.filter(pay => pay.empleadoId === emp.id);

    return {
      assignedCars,
      assignedFacts,
      serviceSalesTotal,
      bonus,
      estimatedTotalWage,
      payrollHistory
    };
  };

  return (
    <div className="space-y-6 relative z-10">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-slate-800 shadow-sm">
        <div>
          <h2 className="font-display font-medium text-white text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-400 animate-pulse" />
            Nómina de Empleados del Taller
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de mecánicos, administración de comisiones de servicios, salarios base y reportes de personal técnico.
          </p>
        </div>

        <button
          id="btn-open-add-empleado"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 text-xs font-black text-white bg-gradient-to-r from-orange-500 to-red-650 hover:brightness-105 px-4 py-3 rounded-xl shadow-lg shadow-orange-505/10 cursor-pointer uppercase tracking-wider scale-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar nuevo empleado</span>
        </button>
      </div>

      {/* Filter and Search row */}
      <div className="flex bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl border border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            id="search-empleados"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por nombre, teléfono o cargo de personal..."
            className="w-full text-xs font-semibold bg-slate-950 border border-slate-850 text-white rounded-xl py-2.5 pl-9 pr-4 outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Main Table list (Page 6) with high contrast colors! */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800">
                <th className="py-4 px-5 text-slate-400">Nombre / Teléfono</th>
                <th className="py-4 px-5 text-slate-400">DUI</th>
                <th className="py-4 px-5 text-slate-400">Porcentaje de ganancia</th>
                <th className="py-4 px-5 text-slate-400">Sueldo base</th>
                <th className="py-4 px-5 text-right text-slate-400">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredEmpleados.map((emp) => {
                const stats = getEmployeeStats(emp);

                return (
                  <tr key={emp.id} className="hover:bg-slate-850/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={emp.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                          alt={emp.nombre}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border border-slate-800"
                        />
                        <div>
                          <div className="font-extrabold text-white text-sm">{emp.nombre}</div>
                          <div className="text-[10px] text-slate-400 font-medium space-y-0.5">
                            <div>{emp.cargo} • Telf: {emp.telefono}</div>
                            {emp.correo && (
                              <div className="text-violet-400 font-mono text-[10px] lowercase flex items-center gap-1">
                                <span className="text-slate-500">@</span>{emp.correo}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-300 font-bold">
                      {emp.dui}
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-300">
                      {emp.porcentajeGanancia ? (
                        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold">
                          {emp.porcentajeGanancia}% de ganancia
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Sin porcentaje</span>
                      )}
                    </td>
                    <td className="py-4 px-5 font-mono font-bold text-white text-sm">
                      ${emp.sueldoBase.toFixed(2)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Page 6 requested detail button: "Visualizar carros trabajando y estimación" */}
                        <button
                          onClick={() => handleOpenStats(emp)}
                          className="p-2 text-emerald-400 bg-slate-950 hover:bg-emerald-650/30 border border-slate-800 rounded-xl transition-all cursor-pointer"
                          title="Visualizar Carga de Trabajo, Coche y Saldo"
                        >
                          <Briefcase className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenVacaciones(emp)}
                          className="p-2 text-violet-600 hover:text-white bg-slate-950 hover:bg-violet-600 border border-slate-800 rounded-xl transition-all cursor-pointer"
                          title="Registrar y ver vacaciones"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-2 text-orange-400 bg-slate-950 hover:bg-orange-650/30 border border-slate-800 rounded-xl transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`¿Seguro de remover al empleado ${emp.nombre}?`)) {
                              onDeleteEmpleado(emp.id);
                            }
                          }}
                          className="p-2 text-red-400 bg-slate-950 hover:bg-red-650/30 border border-slate-800 rounded-xl transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenReport(emp)}
                          className="p-2 text-indigo-400 bg-slate-950 hover:bg-indigo-650/30 border border-slate-800 rounded-xl transition-all cursor-pointer"
                          title="Filing Report Card (Reportar comportamiento)"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
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


      {/* Modal 1: Agregar Empleado (Page 7) */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-200 text-slate-200">
            
            <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 animate-pulse" />
                  Agregar Empleado
                </h3>
                <p className="text-[11px] opacity-90 mt-0.5">Asignación de cargos, nómina fiscal y licencias viales.</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-white hover:opacity-80 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto font-semibold text-xs text-slate-300">
              
              {/* Avatar / Foto de perfil */}
              <div className="flex justify-center">
                <div className="relative inline-block group/avatar">
                  <img 
                    src={formData.avatarUrl} 
                    alt="Avatar del empleado" 
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-full object-cover border-4 border-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => alert("Simulación: Cambiar foto de perfil")}
                    className="absolute inset-0 rounded-full bg-black/50 text-white flex items-center justify-center gap-1 text-[9px] font-black opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Editar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-slate-300">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej. Marlon Chicas"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-slate-300">DUI *</label>
                  <input
                    type="text"
                    required
                    value={formData.dui}
                    onChange={(e) => setFormData(prev => ({ ...prev, dui: e.target.value }))}
                    placeholder="00000000-0"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-slate-300">Número de teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-slate-300">Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.correo}
                    onChange={(e) => setFormData(prev => ({ ...prev, correo: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outlines-none font-medium outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-slate-300">Contraseña (Mismo DUI por defecto)</label>
                <input
                  type="password"
                  placeholder="Dejar vacío para usar DUI como clave"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-3">
                <div>
                  <label className="block mb-1.5 text-slate-300 font-sans">Sueldo base ($)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.sueldoBase}
                    onChange={(e) => setFormData(prev => ({ ...prev, sueldoBase: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-slate-300">Porcentaje de ganancia (%)</label>
                  <input
                    type="number"
                    placeholder="Opcional"
                    value={formData.porcentajeGanancia}
                    onChange={(e) => setFormData(prev => ({ ...prev, porcentajeGanancia: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-3">
                <div>
                  <label className="block mb-1.5 text-slate-300">Cargo de operación</label>
                  <select
                    value={formData.cargo}
                    onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-bold [&>option]:bg-slate-950"
                  >
                    <option value="Mecánico">Mecánico</option>
                    <option value="Recepcionista">Recepcionista</option>
                    {isSuperUser && <option value="Administrador">Administrador (Solo Súper)</option>}
                    {isSuperUser && <option value="Súper Usuario">Súper Usuario (Solo Súper)</option>}
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 text-slate-300 font-sans">Fecha de contratación</label>
                  <input
                    type="date"
                    required
                    value={formData.fechaContratacion}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaContratacion: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-sans font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-800/60 pt-3">
                <input
                  type="checkbox"
                  id="add-tiene-licencia"
                  checked={formData.tieneLicencia}
                  onChange={(e) => setFormData(prev => ({ ...prev, tieneLicencia: e.target.checked }))}
                  className="w-4 h-4 text-violet-500 border-slate-800 rounded focus:ring-violet-500 bg-slate-950"
                />
                <label htmlFor="add-tiene-licencia" className="text-slate-300 font-bold select-none cursor-pointer">
                  El empleado tiene licencia
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="bg-slate-850 hover:bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl cursor-pointer font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-105 text-white rounded-xl px-5 py-2.5 font-black shadow-md cursor-pointer uppercase tracking-wider"
                >
                  Agregar empleado
                </button>
              </div>

            </form>

          </div>
        </div>
      )}


      {/* Modal 2: Editar Empleado (Page 8) */}
      {isEditOpen && selectedEmp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-200 text-slate-200">
            
            <div className="bg-slate-950 text-white p-5 flex justify-between items-center border-b border-slate-800">
              <div>
                <h3 className="font-display font-bold text-base flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-violet-400 animate-pulse" />
                  Editar empleado – {selectedEmp.nombre}
                </h3>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-violet-600 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto font-semibold text-xs text-slate-300">
              
              {/* Avatar / Foto de perfil */}
              <div className="flex justify-center">
                <div className="relative inline-block group/avatar">
                  <img 
                    src={formData.avatarUrl} 
                    alt="Avatar del empleado" 
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-full object-cover border-4 border-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => alert("Simulación: Cambiar foto de perfil")}
                    className="absolute inset-0 rounded-full bg-black/50 text-white flex items-center justify-center gap-1 text-[9px] font-black opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Editar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-300">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-semibold text-slate-100"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-300">DUI</label>
                  <input
                    type="text"
                    required
                    value={formData.dui}
                    onChange={(e) => setFormData(prev => ({ ...prev, dui: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-mono outline-none text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-300">Número de teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-semibold outline-none text-slate-100"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-300">Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.correo}
                    onChange={(e) => setFormData(prev => ({ ...prev, correo: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none text-slate-100 font-semibold"
                  />
                </div>
              </div>

              <div>
                {/* Page 8 constraint: No se podrá editar contraseña desde admin solo super usuario */}
                <label className="block mb-1 text-slate-300 flex items-center gap-1">
                  Contraseña 
                  {!isSuperUser && <LockKeyhole className="w-3 h-3 text-red-500" title="Bloqueado para Administrador" />}
                </label>
                <input
                  type="password"
                  disabled={!isSuperUser}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={!isSuperUser ? "Solo sugerido para Súper Usuario" : "Editar clave"}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-mono disabled:opacity-40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-3">
                <div>
                  <label className="block mb-1 text-slate-300 font-sans">Sueldo base ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sueldoBase}
                    onChange={(e) => setFormData(prev => ({ ...prev, sueldoBase: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-300">Porcentaje de ganancia</label>
                  <input
                    type="number"
                    value={formData.porcentajeGanancia}
                    onChange={(e) => setFormData(prev => ({ ...prev, porcentajeGanancia: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-3">
                <div>
                  <label className="block mb-1 text-slate-300 font-semibold">Cargo</label>
                  <select
                    value={formData.cargo}
                    onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-bold outline-none [&>option]:bg-slate-950"
                  >
                    <option value="Mecánico">Mecánico</option>
                    <option value="Recepcionista">Recepcionista</option>
                    {isSuperUser && <option value="Administrador">Administrador</option>}
                    {isSuperUser && <option value="Súper Usuario">Súper Usuario</option>}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-300 font-sans">Fecha de contratación</label>
                  <input
                    type="date"
                    value={formData.fechaContratacion}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaContratacion: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 font-sans font-medium outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-800/60 pt-3">
                <input
                  type="checkbox"
                  id="edit-tiene-licencia"
                  checked={formData.tieneLicencia}
                  onChange={(e) => setFormData(prev => ({ ...prev, tieneLicencia: e.target.checked }))}
                  className="w-4 h-4 text-violet-500 border-slate-800 rounded focus:ring-violet-500 bg-slate-950"
                />
                <label htmlFor="edit-tiene-licencia" className="text-slate-300 font-bold select-none cursor-pointer">
                  El empleado tiene licencia
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="bg-slate-850 hover:bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl cursor-pointer font-semibold transition-all"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-105 text-white rounded-xl px-5 py-2.5 font-black uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Guardar cambios
                </button>
              </div>

            </form>

          </div>
        </div>
      )}


      {/* Modal 3: Reporte - Marlon Chicas behavior uploader logs (Page 9) */}
      {isReportOpen && selectedEmp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in duration-200 text-slate-200">
            
            <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-5 flex justify-between items-center bg-red-600">
              <div className="flex items-center gap-2">
                <UserX className="w-5 h-5 animate-bounce text-white" />
                <h3 className="font-display font-bold text-base">
                  Reporte – {selectedEmp.nombre}
                </h3>
              </div>
              <button onClick={() => setIsReportOpen(false)} className="text-white hover:opacity-80 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs text-slate-300 space-y-1">
                <p><span className="font-bold text-slate-500">Nombre:</span> <span className="text-white font-semibold">{selectedEmp.nombre}</span></p>
                <p><span className="font-bold text-slate-500">Teléfono:</span> <span className="text-white font-mono">{selectedEmp.telefono}</span></p>
                <p><span className="font-bold text-slate-500">Cargo:</span> <span className="text-white font-semibold">{selectedEmp.cargo}</span></p>
                <p><span className="font-bold text-slate-500">Base:</span> <span className="text-white font-mono">${selectedEmp.sueldoBase}</span></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tipo de Reporte</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none font-bold text-white [&>option]:bg-slate-950"
                >
                  <option value="Comportamiento">Comportamiento / Indisciplinado</option>
                  <option value="Retraso matutino">Retraso de Turno</option>
                  <option value="Felicitación">Felicitación de cliente</option>
                  <option value="Otro">Otro reporte</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notas del reporte</label>
                <textarea
                  required
                  rows={4}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="Escribe observaciones, motivo del reporte..."
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none text-white focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/65">
                <button
                  type="button"
                  onClick={() => setIsReportOpen(false)}
                  className="bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-xs font-black text-white bg-red-650 hover:bg-red-500 rounded-xl px-5 py-2.5 shadow-md cursor-pointer uppercase tracking-wider transition-all"
                >
                  Guardar reporte
                </button>
              </div>

            </form>

          </div>
        </div>
      )}


      {/* Modal 4: Visualizar Carga de Trabajo y Nómina (Page 6 bullet instruction logs) */}
      {isStatsOpen && selectedEmp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-base flex items-center gap-1.5">
                  <Wrench className="w-5 h-5 text-orange-400" />
                  Carga de Trabajo y Salario Estimado
                </h3>
                <p className="text-[11px] text-slate-300">Monitoreo específico de comisiones y vehículos activos.</p>
              </div>
              <button onClick={() => setIsStatsOpen(false)} className="text-slate-400 hover:text-violet-600">✕</button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Employee wages overview */}
              <div className="flex gap-4">
                <img 
                  src={selectedEmp.avatarUrl} 
                  alt="" 
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{selectedEmp.nombre}</h4>
                  <p className="text-xs text-slate-450 font-semibold">{selectedEmp.cargo}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded">
                      Sueldo Base: ${selectedEmp.sueldoBase}
                    </span>
                    {selectedEmp.porcentajeGanancia && (
                      <span className="text-[10px] bg-orange-50 text-orange-700 font-bold px-2 py-0.5 rounded border border-orange-100">
                        {selectedEmp.porcentajeGanancia}% de ganancia
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Page 6: Ver que carros están trabajando */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h5 className="font-display font-semibold text-xs text-slate-700 uppercase tracking-widest flex items-center gap-1">
                  🚗 Vehículos asignados trabajando actualmente:
                </h5>

                <div className="space-y-2">
                  {getEmployeeStats(selectedEmp).assignedCars.map(veh => (
                    <div key={veh.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{veh.marca} {veh.modelo}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Placa: [{veh.placa}] • Ingreso: {veh.fechaIngreso}</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                        {veh.estado}
                      </span>
                    </div>
                  ))}

                  {getEmployeeStats(selectedEmp).assignedCars.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Sin tareas o vehículos activos asignados.
                    </p>
                  )}
                </div>
              </div>

              {/* Page 6: Sueldo estimado con porcentaje */}
              <div className="border-t border-slate-100 pt-4 bg-orange-50/20 p-4 rounded-xl border border-orange-100">
                <h5 className="font-display font-semibold text-xs text-slate-700 uppercase tracking-widest flex items-center gap-1 mb-2">
                  <DollarSign className="w-4 h-4 text-orange-500" />
                  Sueldo estimado de comisiones mes actual:
                </h5>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
                  <div>
                    <span className="text-slate-500 block">Sueldo Base asegurado:</span>
                    <span className="font-bold font-mono text-slate-800">${selectedEmp.sueldoBase.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      Comisiones {selectedEmp.porcentajeGanancia || 0}% sobre servicios (${getEmployeeStats(selectedEmp).serviceSalesTotal.toFixed(2)}):
                    </span>
                    <span className="font-black font-mono text-emerald-600">
                      +${getEmployeeStats(selectedEmp).bonus.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-dashed border-orange-200 pt-2.5 mt-2.5 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">SUELDO LIQUIDADO ESTIMADO:</span>
                    <span className="text-base font-mono font-black text-slate-900 border-b-2 border-orange-500">
                      ${getEmployeeStats(selectedEmp).estimatedTotalWage.toFixed(2)}
                    </span>
                  </div>

                  {isPaying ? (
                    <div className="bg-white border border-emerald-200 p-3 rounded-xl space-y-3 shadow-md animate-in slide-in-from-top-2 duration-200">
                      <div className="flex justify-between items-center pb-2 border-b border-emerald-150">
                        <h6 className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Proceder a Pagar Nómina</h6>
                        <span className="text-[10px] text-slate-500 font-medium">Sugerido: ${getEmployeeStats(selectedEmp).estimatedTotalWage.toFixed(2)}</span>
                      </div>
                      
                      <div className="space-y-2.5 text-left">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 mb-1">Monto Real del Pago ($) *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            className="w-full text-xs bg-emerald-50/50 border border-emerald-200 text-slate-900 rounded-lg p-2 outline-none focus:border-emerald-500 font-bold font-mono"
                            placeholder="Monto a pagar"
                          />
                          <p className="text-[9px] text-slate-450 mt-0.5 font-medium">
                            * El monto estimado sugerido es <span className="font-bold font-mono text-emerald-600">${getEmployeeStats(selectedEmp).estimatedTotalWage.toFixed(2)}</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 mb-1">Período / Mes:</label>
                            <input
                              type="text"
                              value={payMonth}
                              onChange={(e) => setPayMonth(e.target.value)}
                              className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 outline-none focus:border-emerald-500 font-semibold"
                              placeholder="Ej. Junio 2026"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 mb-1">Concepto o Detalle:</label>
                            <input
                              type="text"
                              value={payDetail}
                              onChange={(e) => setPayDetail(e.target.value)}
                              className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 outline-none focus:border-emerald-500 font-semibold"
                              placeholder="Detalle..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setIsPaying(false)}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => confirmPayment(selectedEmp)}
                          className="text-[10px] font-black text-white bg-emerald-600 hover:bg-emerald-650 px-3.5 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer uppercase tracking-wider"
                        >
                          Guardar Pago
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPaying(true);
                        setPayMonth(getCurrentMonthYear());
                        setPayDetail(`Sueldo base + comisiones por servicios de ${getCurrentMonthYear()}`);
                        setPayAmount(getEmployeeStats(selectedEmp).estimatedTotalWage.toFixed(2));
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-650 active:scale-98 transition-all text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/15 cursor-pointer uppercase tracking-wider"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Registrar Pago de Sueldo
                    </button>
                  )}
                </div>
              </div>

              {/* Page 6: Historial de sus sueldos */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h5 className="font-display font-semibold text-xs text-slate-700 uppercase tracking-widest flex items-center gap-1">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  Historial de sus sueldos pagados (Meses previos):
                </h5>

                <div className="space-y-2">
                  {getEmployeeStats(selectedEmp).payrollHistory.map((pay) => (
                    <div key={pay.id} className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex justify-between items-start text-xs gap-4">
                      <div>
                        <p className="font-bold text-slate-800">{pay.mes}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{pay.detalle}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Pagado el: {pay.fechaPago}</p>
                      </div>
                      <span className="font-mono font-black text-slate-705 shrink-0">
                        ${pay.monto.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setIsStatsOpen(false)}
                className="bg-slate-800 hover:bg-black text-white rounded-xl text-xs font-bold px-4 py-2 cursor-pointer"
              >
                Cerrar consulta
              </button>
            </div>

          </div>
        </div>
      )}


      {/* Modal 5: Registro de Vacaciones y Descansos */}
      {isVacacionesOpen && selectedEmp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-150 shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-base flex items-center gap-2 text-white">
                  <Calendar className="w-5 h-5 text-violet-400" />
                  Registro de Vacaciones y Permisos
                </h3>
                <p className="text-[11px] text-slate-350">
                  Control interno de días, solicitudes de descanso y licencias del personal.
                </p>
              </div>
              <button 
                onClick={() => setIsVacacionesOpen(false)} 
                className="text-slate-400 hover:text-violet-600 font-bold cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 max-h-[72vh] overflow-y-auto divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              {/* Left Column: Form to request a new Vacation */}
              <div className="md:col-span-5 p-6 space-y-4">
                <div className="flex gap-3 pb-3 border-b border-slate-100">
                  <img 
                    src={selectedEmp.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'} 
                    alt="" 
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-xs"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-850 leading-tight">{selectedEmp.nombre}</h4>
                    <p className="text-[10px] text-slate-450 font-bold mt-0.5">{selectedEmp.cargo}</p>
                  </div>
                </div>

                <div className="bg-violet-50/50 rounded-xl p-3 border border-violet-100 text-[11px] text-slate-700">
                  <p className="font-bold flex items-center gap-1 text-violet-900">
                    <CheckCircle className="w-3.5 h-3.5 text-violet-500" />
                    Cálculo Automático de Días
                  </p>
                  <p className="mt-1 text-slate-600 leading-normal font-medium">
                    El ERP calculará el número exacto de días naturales comprendidos en el rango de fechas registradas.
                  </p>
                </div>

                <form onSubmit={handleAddVacacionSubmit} className="space-y-3 font-semibold text-xs">
                  <h4 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                    Registrar Período:
                  </h4>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">Fecha de Inicio *</label>
                    <input
                      type="date"
                      required
                      value={vacForm.fechaInicio}
                      onChange={(e) => setVacForm(prev => ({ ...prev, fechaInicio: e.target.value }))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-855 rounded-lg p-2 outline-none focus:border-violet-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">Fecha Final *</label>
                    <input
                      type="date"
                      required
                      value={vacForm.fechaFin}
                      onChange={(e) => setVacForm(prev => ({ ...prev, fechaFin: e.target.value }))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-855 rounded-lg p-2 outline-none focus:border-violet-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">Tipo de Licencia *</label>
                    <select
                      value={vacForm.tipo}
                      onChange={(e) => setVacForm(prev => ({ ...prev, tipo: e.target.value }))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 outline-none focus:border-violet-500 font-bold"
                    >
                      <option value="Vacación Anual Regular">Vacación Anual Regular</option>
                      <option value="Permiso con Goce de Sueldo">Permiso con Goce de Sueldo</option>
                      <option value="Permiso sin Goce de Sueldo">Permiso sin Goce de Sueldo</option>
                      <option value="Incapacidad Médica">Incapacidad Médica</option>
                      <option value="Licencia Especial (Paternidad/Matrimonio)">Licencia Especial</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">Estado</label>
                    <select
                      value={vacForm.estado}
                      onChange={(e) => setVacForm(prev => ({ ...prev, estado: e.target.value as any }))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 outline-none focus:border-violet-500 font-bold"
                    >
                      <option value="Pendiente">Pendiente de Aprobación</option>
                      <option value="Aprobado">Aprobado / Programado</option>
                      <option value="Gozado">Gozado / Culminado</option>
                      <option value="Rechazado">Rechazado / Cancelado</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">Comentarios u Observaciones</label>
                    <textarea
                      value={vacForm.comentarios}
                      onChange={(e) => setVacForm(prev => ({ ...prev, comentarios: e.target.value }))}
                      placeholder="Ej. Correspondiente al período de vacaciones anual... "
                      rows={2}
                      className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2 outline-none focus:border-violet-500 font-medium"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-slate-900 hover:bg-black text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-violet-400" />
                    Guardar Período de Vacación
                  </button>

                </form>
              </div>

              {/* Right Column: List of Registered Vacations of Selected Employee */}
              <div className="md:col-span-7 p-6 space-y-4">
                <h4 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider flex items-center justify-between">
                  <span>Bitácora de Días:</span>
                  <span className="text-indigo-800 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded font-mono font-black text-[10px]">
                    Total: {vacaciones.filter(v => v.empleadoId === selectedEmp.id && v.estado !== 'Rechazado').reduce((acc, v) => acc + v.totalDias, 0)} días
                  </span>
                </h4>

                <div className="space-y-3 overflow-y-auto max-h-[48vh] pr-1.5 scrollbar-thin">
                  {vacaciones.filter(v => v.empleadoId === selectedEmp.id).map(vac => (
                    <div 
                      key={vac.id} 
                      className={`p-3.5 rounded-xl border flex flex-col justify-between text-xs transition-colors ${
                        vac.estado === 'Aprobado' 
                          ? 'bg-emerald-50/40 border-emerald-100 hover:bg-emerald-50/70' 
                          : vac.estado === 'Gozado' 
                          ? 'bg-violet-50/40 border-violet-100 hover:bg-violet-50/70'
                          : vac.estado === 'Rechazado'
                          ? 'bg-rose-50/40 border-rose-100 hover:bg-rose-50/70'
                          : 'bg-amber-50/40 border-amber-100 hover:bg-amber-50/70'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                              vac.estado === 'Aprobado'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : vac.estado === 'Gozado'
                                ? 'bg-violet-100 text-violet-800 border-violet-200'
                                : vac.estado === 'Rechazado'
                                ? 'bg-rose-100 text-rose-800 border-rose-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}>
                              {vac.estado}
                            </span>
                            <span className="font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.2 rounded text-slate-800 font-bold">
                              {vac.totalDias} {vac.totalDias === 1 ? 'Día' : 'Días'}
                            </span>
                          </div>
                          
                          <div className="font-bold text-slate-800 text-xs">
                            {vac.tipo}
                          </div>
                          
                          <div className="text-[10px] text-slate-500 font-bold font-mono py-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Del {vac.fechaInicio} al {vac.fechaFin}</span>
                          </div>

                          <p className="text-[10px] text-slate-650 mt-1.5 bg-white/70 p-2 rounded border border-slate-100 italic leading-normal font-medium">
                            &ldquo;{vac.comentarios}&rdquo;
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteVacacion(vac.id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                          title="Eliminar este registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Pill actions to switch status */}
                      <div className="border-t border-dashed border-slate-150 pt-2 mt-2.5 flex flex-wrap justify-end gap-1 text-[8px] font-extrabold">
                        {vac.estado !== 'Pendiente' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateVacacionEstado(vac.id, 'Pendiente')}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800 border border-slate-200 transition-colors cursor-pointer"
                          >
                            Pendiente
                          </button>
                        )}
                        {vac.estado !== 'Aprobado' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateVacacionEstado(vac.id, 'Aprobado')}
                            className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-250 border border-emerald-200 transition-colors cursor-pointer"
                          >
                            Aprobar
                          </button>
                        )}
                        {vac.estado !== 'Gozado' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateVacacionEstado(vac.id, 'Gozado')}
                            className="px-2 py-0.5 rounded bg-violet-100 text-violet-800 hover:bg-violet-200 border border-violet-200 transition-colors cursor-pointer"
                          >
                            Marcar Gozado
                          </button>
                        )}
                        {vac.estado !== 'Rechazado' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateVacacionEstado(vac.id, 'Rechazado')}
                            className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 hover:bg-rose-220 border border-rose-200 transition-colors cursor-pointer"
                          >
                            Rechazar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {vacaciones.filter(v => v.empleadoId === selectedEmp.id).length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs italic">
                      No hay vacaciones o días registrados previamente para este empleado. En la columna izquierda puede programar unos.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setIsVacacionesOpen(false)}
                className="bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold px-5 py-2 cursor-pointer transition-colors"
              >
                Cerrar Ventana
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
