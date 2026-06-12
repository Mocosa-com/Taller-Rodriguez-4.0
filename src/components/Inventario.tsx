import React, { useState } from 'react';
import { Producto, Proveedor } from '../types';
import { 
  Package, 
  Search, 
  Plus, 
  Minus, 
  Download, 
  Upload, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  X, 
  Warehouse, 
  AlertTriangle,
  PlusCircle,
  FileText
} from 'lucide-react';

interface InventarioProps {
  productos: Producto[];
  proveedores: Proveedor[];
  onAddProducto: (p: Omit<Producto, 'id' | 'sku'>) => void;
  onUpdateProducto: (p: Producto) => void;
  onDeleteProducto: (id: string) => void;
  onAdjustStock: (id: string, qty: number) => void;
}

export function Inventario({ 
  productos, 
  proveedores, 
  onAddProducto, 
  onUpdateProducto, 
  onDeleteProducto,
  onAdjustStock
}: InventarioProps) {

  // Table filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('todos');
  const [selectedType, setSelectedType] = useState('todos');
  const [sortedOrder, setSortedOrder] = useState('normal');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Static Categories from Page 12 list
  const [categories, setCategories] = useState<string[]>([
    'Todos', 'Aceites y fluidos', 'Eléctrico', 'Frenos', 'Llantas', 'Motor', 'Suspensión', 'Transmisión'
  ]);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [selectedProd, setSelectedProd] = useState<Producto | null>(null);

  // Form entries
  const [formData, setFormData] = useState({
    sku: '',
    nombre: '',
    tipo: 'Producto' as 'Producto' | 'Servicio',
    stock: 10,
    compra: 5.00,
    venta: 10.00,
    proveedor: '',
    clasificacion: 'Motor',
    stockMinimo: 5,
    stockMaximum: 999, // default
    descripcion: ''
  });

  // Stock Adjustment values (Pages 15-16)
  const [stockAmount, setStockAmount] = useState<number>(1);
  const [stockObs, setStockObs] = useState<string>('');

  // Handle category category builder
  const handleAddNewCategory = () => {
    const name = prompt('Ingrese el nombre de la nueva categoría para clasificar repuestos:');
    if (name && name.trim()) {
      setCategories(prev => [...prev, name.trim()]);
    }
  };

  // Filter lists
  const filteredProducts = productos.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (selectedProvider !== 'todos' && p.proveedor !== selectedProvider) return false;
    if (selectedType !== 'todos' && p.tipo !== selectedType) return false;
    if (selectedCategory !== 'Todos' && p.clasificacion !== selectedCategory) return false;

    return true;
  }).sort((a, b) => {
    if (sortedOrder === 'stock-asc') return a.stock - b.stock;
    if (sortedOrder === 'stock-desc') return b.stock - a.stock;
    if (sortedOrder === 'precio-asc') return a.venta - b.venta;
    if (sortedOrder === 'precio-desc') return b.venta - a.venta;
    return 0; // natural normal order
  });

  // Handlers
  const handleOpenAdd = () => {
    setFormData({
      sku: '',
      nombre: '',
      tipo: 'Producto',
      stock: 10,
      compra: 5.00,
      venta: 10.00,
      proveedor: proveedores[0]?.nombre || 'Proveedor Alterno',
      clasificacion: categories[1] || 'Motor',
      stockMinimo: 5,
      stockMaximum: 999,
      descripcion: ''
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (p: Producto) => {
    setSelectedProd(p);
    setFormData({
      sku: p.sku,
      nombre: p.nombre,
      tipo: p.tipo,
      stock: p.stock,
      compra: p.compra,
      venta: p.venta,
      proveedor: p.proveedor,
      clasificacion: p.clasificacion,
      stockMinimo: p.stockMinimo,
      stockMaximum: p.stockMaximo || 999,
      descripcion: p.descripcion
    });
    setIsEditOpen(true);
  };

  const handleOpenStockIn = (p: Producto) => {
    setSelectedProd(p);
    setStockAmount(1);
    setStockObs('');
    setIsStockInOpen(true);
  };

  const handleOpenStockOut = (p: Producto) => {
    setSelectedProd(p);
    setStockAmount(1);
    setStockObs('');
    setIsStockOutOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre) return;
    onAddProducto(formData);
    setIsAddOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProd) return;
    onUpdateProducto({
      ...selectedProd,
      sku: formData.sku,
      nombre: formData.nombre,
      tipo: formData.tipo,
      stock: formData.stock,
      compra: formData.compra,
      venta: formData.venta,
      proveedor: formData.proveedor,
      clasificacion: formData.clasificacion,
      stockMinimo: formData.stockMinimo,
      stockMaximo: formData.stockMaximum,
      descripcion: formData.descripcion
    });
    setIsEditOpen(false);
  };

  const handleStockAdjustIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProd || stockAmount < 1) return;
    onAdjustStock(selectedProd.id, stockAmount);
    setIsStockInOpen(false);
    alert(`Entrada de Stock registrada con éxito. Se añadieron +${stockAmount} unidades a ${selectedProd.nombre}.`);
  };

  const handleStockAdjustOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProd || stockAmount < 1) return;
    if (stockAmount > selectedProd.stock) {
      alert('Error: No puede retirar más unidades de las registradas actualmente en almacén.');
      return;
    }
    onAdjustStock(selectedProd.id, -stockAmount);
    setIsStockOutOpen(false);
    alert(`Salida de Almacén registrada con éxito. Se dedujeron -${stockAmount} unidades a ${selectedProd.nombre}.`);
  };

  return (
    <div className="space-y-6 relative z-10 text-slate-100 animate-none">

      {/* Unified Contiguous Card Container has NO outer vertical divisions/spacing tabs. 
         It is continuous and wraps everything beautifully in a single dark slate backdrop pane. */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800 p-6 space-y-6 shadow-2xl">
        
        {/* Row 1: Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div>
            <h2 className="font-display font-medium text-white text-lg flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-violet-400 animate-pulse" />
              Control de Inventario de Repuestos
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Gestión de piezas de automotores, aceites de motores, alertas de recarga y facturación de servicios.
            </p>
          </div>

          <div className="flex gap-2.5 flex-wrap">
            <button
              onClick={() => alert('Simulación: Importando catálogo CSV...')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-350 bg-slate-850 hover:bg-slate-800 border border-slate-805 rounded-xl px-3.5 py-2.5 cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Importar CSV</span>
            </button>
            
            <button
              onClick={() => alert('Generando listado de exportación en formato XLSX...')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-350 bg-slate-850 hover:bg-slate-800 border border-slate-805 rounded-xl px-3.5 py-2.5 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Exportar Todo</span>
            </button>

            <button
              id="btn-open-add-product"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 text-xs font-black text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-105 px-4.5 py-2.5 rounded-xl shadow-lg shadow-violet-500/10 cursor-pointer transition-all animate-none"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar producto</span>
            </button>
          </div>
        </div>

        {/* Row 2: Categories Filters (Seamless layout, no separate card box) */}
        <div className="flex items-center gap-2 flex-wrap py-1.5 overflow-x-auto border-b border-slate-850/30 pb-4">
          <span className="text-xs font-black text-slate-450 uppercase tracking-widest mr-2">Categorías:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-violet-600 text-white border-violet-500 shadow-sm shadow-violet-500/20' 
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
          {/* "+ Nueva" button category builder */}
          <button
            onClick={handleAddNewCategory}
            className="px-3.5 py-1.5 text-xs font-black rounded-full border border-dashed border-violet-500/50 text-violet-400 hover:bg-violet-500/10 hover:text-white transition-all cursor-pointer"
          >
            + Nueva
          </button>
        </div>

        {/* Row 3: Filter controls row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              id="search-inventario"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código SKU, producto, servicio..."
              className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="text-xs bg-slate-950 text-slate-300 border border-slate-800 rounded-xl py-3 px-3 outline-none focus:border-violet-500 cursor-pointer font-extrabold"
          >
            <option value="todos">Todos los proveedores</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.nombre} className="bg-slate-950 text-slate-200">{p.nombre}</option>
            ))}
          </select>

          <select
            value={sortedOrder}
            onChange={(e) => setSortedOrder(e.target.value)}
            className="text-xs bg-slate-950 text-slate-300 border border-slate-800 rounded-xl py-3 px-3 outline-none focus:border-violet-500 cursor-pointer font-extrabold"
          >
            <option value="normal">Sin orden específico</option>
            <option value="stock-asc">Stock: Menor a Mayor</option>
            <option value="stock-desc">Stock: Mayor a Menor</option>
            <option value="precio-asc">Precio: Más bajo primero</option>
            <option value="precio-desc">Precio: Más alto primero</option>
          </select>
        </div>

        {/* Row 4: Continuous Table (no separate division box) */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/20">

          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-slate-800/60">
            {filteredProducts.map((p) => {
              const isCritical = p.tipo === 'Producto' && p.stock <= p.stockMinimo;
              return (
                <div key={p.id} className={`p-4 space-y-3 text-xs ${isCritical ? 'bg-red-500/10' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-extrabold text-white text-sm">{p.nombre}</div>
                      <div className="text-[10px] text-slate-450 mt-0.5">{p.descripcion}</div>
                      <div className="text-[10px] font-mono font-black text-violet-400 mt-1">{p.sku}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold flex-shrink-0 ${
                      p.tipo === 'Producto' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    }`}>
                      {p.tipo}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-[10px] text-slate-450 uppercase font-bold mr-1">Stock:</span>
                      {p.tipo === 'Producto' ? (
                        <>
                          <span className={`px-2.5 py-1 rounded-full font-mono font-black ${
                            isCritical ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {p.stock}
                          </span>
                          {isCritical && (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" title="Mínimo alcanzado" />
                          )}
                        </>
                      ) : (
                        <span className="text-slate-500 italic">Ilimitado</span>
                      )}
                    </div>
                    <span className="bg-slate-950/60 border border-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wide">
                      {p.clasificacion}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Compra: <span className="font-semibold">${p.compra.toFixed(2)}</span></span>
                    <span className="text-white font-black text-sm">${p.venta.toFixed(2)}</span>
                  </div>

                  <div className="text-[10px] text-slate-300 font-medium truncate">
                    Proveedor: {p.proveedor}
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-2 text-violet-600 hover:text-white bg-slate-950/40 hover:bg-violet-600 border border-slate-800 rounded-xl transition-all cursor-pointer"
                      title="Editar Ficha"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {p.tipo === 'Producto' && (
                      <>
                        <button
                          onClick={() => handleOpenStockIn(p)}
                          className="p-2 text-emerald-600 hover:text-white bg-slate-950/40 hover:bg-emerald-600 border border-slate-800 rounded-xl transition-all cursor-pointer font-bold"
                          title="Registrar Entrada Stock"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenStockOut(p)}
                          className="p-2 text-rose-600 hover:text-white bg-slate-950/40 hover:bg-rose-600 border border-slate-800 rounded-xl transition-all cursor-pointer font-bold"
                          title="Registrar Salida Stock"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        if (window.confirm(`¿Seguro que desea retirar del catálogo: ${p.nombre}?`)) {
                          onDeleteProducto(p.id);
                        }
                      }}
                      className="p-2 text-red-650 hover:bg-red-600 hover:text-white border border-red-150/55 rounded-xl transition-all cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="py-8 text-center text-slate-500 italic text-xs">
                No se encontraron productos o servicios con este filtro.
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800">
                  <th className="py-4 px-5">SKU</th>
                  <th className="py-4 px-5">Producto / Servicio</th>
                  <th className="py-4 px-5">Tipo</th>
                  <th className="py-4 px-5">Stock</th>
                  <th className="py-4 px-5">Compra</th>
                  <th className="py-4 px-5">Venta</th>
                  <th className="py-4 px-5">Proveedor</th>
                  <th className="py-4 px-5">Clasificación</th>
                  <th className="py-4 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredProducts.map((p) => {
                  const isCritical = p.tipo === 'Producto' && p.stock <= p.stockMinimo;

                  return (
                    <tr key={p.id} className={`hover:bg-slate-800/10 transition-colors ${isCritical ? 'bg-red-500/10' : ''}`}>
                      <td className="py-4 px-5 font-mono font-black text-violet-400">{p.sku}</td>
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-white text-sm">{p.nombre}</div>
                        <div className="text-[10px] text-slate-450 mt-0.5 truncate max-w-xs">{p.descripcion}</div>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          p.tipo === 'Producto' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                        }`}>
                          {p.tipo}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        {p.tipo === 'Producto' ? (
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className={`px-2.5 py-1 rounded-full font-mono font-black ${
                              isCritical ? 'bg-red-500/20 text-red-00 border border-red-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              {p.stock}
                            </span>
                            {isCritical && (
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" title="Mínimo alcanzado" />
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Ilimitado</span>
                        )}
                      </td>
                      <td className="py-4 px-5 font-mono font-semibold text-slate-400">${p.compra.toFixed(2)}</td>
                      <td className="py-4 px-5 font-mono font-black text-white text-sm">${p.venta.toFixed(2)}</td>
                      <td className="py-4 px-5 text-slate-300 font-medium truncate max-w-[120px]" title={p.proveedor}>
                        {p.proveedor}
                      </td>
                      <td className="py-4 px-5">
                        <span className="bg-slate-950/60 border border-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wide">
                          {p.clasificacion}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-2 text-violet-600 hover:text-white bg-slate-950/40 hover:bg-violet-600 border border-slate-800 rounded-xl transition-all cursor-pointer"
                            title="Editar Ficha"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Adjust Stock in (Only products) */}
                          {p.tipo === 'Producto' && (
                            <>
                              <button
                                onClick={() => handleOpenStockIn(p)}
                                className="p-2 text-emerald-600 hover:text-white bg-slate-950/40 hover:bg-emerald-600 border border-slate-800 rounded-xl transition-all cursor-pointer font-bold"
                                title="Registrar Entrada Stock"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenStockOut(p)}
                                className="p-2 text-rose-600 hover:text-white bg-slate-950/40 hover:bg-rose-600 border border-slate-800 rounded-xl transition-all cursor-pointer font-bold"
                                title="Registrar Salida Stock"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => {
                              if (window.confirm(`¿Seguro que desea retirar del catálogo: ${p.nombre}?`)) {
                                onDeleteProducto(p.id);
                              }
                            }}
                            className="p-2 text-red-650 hover:bg-red-50 hover:text-red-600 border border-red-150/55 rounded-xl transition-all cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      </div>


      {/* Modal 1: Agregar Producto (Page 13) */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-200">
            
            <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-display font-medium text-base flex items-center gap-2">
                  <Package className="w-5 h-5 animate-pulse" />
                  Agregar Producto o Servicio
                </h3>
                <p className="text-[11px] opacity-90 mt-0.5">Sincronización directa al catálogo de inventarios.</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-white hover:opacity-80 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del producto *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej. Aceite Motor Premium 10W40"
                  className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-violet-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Proveedor ("Toma previos", Page 13)</label>
                  <select
                    value={formData.proveedor}
                    onChange={(e) => setFormData(prev => ({ ...prev, proveedor: e.target.value }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none font-semibold text-white [&>option]:bg-slate-950"
                  >
                    {proveedores.map(prov => (
                      <option key={prov.id} value={prov.nombre}>{prov.nombre}</option>
                    ))}
                    <option value="Procompra SV">Procompra SV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Clasificación de producto</label>
                  <select
                    value={formData.clasificacion}
                    onChange={(e) => setFormData(prev => ({ ...prev, clasificacion: e.target.value }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none font-semibold text-white [&>option]:bg-slate-950"
                  >
                    {categories.filter(c => c !== 'Todos').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Precio Compra ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.compra}
                    onChange={(e) => setFormData(prev => ({ ...prev, compra: parseFloat(e.target.value) }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Precio Venta ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.venta}
                    onChange={(e) => setFormData(prev => ({ ...prev, venta: parseFloat(e.target.value) }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo catálogo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as any }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none font-bold text-white [&>option]:bg-slate-950"
                  >
                    <option value="Producto">Producto</option>
                    <option value="Servicio">Servicio</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    disabled={formData.tipo === 'Servicio'}
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-bold disabled:opacity-40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Mínimo Alerta</label>
                  <input
                    type="number"
                    disabled={formData.tipo === 'Servicio'}
                    value={formData.stockMinimo}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockMinimo: parseInt(e.target.value) }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-bold disabled:opacity-40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción corta (opcional)</label>
                <textarea
                  value={formData.descripcion}
                  rows={2}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Escriba especificaciones del artículo..."
                  className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="text-xs font-semibold text-slate-300 bg-slate-850 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="text-xs font-black text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-105 px-5 py-2.5 rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
                >
                  Agregar producto
                </button>
              </div>

            </form>

          </div>
        </div>
      )}


      {/* Modal 2: Editar Producto (Page 14) */}
      {isEditOpen && selectedProd && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-200">
            
            <div className="bg-slate-950 text-white p-5 flex justify-between items-center border-b border-slate-800">
              <div>
                <h3 className="font-display font-medium text-base flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-orange-400 animate-pulse" />
                  Editar Ficha de Producto o Servicio
                </h3>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-violet-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-semibold focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Código SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-mono font-bold focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Proveedor</label>
                  <select
                    value={formData.proveedor}
                    onChange={(e) => setFormData(prev => ({ ...prev, proveedor: e.target.value }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-semibold [&>option]:bg-slate-950"
                  >
                    {proveedores.map(p => (
                      <option key={p.id} value={p.nombre}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Clasificación</label>
                  <select
                    value={formData.clasificacion}
                    onChange={(e) => setFormData(prev => ({ ...prev, clasificacion: e.target.value }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-semibold [&>option]:bg-slate-950"
                  >
                    {categories.filter(c => c !== 'Todos').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Costo Compra ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.compra}
                    onChange={(e) => setFormData(prev => ({ ...prev, compra: parseFloat(e.target.value) }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Precio Venta ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.venta}
                    onChange={(e) => setFormData(prev => ({ ...prev, venta: parseFloat(e.target.value) }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as any }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none font-bold [&>option]:bg-slate-950"
                  >
                    <option value="Producto">Producto</option>
                    <option value="Servicio">Servicio</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mínimo sugerido para alertas de stock</label>
                  <input
                    type="number"
                    value={formData.stockMinimo}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockMinimo: parseInt(e.target.value) }))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción técnica</label>
                <textarea
                  value={formData.descripcion}
                  rows={2}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full text-xs bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="text-xs font-semibold text-slate-300 bg-slate-850 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="text-xs font-black text-white bg-gradient-to-r from-orange-500 to-red-500 hover:brightness-105 px-5 py-2.5 rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
                >
                  Guardar cambios
                </button>
              </div>

            </form>

          </div>
        </div>
      )}


      {/* Modal 3: Entrada de Stock (Page 15) */}
      {isStockInOpen && selectedProd && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in duration-200 text-slate-200">
            
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4.5 flex justify-between items-center">
              <span className="font-display font-bold text-sm">Entrada de stock - {selectedProd.nombre}</span>
              <button onClick={() => setIsStockInOpen(false)} className="text-white hover:opacity-80 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleStockAdjustIn} className="p-5 space-y-4">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-slate-400">Stock actual: <span className="text-white font-mono">{selectedProd.stock}</span> uds.</p>
                <p className="font-semibold text-slate-400">SKU: <span className="text-white font-mono">{selectedProd.sku}</span></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cantidad a ingresar</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockAmount}
                  onChange={(e) => setStockAmount(parseInt(e.target.value) || 1)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none font-bold text-white focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Observaciones (Opcional)</label>
                <textarea
                  value={stockObs}
                  rows={2}
                  onChange={(e) => setStockObs(e.target.value)}
                  placeholder="Ej. Ingreso de compra mensual lote #102..."
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-white focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsStockInOpen(false)}
                  className="bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs px-4 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md cursor-pointer transition-all uppercase tracking-wider"
                >
                  Registrar Entrada
                </button>
              </div>
            </form>

          </div>
        </div>
      )}


      {/* Modal 4: Salida de Almacén (Page 16) */}
      {isStockOutOpen && selectedProd && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in duration-200 text-slate-200">
            
            <div className="bg-red-600 text-white p-4.5 flex justify-between items-center">
              <span className="font-display font-bold text-sm">Salida de stock - {selectedProd.nombre}</span>
              <button onClick={() => setIsStockOutOpen(false)} className="text-white hover:opacity-80 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleStockAdjustOut} className="p-5 space-y-4">
              <div className="bg-red-950/20 text-red-400 p-3.5 rounded-xl border border-red-900/40 text-xs font-semibold space-y-1">
                <p>Stock actual disponible: {selectedProd.stock} uds.</p>
                <p className="mt-0.5 text-[10px] opacity-90">No retire más unidades que el stock disponible.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cantidad a extraer</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProd.stock}
                  required
                  value={stockAmount}
                  onChange={(e) => setStockAmount(parseInt(e.target.value) || 1)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none font-bold font-mono text-red-400 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Observaciones (Opcional)</label>
                <textarea
                  value={stockObs}
                  rows={2}
                  onChange={(e) => setStockObs(e.target.value)}
                  placeholder="Ej. Desecho de piezas vencidas o dañadas..."
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-white focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsStockOutOpen(false)}
                  className="bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs px-4 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-red-650 hover:bg-red-500 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md cursor-pointer transition-all uppercase tracking-wider bg-red-600"
                >
                  Registrar Salida
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
