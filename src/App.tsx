/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AppRoute,
  UserSession,
  CartItem,
  CustomerPortalTab,
  AdminPortalTab,
  CustomerOrder,
} from './types';
import { LandingNavbar } from './components/landing/LandingNavbar';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { CustomerPortal } from './components/portal/CustomerPortal';
import { AdminPortal } from './components/portal/AdminPortal';
import { CartDrawer } from './components/CartDrawer';
import { ARCHIVE_PRODUCTS } from './data/archiveCatalog';
import { auditProductCatalogImages } from './utils/imageValidation';
import { playPaperTapSound, playShutterSound } from './utils/audio';
import { authApi, orderApi } from './lib/api';
import { disconnectSocket, getSocket } from './lib/socket';

function parseUrlPath(pathname: string): {
  route: AppRoute;
  customerTab: CustomerPortalTab;
  adminTab: AdminPortalTab;
  openCart: boolean;
} {
  const p = pathname.toLowerCase().replace(/\/$/, '') || '/';

  if (p === '/login') {
    return { route: 'login', customerTab: 'dashboard', adminTab: 'dashboard', openCart: false };
  }

  if (p === '/portal/admin' || p.startsWith('/portal/admin')) {
    let adminTab: AdminPortalTab = 'dashboard';
    if (p.includes('/queue')) adminTab = 'queue';
    else if (p.includes('/orders')) adminTab = 'orders';
    else if (p.includes('/inventory')) adminTab = 'inventory';
    else if (p.includes('/analytics')) adminTab = 'analytics';
    return { route: 'portal-admin', customerTab: 'dashboard', adminTab, openCart: false };
  }

  if (p === '/portal/customer' || p.startsWith('/portal/customer') || p.startsWith('/archive')) {
    let customerTab: CustomerPortalTab = 'dashboard';
    let openCart = false;

    if (p.includes('/favorites') || p === '/favorites') customerTab = 'favorites';
    else if (p.includes('/shop') || p.startsWith('/archive')) customerTab = 'shop';
    else if (p.includes('/cart')) {
      customerTab = 'shop';
      openCart = true;
    } else if (p.includes('/orders')) customerTab = 'orders';
    else if (p.includes('/profile')) customerTab = 'profile';
    else if (p.includes('/custom')) customerTab = 'custom';

    return { route: 'portal-customer', customerTab, adminTab: 'dashboard', openCart };
  }

  return { route: 'landing', customerTab: 'dashboard', adminTab: 'dashboard', openCart: false };
}

export default function App() {
  const initial = parseUrlPath(typeof window !== 'undefined' ? window.location.pathname : '/');

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(initial.route);
  const [customerTab, setCustomerTab] = useState<CustomerPortalTab>(initial.customerTab);
  const [adminTab, setAdminTab] = useState<AdminPortalTab>(initial.adminTab);
  const [isCartOpen, setIsCartOpen] = useState(initial.openCart);

  // User session
  const [userSession, setUserSession] = useState<UserSession>({ role: null, name: '', email: '' });
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const response = await authApi.me();
        if (!active || !response?.user) {
          return;
        }

        const role = response.user.role === 'admin' ? 'admin' : 'customer';
        setUserSession({
          role,
          name: response.user.name || '',
          email: response.user.email || '',
          avatar: response.user.avatar ?? undefined,
          memberSince: response.user.memberSince,
        });
      } catch {
        if (active) {
          setUserSession({ role: null, name: '', email: '' });
        }
      } finally {
        if (active) {
          setAuthChecking(false);
        }
      }
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  // Global Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Customer orders are fetched from the authenticated backend when a customer session is restored.
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);

  useEffect(() => {
    if (userSession.role !== 'customer') {
      setCustomerOrders([]);
      return;
    }

    let active = true;

    const loadOrders = async () => {
      try {
        const response = await orderApi.list();
        if (!active || !response?.orders) {
          return;
        }

        const normalized = response.orders.map((order: any) => {
          const items = Array.isArray(order.items) ? order.items : [];
          const statusMap: Record<string, CustomerOrder['status']> = {
            QUEUED: 'In Darkroom',
            EMULSION_PREP: 'Thermal Printing',
            OPTICAL_EXPOSURE: 'Thermal Printing',
            CRYSTALLIZATION: 'QC Inspection',
            WAX_PACKAGING: 'Out for Delivery',
            DISPATCHED: 'Out for Delivery',
            DELIVERED: 'Delivered',
          };

          return {
            id: order.orderNumber || order.id,
            date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today',
            itemsCount: items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
            totalAmount: Number(order.total || 0),
            status: statusMap[order.status] || 'In Darkroom',
            currentStage: order.status,
            carrier: 'BlueDart Express Air',
            trackingNumber: order.trackingId || `BD-${order.id.slice(0, 6).toUpperCase()}`,
            estimatedDelivery: order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD',
            items: items.map((item: any) => ({
              title: item.productTitleSnapshot || item.title || 'Polaroid Print',
              caption: item.caption || 'Archival print',
              price: Number(item.unitPrice || item.price || 0),
              imageUrl: item.productImageSnapshot || item.imageUrl || '',
              qty: Number(item.quantity || 1),
            })),
          } satisfies CustomerOrder;
        });

        setCustomerOrders(normalized);
      } catch {
        if (active) {
          setCustomerOrders([]);
        }
      }
    };

    void loadOrders();

    return () => {
      active = false;
    };
  }, [userSession.role]);

  useEffect(() => {
    if (!userSession.role) {
      disconnectSocket();
      return;
    }

    const socket = getSocket();
    if (!socket) {
      return;
    }

    const statusMap: Record<string, CustomerOrder['status']> = {
      QUEUED: 'In Darkroom',
      EMULSION_PREP: 'Thermal Printing',
      OPTICAL_EXPOSURE: 'Thermal Printing',
      CRYSTALLIZATION: 'QC Inspection',
      WAX_PACKAGING: 'Out for Delivery',
      DISPATCHED: 'Out for Delivery',
      DELIVERED: 'Delivered',
    };

    const handleOrderStatusUpdate = (payload: { orderId?: string; orderNumber?: string; status?: string; updatedAt?: string }) => {
      if (!payload?.status) {
        return;
      }

      setCustomerOrders((prev) =>
        prev.map((order) => {
          const matchesOrder = String(order.id) === String(payload.orderNumber || payload.orderId || '');
          if (!matchesOrder) {
            return order;
          }

          const nextStatus = statusMap[String(payload.status)] || order.status;
          const nextStage = String(payload.status) as CustomerOrder['currentStage'];

          return {
            ...order,
            status: nextStatus,
            currentStage: nextStage,
            estimatedDelivery: payload.updatedAt ? new Date(payload.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : order.estimatedDelivery,
          } satisfies CustomerOrder;
        })
      );
    };

    socket.on('order.status.updated', handleOrderStatusUpdate);

    return () => {
      socket.off('order.status.updated', handleOrderStatusUpdate);
    };
  }, [userSession.role]);

  // Run image audit in development on mount
  useEffect(() => {
    auditProductCatalogImages(ARCHIVE_PRODUCTS);
  }, []);

  // Listen to browser popstate (Back / Forward)
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrlPath(window.location.pathname);
      setCurrentRoute(parsed.route);
      setCustomerTab(parsed.customerTab);
      setAdminTab(parsed.adminTab);
      setIsCartOpen(parsed.openCart);

      if ((parsed.route === 'portal-admin' || parsed.route === 'portal-customer') && !userSession.role) {
        void authApi.me().then((response) => {
          if (!response?.user) {
            setUserSession({ role: null, name: '', email: '' });
            return;
          }

          const role = response.user.role === 'admin' ? 'admin' : 'customer';
          setUserSession({
            role,
            name: response.user.name || '',
            email: response.user.email || '',
            avatar: response.user.avatar ?? undefined,
            memberSince: response.user.memberSince,
          });
        }).catch(() => {
          setUserSession({ role: null, name: '', email: '' });
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [userSession.role]);

  // Router navigation helper
  const navigateTo = useCallback((target: string) => {
    playPaperTapSound();

    let targetPath = target;
    if (target === 'landing' || target === '/') {
      targetPath = '/';
      setCurrentRoute('landing');
      setIsCartOpen(false);
    } else if (target === 'login' || target === '/login') {
      targetPath = '/login';
      setCurrentRoute('login');
      setIsCartOpen(false);
    } else if (target === 'portal-customer' || target === '/portal/customer') {
      targetPath = '/portal/customer';
      setCurrentRoute('portal-customer');
      setCustomerTab('dashboard');
    } else if (target === '/portal/customer/shop') {
      targetPath = '/portal/customer/shop';
      setCurrentRoute('portal-customer');
      setCustomerTab('shop');
    } else if (target === '/portal/customer/cart') {
      targetPath = '/portal/customer/cart';
      setCurrentRoute('portal-customer');
      setIsCartOpen(true);
    } else if (target === '/portal/customer/orders') {
      targetPath = '/portal/customer/orders';
      setCurrentRoute('portal-customer');
      setCustomerTab('orders');
    } else if (target === '/portal/customer/profile') {
      targetPath = '/portal/customer/profile';
      setCurrentRoute('portal-customer');
      setCustomerTab('profile');
    } else if (target === 'portal-admin' || target === '/portal/admin') {
      targetPath = '/portal/admin';
      setCurrentRoute('portal-admin');
      setAdminTab('dashboard');
    } else if (target.startsWith('/portal/admin/')) {
      targetPath = target;
      setCurrentRoute('portal-admin');
      const sub = target.replace('/portal/admin/', '') as AdminPortalTab;
      setAdminTab(sub);
    }

    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCustomerTabChange = (tab: CustomerPortalTab) => {
    setCustomerTab(tab);
    let path = '/portal/customer';
    if (tab === 'shop') path = '/portal/customer/shop';
    else if (tab === 'favorites') path = '/portal/customer/favorites';
    else if (tab === 'custom') path = '/portal/customer/custom';
    else if (tab === 'orders') path = '/portal/customer/orders';
    else if (tab === 'profile') path = '/portal/customer/profile';

    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

  const handleAdminTabChange = (tab: AdminPortalTab) => {
    setAdminTab(tab);
    const path = tab === 'dashboard' ? '/portal/admin' : `/portal/admin/${tab}`;
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    if (session.role === 'admin') {
      navigateTo('/portal/admin');
    } else {
      navigateTo('/portal/customer');
    }
  };

  const handleLogout = async () => {
    playPaperTapSound();
    try {
      await authApi.logout();
    } catch {
      // no-op: still clear session locally so the UI is protected
    }
    setUserSession({ role: null, name: '', email: '' });
    navigateTo('/login');
  };

  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
    if (typeof window !== 'undefined' && window.location.pathname !== '/portal/customer/cart') {
      window.history.pushState(null, '', '/portal/customer/cart');
    }
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    playPaperTapSound();
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    playPaperTapSound();
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderCreated = (order: CustomerOrder) => {
    setCustomerOrders((prev) => [order, ...prev]);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0B0A08] text-[#E8DDC8] flex items-center justify-center font-['Syne'] uppercase tracking-[0.3em] text-xs text-[#F4B82A]">
        VERIFYING STUDIO ACCESS...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0A08] text-[#E8DDC8] selection:bg-[#F4B82A] selection:text-[#0B0A08] font-['Plus_Jakarta_Sans']">
      
      {/* ============================================================ */}
      {/* 1. PUBLIC MARKETING LANDING PAGE */}
      {/* ============================================================ */}
      {currentRoute === 'landing' && (
        <div className="relative">
          <LandingNavbar
            onEnterApp={() => navigateTo('/login')}
            onLoginClick={() => navigateTo('/login')}
            onScrollToSection={(secId) => {
              const el = document.getElementById(secId);
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <LandingPage
            onEnterPixe={() => navigateTo('/login')}
            onLoginClick={() => navigateTo('/login')}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. AUTHENTICATION / LOGIN PAGE */}
      {/* ============================================================ */}
      {currentRoute === 'login' && (
        <LoginPage
          onBackToLanding={() => navigateTo('/')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* ============================================================ */}
      {/* 3. CUSTOMER USER PORTAL */}
      {/* ============================================================ */}
      {currentRoute === 'portal-customer' && (
        <CustomerPortal
          userSession={userSession}
          cartItems={cartItems}
          activeTab={customerTab}
          onTabChange={handleCustomerTabChange}
          orders={customerOrders}
          onOpenCart={() => {
            setIsCartOpen(true);
            if (typeof window !== 'undefined' && window.location.pathname !== '/portal/customer/cart') {
              window.history.pushState(null, '', '/portal/customer/cart');
            }
          }}
          onAddToCart={handleAddToCart}
          onLogout={handleLogout}
          onSwitchToAdmin={() => navigateTo('/portal/admin')}
        />
      )}

      {/* ============================================================ */}
      {/* 4. ADMIN USER PORTAL */}
      {/* ============================================================ */}
      {currentRoute === 'portal-admin' && (
        <AdminPortal
          userSession={userSession}
          initialTab={adminTab}
          onTabChange={handleAdminTabChange}
          onLogout={handleLogout}
          onSwitchToCustomer={() => navigateTo('/portal/customer')}
        />
      )}

      {/* Global Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => {
          setIsCartOpen(false);
          // Restore path to current portal tab
          if (currentRoute === 'portal-customer') {
            const p = customerTab === 'dashboard' ? '/portal/customer' : `/portal/customer/${customerTab}`;
            if (window.location.pathname !== p) {
              window.history.pushState(null, '', p);
            }
          }
        }}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOrderCreated={handleOrderCreated}
        onNavigateOrders={() => {
          setIsCartOpen(false);
          handleCustomerTabChange('orders');
        }}
        onNavigateCustom={() => {
          setIsCartOpen(false);
          if (currentRoute !== 'portal-customer') {
            navigateTo('/portal/customer');
          }
          handleCustomerTabChange('custom');
        }}
      />

    </div>
  );
}
