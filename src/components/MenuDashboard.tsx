import React from 'react';
import { ActiveView } from './Sidebar';

interface MenuDashboardProps {
  onSetView: (view: ActiveView) => void;
  activeVehiculosCount: number;
  lowStockCount: number;
  activeTurnoState: boolean;
}

export function MenuDashboard({ 
  onSetView, 
  activeVehiculosCount, 
  lowStockCount,
  activeTurnoState
}: MenuDashboardProps) {

  const menuCards = [
    {
      id: 'caja' as ActiveView,
      label: 'Caja',
      description: activeTurnoState ? 'Turno abierto' : 'Turno cerrado',
      img: '/assets/sidebar/caja.png',
      badge: activeTurnoState ? 'Manejar' : undefined,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/15',
    },
    {
      id: 'clientes' as ActiveView,
      label: 'Clientes',
      description: 'Expediente del taller',
      img: '/assets/sidebar/cliente.png',
    },
    {
      id: 'empleados' as ActiveView,
      label: 'Empleados',
      description: 'Personal & Sueldos',
      img: '/assets/sidebar/empleados.png',
    },
    {
      id: 'ofertas' as ActiveView,
      label: 'Ofertas',
      description: 'Campañas de descuento',
      img: '/assets/sidebar/ofertas.png',
    },
    {
      id: 'inventario' as ActiveView,
      label: 'Inventario',
      description: 'Gestión de stock',
      img: '/assets/sidebar/bodega.png',
      badge: lowStockCount > 0 ? `${lowStockCount} Bajo` : undefined,
      badgeColor: 'bg-amber-500/10 text-amber-600 border border-amber-500/15',
    },
    {
      id: 'facturacion' as ActiveView,
      label: 'Facturación',
      description: 'Emisión de facturas',
      img: '/assets/sidebar/facturacion.png',
    },
    {
      id: 'vehiculos' as ActiveView,
      label: 'Vehículos',
      description: 'En el taller',
      img: '/assets/sidebar/coche.png',
      badge: activeVehiculosCount > 0 ? `${activeVehiculosCount} Activos` : undefined,
      badgeColor: 'bg-violet-500/10 text-violet-600 border border-violet-500/15',
    },
    {
      id: 'reportes' as ActiveView,
      label: 'Reportes',
      description: 'Estadísticas & Ventas',
      img: '/assets/sidebar/reportes.png',
    },
    {
      id: 'proveedores' as ActiveView,
      label: 'Proveedores',
      description: 'Contactos directos',
      img: '/assets/sidebar/proveedores.png',
    },
    {
      id: 'perfil' as ActiveView,
      label: 'Mi perfil',
      description: 'Rol y Configuración',
      img: '/assets/sidebar/perfil.png',
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 md:px-8 space-y-12 animate-in fade-in duration-300">
      
      {/* Centered Premium Logo and Header styling mimicking screenshot */}
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex items-center gap-4 bg-white/90 shadow-sm border border-slate-200/60 p-4 px-8 rounded-full">
          {/* Real workshop logo on a dark circle for contrast (logo has light/white details) */}
          <div className="relative w-12 h-12 flex items-center justify-center bg-slate-900 rounded-full border border-slate-200 shadow-inner flex-shrink-0 overflow-hidden p-1.5">
            <img src="/assets/logo_taller.png" alt="Logo Taller Rodríguez" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-slate-900 tracking-tight select-none">
            Taller Rodriguez
          </h1>
        </div>
        <p className="text-xs text-slate-400 max-w-sm mt-1 uppercase tracking-widest font-mono">
          Sistema de Control & Operaciones
        </p>
      </div>

      {/* Grid of clean white cards styled exactly as the image */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
        {menuCards.map((card) => {
          return (
            <button
              key={card.id}
              onClick={() => onSetView(card.id)}
              className="group relative flex flex-col items-center justify-center p-4 sm:p-6 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center min-h-[130px] sm:min-h-[160px] select-none"
            >
              {/* Badge indicator if any */}
              {card.badge && (
                <span className={`absolute top-2 right-2 sm:top-3 sm:right-3 text-[8px] sm:text-[9px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap ${card.badgeColor}`}>
                  {card.badge}
                </span>
              )}

              {/* Large styled icon (real workshop artwork) */}
              <div className="p-3 sm:p-4 bg-slate-50 group-hover:bg-violet-50 group-hover:scale-105 rounded-2xl border border-slate-100 transition-all duration-300">
                <img src={card.img} alt={card.label} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
              </div>

              {/* Label */}
              <span className="mt-3 sm:mt-4 text-xs sm:text-sm font-black text-slate-900 group-hover:text-violet-600 transition-colors uppercase tracking-wide">
                {card.label}
              </span>

              {/* Description */}
              <span className="mt-1 text-[9px] sm:text-[10px] text-slate-400 font-semibold truncate max-w-full">
                {card.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Aesthetic bottom system details for premium appearance */}
      <div className="text-center text-[10px] text-slate-500 font-mono pt-4 select-none">
        Taller Rodríguez ERP • Diseñado para Alta Costura y Eficiencia Operativa
      </div>
    </div>
  );
}
