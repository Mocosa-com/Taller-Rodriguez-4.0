import React, { useState } from 'react';
import { TurnoCaja, Factura, Usuario } from '../types';
import { 
  Wallet, 
  Clock, 
  Calendar, 
  User, 
  DollarSign, 
  CheckCircle2, 
  FileText, 
  History, 
  Lock, 
  Unlock, 
  X, 
  Printer, 
  Trash2, 
  RotateCw, 
  Search, 
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

interface CajaProps {
  activeTurno: TurnoCaja | null;
  facturas: Factura[];
  currentUser: Usuario;
  historialTurnos: TurnoCaja[];
  onSetView: (v: any) => void;
  onAbrirCaja: (montoBase: number) => void;
  onCerrarCaja: () => void;
  onAnularFactura: (id: string) => void;
  onActualizarEfectivoActual: (monto: number) => void;
}

export function Caja({ 
  activeTurno, 
  facturas, 
  currentUser, 
  historialTurnos,
  onSetView,
  onAbrirCaja,
  onCerrarCaja,
  onAnularFactura,
  onActualizarEfectivoActual
}: CajaProps) {

  // Views states
  const [cajaSubView, setCajaSubView] = useState<'panel' | 'turnos' | 'facturas'>('panel');
  const [openingBase, setOpeningBase] = useState<number>(100);
  const [updateCashInput, setUpdateCashInput] = useState<string>('');
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  
  // Summary modal
  const [showResumenModal, setShowResumenModal] = useState(false);
  const [ultimoTurnoCerrado, setUltimoTurnoCerrado] = useState<TurnoCaja | null>(null);

  // PDF Preview State
  const [showPdfInvoice, setShowPdfInvoice] = useState<Factura | null>(null);

  // Filter current shift stats
  const activeShiftInvoices = facturas.filter(f => {
    if (!activeTurno) return false;
    // Basic filter of facts issued after start
    return f.fecha === activeTurno.fecha && f.estado === 'Activa';
  });

  const activeShiftRevenue = activeShiftInvoices.reduce((acc, f) => acc + f.total, 0);

  // Handler Opening box
  const handleOpenBox = (e: React.FormEvent) => {
    e.preventDefault();
    if (openingBase <= 0) {
      alert('La base inicial debe ser mayor a 0 para abrir caja.');
      return;
    }
    onAbrirCaja(openingBase);
  };

  // Handler Closing box
  const handleCloseBox = () => {
    if (!activeTurno) return;
    
    // Save info for the shift review
    const summary: TurnoCaja = {
      ...activeTurno,
      ventasTurno: activeShiftRevenue,
      facturasEmitidasCount: activeShiftInvoices.length,
      efectivo: activeTurno.base + activeShiftRevenue,
      cierre: activeTurno.base + activeShiftRevenue,
      horaCierre: new Date().toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' }),
      estado: 'Cerrada'
    };

    setUltimoTurnoCerrado(summary);
    setShowResumenModal(true);
    onCerrarCaja();
  };

  // Refresh cash register balance helper
  const handleUpdateCashRegister = () => {
    const val = parseFloat(updateCashInput);
    if (isNaN(val) || val < 0) {
      alert('Por favor ingrese un monto válido en efectivo.');
      return;
    }
    onActualizarEfectivoActual(val);
    setUpdateCashInput('');
    alert('Efectivo manual de caja ajustado con éxito.');
  };

  // Simple PDF layout trigger
  const handlePrintMockup = (fact: Factura) => {
    setShowPdfInvoice(fact);
  };

  // Filter invoices for table history
  const filteredInvoices = facturas.filter(f => {
    const q = invoiceSearchQuery.toLowerCase();
    return f.codigo.toLowerCase().includes(q) ||
           f.clienteNombre.toLowerCase().includes(q) ||
           f.tipo.toLowerCase().includes(q);
  });  return (
    <div className="space-y-6 relative z-10 text-slate-200">

      {/* Main Container Switch */}
      {cajaSubView === 'panel' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-slate-800 shadow-sm">
            <div>
              <h2 className="font-display font-medium text-white text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5 text-orange-400" />
                Caja del Taller Rodríguez
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Monitoreo de flujo de caja, arqueo de turno actual, facturación y registros históricos de ventas.
              </p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                id="btn-nav-turnos"
                onClick={() => setCajaSubView('turnos')}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2 cursor-pointer transition-all"
              >
                <History className="w-4 h-4 text-slate-500" />
                <span>Historial de turnos</span>
              </button>
              <button
                id="btn-nav-facturas"
                onClick={() => setCajaSubView('facturas')}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2 cursor-pointer transition-all"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Historial de facturas</span>
              </button>
            </div>
          </div>

          {/* MAIN CASH CONTROL WORKFLOW (Page 9 & 11) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Cash register Status display panel */}
            <div className="lg:col-span-7 bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
              
              <div>
                <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-850 font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Terminal de Caja Principal
                </span>
                
                {activeTurno ? (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Unlock className="w-5 h-5 animate-pulse" />
                      <span className="font-display font-extrabold text-sm uppercase tracking-wide">
                        Caja General Activa (Abierta)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Responsable actual:</span>
                        <span className="font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {activeTurno.responsableNombre}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Fecha turno:</span>
                        <span className="font-semibold text-slate-300 block mt-0.5 font-mono">{activeTurno.fecha}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Hora apertura:</span>
                        <span className="font-semibold text-slate-300 block mt-0.5 font-mono">{activeTurno.horaInicio}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium font-sans">Monto base inicial:</span>
                        <span className="font-bold text-orange-400 block mt-0.5 font-mono">${activeTurno.base.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Live actual balance updater inputs (Page 9 details) */}
                    <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20 space-y-3">
                      <label className="block text-xs font-semibold text-slate-300">
                        Efectivo actual reportado en caja física:
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 font-semibold text-xs">$</span>
                          <input
                            type="number"
                            value={updateCashInput}
                            onChange={(e) => setUpdateCashInput(e.target.value)}
                            placeholder={`Actual: $${activeTurno.efectivo.toFixed(2)}`}
                            className="bg-slate-950 border border-slate-850 rounded-xl py-2 pl-6 pr-3 w-full text-xs outline-none text-white font-bold font-mono"
                          />
                        </div>
                        <button
                          onClick={handleUpdateCashRegister}
                          className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold px-4 py-2 transition-all cursor-pointer"
                        >
                          Actualizar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-2 text-red-400">
                      <Lock className="w-5 h-5" />
                      <span className="font-display font-extrabold text-sm uppercase tracking-wide">
                        Caja Inactiva (Cerrada)
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      La caja registradora de Taller Rodríguez se encuentra cerrada. Para poder facturar repuestos, ingresar productos o cobrar servicios, debe abrir caja declarando una base inicial de cambio obligatoria.
                    </p>

                    {/* Mandamiento de Apertura Obligatoria - Page 11 bottom */}
                    <form onSubmit={handleOpenBox} className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Monto base inicial obligatoria de apertura *
                        </label>
                        <div className="relative">
                          <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                          <input
                            type="number"
                            required
                            min={1}
                            value={openingBase}
                            onChange={(e) => setOpeningBase(parseFloat(e.target.value))}
                            className="bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 pl-7 pr-4 w-full text-xs font-bold font-mono outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full text-center py-2.5 text-xs font-black text-white bg-gradient-to-r from-orange-500 to-red-500 hover:brightness-105 rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
                      >
                        Abrir caja registradora
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Action buttons list (Page 9: Cerrar caja, Facturar, Historiales) */}
              {activeTurno && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4 border-t border-slate-850">
                  <button
                    onClick={handleCloseBox}
                    className="flex flex-col items-center justify-center gap-1.5 bg-red-950/30 hover:bg-red-600 hover:text-white text-red-400 transition-all p-3 rounded-xl border border-red-900/30 cursor-pointer"
                  >
                    <Lock className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Cerrar caja</span>
                  </button>
                  <button
                    onClick={() => onSetView('facturacion')}
                    className="flex flex-col items-center justify-center gap-1.5 bg-orange-950/30 hover:bg-orange-600 hover:text-white text-orange-400 transition-all p-3 rounded-xl border border-orange-900/30 cursor-pointer"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-sans">Facturar</span>
                  </button>
                  <button
                    onClick={() => setCajaSubView('turnos')}
                    className="flex flex-col items-center justify-center gap-1.5 bg-blue-950/30 hover:bg-blue-600 hover:text-white text-blue-400 transition-all p-3 rounded-xl border border-blue-900/30 cursor-pointer"
                  >
                    <History className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Turnos</span>
                  </button>
                  <button
                    onClick={() => setCajaSubView('facturas')}
                    className="flex flex-col items-center justify-center gap-1.5 bg-indigo-950/30 hover:bg-indigo-600 hover:text-white text-indigo-400 transition-all p-3 rounded-xl border border-indigo-900/30 cursor-pointer"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Facturas</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick overview of active shift numbers summary info */}
            <div className="lg:col-span-5 bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-display font-medium text-white text-sm">Resumen del Cuadro Actual</h3>
                <p className="text-xs text-slate-400 mt-0.5">Ventas emitidas en el turno activo.</p>
              </div>

              {activeTurno ? (
                <div className="space-y-4 my-4 flex-1">
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-800">
                    <span className="text-xs font-medium text-slate-400">Base inicial:</span>
                    <span className="text-xs font-mono font-bold text-slate-200">${activeTurno.base.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-800">
                    <span className="text-xs font-medium text-slate-400">Facturas emitidas hoy:</span>
                    <span className="text-xs font-mono font-bold text-blue-400">{activeShiftInvoices.length} uds.</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-800">
                    <span className="text-xs font-medium text-slate-400">Ventas netas del turno:</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">+${activeShiftRevenue.toFixed(2)}</span>
                  </div>

                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">TOTAL REPORTADO EN CAJA</span>
                    <span className="text-2xl font-mono font-black text-emerald-400 block mt-1">
                      ${(activeTurno.base + activeShiftRevenue).toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="my-10 text-center text-slate-500 text-xs italic">
                  Abra caja para iniciar la sincronización de indicadores de ventas.
                </div>
              )}

            </div>

          </div>

        </div>
      )}


      {/* SHIFT HISTORY SUBVIEW (Page 10) */}
      {cajaSubView === 'turnos' && (
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-display font-medium text-white text-sm flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                Historial de Turnos de Caja
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Control fiscal de turnos cerrados de trabajadores de Taller Rodríguez.</p>
            </div>
            
            <button
              id="btn-return-caja-turnos"
              onClick={() => setCajaSubView('panel')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a caja</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800">
                  <th className="py-3 px-4 text-slate-400">FECHA</th>
                  <th className="py-3 px-4 text-slate-400">TURNO</th>
                  <th className="py-3 px-4 text-slate-400">RESPONSABLE</th>
                  <th className="py-3 px-4 text-slate-400">BASE</th>
                  <th className="py-3 px-4 text-slate-400">EFECTIVO</th>
                  <th className="py-3 px-4 text-slate-400">CIERRE</th>
                  <th className="py-3 px-4 text-slate-400">HORA INICIO</th>
                  <th className="py-3 px-4 text-slate-400">HORA CIERRE</th>
                  <th className="py-3 px-4 text-slate-400">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
                {historialTurnos.map((tn) => (
                  <tr key={tn.id} className="hover:bg-slate-850/30">
                    <td className="py-3 px-4 font-mono">{tn.fecha}</td>
                    <td className="py-3 px-4 font-bold text-slate-500 font-mono">#{tn.turnoNumero}</td>
                    <td className="py-3 px-4">{tn.responsableNombre}</td>
                    <td className="py-3 px-4 font-mono">${tn.base.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono">${tn.efectivo.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {tn.cierre ? `$${tn.cierre.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-450">{tn.horaInicio}</td>
                    <td className="py-3 px-4 font-mono text-slate-455">{tn.horaCierre || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        tn.estado === 'Abierta' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-950 text-slate-500 border-slate-850'
                      }`}>
                        {tn.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* INVOICE HISTORY SUBVIEW (Page 11) */}
      {cajaSubView === 'facturas' && (
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-200">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-display font-medium text-white text-sm flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Historial de Facturas Emitidas
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Control de facturación fiscal, descargas y anulaciones.</p>
            </div>
            
            <button
              id="btn-return-caja-facturas"
              onClick={() => setCajaSubView('panel')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-1.5 cursor-pointer self-start md:self-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a caja</span>
            </button>
          </div>

          {/* Search table filter bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                value={invoiceSearchQuery}
                onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                placeholder="Buscar por código, cliente o tipo..."
                className="w-full text-xs bg-slate-950 border border-slate-850 text-white rounded-xl py-2 pl-9 pr-3 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800">
                  <th className="py-3 px-4 text-slate-400">CÓDIGO</th>
                  <th className="py-3 px-4 text-slate-400">CLIENTE</th>
                  <th className="py-3 px-4 text-slate-400">TIPO FACTURA</th>
                  <th className="py-3 px-4 text-slate-400">TOTAL</th>
                  <th className="py-3 px-4 text-slate-400">FECHA</th>
                  <th className="py-3 px-4 text-center text-slate-400">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
                {filteredInvoices.map((f) => (
                  <tr key={f.id} className={`hover:bg-slate-850/30 ${f.estado === 'Anulada' ? 'opacity-40 line-through' : ''}`}>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">{f.codigo}</td>
                    <td className="py-3 px-4 font-semibold text-slate-100">{f.clienteNombre}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        f.tipo === 'Consumidor Final' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {f.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">${f.total.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono text-slate-450">{f.fecha}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-sans">
                        
                        {/* Simulated print PDF */}
                        <button
                          onClick={() => handlePrintMockup(f)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold text-red-400 bg-slate-950 border border-slate-850 hover:bg-slate-850 rounded transition-all cursor-pointer"
                        >
                          <Printer className="w-3 h-3 text-red-400" />
                          <span>PDF</span>
                        </button>

                        {/* Page 11: "En vez de editar cancelar" */}
                        {f.estado === 'Activa' ? (
                          <button
                            onClick={() => {
                              const alertConf = window.confirm(`¿Seguro que desea ANULAR la factura ${f.codigo}? Esta acción cancelará la transacción.`);
                              if (alertConf) onAnularFactura(f.id);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold text-orange-400 bg-slate-950 border border-slate-850 hover:bg-slate-850 rounded transition-all cursor-pointer"
                          >
                            <X className="w-3 h-3 text-orange-400" />
                            <span>Anular / Cancelar</span>
                          </button>
                        ) : (
                          <span className="text-[10px] bg-slate-950 border border-slate-850 text-slate-500 px-2.5 py-0.5 rounded font-bold font-mono">
                            ANULADA
                          </span>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}

                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-505 italic">
                      No se encontraron registros de facturación.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-slate-500 text-xs font-mono pt-3 border-t border-slate-800">
            <span>{filteredInvoices.length} factura(s) registrada(s)</span>
          </div>

        </div>
      )}


      {/* Modal: Arqueo Resumen de Fin de Turno (Page 10) */}
      {showResumenModal && ultimoTurnoCerrado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-200">
            
            <div className="p-6 text-center space-y-4">
              
              <div className="w-16 h-16 bg-emerald-550/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-display font-medium text-white text-lg">
                  Resumen del turno (Cerrado)
                </h3>
                <p className="text-[11px] text-slate-450 mt-1 font-semibold uppercase tracking-wider">
                  Taller Rodríguez • Arqueo #{ultimoTurnoCerrado.turnoNumero}
                </p>
              </div>

              <div className="space-y-2.5 text-left border-t border-b border-slate-800 py-4 font-semibold text-xs text-slate-300">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Base inicial</span>
                  <span className="font-mono text-slate-200">${ultimoTurnoCerrado.base.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Facturas emitidas</span>
                  <span className="text-blue-400 font-mono">{ultimoTurnoCerrado.facturasEmitidasCount} facturas</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Ventas del turno</span>
                  <span className="text-emerald-400 font-mono">${ultimoTurnoCerrado.ventasTurno.toFixed(2)}</span>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/15 p-3.5 rounded-xl flex justify-between items-center mt-3">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">TOTAL EN CAJA</span>
                  <span className="text-lg font-mono font-black text-emerald-400">${ultimoTurnoCerrado.efectivo.toFixed(2)}</span>
                </div>
                
                <p className="text-[10px] text-center text-slate-500 font-mono bg-slate-950 py-1.5 rounded mt-2">
                  Base ${ultimoTurnoCerrado.base.toFixed(2)} + Ventas ${ultimoTurnoCerrado.ventasTurno.toFixed(2)} = ${ultimoTurnoCerrado.efectivo.toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => setShowResumenModal(false)}
                className="w-full bg-emerald-555 hover:bg-emerald-600 text-white rounded-xl py-3 font-bold text-xs select-none transition-all cursor-pointer shadow-md"
              >
                Entendido
              </button>

            </div>

          </div>
        </div>
      )}


      {/* Simulated printable invoice modal preview */}
      {showPdfInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 text-slate-200 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
            
            <div className="bg-slate-950 text-white p-4 flex justify-between items-center border-b border-slate-800">
              <span className="font-display font-medium text-xs">Pre-visualización de Impresión Fiscal</span>
              <button 
                onClick={() => setShowPdfInvoice(null)}
                className="text-slate-400 hover:text-violet-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-8 space-y-6 font-mono text-xs bg-slate-950/60 m-4 rounded-2xl border border-slate-850">
              {/* Header */}
              <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-800">
                <h4 className="font-display font-black text-sm uppercase text-white">Taller Rodríguez, S.A. de C.V.</h4>
                <p className="text-slate-400">AUTOPROP, EL SALVADOR</p>
                <p className="text-slate-400">TEL: 2121-2828 • NIT: 0614-121218-101-1</p>
                <p className="font-extrabold text-orange-400 mt-2">{showPdfInvoice.tipo}</p>
                <p className="font-extrabold text-orange-400 font-mono text-sm">{showPdfInvoice.codigo}</p>
              </div>

              {/* Meta */}
              <div className="space-y-1 text-slate-300">
                <p><span className="font-bold text-slate-500">FECHA:</span> {showPdfInvoice.fecha} • {new Date().toLocaleTimeString()}</p>
                <p><span className="font-bold text-slate-500">CLIENTE:</span> {showPdfInvoice.clienteNombre}</p>
                {showPdfInvoice.vehiculoPlaca && (
                  <p><span className="font-bold text-slate-500">VEHÍCULO:</span> Placa [{showPdfInvoice.vehiculoPlaca}]</p>
                )}
                <p><span className="font-bold text-slate-500">CAJERO:</span> {currentUser.nombre}</p>
              </div>

              {/* Items Table */}
              <div className="border-t border-b border-dashed border-slate-800 py-3 space-y-2">
                <div className="flex justify-between font-bold text-slate-450">
                  <span className="w-1/2">CONCEPTO</span>
                  <span className="w-1/6 text-center">CANT</span>
                  <span className="w-1/3 text-right">PRECIO</span>
                </div>
                {showPdfInvoice.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-slate-300">
                    <span className="w-1/2 truncate">{it.nombre}</span>
                    <span className="w-1/6 text-center font-bold text-indigo-400">{it.cantidad}</span>
                    <span className="w-1/3 text-right font-mono">${(it.precioUnitario * it.cantidad).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Total calculations */}
              <div className="space-y-1 text-right text-slate-300 border-dashed border-slate-800">
                <p>SUBTOTAL: ${(showPdfInvoice.total / 1.13).toFixed(2)}</p>
                <p>IVA (13%): ${(showPdfInvoice.total - (showPdfInvoice.total / 1.13)).toFixed(2)}</p>
                <p className="font-black text-sm text-emerald-400 border-t border-dashed border-slate-800 pt-2">
                  TOTAL A PAGAR: ${showPdfInvoice.total.toFixed(2)}
                </p>
              </div>

              <div className="text-center text-[10px] text-slate-505 pt-4 border-t border-dashed border-slate-800">
                <p>*** Gracias por su preferencia ***</p>
                <p>Visite tallerrodriguez.com • Control System</p>
              </div>

            </div>

            <div className="bg-slate-950 p-4 border-t border-slate-850 flex justify-end gap-2.5">
              <button
                onClick={() => {
                  alert('Instalando plantilla de impresión a ruteadora térmica...');
                  setShowPdfInvoice(null);
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black px-4 py-2.5 cursor-pointer shadow-md inline-flex items-center gap-1 uppercase tracking-wider"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ticket</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
