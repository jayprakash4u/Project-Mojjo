'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Sparkles,
  Smartphone,
  Globe,
  Trash2,
  CheckCircle2,
  Clock,
  TrendingUp,
  Wine,
  Flame,
  Cookie,
  Coffee,
  Zap,
  Home,
} from 'lucide-react';
import { AdminProduct } from '../../types/admin';
import { useAdminStore } from '../../services/adminStore';

interface EditProductModalProps {
  product: AdminProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProduct: (updated: AdminProduct) => void;
  onDeleteProduct: (productId: string) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const categories = useAdminStore((s) => s.categories);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('alcohol');
  const [unit, setUnit] = useState('750 ml');
  const [price, setPrice] = useState('4200');
  const [mrp, setMrp] = useState('4800');
  const [stockQuantity, setStockQuantity] = useState('25');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  // Section Placements
  const [isFlashDeal, setIsFlashDeal] = useState(false);
  const [isDealOfTheDay, setIsDealOfTheDay] = useState(false);
  const [isPopularNow, setIsPopularNow] = useState(false);
  const [isHardDrinks, setIsHardDrinks] = useState(false);
  const [isCigarettes, setIsCigarettes] = useState(false);
  const [isSnacks, setIsSnacks] = useState(false);
  const [isDrinksAndMixers, setIsDrinksAndMixers] = useState(false);

  // Channels
  const [showOnMobileApp, setShowOnMobileApp] = useState(true);
  const [showOnWeb, setShowOnWeb] = useState(true);

  // Piece-Wise & Packet Quantity Configuration
  const [hasPieceOptions, setHasPieceOptions] = useState(false);
  const [sticksPerPack, setSticksPerPack] = useState('20');
  const [singleStickPrice, setSingleStickPrice] = useState('25');
  const [packPrice, setPackPrice] = useState('450');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategoryId(product.categoryId || 'alcohol');
      setUnit(product.unit || '1 Unit');
      setPrice(product.price.toString());
      setMrp(product.mrp.toString());
      setStockQuantity(product.stockQuantity.toString());
      setThumbnailUrl(product.thumbnailUrl);
      setIsFlashDeal(product.isFlashDeal);
      setIsDealOfTheDay(product.isDealOfTheDay ?? product.isFlashDeal);
      setIsPopularNow(product.isPopularNow ?? false);
      setIsHardDrinks(product.isHardDrinks ?? (product.categoryId === 'alcohol'));
      setIsCigarettes(product.isCigarettes ?? (product.categoryId === 'cigarettes'));
      setIsSnacks(product.isSnacks ?? (product.categoryId === 'snacks'));
      setIsDrinksAndMixers(product.isDrinksAndMixers ?? (product.categoryId === 'cold-drinks'));
      setShowOnMobileApp(product.showOnMobileApp);
      setShowOnWeb(product.showOnWeb);

      if (product.pieceOptions) {
        setHasPieceOptions(true);
        setSticksPerPack(product.pieceOptions.sticksPerPack.toString());
        setSingleStickPrice(product.pieceOptions.singleStickPrice.toString());
        setPackPrice(product.pieceOptions.packPrice.toString());
      } else if (product.categoryId === 'cigarettes') {
        setHasPieceOptions(true);
        setSticksPerPack('20');
        setSingleStickPrice('25');
        setPackPrice(product.price.toString());
      } else {
        setHasPieceOptions(false);
      }

      setIsDeleting(false);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const selectedCat = categories.find((c) => c.id === categoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a product title.');
      return;
    }

    const priceNum = parseFloat(price);
    const mrpNum = parseFloat(mrp);
    const stockNum = parseInt(stockQuantity, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid selling price.');
      return;
    }

    setIsSaving(true);
    setError('');

    const stickCountNum = parseInt(sticksPerPack, 10) || 20;
    const stickPriceNum = parseFloat(singleStickPrice) || (priceNum / stickCountNum);
    const packPriceNum = parseFloat(packPrice) || priceNum;

    const updatedProduct: AdminProduct = {
      ...product,
      name: name.trim(),
      category: selectedCat ? selectedCat.name : product.category,
      categoryId,
      unit: unit.trim() || product.unit,
      price: priceNum,
      mrp: isNaN(mrpNum) ? priceNum : mrpNum,
      stockQuantity: isNaN(stockNum) ? 0 : stockNum,
      isAvailable: stockNum > 0,
      isFlashDeal: isDealOfTheDay || isFlashDeal,
      isDealOfTheDay,
      isPopularNow,
      isHardDrinks,
      isCigarettes,
      isSnacks,
      isDrinksAndMixers,
      pieceOptions: hasPieceOptions ? {
        sticksPerPack: stickCountNum,
        singleStickPrice: stickPriceNum,
        packPrice: packPriceNum,
      } : undefined,
      units: hasPieceOptions ? [
        { id: `pack${stickCountNum}`, label: `Pack of ${stickCountNum}`, price: packPriceNum, contains: stickCountNum },
        { id: 'single', label: '1 piece', price: stickPriceNum, contains: 1 },
      ] : undefined,
      showOnMobileApp,
      showOnWeb,
      thumbnailUrl: thumbnailUrl.trim() || product.thumbnailUrl,
      updatedAt: 'Just now',
    };

    setTimeout(() => {
      onUpdateProduct(updatedProduct);
      setIsSaving(false);
      onClose();
    }, 250);
  };

  const handleDelete = () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }
    onDeleteProduct(product.id);
    onClose();
  };

  const activeHomeSectionsCount = [
    isDealOfTheDay,
    isPopularNow,
    isHardDrinks,
    isCigarettes,
    isSnacks,
    isDrinksAndMixers,
  ].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">Edit Product Showcases</h3>
              <p className="text-xs text-slate-400">SKU: {product.id} • Live on Kathmandu Storefront</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Product Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 transition-colors"
            />
          </div>

          {/* Category & Packaging Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-hidden focus:border-teal-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Unit / Packaging *
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>

          {/* Price, MRP, and Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Price (NPR) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-emerald-400 font-bold focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                MRP (NPR)
              </label>
              <input
                type="number"
                min="1"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-400 focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Stock Qty *
              </label>
              <input
                type="number"
                required
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>

          {/* ============================================================ */}
          {/* PIECE-WISE & PACKET QUANTITY CONFIGURATION (Cigarettes, etc.) */}
          {/* ============================================================ */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white">
                  Piece-Wise & Packet Configuration
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                <input
                  type="checkbox"
                  checked={hasPieceOptions}
                  onChange={(e) => setHasPieceOptions(e.target.checked)}
                  className="w-4 h-4 rounded-md accent-teal-500 bg-slate-900 border-slate-700"
                />
                <span>Allow Single Piece Sale</span>
              </label>
            </div>

            {hasPieceOptions && (
              <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-800 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Pieces in Packet
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 10, 20"
                    value={sticksPerPack}
                    onChange={(e) => setSticksPerPack(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Single Piece Price (NPR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="25"
                    value={singleStickPrice}
                    onChange={(e) => setSingleStickPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Full Packet Price (NPR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="450"
                    value={packPrice}
                    onChange={(e) => setPackPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-teal-400 font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              HD Image URL *
            </label>
            <input
              type="url"
              required
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-teal-500 font-mono"
            />
          </div>

          {/* ============================================================ */}
          {/* HOME SCREEN DISPLAY & SHOWCASES CHECKBOXES */}
          {/* ============================================================ */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 border border-teal-500/30 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Home className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Home Screen Section Checkboxes
                  </span>
                  <p className="text-[10px] text-slate-400">Select where product is featured on homepage</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {activeHomeSectionsCount} Sections Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Checkbox 1: Deals of the Day */}
              <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                isDealOfTheDay
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={isDealOfTheDay}
                  onChange={(e) => setIsDealOfTheDay(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-0"
                />
                <div>
                  <span className="font-bold text-white flex items-center gap-1">
                    ⚡ Deals of the Day
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Top flash discount strip</p>
                </div>
              </label>

              {/* Checkbox 2: Popular Now */}
              <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                isPopularNow
                  ? 'bg-purple-500/10 border-purple-500/40 text-purple-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={isPopularNow}
                  onChange={(e) => setIsPopularNow(e.target.checked)}
                  className="mt-0.5 rounded text-purple-500 focus:ring-0"
                />
                <div>
                  <span className="font-bold text-white flex items-center gap-1">
                    ⭐ Popular Now
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Top trending orders tonight</p>
                </div>
              </label>

              {/* Checkbox 3: Hard Drinks & Liquors */}
              <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                isHardDrinks
                  ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={isHardDrinks}
                  onChange={(e) => setIsHardDrinks(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-500 focus:ring-0"
                />
                <div>
                  <span className="font-bold text-white flex items-center gap-1">
                    🍷 Hard Drinks & Liquors
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Whisky, wine, beer & spirits</p>
                </div>
              </label>

              {/* Checkbox 4: Cigarettes & Tobacco */}
              <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                isCigarettes
                  ? 'bg-slate-700/30 border-slate-500 text-slate-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={isCigarettes}
                  onChange={(e) => setIsCigarettes(e.target.checked)}
                  className="mt-0.5 rounded text-slate-400 focus:ring-0"
                />
                <div>
                  <span className="font-bold text-white flex items-center gap-1">
                    🚬 Cigarettes & Tobacco
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Packs & per-piece units</p>
                </div>
              </label>

              {/* Checkbox 5: Snacks & Munchies */}
              <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                isSnacks
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={isSnacks}
                  onChange={(e) => setIsSnacks(e.target.checked)}
                  className="mt-0.5 rounded text-rose-500 focus:ring-0"
                />
                <div>
                  <span className="font-bold text-white flex items-center gap-1">
                    🍿 Snacks & Munchies
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Chips, nuts & chocolates</p>
                </div>
              </label>

              {/* Checkbox 6: Drinks & Mixers */}
              <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                isDrinksAndMixers
                  ? 'bg-teal-500/10 border-teal-500/40 text-teal-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}>
                <input
                  type="checkbox"
                  checked={isDrinksAndMixers}
                  onChange={(e) => setIsDrinksAndMixers(e.target.checked)}
                  className="mt-0.5 rounded text-teal-500 focus:ring-0"
                />
                <div>
                  <span className="font-bold text-white flex items-center gap-1">
                    🥤 Drinks & Mixers
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Cold sodas, tonics & juices</p>
                </div>
              </label>
            </div>
          </div>

          {/* Omnichannel Visibility */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Channel Visibility</span>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <label className="flex items-center gap-1.5 text-teal-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnMobileApp}
                  onChange={(e) => setShowOnMobileApp(e.target.checked)}
                  className="rounded text-teal-500 focus:ring-0"
                />
                <Smartphone className="w-3.5 h-3.5" /> Mobile App
              </label>

              <label className="flex items-center gap-1.5 text-emerald-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnWeb}
                  onChange={(e) => setShowOnWeb(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-0"
                />
                <Globe className="w-3.5 h-3.5" /> Web Store
              </label>
            </div>
          </div>
        </form>

        {/* Footer Buttons */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ${
              isDeleting
                ? 'bg-rose-600 text-white animate-pulse'
                : 'text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Confirm Delete?' : 'Delete'}
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Showcase Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
