'use client';

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Search,
  Smartphone,
  Globe,
  Tag,
  ArrowUpDown,
  X,
  PackagePlus,
  ShoppingBag,
} from 'lucide-react';
import { AdminCategory, AdminProduct } from '../../types/admin';
import { useAdminStore } from '../../services/adminStore';
import { AddProductModal } from '../../components/products/AddProductModal';

export default function CategoriesPage() {
  const categories = useAdminStore((s) => s.categories);
  const products = useAdminStore((s) => s.products);
  const addCategory = useAdminStore((s) => s.addCategory);
  const updateCategory = useAdminStore((s) => s.updateCategory);
  const deleteCategory = useAdminStore((s) => s.deleteCategory);
  const toggleCategoryStatus = useAdminStore((s) => s.toggleCategoryStatus);
  const addProduct = useAdminStore((s) => s.addProduct);

  const [searchQuery, setSearchQuery] = useState('');
  
  // Category Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);

  // Add Product to Category Modal
  const [targetCategoryForProduct, setTargetCategoryForProduct] = useState<string | null>(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [image, setImage] = useState('');
  const [color, setColor] = useState('#0F766E');
  const [subcategoriesInput, setSubcategoriesInput] = useState('');

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setName('');
    setTagline('');
    setImage('https://images.unsplash.com/photo-1543253687-c931c8e01820?w=500');
    setColor('#0F766E');
    setSubcategoriesInput('Soft Drinks, Energy, Juice');
    setEditingCategory(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cat: AdminCategory) => {
    setName(cat.name);
    setTagline(cat.tagline);
    setImage(cat.image);
    setColor(cat.color);
    setSubcategoriesInput(cat.subcategories.join(', '));
    setEditingCategory(cat);
    setIsAddModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const subcats = subcategoriesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: name.trim(),
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        tagline: tagline.trim(),
        image: image.trim(),
        color,
        subcategories: subcats,
      });
    } else {
      const newCat: AdminCategory = {
        id: `cat-${Date.now()}`,
        name: name.trim(),
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        tagline: tagline.trim() || 'Essential picks delivered fast',
        image: image.trim() || 'https://images.unsplash.com/photo-1543253687-c931c8e01820?w=500',
        icon: 'Package',
        color,
        productCount: 0,
        isActive: true,
        displayOrder: categories.length + 1,
        subcategories: subcats.length > 0 ? subcats : ['General'],
      };
      addCategory(newCat);
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category? Products in it can be re-assigned.')) {
      deleteCategory(id);
    }
  };

  const handleOpenAddProductForCategory = (catId: string) => {
    setTargetCategoryForProduct(catId);
    setIsAddProductModalOpen(true);
  };

  const handleAddNewProductToStore = (newProduct: AdminProduct) => {
    addProduct(newProduct);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-teal-400" />
            Categories & Aisles Manager
          </h2>
          <p className="text-sm text-slate-400">
            Add new categories, manage subcategories & add products directly into aisles
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {/* Quick Search */}
      <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search categories by name or tagline..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-hidden flex-1"
        />
        <span className="text-xs text-slate-400 mr-2 font-medium">
          {filteredCategories.length} Active Aisles
        </span>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCategories.map((cat) => {
          const categoryProductCount = products.filter(
            (p) => p.categoryId === cat.id || p.category.toLowerCase().includes(cat.slug)
          ).length;

          return (
            <div
              key={cat.id}
              className={`rounded-3xl border transition-all overflow-hidden bg-slate-900 ${
                cat.isActive ? 'border-slate-800 hover:border-slate-700 shadow-xl' : 'border-slate-800/40 opacity-60'
              }`}
            >
              {/* Category Photo Banner */}
              <div className="h-36 w-full relative overflow-hidden bg-slate-950">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Status Badge & Actions Overlay */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={() => toggleCategoryStatus(cat.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
                      cat.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700'
                    }`}
                  >
                    {cat.isActive ? 'Active on App & Web' : 'Hidden'}
                  </button>
                </div>

                {/* Theme Color Pill */}
                <div
                  className="absolute bottom-3 left-4 px-3 py-1 rounded-xl text-xs font-black text-white shadow-lg flex items-center gap-1.5"
                  style={{ backgroundColor: cat.color }}
                >
                  <span>{cat.name}</span>
                </div>
              </div>

              {/* Category Details */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{cat.name}</h3>
                    <p className="text-xs text-slate-400">{cat.tagline}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-teal-400 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20">
                      {categoryProductCount} Products Live
                    </span>
                  </div>
                </div>

                {/* Subcategories Chips */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Subcategories / Tags:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.map((sub) => (
                      <span
                        key={sub}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-medium"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenAddProductForCategory(cat.id)}
                    className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <PackagePlus className="w-3.5 h-3.5 text-teal-400" />
                    + Add Product to this Aisle
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Aisle
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Party Essentials, Energy Drinks & Tonics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tagline / Subtext *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cups, ice cubes, openers & cocktail syrups"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  HD Image Banner URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Subcategories (comma-separated tags)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ice Bags, Plastic Cups, Shakers, Straws"
                  value={subcategoriesInput}
                  onChange={(e) => setSubcategoriesInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 text-sm font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Add Product Modal pre-filled for target category */}
      {isAddProductModalOpen && (
        <AddProductModal
          isOpen={isAddProductModalOpen}
          defaultCategoryId={targetCategoryForProduct || 'alcohol'}
          onClose={() => setIsAddProductModalOpen(false)}
          onAddProduct={handleAddNewProductToStore}
        />
      )}
    </div>
  );
}
