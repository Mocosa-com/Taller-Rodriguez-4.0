import React, { useState } from 'react';
import { Oferta, Producto } from '../types';
import { 
  Percent, 
  Plus, 
  Trash2, 
  Calendar, 
  ShoppingBag, 
  CheckCircle, 
  AlertTriangle, 
  ToggleRight, 
  ToggleLeft
} from 'lucide-react';

interface OffersProps {
  ofertas: Oferta[];
  productos: Producto[];
  onAddOferta: (o: Omit<Oferta, 'id'>) => void;
  onToggleOfertaActivo: (id: string) => void;
  onDeleteOferta: (id: string) => void;
}

export function Offers({ 
  ofertas, 
  productos, 
  onAddOferta, 
  onToggleOfertaActivo, 
  onDeleteOferta 
}: OffersProps) {

  // Left form state
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [descuentoPct, setDescuentoPct] = useState<number>(15);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().split('T')[0];
  });

  // Filter deactivated
  const [showDeactivated, setShowDeactivated] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || descuentoPct < 1 || descuentoPct > 100) {
      alert('Por favor complete un nombre y descuento válido (1% - 100%).');
      return;
    }
    
    // Validate dates
    if (fechaFin < fechaInicio) {
      alert('La fecha de vencimiento no puede ser anterior a la de inicio.');
      return;
    }

    onAddOferta({
      nombre,
      descripcion,
      porcentajeDescuento: descuentoPct,
      idProducto: selectedProductId || undefined,
      fechaInicio,
      fechaFin,
      activo: true
    });

    // Reset
    setNombre('');
    setDescripcion('');
    setDescuentoPct(15);
    setSelectedProductId('');
    alert('Nueva oferta registrada y cargada con éxito.');
  };

  // Filter list
  const filteredOffers = ofertas.filter(o => showDeactivated ? true : o.activo);

  return (
    <div className="space-y-6 relative z-10">

      {/* Header Info Banner */}
      <div className="bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-slate-800">
        <h2 className="font-display font-medium text-white text-lg flex items-center gap-2">
          <Percent className="w-5 h-5 text-orange-400 animate-pulse" />
          Módulo de Campañas y Ofertas
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configuración y activación de descuentos, promociones temporales e incentivos especiales para clientes del taller.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left column form (4 spans) */}
        <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-sm text-white pb-3 border-b border-slate-800/80 uppercase tracking-widest">
            Agregar nueva oferta
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-300">
            <div>
              <label className="block mb-1.5 text-slate-400">Nombre de la oferta *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Descuento invierno"
                className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl p-2.5 outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-sans text-slate-400">Detalle / Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción para visualización en terminal..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl p-2.5 outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1.5 text-slate-400">% de descuento</label>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500 font-bold">%</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={descuentoPct}
                    onChange={(e) => setDescuentoPct(Math.min(100, Math.max(1, parseInt(e.target.value) || 0)))}
                    className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2 pl-7 pr-3 outline-none focus:border-violet-500 transition-colors font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-slate-400">Producto opcional</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-300 rounded-xl p-2.5 outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="" className="bg-slate-950 text-slate-100">Aplica a todo el carro</option>
                  {productos.filter(p => p.tipo === 'Producto').map(prod => (
                    <option key={prod.id} value={prod.id} className="bg-slate-950 text-slate-100">{prod.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1.5 text-slate-400">Fecha inicio</label>
                <input
                  type="date"
                  required
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl p-2.5 outline-none focus:border-violet-500 transition-colors font-sans font-medium"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-slate-400">Fecha fin</label>
                <input
                  type="date"
                  required
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl p-2.5 outline-none focus:border-violet-500 transition-colors font-sans font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 text-center text-white font-black bg-gradient-to-r from-orange-500 to-red-650 hover:brightness-105 rounded-xl shadow-lg shadow-orange-500/15 cursor-pointer uppercase tracking-wider text-xs"
            >
              Agregar Oferta
            </button>
          </form>
        </div>

        {/* Right column list (8 spans) */}
        <div className="lg:col-span-8 bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-slate-800 flex flex-col justify-between shadow-sm">
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800/85">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Lista de Ofertas registradas
              </h3>

              {/* Show deactivated switch */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <span>Mostrar desactivadas</span>
                <button
                  type="button"
                  onClick={() => setShowDeactivated(!showDeactivated)}
                  className="text-slate-300 font-bold cursor-pointer"
                >
                  {showDeactivated ? (
                    <ToggleRight className="w-8 h-8 text-orange-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-slate-800/60 rounded-2xl border border-slate-800 overflow-hidden">
              {filteredOffers.map((of) => {
                const linkedProduct = productos.find(p => p.id === of.idProducto);
                return (
                  <div key={of.id} className={`p-4 space-y-3 text-xs ${!of.activo ? 'opacity-60 bg-slate-950/20' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-extrabold text-white text-sm">{of.nombre}</div>
                        <div className="text-[10px] text-slate-400 font-medium italic mt-0.5">{of.descripcion}</div>
                        {linkedProduct && (
                          <span className="text-[9px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold mt-1 inline-block">
                            Exclusivo: {linkedProduct.nombre}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-black text-rose-400 text-sm flex-shrink-0">
                        {of.porcentajeDescuento}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{of.fechaInicio} al {of.fechaFin}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => onToggleOfertaActivo(of.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block cursor-pointer transition-colors ${
                          of.activo 
                            ? 'bg-emerald-500/15 text-emerald-450 border border-emerald-500/25' 
                            : 'bg-slate-950 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {of.activo ? 'Activa' : 'Desactivada'}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('¿Seguro que desea eliminar esta oferta definitivamente?')) {
                            onDeleteOferta(of.id);
                          }
                        }}
                        className="p-2 text-rose-600 hover:text-white bg-slate-950/40 hover:bg-rose-600 border border-slate-800 rounded-xl transition-all cursor-pointer"
                        title="Eliminar Oferta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredOffers.length === 0 && (
                <div className="py-8 text-center text-slate-500 italic text-xs">
                  No hay ofertas registradas con este filtro.
                </div>
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 text-[10px] font-bold text-slate-405 uppercase tracking-widest border-b border-slate-800">
                    <th className="py-3.5 px-4 text-slate-400">Oferta</th>
                    <th className="py-3.5 px-4 text-slate-400">Descuento</th>
                    <th className="py-3.5 px-4 text-slate-400">Vigencia</th>
                    <th className="py-3.5 px-4 text-center text-slate-400">Estado</th>
                    <th className="py-3.5 px-4 text-right text-slate-400">Eliminar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredOffers.map((of) => {
                    const linkedProduct = productos.find(p => p.id === of.idProducto);

                    return (
                      <tr key={of.id} className={`hover:bg-slate-850/30 transition-colors ${!of.activo ? 'opacity-60 bg-slate-950/20' : ''}`}>
                        <td className="py-4 px-4">
                          <div className="font-extrabold text-white text-sm">{of.nombre}</div>
                          <div className="text-[10px] text-slate-400 font-medium italic mt-0.5">{of.descripcion}</div>
                          {linkedProduct && (
                            <span className="text-[9px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold mt-1 inline-block">
                              Exclusivo: {linkedProduct.nombre}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-mono font-black text-rose-400 text-sm">
                          {of.porcentajeDescuento}%
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-350 text-[11px]">
                          {of.fechaInicio} al {of.fechaFin}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => onToggleOfertaActivo(of.id)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block cursor-pointer transition-colors ${
                              of.activo 
                                ? 'bg-emerald-500/15 text-emerald-450 border border-emerald-500/25' 
                                : 'bg-slate-950 text-slate-500 border border-slate-800'
                            }`}
                          >
                            {of.activo ? 'Activa' : 'Desactivada'}
                          </button>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm('¿Seguro que desea eliminar esta oferta definitivamente?')) {
                                onDeleteOferta(of.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Eliminar Oferta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredOffers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 italic text-xs">
                        No hay ofertas registradas con este filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
