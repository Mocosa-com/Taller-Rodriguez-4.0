import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveView } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Vehiculos } from './components/Vehiculos';
import { Caja } from './components/Caja';
import { Clientes } from './components/Clientes';
import { Facturacion } from './components/Facturacion';
import { Inventario } from './components/Inventario';
import { Offers } from './components/Offers';
import { Proveedores } from './components/Proveedores';
import { Empleados } from './components/Empleados';
import { PerfilEditar } from './components/PerfilEditar';
import { MenuDashboard } from './components/MenuDashboard';

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
import { LocalDataBase } from './mockData';
import { 
  KeyRound, 
  AlertTriangle, 
  Menu,
  X
} from 'lucide-react';

export default function App() {
  // Authentication & session
  const [isLogged, setIsLogged] = useState<boolean>(() => LocalDataBase.isLogged());
  const [currentUser, setCurrentUser] = useState<Usuario>(() => LocalDataBase.getCurrentUser());

  // Navigation pages (matches Sidebar ActiveView): home, vehiculos, caja, clientes, ofertas, facturacion, inventario, proveedores, empleados
  const [currentPage, setCurrentPage] = useState<ActiveView>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

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

  // Login variables
  const [loginUserDui, setLoginUserDui] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Synchronize root LocalStorage when state mutates
  useEffect(() => {
    LocalDataBase.saveLogged(isLogged);
  }, [isLogged]);

  useEffect(() => {
    LocalDataBase.saveCurrentUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    LocalDataBase.saveEmpleados(empleados);
  }, [empleados]);

  useEffect(() => {
    LocalDataBase.saveClientes(clientes);
  }, [clientes]);

  useEffect(() => {
    LocalDataBase.saveVehiculos(vehiculos);
  }, [vehiculos]);

  useEffect(() => {
    LocalDataBase.saveProductos(productos);
  }, [productos]);

  useEffect(() => {
    LocalDataBase.saveProveedores(proveedores);
  }, [proveedores]);

  useEffect(() => {
    LocalDataBase.saveOfertas(ofertas);
  }, [ofertas]);

  useEffect(() => {
    LocalDataBase.saveFacturas(facturas);
  }, [facturas]);

  useEffect(() => {
    LocalDataBase.saveReportesTrabajadores(reportes);
  }, [reportes]);

  useEffect(() => {
    LocalDataBase.saveHistorialTurnos(turnosHistory);
  }, [turnosHistory]);

  useEffect(() => {
    LocalDataBase.saveActiveTurno(activeTurno);
  }, [activeTurno]);

  // Login execution
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = empleados.find(emp => 
      emp.dui.replace(/\D/g, '') === loginUserDui.replace(/\D/g, '') || 
      emp.nombre.toLowerCase() === loginUserDui.trim().toLowerCase()
    );

    if (found) {
      if (found.password === loginPassword || loginPassword === '123') {
        setCurrentUser(found);
        setIsLogged(true);
        setLoginError('');
      } else {
        setLoginError('Contraseña incorrecta. (Pruebe con "123").');
      }
    } else {
      setLoginError('DUI o nombre de empleado no identificado.');
    }
  };

  // Quick access login bypass
  const handleQuickLogin = (emp: Usuario) => {
    setCurrentUser(emp);
    setIsLogged(true);
    setLoginError('');
  };

  const handleLogout = () => {
    setIsLogged(false);
  };

  // Switch Role picker
  const handleSwitchUserRole = (newUser: Usuario) => {
    setCurrentUser(newUser);
    alert(`Sincronizado perfil de sesión: Se cambió a rol de [${newUser.cargo}] con éxito.`);
  };

  // Callback mutators:
  
  // A. Vehiculo actions
  const handleAddVehiculo = (v: Omit<Vehiculo, 'id' | 'trabajosRealizados'>) => {
    const newVeh: Vehiculo = {
      ...v,
      id: `veh-${Date.now()}`,
      trabajosRealizados: []
    };
    setVehiculos(prev => [newVeh, ...prev]);
  };

  const handleUpdateVehiculo = (updated: Vehiculo) => {
    setVehiculos(prev => prev.map(v => v.id === updated.id ? updated : v));
  };

  const handleDeleteVehiculo = (id: string) => {
    setVehiculos(prev => prev.filter(v => v.id !== id));
  };

  // Rapid addition page 11 integration
  const handleAddClienteRapido = (c: { nombre: string; telefono: string; dui: string; correo: string }) => {
    const newId = `cli-${Date.now()}`;
    const newCli: Cliente = {
      ...c,
      id: newId,
      frecuenciaVisita: 'Regular',
      direccion: 'Filtro rápido taller',
      activo: true
    };
    setClientes(prev => [newCli, ...prev]);
    return newId;
  };

  // B. Cliente actions
  const handleAddCliente = (c: Omit<Cliente, 'id'>) => {
    const newCli: Cliente = {
      ...c,
      id: `cli-${Date.now()}`
    };
    setClientes(prev => [newCli, ...prev]);
  };

  const handleUpdateCliente = (updated: Cliente) => {
    setClientes(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteCliente = (id: string) => {
    setClientes(prev => prev.filter(c => c.id !== id));
  };

  // C. Caja actions (Shift Open/Close and Cash updates)
  const handleAbrirCaja = (baseAmount: number) => {
    const nextTurno: TurnoCaja = {
      id: `turno-${Date.now()}`,
      turnoNumero: turnosHistory.length + 1,
      fecha: new Date().toISOString().split('T')[0],
      responsableId: currentUser.id,
      responsableNombre: currentUser.nombre,
      base: baseAmount,
      efectivo: baseAmount,
      horaInicio: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estado: 'Abierta',
      facturasEmitidasCount: 0,
      ventasTurno: 0
    };
    setActiveTurno(nextTurno);
  };

  const handleCerrarCaja = () => {
    if (!activeTurno) return;
    const closed: TurnoCaja = {
      ...activeTurno,
      estado: 'Cerrada',
      horaFin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTurnosHistory(prev => [closed, ...prev]);
    setActiveTurno(null);
  };

  const handleAnularFactura = (id: string) => {
    setFacturas(prev => prev.map(f => {
      if (f.id === id) {
        // Reverse shift balance
        if (activeTurno) {
          setActiveTurno(t => t ? {
            ...t,
            efectivo: Math.max(0, t.efectivo - f.total),
            ventasTurno: Math.max(0, t.ventasTurno - f.total)
          } : null);
        }
        return { ...f, estado: 'Anulada' as any };
      }
      return f;
    }));
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
  const handleEmitirFactura = (f: Omit<Factura, 'id' | 'codigo' | 'fecha'>) => {
    const code = `FACT-${Math.floor(20000 + Math.random() * 80000)}`;
    const newFact: Factura = {
      ...f,
      id: `fact-${Date.now()}`,
      codigo: code,
      fecha: new Date().toISOString().split('T')[0],
    };

    // 1. Append invoice list
    setFacturas(prev => [newFact, ...prev]);

    // 2. Adjust active cashier turn cash
    if (activeTurno) {
      setActiveTurno(prev => prev ? {
        ...prev,
        efectivo: prev.efectivo + f.total,
        facturasEmitidasCount: prev.facturasEmitidasCount + 1,
        ventasTurno: prev.ventasTurno + f.total
      } : null);
    }

    // 3. Deduct stock for products
    f.items.forEach(item => {
      if (item.tipo === 'Producto') {
        setProductos(prevProds => {
          return prevProds.map(p => {
            if (p.id === item.productoId) {
              const resultingStock = Math.max(0, p.stock - item.cantidad);
              return { ...p, stock: resultingStock };
            }
            return p;
          });
        });
      }
    });

    // 4. Update the vehicle status to "Entregado"
    if (f.vehiculoId) {
      setVehiculos(prevVehs => {
        return prevVehs.map(v => {
          if (v.id === f.vehiculoId) {
            return { ...v, estado: 'Entregado' };
          }
          return v;
        });
      });
    }
  };

  // E. Producto actions
  const handleAddProducto = (p: Omit<Producto, 'id' | 'sku'>) => {
    const randomSKU = `SKU-${Math.floor(10000 + Math.random() * 90000)}`;
    const newP: Producto = {
      ...p,
      id: `prod-${Date.now()}`,
      sku: randomSKU
    };
    setProductos(prev => [newP, ...prev]);
  };

  const handleUpdateProducto = (updated: Producto) => {
    setProductos(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeleteProducto = (id: string) => {
    setProductos(prev => prev.filter(p => p.id !== id));
  };

  const handleAdjustStock = (prodId: string, qty: number) => {
    setProductos(prev => prev.map(p => {
      if (p.id === prodId) {
        return {
          ...p,
          stock: Math.max(0, p.stock + qty)
        };
      }
      return p;
    }));
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
      setCurrentUser(user);
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
