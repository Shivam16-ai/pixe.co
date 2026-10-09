import React, { useState } from 'react';
import {
  ShoppingBag,
  User,
  Package,
  Sparkles,
  Layers,
  LogOut,
  Sliders,
  CheckCircle2,
  Clock,
  Truck,
  ExternalLink,
  ChevronRight,
  Shield,
  Search,
  Filter,
  Heart,
} from 'lucide-react';
import {
  CustomerPortalTab,
  UserSession,
  CartItem,
  PolaroidCategory,
  PrintPlan,
  CustomerOrder,
  ArchiveProduct,
} from '../../types';
import { POLAROID_CATEGORIES, PRINT_PLANS } from '../../data/categories';
import { ARCHIVE_PRODUCTS } from '../../data/archiveCatalog';
import { Customizer } from '../Customizer';
import { PolaroidModal } from '../PolaroidModal';
import { ShopArchive } from './ShopArchive';
import { FavoritesView } from './FavoritesView';
import { ProductDetailModal } from './ProductDetailModal';
import { playPaperTapSound, playShutterSound } from '../../utils/audio';

interface CustomerPortalProps {
  userSession: UserSession;
  cartItems: CartItem[];
  activeTab?: CustomerPortalTab;
  onTabChange?: (tab: CustomerPortalTab) => void;
  orders?: CustomerOrder[];
  onOpenCart: () => void;
  onAddToCart: (item: CartItem) => void;
  onLogout: () => void;
  onSwitchToAdmin: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  userSession,
  cartItems,
  activeTab: controlledTab,
  onTabChange,
  orders: controlledOrders,
  onOpenCart,
  onAddToCart,
  onLogout,
  onSwitchToAdmin,
}) => {
  const [internalTab, setInternalTab] = useState<CustomerPortalTab>(controlledTab || 'dashboard');
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;

  const [selectedCategory, setSelectedCategory] = useState<PolaroidCategory | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'culture' | 'motors' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectProduct, setInspectProduct] = useState<ArchiveProduct | null>(null);
  const orders = controlledOrders || [];
  const latestOrder = orders[0] ?? null;

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSelectTab = (tab: CustomerPortalTab) => {
    playPaperTapSound();
    setInternalTab(tab);
    onTabChange?.(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddCategoryToCart = (category: PolaroidCategory) => {
    playShutterSound();
    const item: CartItem = {
      id: `cat-${category.id}-${Date.now()}`,
      title: `${category.name} Polaroid Print`,
      type: 'category',
      price: 40,
      quantity: 1,
      caption: category.highlightCaption,
      imageUrl: category.imageUrl,
    };
    onAddToCart(item);
  };

  const handleAddPlanToCart = (plan: PrintPlan) => {
    playShutterSound();
    const item: CartItem = {
      id: `plan-${plan.id}-${Date.now()}`,
      title: plan.name,
      type: 'plan',
      price: plan.price,
      quantity: 1,
      caption: plan.caption,
      imageUrl: plan.imageSample,
    };
    onAddToCart(item);
  };

  const filteredCategories = POLAROID_CATEGORIES.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'culture') return ['anime', 'heroes', 'movies', 'cartoons', 'games'].includes(cat.id);
    if (categoryFilter === 'motors') return ['f1', 'cars', 'bikes'].includes(cat.id);
    if (categoryFilter === 'custom') return ['quotes', 'custom'].includes(cat.id);
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0E0D0B] text-[#E8DDC8] flex flex-col justify-between select-none">
      
      {/* ============================================================ */}
      {/* PORTAL TOP NAVIGATION BAR */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 bg-[#0B0A08]/95 backdrop-blur-md border-b border-[#27241D] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand & Portal Type Label */}
          <div className="flex items-center gap-3">
            <span className="font-['Syne'] text-xl font-bold tracking-tight text-[#E8DDC8]">
              PIXÉ<span className="text-[#F4B82A]">.</span>CO
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-[#1F1C16] border border-[#F4B82A]/30 text-[#F4B82A]">
              CUSTOMER PORTAL
            </span>
          </div>

          {/* Functional Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-[#14120E] rounded-lg border border-[#27241D]">
            {[
              { id: 'dashboard', label: 'HOME' },
              { id: 'shop', label: 'SHOP ARCHIVE' },
              { id: 'favorites', label: 'SAVED' },
              { id: 'custom', label: 'CUSTOM LAB' },
              { id: 'cart', label: 'CART', isCart: true },
              { id: 'orders', label: 'ORDERS' },
              { id: 'profile', label: 'PROFILE' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.isCart) {
                    playPaperTapSound();
                    onOpenCart();
                  } else {
                    handleSelectTab(tab.id as CustomerPortalTab);
                  }
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-[#F4B82A] text-[#0B0A08] shadow-sm font-bold'
                    : 'text-[#E8DDC8]/70 hover:text-[#E8DDC8]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.isCart && cartCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#F4B82A] text-[#0B0A08]">
                    {cartCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Portal User Actions */}
          <div className="flex items-center gap-3">
            {/* Switch to Admin Portal shortcut */}
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#181612] hover:bg-[#25221B] border border-[#27241D] text-[#E8DDC8]/60 hover:text-[#F4B82A] text-xs font-mono transition-colors cursor-pointer"
              title="Switch to Admin Darkroom View"
            >
              <Shield className="w-3.5 h-3.5 text-[#F4B82A]" />
              <span>Admin Portal</span>
            </button>

            {/* Cart Trigger */}
            <button
              type="button"
              onClick={onOpenCart}
              aria-label="Shopping Cart"
              className="relative p-2 rounded-lg bg-[#14120E] border border-[#27241D] hover:border-[#F4B82A]/50 text-[#E8DDC8] hover:text-[#F4B82A] transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#F4B82A] text-[#0B0A08] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile Pill & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#27241D]">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-[#E8DDC8] truncate max-w-[120px]">
                  {userSession.name}
                </div>
                <div className="text-[10px] text-[#F4B82A] font-mono">
                  {userSession.memberSince ? `Member since ${userSession.memberSince}` : 'Collector access active'}
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                aria-label="Log out from customer portal"
                className="p-2 rounded-lg bg-[#14120E] hover:bg-red-500/20 text-[#E8DDC8]/60 hover:text-red-400 border border-[#27241D] transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Sub-Navigation Tabs */}
        <div className="md:hidden mt-3 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: 'dashboard', label: 'HOME' },
            { id: 'shop', label: 'SHOP ARCHIVE' },
            { id: 'favorites', label: 'SAVED' },
            { id: 'custom', label: 'CUSTOM LAB' },
            { id: 'cart', label: 'CART', isCart: true },
            { id: 'orders', label: 'ORDERS' },
            { id: 'profile', label: 'PROFILE' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.isCart) {
                  playPaperTapSound();
                  onOpenCart();
                } else {
                  handleSelectTab(tab.id as CustomerPortalTab);
                }
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap flex items-center gap-1 ${
                activeTab === tab.id
                  ? 'bg-[#F4B82A] text-[#0B0A08] font-bold'
                  : 'bg-[#14120E] text-[#E8DDC8]/70 border border-[#27241D]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.isCart && cartCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#F4B82A] text-[#0B0A08]">
                  {cartCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ============================================================ */}
      {/* PORTAL MAIN CONTENT WORKSPACE */}
      {/* ============================================================ */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Welcome Banner */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#14120E] via-[#1C1914] to-[#14120E] border border-[#27241D] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-[#F4B82A] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>COLLECTOR ACTIVE SESSION</span>
                </div>
                <h1 className="font-['Syne'] text-2xl sm:text-3xl font-bold text-[#E8DDC8]">
                  Welcome, {userSession.name}.
                </h1>
                <p className="text-xs sm:text-sm text-[#E8DDC8]/70 font-light max-w-lg">
                  Your physical Polaroid prints are calibrated and printed on 310gsm archival paper. Browse categories, customize personal photos, or track orders.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectTab('custom')}
                  className="px-5 py-3 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-md"
                >
                  CREATE CUSTOM PRINT →
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTab('shop')}
                  className="px-5 py-3 bg-[#1A1813] hover:bg-[#25221B] text-[#E8DDC8] font-semibold text-xs uppercase tracking-wider rounded-lg border border-[#27241D] transition-colors cursor-pointer whitespace-nowrap"
                >
                  BROWSE SHOP
                </button>
              </div>
            </div>

            {/* Active Darkroom Print Status Card */}
            <div className="p-6 rounded-2xl bg-[#14120E] border border-[#27241D] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27241D] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1F1C16] border border-[#F4B82A]/30 flex items-center justify-center text-[#F4B82A]">
                    <Clock className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#F4B82A] uppercase">{latestOrder ? 'Active Darkroom Job' : 'No Active Job'}</div>
                    <div className="font-['Syne'] text-base font-bold text-[#E8DDC8]">
                      {latestOrder ? `Order #${latestOrder.id} · ${latestOrder.items[0]?.title || 'Studio Print'}` : 'Your next print job will appear here once you place an order.'}
                    </div>
                  </div>
                </div>

                {latestOrder && (
                  <button
                    type="button"
                    onClick={() => handleSelectTab('orders')}
                    className="text-xs text-[#F4B82A] hover:underline font-mono self-start sm:self-auto cursor-pointer"
                  >
                    VIEW TRACKING DETAILS →
                  </button>
                )}
              </div>

              {/* Progress Stepper */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                {[
                  { label: 'Color Calibrated', time: '10:14 AM', done: true },
                  { label: 'Thermal Dye Sublimation', time: 'In Progress', active: true },
                  { label: 'Chemical Emulsion Curing', time: 'Estimated 11:30 AM', pending: true },
                  { label: 'Wax-Sealed Dispatch', time: 'Est. Oct 06', pending: true },
                ].map((st, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border text-xs ${
                      st.done
                        ? 'bg-[#191712] border-emerald-500/30 text-emerald-400'
                        : st.active
                        ? 'bg-[#1F1C16] border-[#F4B82A] text-[#F4B82A] shadow-md'
                        : 'bg-[#0E0D0B] border-[#27241D] text-[#E8DDC8]/40'
                    }`}
                  >
                    <div className="font-mono text-[10px] uppercase font-bold mb-1">STAGE 0{i + 1}</div>
                    <div className="font-semibold text-xs">{st.label}</div>
                    <div className="text-[10px] opacity-75 mt-0.5">{st.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Reorder Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-['Syne'] text-lg font-bold text-[#E8DDC8]">
                    Trending Studio Prints
                  </h3>
                  <p className="text-xs text-[#E8DDC8]/60 font-light">
                    Add high-demand archival prints directly to your active cart.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectTab('shop')}
                  className="text-xs font-semibold text-[#F4B82A] hover:underline cursor-pointer"
                >
                  View All 10 Categories →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {POLAROID_CATEGORIES.slice(0, 3).map((cat) => (
                  <div
                    key={cat.id}
                    className="p-4 rounded-xl bg-[#14120E] border border-[#27241D] flex items-center gap-4 hover:border-[#F4B82A]/40 transition-colors"
                  >
                    <div className="w-16 h-20 bg-[#F6F3EB] rounded-[2px] p-1 pb-3 shadow-md shrink-0">
                      <div className="w-full h-full bg-black overflow-hidden">
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono text-[#F4B82A] uppercase">₹40 PRINT</div>
                      <h4 className="font-['Syne'] text-sm font-bold text-[#E8DDC8] truncate">
                        {cat.name}
                      </h4>
                      <p className="font-['Caveat'] text-xs text-[#E8DDC8]/70 truncate">
                        {cat.highlightCaption}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleAddCategoryToCart(cat)}
                        className="mt-2 text-xs font-bold text-[#F4B82A] hover:underline cursor-pointer"
                      >
                        + Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SHOP ARCHIVE (THE PIXÉ ARCHIVE - 20 CATEGORIES) */}
        {activeTab === 'shop' && (
          <ShopArchive
            cartItems={cartItems}
            onAddToCart={onAddToCart}
            onOpenCustomizer={() => handleSelectTab('custom')}
            onOpenCart={onOpenCart}
          />
        )}

        {/* TAB: SAVED FAVORITES (Section 14) */}
        {activeTab === 'favorites' && (
          <FavoritesView
            allProducts={ARCHIVE_PRODUCTS}
            onSelectProduct={(p) => setInspectProduct(p)}
            onAddToCart={onAddToCart}
            onExploreShop={() => handleSelectTab('shop')}
          />
        )}

        {/* TAB 3: CUSTOM POLAROID STUDIO */}
        {activeTab === 'custom' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#27241D] pb-4 flex items-center justify-between">
              <div>
                <h1 className="font-['Syne'] text-2xl font-bold text-[#E8DDC8]">
                  CUSTOMER CUSTOMIZATION STUDIO
                </h1>
                <p className="text-xs text-[#E8DDC8]/60 font-light">
                  Upload your own photo, apply analog film profiles, add handwritten caption, and print.
                </p>
              </div>
            </div>

            <Customizer
              onAddToCart={(item) => onAddToCart(item)}
              onOpenCart={onOpenCart}
            />
          </div>
        )}

        {/* TAB 4: ORDERS & TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#27241D] pb-4">
              <h1 className="font-['Syne'] text-2xl font-bold text-[#E8DDC8]">
                YOUR ORDERS & ARCHIVAL SHIPMENTS
              </h1>
              <p className="text-xs text-[#E8DDC8]/60 font-light">
                Track live printing status, courier dispatch, and download high-resolution receipts.
              </p>
            </div>

            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-6 rounded-2xl bg-[#14120E] border border-[#27241D] space-y-5"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27241D] pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-['Syne'] text-lg font-bold text-[#E8DDC8]">
                          ORDER #{order.id}
                        </span>
                        <span className="text-xs text-[#E8DDC8]/50 font-mono">({order.date})</span>
                      </div>
                      <div className="text-xs text-[#E8DDC8]/60">
                        Carrier: <strong className="text-[#E8DDC8]">{order.carrier}</strong> · Tracking: <span className="font-mono text-[#F4B82A]">{order.trackingNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#1F1C16] border border-[#F4B82A]/40 text-[#F4B82A]">
                        {order.status}
                      </span>
                      <span className="font-['Syne'] text-lg font-bold text-[#E8DDC8] tabular-nums">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#0E0D0B] border border-[#27241D] flex items-center gap-3"
                      >
                        <div className="w-12 h-14 bg-[#F6F3EB] rounded-[2px] p-1 pb-2 shadow-xs shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#E8DDC8] truncate">{item.title}</div>
                          <div className="text-[11px] font-['Caveat'] text-[#F4B82A] truncate">
                            "{item.caption}"
                          </div>
                          <div className="text-[10px] text-[#E8DDC8]/50 font-mono">
                            Qty: {item.qty} · ₹{item.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 6-Stage Darkroom Chemical Timeline */}
                  <div className="p-4 rounded-xl bg-[#0B0A08] border border-[#27241D] space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#201D17] pb-2 text-[#E8DDC8]/60">
                      <span className="uppercase text-[#F4B82A] font-bold">DARKROOM CHEMICAL PIPELINE:</span>
                      <span>CURRENT STAGE: <strong className="text-emerald-400">{order.currentStage || (order.status === 'Delivered' ? 'DISPATCHED' : 'CRYSTALLIZATION')}</strong></span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
                      {[
                        { name: 'QUEUED', desc: 'Job Scheduled' },
                        { name: 'EMULSION PREP', desc: '310gsm Paper Feed' },
                        { name: 'OPTICAL EXPOSURE', desc: 'Thermal Dye Sub' },
                        { name: 'CRYSTALLIZATION', desc: 'Chemical Layer Cure' },
                        { name: 'WAX PACKAGING', desc: 'Brass Seal Applied' },
                        { name: 'DISPATCHED', desc: 'Handed to Courier' },
                      ].map((st, sIdx) => {
                        const stageOrder = ['QUEUED', 'EMULSION PREP', 'OPTICAL EXPOSURE', 'CRYSTALLIZATION', 'WAX PACKAGING', 'DISPATCHED'];
                        const currentIdx = stageOrder.indexOf(order.currentStage || (order.status === 'Delivered' ? 'DISPATCHED' : 'CRYSTALLIZATION'));
                        const isDone = sIdx <= currentIdx;
                        const isCurrent = sIdx === currentIdx;

                        return (
                          <div
                            key={st.name}
                            className={`p-2 rounded-lg border text-center space-y-0.5 transition-all ${
                              isCurrent
                                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400 font-bold shadow-xs'
                                : isDone
                                ? 'bg-[#12100E] border-[#27241D] text-[#E8DDC8]/70'
                                : 'bg-[#0E0D0B] border-[#1C1A14] text-[#E8DDC8]/30'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1 text-[10px]">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isCurrent ? 'bg-emerald-400 animate-pulse' : isDone ? 'bg-[#F4B82A]' : 'bg-[#27241D]'
                                }`}
                              />
                              <span className="truncate">{st.name}</span>
                            </div>
                            <div className="text-[9px] text-[#E8DDC8]/40 truncate">{st.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivery Timeline info */}
                  <div className="p-3 rounded-lg bg-[#0E0D0B] border border-[#27241D] flex items-center justify-between text-xs text-[#E8DDC8]/70 font-mono">
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#F4B82A]" />
                      <span>ESTIMATED DELIVERY: {order.estimatedDelivery}</span>
                    </span>
                    <span className="text-[#F4B82A]">RIGID STAY-FLAT BOARD PACKAGED</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#27241D] pb-4">
              <h1 className="font-['Syne'] text-2xl font-bold text-[#E8DDC8]">
                COLLECTOR PROFILE & STUDIO PREFERENCES
              </h1>
              <p className="text-xs text-[#E8DDC8]/60 font-light">
                Manage your dispatch address and custom printing preferences.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#14120E] border border-[#27241D] space-y-4">
              <div className="flex items-center gap-4 border-b border-[#27241D] pb-4">
                <div className="w-14 h-14 rounded-full bg-[#1F1C16] border-2 border-[#F4B82A] flex items-center justify-center font-['Syne'] text-xl font-bold text-[#F4B82A]">
                  {userSession.name.charAt(0)}
                </div>
                <div>
                  <div className="font-['Syne'] text-lg font-bold text-[#E8DDC8]">{userSession.name}</div>
                  <div className="text-xs text-[#E8DDC8]/60 font-mono">{userSession.email}</div>
                  <div className="text-[11px] text-[#F4B82A] font-mono mt-0.5">
                    Member Since: {userSession.memberSince || 'October 2026'}
                  </div>
                </div>
              </div>

              {/* Address Form */}
              <div className="space-y-3 pt-2 text-xs">
                <div className="font-mono text-[#F4B82A] uppercase tracking-wider font-bold">
                  Default Dispatch Address
                </div>
                <div className="p-3 rounded-lg bg-[#0E0D0B] border border-[#27241D] space-y-1">
                  <div className="font-bold text-[#E8DDC8]">{userSession.name}</div>
                  <div className="text-[#E8DDC8]/70">Your saved address will appear here once it is added from the backend profile.</div>
                  <div className="text-[#E8DDC8]/50 font-mono">{userSession.email}</div>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-3 pt-4 border-t border-[#27241D] text-xs">
                <div className="font-mono text-[#F4B82A] uppercase tracking-wider font-bold">
                  Darkroom Emulsion Preference
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#1F1C16] border border-[#F4B82A] space-y-1">
                    <div className="font-bold text-[#F4B82A]">310gsm Gloss Archival (Active)</div>
                    <div className="text-[#E8DDC8]/60 text-[11px]">Classic high-contrast instant finish</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0E0D0B] border border-[#27241D] space-y-1">
                    <div className="font-bold text-[#E8DDC8]">310gsm Matte Velvet Rag</div>
                    <div className="text-[#E8DDC8]/60 text-[11px]">Reflective-free soft artistic texture</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Portal Footer */}
      <footer className="py-6 bg-[#080706] border-t border-[#1C1A15] text-xs text-[#E8DDC8]/50 font-mono text-center">
        PIXÉ.CO CUSTOMER PORTAL · LOGGED IN AS {userSession.email.toUpperCase()} · 100% PRIVATE DATA
      </footer>

      {/* Polaroid Inspection Modal */}
      <PolaroidModal
        category={selectedCategory}
        onClose={() => setSelectedCategory(null)}
        onAddToCart={handleAddCategoryToCart}
        onCustomize={() => {
          setSelectedCategory(null);
          handleSelectTab('custom');
        }}
      />

      {/* Product Detail Modal for Favorites or Direct Inspect */}
      {inspectProduct && (
        <ProductDetailModal
          product={inspectProduct}
          allProducts={ARCHIVE_PRODUCTS}
          onSelectProduct={(p) => setInspectProduct(p)}
          onClose={() => setInspectProduct(null)}
          onAddToCart={onAddToCart}
          onOpenCustomizer={() => {
            setInspectProduct(null);
            handleSelectTab('custom');
          }}
        />
      )}

    </div>
  );
};
