'use client';

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Smartphone,
  Globe,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Tag,
  Edit2,
  Trash2,
  Clock,
  TrendingUp,
  Wine,
  Flame,
  Cookie,
  Coffee,
} from 'lucide-react';
import { AdminProduct } from '../../types/admin';
import { useAdminStore } from '../../services/adminStore';
import { AddProductModal } from '../../components/products/AddProductModal';
import { EditProductModal } from '../../components/products/EditProductModal';

type SectionFilterType =
  | 'All'
  | 'DealsOfTheDay'
  | 'PopularNow'
  | 'HardDrinks'
  | 'Cigarettes'
  | 'Snacks'
  | 'DrinksAndMixers'
  | 'LowStock';

export default function AdminProductsPage() {
  const products = useAdminStore((s) => s.products);
  const addProduct = useAdminStore((s) => s.addProduct);
  const updateProduct = useAdminStore((s) => s.updateProduct);
  const deleteProduct = useAdminStore((s) => s.deleteProduct);
  const updateStock = useAdminStore((s) => s.updateStock);
  const toggleProductChannel = useAdminStore((s) => s.toggleProductChannel);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState<SectionFilterType>('All');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleStockChange = (productId: string, delta: number) => {
    updateStock(productId, delta);
  };

  const handleToggleChannel = (productId: string, channel: 'mobile' | 'web') => {
    toggleProductChannel(productId, channel);
  };

  const handleAddNewProduct = (newProduct: AdminProduct) => {
    addProduct(newProduct);
    setSuccessToast(`"${newProduct.name}" published live to Mobile App & Web!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleUpdateProduct = (updated: AdminProduct) => {
    updateProduct(updated);
    setSuccessToast(`"${updated.name}" details and sections updated successfully!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleDeleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    deleteProduct(productId);
    setSuccessToast(`"${target?.name || 'Product'}" was removed from the catalog.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    
    // Section Placement Filters
    if (sectionFilter === 'DealsOfTheDay' && !p.isDealOfTheDay) return false;
    if (sectionFilter === 'PopularNow' && !p.isPopularNow) return false;
    if (sectionFilter === 'HardDrinks' && !p.isHardDrinks && p.categoryId !== 'alcohol') return false;
    if (sectionFilter === 'Cigarettes' && !p.isCigarettes && p.categoryId !== 'cigarettes') return false;
    if (sectionFilter === 'Snacks' && !p.isSnacks && p.categoryId !== 'snacks') return false;
    if (sectionFilter === 'DrinksAndMixers' && !p.isDrinksAndMixers && p.categoryId !== 'cold-drinks') return false;
    if (sectionFilter === 'LowStock' && p.stockQuantity > 5) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchId = p.id.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchId) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-teal-500 text-slate-950 font-bold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-teal-400" />
            Products & Sections Manager
          </h2>
          <p className="text-sm text-slate-400">
            Control items across Deals of the Day, Popular Now, Alcohol, Cigarettes, Snacks & Drinks
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Section Placement Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setSectionFilter('All')}
          className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap ${
            sectionFilter === 'All'
              ? 'bg-teal-500 text-slate-950 border-teal-500 font-extrabold shadow-md shadow-teal-500/20'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          All Products ({products.length})
        </button>

        <button
          onClick={() => setSectionFilter('DealsOfTheDay')}
          className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            sectionFilter === 'DealsOfTheDay'
              ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-amber-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" /> Deals of the Day
        </button>

        <button
          onClick={() => setSectionFilter('PopularNow')}
          className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            sectionFilter === 'PopularNow'
              ? 'bg-purple-500 text-white border-purple-500 font-extrabold shadow-md shadow-purple-500/20'
              : 'bg-slate-900 text-purple-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" /> Popular Now
        </button>

        <button
          onClick={() => setSectionFilter('HardDrinks')}
          className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            sectionFilter === 'HardDrinks'
              ? 'bg-indigo-500 text-white border-indigo-500 font-extrabold'
              : 'bg-slate-900 text-indigo-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Wine className="w-3.5 h-3.5" /> Hard Drinks & Liquors
        </button>

        <button
          onClick={() => setSectionFilter('Cigarettes')}
          className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            sectionFilter === 'Cigarettes'
              ? 'bg-slate-600 text-white border-slate-500 font-extrabold'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-400" /> Cigarettes & Tobacco
        </button>

        <button
          onClick={() => setSectionFilter('Snacks')}
          className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            sectionFilter === 'Snacks'
              ? 'bg-rose-500 text-white border-rose-500 font-extrabold'
              : 'bg-slate-900 text-rose-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Cookie className="w-3.5 h-3.5" /> Snacks & Munchies
        </button>

        <button
          onClick={() => setSectionFilter('DrinksAndMixers')}
          className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            sectionFilter === 'DrinksAndMixers'
              ? 'bg-teal-500 text-slate-950 border-teal-500 font-extrabold'
              : 'bg-slate-900 text-teal-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" /> Drinks & Mixers
        </button>

        <button
          onClick={() => setSectionFilter('LowStock')}
          className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
            sectionFilter === 'LowStock'
              ? 'bg-rose-600 text-white border-rose-600 font-extrabold'
              : 'bg-slate-900 text-rose-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            placeholder="Search by product name, category, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-hidden flex-1"
          />
        </div>
        <div className="text-xs text-slate-400 font-semibold px-2">
          Showing <span className="text-white font-bold">{filteredProducts.length}</span> matching products
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-bold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product Info</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price (NPR)</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4">Section Tags</th>
                <th className="py-3.5 px-4">Channels</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredProducts.map((product) => {
                const isLowStock = product.stockQuantity <= 5;
                const isOutOfStock = product.stockQuantity === 0;

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Product Name & Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                          <img
                            src={product.thumbnailUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-teal-300 transition-colors">
                            {product.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {product.unit} • SKU: {product.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                        {product.category}
                      </span>
                    </td>

                    {/* Pricing */}
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-white">
                        रू {product.price.toLocaleString()}
                      </div>
                      {product.mrp > product.price && (
                        <div className="text-xs text-slate-500 line-through">
                          रू {product.mrp.toLocaleString()}
                        </div>
                      )}
                    </td>

                    {/* Stock Stepper */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStockChange(product.id, -1)}
                          disabled={product.stockQuantity <= 0}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-black disabled:opacity-40"
                        >
                          -
                        </button>
                        <span
                          className={`text-xs font-black min-w-[2.5rem] text-center px-1.5 py-0.5 rounded-md ${
                            isOutOfStock
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : isLowStock
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'text-slate-200'
                          }`}
                        >
                          {product.stockQuantity}
                        </span>
                        <button
                          onClick={() => handleStockChange(product.id, 5)}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 flex items-center justify-center font-black"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Section Placement Badges */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {product.isDealOfTheDay && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            ⚡ Deals
                          </span>
                        )}
                        {product.isPopularNow && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            ⭐ Popular
                          </span>
                        )}
                        {product.isHardDrinks && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            🍷 Liquor
                          </span>
                        )}
                        {product.isCigarettes && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            🚬 Tobacco
                          </span>
                        )}
                        {product.isSnacks && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                            🍿 Snacks
                          </span>
                        )}
                        {product.isDrinksAndMixers && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                            🥤 Drinks
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Channel Toggles */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleChannel(product.id, 'mobile')}
                          className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border transition-colors ${
                            product.showOnMobileApp
                              ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                              : 'bg-slate-950 border-slate-800 text-slate-600'
                          }`}
                          title="Mobile App Visibility"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleChannel(product.id, 'web')}
                          className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border transition-colors ${
                            product.showOnWeb
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-600'
                          }`}
                          title="Web Store Visibility"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Edit Product Details & Sections"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Remove Product"
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

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProduct={handleAddNewProduct}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
}
