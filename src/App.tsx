import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  type ActiveView,
  Dashboard,
  Vehiculos,
  Caja,
  Clientes,
  Facturacion,
  Inventario,
  Offers,
  Proveedores,
  Empleados,
  PerfilEditar,
  MenuDashboard
} from './views';

import { 
  Usuario, 
  Vehiculo, 
  Cliente, 
  Producto, 
  Oferta, 
  Proveedor, 
  Factura, 
  TurnoCaja, 
  ReporteTrabajador, 
  RegistroSueldo 
} from './types';
import { api } from './api';
import { LocalDataBase } from './mockData';
import { useAuthController } from './controllers/useAuthController';
import { 
  KeyRound, 
  AlertTriangle, 
  Menu,
  X
} from 'lucide-react';

export default function App() {
  // Navigation pages (matches Sidebar ActiveView): home, vehiculos, caja, clientes, ofertas, facturacion, inventario, proveedores, empleados
  const [currentPage, setCurrentPage] = useState<ActiveView>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [useLocalData, setUseLocalData] = useState(true);

  // Master Collections
  const [empleados, setEmpleados] = useState<Usuario[]>(() => LocalDataBase.getEmpleados());
  const [clientes, setClientes] = useState<Cliente[]>(() => LocalDataBase.getClientes());
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(() => LocalDataBase.getVehiculos());
  const [productos, setProductos] = useState<Producto[]>(() => LocalDataBase.getProductos());
  const [proveedores, setProveedores] = useState<Proveedor[]>(() => LocalDataBase.getProveedores());
  const [ofertas, setOfertas] = useState<Oferta[]>(() => LocalDataBase.getOfertas());
  const [facturas, setFacturas] = useState<Factura[]>(() => LocalDataBase.getFacturas());
  const [reportes, setReportes] = useState<ReporteTrabajador[]>(() => LocalDataBase.getReportesTrabajadores());
  
  // Shift Management State
  const [turnosHistory, setTurnosHistory] = useState<TurnoCaja[]>(() => LocalDataBase.getHistorialTurnos());
  const [activeTurno, setActiveTurno] = useState<TurnoCaja | null>(() => LocalDataBase.getActiveTurno());

  const {
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
    handleLogout,
    handleSwitchUserRole,
    updateCurrentUser
  } = useAuthController();

  useEffect(() => {
    if (!useLocalData) return;
    LocalDataBase.saveEmpleados(empleados);
    LocalDataBase.saveClientes(clientes);
    LocalDataBase.saveVehiculos(vehiculos);
    LocalDataBase.saveProductos(productos);
    LocalDataBase.saveProveedores(proveedores);
    LocalDataBase.saveOfertas(ofertas);
    LocalDataBase.saveFacturas(facturas);
    LocalDataBase.saveReportesTrabajadores(reportes);
    LocalDataBase.saveHistorialTurnos(turnosHistory);
    LocalDataBase.saveActiveTurno(activeTurno);
  }, [useLocalData, empleados, clientes, vehiculos, productos, proveedores, ofertas, facturas, reportes, turnosHistory, activeTurno]);

  useEffect(() => {
    if (!isLogged || !authReady) return;
    void Promise.all([api.customers(), api.vehicles(), api.products(), api.invoices(), api.activeShift(), api.shifts()]).then(([loadedClientes, loadedVehiculos, loadedProductos, loadedFacturas, loadedActiveShift, loadedShifts]) => {
      setClientes(loadedClientes); setVehiculos(loadedVehiculos); setProductos(loadedProductos); setFacturas(loadedFacturas); setActiveTurno(loadedActiveShift); setTurnosHistory(loadedShifts);
      setUseLocalData(false);
    }).catch(() => setUseLocalData(true));
  }, [isLogged, authReady]);

  // Callback mutators:
  
  // A. Vehiculo actions
  const handleAddVehiculo = async (v: Omit<Vehiculo, 'id' | 'trabajosRealizados'>) => {
    if (useLocalData) {
      setVehiculos(prev => [{ ...v, id: `veh-${Date.now()}`, trabajosRealizados: [] }, ...prev]);
      return;
    }
    const newVeh = await api.createVehicle(v);
    setVehiculos(prev => [newVeh, ...prev]);
  };

  const handleUpdateVehiculo = async (updated: Vehiculo) => {
    if (useLocalData) {
      setVehiculos(prev => prev.map(vehicle => vehicle.id === updated.id ? updated : vehicle));
      return;
    }
    const saved = await api.updateVehicle(updated);
    setVehiculos(prev => prev.map(v => v.id === saved.id ? saved : v));
  };

  const handleDeleteVehiculo = (id: string) => {
    setVehiculos(prev => prev.filter(v => v.id !== id));
  };

  // Rapid addition page 11 integration
  const handleAddClienteRapido = async (c: { nombre: string; telefono: string; dui: string; correo: string }) => {
    if (useLocalData) {
      const id = `cli-${Date.now()}`;
      setClientes(prev => [{ ...c, id, frecuenciaVisita: 'Regular', direccion: 'Filtro rápido taller', activo: true }, ...prev]);
      return id;
    }
    const newCli = await api.createCustomer({ ...c, frecuenciaVisita: 'Regular', direccion: '', activo: true });
    setClientes(prev => [newCli, ...prev]);
    return newCli.id;
  };

  // B. Cliente actions
  const handleAddCliente = async (c: Omit<Cliente, 'id'>) => {
    if (useLocalData) {
      setClientes(prev => [{ ...c, id: `cli-${Date.now()}` }, ...prev]);
      return;
    }
    const newCli = await api.createCustomer(c);
    setClientes(prev => [newCli, ...prev]);
  };

  const handleUpdateCliente = async (updated: Cliente) => {
    if (useLocalData) {
      setClientes(prev => prev.map(client => client.id === updated.id ? updated : client));
      return;
    }
    const saved = await api.updateCustomer(updated);
    setClientes(prev => prev.map(c => c.id === saved.id ? saved : c));
  };

  const handleDeleteCliente = async (id: string) => {
    if (useLocalData) {
      setClientes(prev => prev.filter(client => client.id !== id));
      return;
    }
    await api.deleteCustomer(id); setClientes(prev => prev.filter(c => c.id !== id));
  };

  // C. Caja actions (Shift Open/Close and Cash updates)
  const handleAbrirCaja = async (baseAmount: number) => {
    if (useLocalData) {
      setActiveTurno({ id: `turno-${Date.now()}`, turnoNumero: turnosHistory.length + 1, fecha: new Date().toISOString().split('T')[0], responsableId: currentUser.id, responsableNombre: currentUser.nombre, base: baseAmount, efectivo: baseAmount, horaInicio: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), estado: 'Abierta', facturasEmitidasCount: 0, ventasTurno: 0 });
      return;
    }
    setActiveTurno(await api.openShift(baseAmount));
  };

  const handleCerrarCaja = async () => {
    if (!activeTurno) return;
    if (useLocalData) {
      setTurnosHistory(prev => [{ ...activeTurno, estado: 'Cerrada', cierre: activeTurno.efectivo, horaCierre: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev]);
      setActiveTurno(null);
      return;
    }
    const closed = await api.closeShift(activeTurno.id, activeTurno.efectivo);
    setTurnosHistory(prev => [closed, ...prev]); setActiveTurno(null);
  };

  const handleAnularFactura = async (id: string) => {
    const saved = await api.annulInvoice(id, 'Anulación solicitada desde caja');
    setFacturas(prev => prev.map(invoice => invoice.id === saved.id ? saved : invoice));
    setActiveTurno(await api.activeShift());
    setProductos(await api.products());
  };

  const handleActualizarEfectivoActual = (monto: number) => {
    if (activeTurno) {
      setActiveTurno(prev => prev ? {
        ...prev,
        efectivo: monto
      } : null);
    }
  };

  // D. Emit Factura & Deduct Stocks
  const handleEmitirFactura = async (f: Omit<Factura, 'id' | 'codigo' | 'fecha'>) => {
    const newFact = await api.createInvoice({ customerId: f.clienteId, vehicleId: f.vehiculoId, type: f.tipo, items: f.items.map(item => ({ productId: item.productoId, quantity: item.cantidad })) });
    setFacturas(prev => [newFact, ...prev]);
    setActiveTurno(await api.activeShift());
    setProductos(await api.products());
    setVehiculos(await api.vehicles());
  };

  // E. Producto actions
  const handleAddProducto = async (p: Omit<Producto, 'id'>) => {
    if (useLocalData) {
      setProductos(prev => [{ ...p, id: `prod-${Date.now()}` }, ...prev]);
      return;
    }
    const newP = await api.createProduct(p);
    setProductos(prev => [newP, ...prev]);
  };

  const handleUpdateProducto = async (updated: Producto) => {
    if (useLocalData) {
      setProductos(prev => prev.map(product => product.id === updated.id ? updated : product));
      return;
    }
    const saved = await api.updateProduct(updated);
    setProductos(prev => prev.map(p => p.id === saved.id ? saved : p));
  };

  const handleDeleteProducto = async (id: string) => {
    if (useLocalData) {
      setProductos(prev => prev.filter(product => product.id !== id));
      return;
    }
    await api.deleteProduct(id);
    setProductos(prev => prev.filter(p => p.id !== id));
  };

  const handleAdjustStock = async (prodId: string, qty: number) => {
    if (useLocalData) {
      setProductos(prev => prev.map(product => product.id === prodId ? { ...product, stock: Math.max(0, product.stock + qty) } : product));
      return;
    }
    const saved = await api.adjustStock(prodId, qty, 'Ajuste manual desde inventario');
    setProductos(prev => prev.map(product => product.id === saved.id ? saved : product));
  };

  // F. Oferta actions
  const handleAddOferta = (o: Omit<Oferta, 'id'>) => {
    const newOf: Oferta = {
      ...o,
      id: `of-${Date.now()}`
    };
    setOfertas(prev => [newOf, ...prev]);
  };

  const handleToggleOferta = (id: string) => {
    setOfertas(prev => prev.map(o => o.id === id ? { ...o, activo: !o.activo } : o));
  };

  const handleDeleteOferta = (id: string) => {
    setOfertas(prev => prev.filter(o => o.id !== id));
  };

  // G. Proveedor actions
  const handleAddProveedor = (p: Omit<Proveedor, 'id'>) => {
    const newP: Proveedor = {
      ...p,
      id: `prov-${Date.now()}`
    };
    setProveedores(prev => [newP, ...prev]);
  };

  const handleUpdateVendor = (updated: Proveedor) => {
    setProveedores(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeleteProveedor = (id: string) => {
    setProveedores(prev => prev.filter(p => p.id !== id));
  };

  // H. Empleado actions
  const handleAddUsuario = (user: Usuario) => {
    setEmpleados(prev => [user, ...prev]);
  };

  const handleUpdateUsuario = (user: Usuario) => {
    setEmpleados(prev => prev.map(e => e.id === user.id ? user : e));
    if (user.id === currentUser.id) {
      updateCurrentUser(user);
    }
  };

  const handleDeleteUsuario = (id: string) => {
    if (id === currentUser.id) {
      alert('No puede eliminar a su propio usuario activo en sesión.');
      return;
    }
    setEmpleados(prev => prev.filter(e => e.id !== id));
  };

  // I. Disciplinary behavior Logs
  const handleAddReporteTrabajador = (rep: Omit<ReporteTrabajador, 'id' | 'fecha'>) => {
    const newRep: ReporteTrabajador = {
      ...rep,
      id: `rep-${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0]
    };
    setReportes(prev => [newRep, ...prev]);
  };

  const handleDeleteReporte = (id: string) => {
    setReportes(prev => prev.filter(r => r.id !== id));
  };

  // Route Content switcher
  const renderMainContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <MenuDashboard
            onSetView={(view) => setCurrentPage(view)}
            activeVehiculosCount={vehiculos.filter(v => v.estado !== 'Entregado').length}
            lowStockCount={productos.filter(p => p.tipo === 'Producto' && p.stock <= p.stockMinimo).length}
            activeTurnoState={!!activeTurno}
          />
        );
      case 'reportes':
        return (
          <Dashboard
            vehiculos={vehiculos}
            productos={productos}
            facturas={facturas}
            reportes={reportes}
            activeTurno={activeTurno}
            clientes={clientes}
            onSetView={(view) => setCurrentPage(view)}
            onDeleteReporte={handleDeleteReporte}
          />
        );
      case 'vehiculos':
        return (
          <Vehiculos
            vehiculos={vehiculos}
            clientes={clientes}
            empleados={empleados}
            currentUser={currentUser}
            onAddVehiculo={handleAddVehiculo}
            onUpdateVehiculo={handleUpdateVehiculo}
            onAddClienteRapido={handleAddClienteRapido}
          />
        );
      case 'caja':
        return (
          <Caja
            activeTurno={activeTurno}
            facturas={facturas}
            currentUser={currentUser}
            historialTurnos={turnosHistory}
            onSetView={(view) => setCurrentPage(view)}
            onAbrirCaja={handleAbrirCaja}
            onCerrarCaja={handleCerrarCaja}
            onAnularFactura={handleAnularFactura}
            onActualizarEfectivoActual={handleActualizarEfectivoActual}
          />
        );
      case 'clientes':
        return (
          <Clientes
            clientes={clientes}
            vehiculos={vehiculos}
            currentUser={currentUser}
            onAddCliente={handleAddCliente}
            onUpdateCliente={handleUpdateCliente}
            onDeleteCliente={handleDeleteCliente}
            onAddReporteCliente={handleAddReporteTrabajador}
          />
        );
      case 'facturacion':
        return (
          <Facturacion
            clientes={clientes}
            vehiculos={vehiculos}
            productos={productos}
            ofertas={ofertas}
            activeTurno={activeTurno}
            onEmitirFactura={handleEmitirFactura}
          />
        );
      case 'inventario':
        return (
          <Inventario
            productos={productos}
            proveedores={proveedores}
            onAddProducto={handleAddProducto}
            onUpdateProducto={handleUpdateProducto}
            onDeleteProducto={handleDeleteProducto}
            onAdjustStock={handleAdjustStock}
          />
        );
      case 'ofertas':
        return (
          <Offers
            ofertas={ofertas}
            productos={productos}
            onAddOferta={handleAddOferta}
            onToggleOfertaActivo={handleToggleOferta}
            onDeleteOferta={handleDeleteOferta}
          />
        );
      case 'proveedores':
        return (
          <Proveedores
            proveedores={proveedores}
            onAddProveedor={handleAddProveedor}
            onUpdateProveedor={handleUpdateVendor}
            onDeleteProveedor={handleDeleteProveedor}
          />
        );
      case 'empleados':
        return (
          <Empleados
            empleados={empleados}
            vehiculos={vehiculos}
            facturas={facturas}
            currentUser={currentUser}
            reportesTrabajadores={reportes}
            onAddEmpleado={handleAddUsuario}
            onUpdateEmpleado={handleUpdateUsuario}
            onDeleteEmpleado={handleDeleteUsuario}
            onAddReporte={handleAddReporteTrabajador}
          />
        );
      case 'perfil':
        return (
          <PerfilEditar 
            currentUser={currentUser}
            onUpdateCurrentUser={handleUpdateUsuario}
            onLogout={handleLogout}
          />
        );
      default:
        return <div className="text-center font-bold text-slate-500 py-10">Módulo no identificado.</div>;
    }
  };

  // Logged-out layout gates beautiful screen
  if (!isLogged) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-violet-500 selection:text-white relative overflow-hidden">
        
        {/* Abstract absolute graphics */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-650/10 rounded-full blur-3xl animate-pulse duration-5000"></div>

        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-7 relative z-10 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex p-2">
              <img src="/assets/logo_taller.png" alt="Logo Taller Rodríguez" className="w-16 h-16 object-contain" />
            </div>
            
            <h1 className="text-2xl font-black font-display text-white tracking-tight mt-3">
              Taller Rodríguez
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Ingrese credenciales de taller o acelere utilizando acceso rápido de un clic.
            </p>
          </div>

          {loginError && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-pulse" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Empleado (Nombre o DUI)
              </label>
              <input
                id="login-username"
                type="text"
                required
                value={loginUserDui}
                onChange={(e) => setLoginUserDui(e.target.value)}
                placeholder="Ej. Heysell o Marlon Chicas"
                className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Contraseña de Acceso
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Pruebe con '123' o su DUI"
                className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-violet-500 transition-colors font-mono"
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="w-full py-3 text-xs font-black text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-105 rounded-xl shadow-lg shadow-violet-500/10 cursor-pointer uppercase tracking-wider"
            >
              Iniciar sesión
            </button>
          </form>

          {/* Quick-Access Seed Profiles Portal */}
          <div className="border-t border-slate-800/80 pt-5 space-y-3">
            <p className="text-[10px] font-bold text-violet-400 text-center uppercase tracking-widest flex items-center justify-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-violet-400" />
              Ingreso rápido con un clic:
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {empleados.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => handleQuickLogin(emp)}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-center gap-2 text-left hover:border-violet-500/50 transition-colors cursor-pointer text-slate-300"
                >
                  <img 
                    src={emp.avatarUrl} 
                    alt="" 
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover border border-slate-700 font-sans"
                  />
                  <div className="truncate">
                    <p className="font-bold text-white truncate">{emp.nombre}</p>
                    <span className="text-[9px] text-slate-400 block">{emp.cargo}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Loaded & Authenticated application workspace
  return (
    <div id="app-wrapper" className="min-h-screen bg-slate-950 font-sans text-slate-100 flex selection:bg-violet-500 selection:text-white relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-600/4 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Backdrop overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* 1. Sidebar Panel on Left */}
      <Sidebar 
        currentView={currentPage}
        onSetView={(view) => setCurrentPage(view)}
        currentUser={currentUser}
        employees={empleados}
        activeTurno={activeTurno}
        onChangeUser={handleSwitchUserRole}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Workspace container right pane */}
      <div className="flex-1 flex flex-col min-w-0 font-sans relative z-10">

        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between bg-slate-900/60 backdrop-blur-md border-b border-slate-900 p-4 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 transition-all cursor-pointer"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-display font-black text-sm text-white uppercase tracking-wider pl-1 font-semibold">
              {currentPage === 'home' && 'Menú Principal'}
              {currentPage === 'reportes' && 'Reportes'}
              {currentPage === 'vehiculos' && 'Vehículos'}
              {currentPage === 'caja' && 'Caja'}
              {currentPage === 'clientes' && 'Clientes'}
              {currentPage === 'ofertas' && 'Ofertas'}
              {currentPage === 'facturacion' && 'Facturación'}
              {currentPage === 'inventario' && 'Inventario'}
              {currentPage === 'proveedores' && 'Proveedores'}
              {currentPage === 'empleados' && 'Empleados'}
              {currentPage === 'perfil' && 'Perfil'}
            </span>
          </div>

          {/* Compact profile trigger icon on the right */}
          <div 
            onClick={() => setCurrentPage('perfil')}
            className="flex items-center gap-2 cursor-pointer bg-slate-950 p-1.5 px-3 rounded-full border border-slate-850 hover:border-violet-500 transition-colors"
          >
            <img 
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
              alt={currentUser.nombre} 
              className="w-5 h-5 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="text-[10px] text-slate-300 font-extrabold max-w-[70px] truncate">{currentUser.nombre.split(' ')[0]}</span>
          </div>
        </div>

        {/* 3. Main routed layout container */}
        <main className="p-4 md:p-6 lg:p-8 flex-1 space-y-6 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          
          {/* Active component view list renderer */}
          {renderMainContent()}

        </main>

      </div>

    </div>
  );
}
