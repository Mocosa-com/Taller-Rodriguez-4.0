import React from 'react';
import { Usuario, TurnoCaja } from '../types';
import { 
  Car, 
  Wallet, 
  Users, 
  Percent, 
  ReceiptText, 
  Package, 
  Truck, 
  Briefcase, 
  Settings, 
  Home,
  Clock,
  Landmark,
  LogOut,
  BarChart3
} from 'lucide-react';

export type ActiveView = 
  | 'home' 
  | 'vehiculos' 
  | 'caja' 
  | 'clientes' 
  | 'ofertas' 
  | 'facturacion' 
  | 'inventario' 
  | 'proveedores' 
  | 'empleados' 
  | 'perfil'
  | 'reportes';

interface SidebarProps {
  currentView: ActiveView;
  onSetView: (view: ActiveView) => void;
  currentUser: Usuario;
  employees: Usuario[];
  activeTurno: TurnoCaja | null;
  onChangeUser: (user: Usuario) => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ 
  currentView, 
  onSetView, 
  currentUser, 
  employees, 
  activeTurno, 
  onChangeUser, 
  onLogout,
  isMobileOpen = false,
  onCloseMobile
}: SidebarProps) {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSystemTime = () => {
    return time.toLocaleTimeString('es-SV', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const sections = [
    {
      title: 'Principal',
      items: [
        { id: 'home', label: 'Menú Principal', icon: Home, img: null },
        { id: 'reportes', label: 'Reportes & Estadísticas', icon: BarChart3, img: '/assets/sidebar/reportes.png' },
      ]
    },
    {
      title: 'Taller & Operaciones',
      items: [
        { id: 'vehiculos', label: 'Vehículos taller', icon: Car, img: '/assets/sidebar/coche.png' },
        { id: 'clientes', label: 'Clientes', icon: Users, img: '/assets/sidebar/cliente.png' },
        { id: 'inventario', label: 'Inventario & Stock', icon: Package, img: '/assets/sidebar/bodega.png' },
        { id: 'proveedores', label: 'Proveedores', icon: Truck, img: '/assets/sidebar/proveedores.png' },
      ]
    },
    {
      title: 'Facturación & Caja',
      items: [
        { id: 'caja', label: 'Caja & Ventas', icon: Wallet, img: '/assets/sidebar/caja.png' },
        { id: 'facturacion', label: 'Facturación', icon: ReceiptText, img: '/assets/sidebar/facturacion.png' },
        { id: 'ofertas', label: 'Ofertas & Descuentos', icon: Percent, img: '/assets/sidebar/ofertas.png' },
      ]
    },
    {
      title: 'Negocio',
      items: [
        { id: 'empleados', label: 'Personal & Empleados', icon: Briefcase, img: '/assets/sidebar/empleados.png' },
      ]
    }
  ] as const;

  return (
    <aside id="app-sidebar" className={`w-60 bg-slate-900 backdrop-blur-md text-slate-100 flex flex-col h-screen fixed md:sticky top-0 left-0 border-r border-slate-900 flex-shrink-0 z-50 transform transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      
      {/* 1. Logo of Taller Rodríguez dynamically scaled smaller */}
      <div 
        onClick={() => {
          onSetView('home');
          onCloseMobile?.();
        }}
        className="p-4 border-b border-slate-900 flex flex-col items-center justify-center gap-2 cursor-pointer group hover:bg-slate-800/10 transition-all duration-300"
        title="Ir al Inicio (Home)"
      >
        <div className="relative w-12 h-12 flex items-center justify-center bg-slate-900/80 rounded-full border border-slate-800 p-1 shadow-lg shadow-black/30 group-hover:border-violet-500/50 transition-all overflow-hidden">
          <img
            src="/assets/logo_taller.png"
            alt="Logo Taller Rodríguez"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="text-center">
          <h2 className="font-display font-extrabold text-white text-xs uppercase tracking-wider leading-none">
            Taller Rodríguez
          </h2>
          <p className="text-[9px] text-violet-400 font-bold uppercase tracking-widest mt-1">
            Est. 2018 • ERP
          </p>
        </div>
      </div>

      {/* 2. Menu Items Navigation (Layout compact for perfect side space fit) */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest select-none">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSetView(item.id);
                      onCloseMobile?.();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-205 group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20'
                        : 'text-slate-300 hover:bg-slate-850/60 hover:text-white'
                    }`}
                  >
                    <div className={`p-1 rounded-lg transition-colors ${
                      isActive ? 'bg-white/10 text-white' : 'bg-slate-850/40 text-slate-400 group-hover:text-white'
                    }`}>
                      {item.img ? (
                        <img src={item.img} alt="" className="w-3.5 h-3.5 object-contain" />
                      ) : (
                        <IconComponent className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    
                    {isActive && (
                      <span className="absolute right-2.5 w-1.2 h-1.2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 4. Bottom profile & utility panel with logout capability */}
      <div className="p-3 bg-slate-950/40 border-t border-slate-900 flex items-center justify-between gap-1.5 font-semibold">
        <div 
          onClick={() => {
            onSetView('perfil');
            onCloseMobile?.();
          }}
          className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 group"
          title="Ver mi perfil"
        >
          <div className="relative flex-shrink-0">
            <img 
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
              alt={currentUser.nombre} 
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full border border-slate-800 object-cover group-hover:border-violet-500 transition-colors"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-cyan-500 border border-slate-950"></span>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-extrabold text-slate-100 truncate leading-tight">
              {currentUser.nombre}
            </p>
            <p className="text-[10px] text-violet-400 font-extrabold truncate uppercase tracking-wide">
              {currentUser.cargo}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() => {
              onSetView('perfil');
              onCloseMobile?.();
            }}
            className="p-1 text-slate-400 hover:text-violet-400 transition-colors cursor-pointer"
            title="Configuración"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onLogout}
            className="p-1 text-slate-450 hover:text-rose-450 transition-colors cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </aside>
  );
}
