import React, { useState, useEffect } from 'react';
import { Cliente, Vehiculo, Producto, Oferta, Factura, FacturaItem, TurnoCaja } from '../types';
import { 
  ReceiptText, 
  Search, 
  User, 
  Car, 
  Tag, 
  Percent, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle, 
  Calculator, 
  AlertCircle, 
  Ban, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';

interface FacturacionProps {
  clientes: Cliente[];
  vehiculos: Vehiculo[];
  productos: Producto[];
  ofertas: Oferta[];
  activeTurno: TurnoCaja | null;
  onEmitirFactura: (fact: Omit<Factura, 'id' | 'codigo' | 'fecha'>) => void;
}

export function Facturacion({ 
  clientes, 
  vehiculos, 
  productos, 
  ofertas, 
  activeTurno,
  onEmitirFactura 
}: FacturacionProps) {

  // Selected bill-to info
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [selectedVehiculoId, setSelectedVehiculoId] = useState<string>('');
  const [factType, setFactType] = useState<'Consumidor Final' | 'Crédito Fiscal'>('Consumidor Final');
  const [selectedOfertaId, setSelectedOfertaId] = useState<string>('');
  const [customDiscount, setCustomDiscount] = useState<number>(0);

  // Cart list
  const [cartItems, setCartItems] = useState<FacturaItem[]>([]);

  // Cashier calculator
  const [montoRecibido, setMontoRecibido] = useState<string>('');
  const [cambioDue, setCambioDue] = useState<number | null>(null);

  // Search products panel
  const [productSearch, setProductSearch] = useState('');

  // 1. Core integration: "si cliente tiene vehículo que aparezca como opción"
  const clientVehicles = vehiculos.filter(v => v.clienteId === selectedClienteId);

  useEffect(() => {
    // If selected client changed, auto select their vehicle if they have only one, or default to empty
    if (clientVehicles.length > 0) {
      setSelectedVehiculoId(clientVehicles[0].id);
    } else {
      setSelectedVehiculoId('');
    }
  }, [selectedClienteId]);

  // Handle offer calculations
  const activeOferta = ofertas.find(o => o.id === selectedOfertaId && o.activo);
  const currentDiscountPct = activeOferta ? activeOferta.porcentajeDescuento : customDiscount;

  // Cart calculations
  const rawSubtotal = cartItems.reduce((acc, it) => acc + (it.precioUnitario * it.cantidad), 0);
  const discountAmount = (rawSubtotal * currentDiscountPct) / 100;
  const subtotalWithDiscount = rawSubtotal - discountAmount;
  
  // El Salvador standard values: Total includes IVA (13%)
  const totalFactura = subtotalWithDiscount;
  const standardIvaAmount = totalFactura * 0.13; // 13% IVA
  const baseBeforeIva = totalFactura / 1.13;

  // Calculator effect
  useEffect(() => {
    const received = parseFloat(montoRecibido);
    if (!isNaN(received) && received >= totalFactura && totalFactura > 0) {
      setCambioDue(received - totalFactura);
    } else {
      setCambioDue(null);
    }
  }, [montoRecibido, totalFactura]);

  // Cart actions
  const handleAddProductToCart = (prod: Producto) => {
    // Check stock if product
    if (prod.tipo === 'Producto') {
      const existingInCart = cartItems.find(it => it.productoId === prod.id);
      const currentQty = existingInCart ? existingInCart.cantidad : 0;
      if (currentQty >= prod.stock) {
        alert('No puede agregar más unidades de las existentes en inventario.');
        return;
      }
    }

    setCartItems(prev => {
      const existing = prev.find(it => it.productoId === prod.id);
      if (existing) {
        return prev.map(it => it.productoId === prod.id ? { ...it, cantidad: it.cantidad + 1 } : it);
      } else {
        return [...prev, {
          productoId: prod.id,
          nombre: prod.nombre,
          tipo: prod.tipo,
          cantidad: 1,
          precioUnitario: prod.venta
        }];
      }
    });
  };

  const handleUpdateQty = (prodId: string, delta: number) => {
    const prod = productos.find(p => p.id === prodId);
    if (!prod) return;

    setCartItems(prev => {
      return prev.map(it => {
        if (it.productoId === prodId) {
          const nextQty = it.cantidad + delta;
          if (nextQty <= 0) return null;
          // Check stock
          if (prod.tipo === 'Producto' && nextQty > prod.stock) {
            alert('Excede el stock disponible.');
            return it;
          }
          return { ...it, cantidad: nextQty };
        }
        return it;
      }).filter(Boolean) as FacturaItem[];
    });
  };

  const handleRemoveFromCart = (prodId: string) => {
    setCartItems(prev => prev.filter(it => it.productoId !== prodId));
  };

  // Submit invoice processing
  const handleProcessFactura = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeTurno) {
      alert('ERROR: No se puede facturar porque la caja registradora se encuentra CERRADA. Por favor, abra caja primero.');
      return;
    }

    if (!selectedClienteId) {
      alert('Por favor seleccione un Cliente.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Agregue productos o servicios para procesar la venta.');
      return;
    }

    const client = clientes.find(c => c.id === selectedClienteId);
    const vehicle = vehiculos.find(v => v.id === selectedVehiculoId);

    onEmitirFactura({
      clienteId: selectedClienteId,
      clienteNombre: client ? client.nombre : 'Consumidor Final',
      vehiculoId: selectedVehiculoId || undefined,
      vehiculoPlaca: vehicle ? vehicle.placa : undefined,
      tipo: factType,
      total: totalFactura,
      items: cartItems,
      ofertaId: selectedOfertaId || undefined,
      descuento: discountAmount,
      estado: 'Activa'
    });

    // Reset checkout desk
    setCartItems([]);
    setMontoRecibido('');
    setCambioDue(null);
    setSelectedOfertaId('');
    setCustomDiscount(0);
    alert('¡Factura procesada con éxito! Se ha impreso el reporte tributario y sincronizado el saldo de caja.');
  };

  // Filter left available catalog search
  const catalogList = productos.filter(p => {
    const q = productSearch.toLowerCase();
    return p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.clasificacion.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 relative z-10 text-slate-100 animate-none">

      {/* Terminal Title Block */}
      <div className="bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display font-medium text-white text-lg flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-violet-400" />
            Terminal de Facturación y Cajas
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Punto de venta directo para repuestos originales e intervenciones de mecánicos del taller.
          </p>
        </div>

        {!activeTurno ? (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs text-red-400">
            <Ban className="w-4 h-4 flex-shrink-0 animate-pulse" />
            <div>
              <span className="font-black uppercase tracking-wider">Turno de caja cerrado:</span> Abra caja antes de transaccionar.
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            Caja Abierta y Sincronizada
          </div>
        )}
      </div>

      {/* 3-Column POS Desktop Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* --- COLUMN 1 (Left 4/12): Client & Billing Configuration --- */}
        <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-4">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-display font-medium text-white text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-violet-400" />
              1. Cliente y Vehículo
            </h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Identificación</span>
          </div>

          {/* Client select */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest">Cliente Facturador</label>
            <select
              id="select-bill-client"
              value={selectedClienteId}
              onChange={(e) => setSelectedClienteId(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-250 rounded-xl p-3 outline-none focus:border-violet-500 transition-colors cursor-pointer font-bold"
            >
              <option value="" className="bg-slate-950 text-slate-400">-- Seleccione Cliente Propietario --</option>
              {clientes.map(cli => (
                <option key={cli.id} value={cli.id} className="bg-slate-95s text-slate-300">
                  {cli.nombre} [{cli.dui}]
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle associated select */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest">Vehículo en Reparación</label>
            <select
              id="select-bill-car"
              value={selectedVehiculoId}
              onChange={(e) => setSelectedVehiculoId(e.target.value)}
              disabled={!selectedClienteId}
              className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-250 rounded-xl p-3 outline-none focus:border-violet-500 transition-colors cursor-pointer font-extrabold disabled:opacity-50"
            >
              {clientVehicles.length > 0 ? (
                clientVehicles.map(veh => (
                  <option key={veh.id} value={veh.id} className="bg-slate-950 text-slate-205">
                    {veh.marca} {veh.modelo} ({veh.placa})
                  </option>
                ))
              ) : (
                <option value="" className="bg-slate-950 text-slate-400">Sin vehículo o no requerido</option>
              )}
            </select>
            {selectedClienteId && clientVehicles.length > 0 && (
              <p className="text-[10px] text-violet-400 font-bold mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-violet-400" />
                Vehículo encontrado para cargo de taller
              </p>
            )}
          </div>

          {/* Comprobante & Offers */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest">Tipo de Comprobante</label>
              <select
                value={factType}
                onChange={(e) => setFactType(e.target.value as any)}
                className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-250 rounded-xl p-3 outline-none focus:border-violet-500 cursor-pointer font-extrabold"
              >
                <option value="Consumidor Final" className="bg-slate-950">Factura de Consumidor Final</option>
                <option value="Crédito Fiscal" className="bg-slate-950">Comprobante de Crédito Fiscal (CCF)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-1">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest">Oferta de Taller</label>
                <select
                  value={selectedOfertaId}
                  onChange={(e) => setSelectedOfertaId(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-250 rounded-xl p-3 outline-none focus:border-violet-500 cursor-pointer text-slate-300"
                >
                  <option value="" className="bg-slate-950">Ninguna</option>
                  {ofertas.filter(o => o.activo).map(of => (
                    <option key={of.id} value={of.id} className="bg-slate-950">{of.nombre} ({of.porcentajeDescuento}%)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest">Desc. Manual %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-250 rounded-xl p-3 outline-none focus:border-violet-500 font-mono font-bold text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- COLUMN 2 (Middle 4/12): Add items / Catalog searching --- */}
        <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-2xl flex flex-col h-[520px]">
          
          <div className="pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-shrink-0">
            <h3 className="font-display font-medium text-white text-sm flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-violet-400" />
              2. Catálogo de Repuestos
            </h3>
            
            {/* Quick Filter */}
            <div className="relative w-full sm:max-w-[130px]">
              <Search className="absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-500 w-3 h-3" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Filtrar..."
                className="w-full text-[10px] bg-slate-950 border border-slate-800 text-white rounded-lg py-1.5 pl-7 pr-2 outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Quick list lookup */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 mt-3 max-h-[420px]">
            {catalogList.map((prod) => {
              const isOutOfStock = prod.tipo === 'Producto' && prod.stock <= 0;

              return (
                <div 
                  key={prod.id} 
                  className={`p-3 bg-slate-950/60 rounded-xl border border-slate-850 flex items-center justify-between gap-2.5 hover:border-violet-500/40 transition-colors ${
                    isOutOfStock ? 'opacity-50' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-black font-mono text-violet-400">{prod.sku}</div>
                    <div className="text-xs font-bold text-white truncate max-w-[150px]">{prod.nombre}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">
                        {prod.clasificacion}
                      </span>
                      <span className={`px-1 rounded text-[8px] font-extrabold ${
                        prod.tipo === 'Producto' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'
                      }`}>
                        {prod.tipo}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                    <span className="text-xs font-black text-rose-300 font-mono">
                      ${prod.venta.toFixed(2)}
                    </span>
                    
                    {prod.tipo === 'Producto' ? (
                      <span className={`text-[9px] font-bold ${prod.stock === 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {prod.stock === 0 ? 'Agotado' : `${prod.stock} uds.`}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-bold">Servicio</span>
                    )}

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleAddProductToCart(prod)}
                      className={`px-2.5 py-1 text-[9px] font-black rounded-lg border transition-all cursor-pointer ${
                        isOutOfStock 
                          ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' 
                          : 'bg-violet-600/30 hover:bg-violet-600 text-violet-300 hover:text-white border-violet-500/30'
                      }`}
                    >
                      + Añadir
                    </button>
                  </div>
                </div>
              );
            })}

            {catalogList.length === 0 && (
              <p className="text-xs text-slate-500 italic py-10 text-center">
                Ningún repuesto coincide con la búsqueda.
              </p>
            )}
          </div>
        </div>

        {/* --- COLUMN 3 (Right 4/12): Checkout basket & Cashier flow --- */}
        <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-2xl flex flex-col h-[520px]">
          
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <h3 className="font-display font-medium text-white text-sm flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-violet-400" />
              3. Resumen y Total
            </h3>
            
            <span className="text-[10px] bg-violet-600/20 text-violet-400 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              {cartItems.length} items
            </span>
          </div>

          {/* Cart items list */}
          <div className="flex-grow overflow-y-auto pr-1 my-3 space-y-2">
            {cartItems.map((item) => (
              <div key={item.productoId} className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-850 rounded-xl gap-2 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white truncate text-xs">{item.nombre}</p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">Precio unitario: ${item.precioUnitario.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 bg-slate-950/80 rounded-lg p-0.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.productoId, -1)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-[10px] font-mono font-extrabold px-1 text-white">{item.cantidad}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.productoId, 1)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <span className="font-bold font-mono text-white text-xs w-12 text-right">
                    ${(item.precioUnitario * item.cantidad).toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveFromCart(item.productoId)}
                    className="text-slate-500 hover:text-red-400 p-1"
                    title="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {cartItems.length === 0 && (
              <p className="text-xs text-slate-500 italic py-16 text-center">
                El cesto está vacío. Añada repuestos o servicios para facturar.
              </p>
            )}
          </div>

          {/* Calculator base & Action checkout */}
          <div className="border-t border-slate-800 pt-4 space-y-3 flex-shrink-0">
            
            {/* Calculation summary stack */}
            <div className="space-y-1 text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
              <div className="flex justify-between">
                <span>Total Gravado (sin IVA):</span>
                <span className="font-mono">${baseBeforeIva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA 13%:</span>
                <span className="font-mono">${standardIvaAmount.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-violet-400 font-bold">
                  <span>Descuento Aplicado:</span>
                  <span className="font-mono">-${discountAmount.toFixed(2)} ({-currentDiscountPct}%)</span>
                </div>
              )}
            </div>

            {/* Total cash and change box */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 border border-slate-800 p-2 py-2.5 rounded-xl text-[10px]">
              <div>
                <span className="text-slate-500 block font-bold uppercase tracking-wide">Recibe ($)</span>
                <input
                  id="calc-received-input"
                  type="number"
                  placeholder="0.00"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold font-mono text-white outline-none"
                />
              </div>

              <div className="text-right">
                <span className="text-slate-500 block font-bold uppercase tracking-wide">Vuelto / Cambio</span>
                <span className="text-sm font-black font-mono text-emerald-400">
                  {cambioDue !== null ? `$${cambioDue.toFixed(2)}` : '——'}
                </span>
              </div>
            </div>

            {/* Total display is inside checkout button or beside it */}
            <button
              onClick={handleProcessFactura}
              className="w-full text-center py-3.5 text-xs font-black text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-105 rounded-xl shadow-lg shadow-violet-500/20 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <Calculator className="w-4 h-4" />
              <span>Pagar e Imprimir • Total: ${totalFactura.toFixed(2)}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
