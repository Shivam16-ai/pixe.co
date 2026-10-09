import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Check, Sparkles, Truck, Package } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, CustomerOrder } from '../types';
import { orderApi } from '../lib/api';
import { playPaperTapSound, playShutterSound } from '../utils/audio';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onNavigateCustom: () => void;
  onOrderCreated?: (order: CustomerOrder) => void;
  onNavigateOrders?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigateCustom,
  onOrderCreated,
  onNavigateOrders,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Shipping form state
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');

  if (!isOpen) return null;

  // SMART BUNDLE PRICING LOGIC:
  // Standard prints (₹40 items: archive or category) qualify for "3 for ₹100" bundles!
  // Every full set of 3 standard prints saves ₹20 (₹100 instead of ₹120).
  const standardPrintCount = items
    .filter((i) => i.type === 'archive' || i.type === 'category' || (i.price === 40 && i.type !== 'custom'))
    .reduce((sum, i) => sum + i.quantity, 0);

  const bundleCount = Math.floor(standardPrintCount / 3);
  const bundleDiscount = bundleCount * 20; // Save ₹20 per 3 prints

  const rawSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const subtotal = Math.max(0, rawSubtotal - bundleDiscount);
  const shipping = subtotal >= 200 || subtotal === 0 ? 0 : 40;
  const packagingFee = 0; // Free archival packaging!
  const total = subtotal + shipping;

  const remainderStandard = standardPrintCount % 3;
  const isOneMoreForBundle = remainderStandard === 2;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !address || !city || !pincode) return;

    setIsCheckingOut(true);
    playShutterSound();

    try {
      const response = await orderApi.create({
        shippingAddress: {
          fullName: fullName.trim(),
          phone: '+91 99999 99999',
          addressLine1: address,
          addressLine2: '',
          city: city.trim(),
          state: 'Karnataka',
          postalCode: pincode,
          country: 'India',
        },
        paymentMethod,
      });

      const backendOrder = response?.order as any;
      const normalizedOrder: CustomerOrder = {
        id: backendOrder?.orderNumber || backendOrder?.id || `PX-${Date.now()}`,
        date: backendOrder?.createdAt ? new Date(backendOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today',
        itemsCount: Array.isArray(backendOrder?.items) ? backendOrder.items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0) : items.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: Number(backendOrder?.total || total),
        status: 'In Darkroom',
        currentStage: 'QUEUED',
        carrier: 'BlueDart Express Air',
        trackingNumber: backendOrder?.trackingId || `BD-${Math.floor(1000000 + Math.random() * 9000000)}-IN`,
        estimatedDelivery: 'TBD',
        items: Array.isArray(backendOrder?.items)
          ? backendOrder.items.map((item: any) => ({
              title: item.productTitleSnapshot || item.title || 'Polaroid Print',
              caption: item.caption || 'Archival print',
              price: Number(item.unitPrice || item.price || 0),
              imageUrl: item.productImageSnapshot || item.imageUrl || '',
              qty: Number(item.quantity || 1),
            }))
          : items.map((i) => ({
              title: i.title,
              caption: i.caption,
              price: i.price,
              imageUrl: i.imageUrl,
              qty: i.quantity,
            })),
      };

      setOrderId(normalizedOrder.id);
      setOrderSuccess(true);
      onOrderCreated?.(normalizedOrder);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F4B82A', '#E8DDC8', '#FFFFFF', '#E2A618'],
        });
      } catch {
        // safe fallback
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setIsCheckingOut(false);
      setOrderSuccess(false);
    }
  };

  const handleFinish = () => {
    onClearCart();
    setOrderSuccess(false);
    setIsCheckingOut(false);
    onClose();
  };

  const handleViewOrders = () => {
    onClearCart();
    setOrderSuccess(false);
    setIsCheckingOut(false);
    onClose();
    onNavigateOrders?.();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Your Print Collection Cart"
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#12100E] border-l border-[#27241D] h-full flex flex-col justify-between shadow-2xl p-6 sm:p-7 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#27241D]">
          <div className="flex items-center gap-2">
            <span className="font-['Syne'] text-lg font-bold text-[#E8DDC8]">
              {orderSuccess ? 'ORDER CONFIRMED' : isCheckingOut ? 'STUDIO CHECKOUT' : 'PRINT CART'}
            </span>
            <span className="text-xs font-mono text-[#F4B82A] tabular-nums">
              ({items.length} {items.length === 1 ? 'item' : 'items'})
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="w-8 h-8 rounded-full bg-[#1A1813] hover:bg-[#F4B82A] text-[#E8DDC8] hover:text-[#0B0A08] transition-colors flex items-center justify-center cursor-pointer border border-[#27241D]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ORDER SUCCESS RECEIPT STATE */}
        {orderSuccess ? (
          <div className="my-auto py-6 text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-[#F4B82A] text-[#0B0A08] mx-auto flex items-center justify-center shadow-lg">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono text-[#F4B82A] tracking-wider uppercase font-bold">
                DARKROOM ENTRY · ORDER CONFIRMED
              </span>
              <h3 className="font-['Syne'] text-2xl font-bold text-[#E8DDC8]">
                THANK YOU, {fullName.toUpperCase()}!
              </h3>
              <p className="font-['Caveat'] text-2xl text-[#E8DDC8]/80">
                "Your Polaroids are entering the darkroom."
              </p>
            </div>

            {/* Darkroom Chemical Stages Tracker */}
            <div className="p-4 rounded-xl bg-[#0A0907] border border-[#27241D] space-y-3 text-left">
              <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#27241D] pb-2">
                <span className="text-[#E8DDC8]/60">DARKROOM TRACKING:</span>
                <span className="text-[#F4B82A] font-bold">ORDER ID: {orderId}</span>
              </div>

              {/* 6 Stage Timeline */}
              <div className="space-y-2 text-xs font-mono">
                {[
                  { stage: 'QUEUED', desc: 'Assigned to High-Resolution Thermal Bed', active: true },
                  { stage: 'EMULSION PREP', desc: '310gsm Archival Paper Feed', pending: true },
                  { stage: 'OPTICAL EXPOSURE', desc: 'Precision Thermal Dye Sublimation', pending: true },
                  { stage: 'CRYSTALLIZATION', desc: 'Chemical Layer Curing & QC Pass', pending: true },
                  { stage: 'WAX PACKAGING', desc: 'Sealed in Rigid Stay-Flat Brown Kraft Mailer', pending: true },
                  { stage: 'DISPATCHED', desc: 'Handed to BlueDart Express Courier', pending: true },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        s.active ? 'bg-emerald-400 animate-pulse' : 'bg-[#27241D]'
                      }`}
                    />
                    <span className={s.active ? 'text-emerald-400 font-bold' : 'text-[#E8DDC8]/40'}>
                      {s.stage}
                    </span>
                    <span className="text-[10px] text-[#E8DDC8]/30 truncate">· {s.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Receipt Summary */}
            <div className="p-4 rounded-xl bg-[#0B0A08] border border-[#27241D] text-left text-xs font-mono space-y-2 text-[#E8DDC8]/80">
              <div className="flex justify-between">
                <span className="text-[#E8DDC8]/50">DESTINATION:</span>
                <span className="truncate max-w-[200px]">{city}, {pincode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#E8DDC8]/50">PAYMENT:</span>
                <span className="uppercase">{paymentMethod}</span>
              </div>
              <div className="flex justify-between border-t border-[#27241D] pt-2 text-sm font-bold text-[#E8DDC8]">
                <span>TOTAL PAID:</span>
                <span className="text-[#F4B82A]">₹{total}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleViewOrders}
                className="w-full py-3.5 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Package className="w-4 h-4" />
                <span>TRACK ORDER IN ORDERS TAB</span>
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-2.5 bg-[#181612] hover:bg-[#25221B] border border-[#27241D] text-[#E8DDC8]/80 text-xs font-mono uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                RETURN TO SHOP ARCHIVE
              </button>
            </div>
          </div>
        ) : isCheckingOut ? (
          /* CHECKOUT FORM VIEW */
          <form onSubmit={handlePlaceOrder} className="my-auto py-4 space-y-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#E8DDC8]/70">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rohan Sharma"
                className="w-full px-3 py-2 bg-[#0A0908] border border-[#27241D] focus:border-[#F4B82A] rounded-lg text-xs text-[#E8DDC8] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#E8DDC8]/70">
                Delivery Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat 402, Oakwood Heights, Indiranagar"
                className="w-full px-3 py-2 bg-[#0A0908] border border-[#27241D] focus:border-[#F4B82A] rounded-lg text-xs text-[#E8DDC8] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#E8DDC8]/70">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Bengaluru"
                  className="w-full px-3 py-2 bg-[#0A0908] border border-[#27241D] focus:border-[#F4B82A] rounded-lg text-xs text-[#E8DDC8] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#E8DDC8]/70">
                  PIN Code
                </label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="560038"
                  className="w-full px-3 py-2 bg-[#0A0908] border border-[#27241D] focus:border-[#F4B82A] rounded-lg text-xs text-[#E8DDC8] outline-none font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#F4B82A]">
                Payment Option
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upi', name: 'UPI / GPay' },
                  { id: 'card', name: 'Cards' },
                  { id: 'cod', name: 'Cash on Del.' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as 'upi' | 'card' | 'cod')}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                      paymentMethod === pm.id
                        ? 'border-[#F4B82A] bg-[#1E1B15] text-[#F4B82A]'
                        : 'border-[#27241D] bg-[#0A0908] text-[#E8DDC8]/60'
                    }`}
                  >
                    {pm.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Row */}
            <div className="p-3 rounded-lg bg-[#0A0908] border border-[#27241D] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#E8DDC8]/60">
                <span>SUBTOTAL:</span>
                <span>₹{subtotal}</span>
              </div>
              {bundleDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>3-FOR-₹100 BUNDLE SAVINGS:</span>
                  <span>-₹{bundleDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-[#E8DDC8]/60">
                <span>ARCHIVAL COURIER SHIPPING:</span>
                <span className={shipping === 0 ? 'text-emerald-400 font-bold' : 'text-[#E8DDC8]'}>
                  {shipping === 0 ? 'FREE (₹200+)' : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between text-[#E8DDC8]/60">
                <span>STAY-FLAT ARCHIVAL PACKAGING:</span>
                <span className="text-[#F4B82A]">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#E8DDC8] pt-1 border-t border-[#27241D]">
                <span>PAYABLE TOTAL:</span>
                <span className="text-[#F4B82A]">₹{total}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCheckingOut(false)}
                className="w-1/3 py-3 rounded-xl bg-[#1A1813] text-[#E8DDC8] text-xs font-bold uppercase tracking-wider border border-[#27241D] cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                CONFIRM & PAY ₹{total}
              </button>
            </div>
          </form>
        ) : (
          /* STANDARD CART ITEMS LIST */
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            
            {/* Smart Bundle Notification within cart */}
            {isOneMoreForBundle && (
              <div className="p-3 rounded-xl bg-[#1F1C16] border border-[#F4B82A] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F4B82A] shrink-0" />
                  <span className="text-[#E8DDC8]">
                    <strong className="text-[#F4B82A]">ADD ONE MORE FOR ₹100:</strong> 3-Print Studio Bundle (Save ₹20)!
                  </span>
                </div>
              </div>
            )}

            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                <div className="w-24 aspect-square bg-[#F6F3EB] rounded-[2px] p-2 pb-5 shadow-xl rotate-3 opacity-60">
                  <div className="w-full h-full bg-[#181613] flex items-center justify-center text-[10px] font-mono text-[#E8DDC8]/40">
                    EMPTY TRAY
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-['Syne'] text-base font-bold text-[#E8DDC8]">
                    Your Darkroom Tray is Empty
                  </h4>
                  <p className="text-xs text-[#E8DDC8]/60 font-light max-w-xs">
                    Choose from 20 major categories in The PIXÉ Archive or customize your personal memory.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  EXPLORE ARCHIVE →
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#14120E] border border-[#27241D] flex items-center gap-3.5 group hover:border-[#F4B82A]/30 transition-colors"
                >
                  {/* Polaroid Mini Thumbnail */}
                  <div className="w-14 shrink-0 bg-[#F6F3EB] rounded-[2px] p-1 pb-3 shadow-md -rotate-1">
                    <div className="aspect-square bg-black overflow-hidden rounded-[1px]">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Item info */}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-['Syne'] text-xs font-bold text-[#E8DDC8] truncate">
                      {item.title}
                    </h5>
                    {item.caption && (
                      <p className="font-['Caveat'] text-sm text-[#F4B82A] truncate">
                        "{item.caption}"
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#E8DDC8]/60 tabular-nums">
                      <span>₹{item.price} each</span>
                      {item.paperFinish && (
                        <>
                          <span>·</span>
                          <span className="uppercase text-[#F4B82A]/80">{item.paperFinish}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5 bg-[#0A0908] rounded-md p-1 border border-[#27241D]">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-[#E8DDC8] hover:text-[#F4B82A] cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-mono font-bold w-4 text-center tabular-nums text-[#E8DDC8]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-[#E8DDC8] hover:text-[#F4B82A] cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    aria-label={`Remove ${item.title}`}
                    className="p-1.5 text-[#E8DDC8]/40 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* BOTTOM TOTAL & CHECKOUT BUTTON */}
        {!orderSuccess && !isCheckingOut && items.length > 0 && (
          <div className="pt-4 border-t border-[#27241D] space-y-3">
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#E8DDC8]/60">
                <span>SUBTOTAL:</span>
                <span className="text-[#E8DDC8]">₹{subtotal}</span>
              </div>
              {bundleDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>3-FOR-₹100 BUNDLE DISCOUNT:</span>
                  <span>-₹{bundleDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-[#E8DDC8]/60">
                <span>ARCHIVAL COURIER SHIPPING:</span>
                <span className={shipping === 0 ? 'text-emerald-400 font-bold' : 'text-[#E8DDC8]'}>
                  {shipping === 0 ? 'FREE (₹200+)' : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <div className="text-[10px] text-[#F4B82A] font-mono">
                  Add ₹{200 - subtotal} more for FREE shipping!
                </div>
              )}
              <div className="flex justify-between text-[#E8DDC8]/60">
                <span>STAY-FLAT PACKAGING:</span>
                <span className="text-[#F4B82A]">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#E8DDC8] pt-1 border-t border-[#27241D]">
                <span>FINAL TOTAL:</span>
                <span className="text-[#F4B82A] text-lg tabular-nums">₹{total}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playPaperTapSound();
                setIsCheckingOut(true);
              }}
              className="w-full py-3.5 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-[#E8DDC8]/40">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F4B82A]" />
              <span>DYE SUBLIMATION PRINT · DISPATCHES IN 24 HOURS</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
