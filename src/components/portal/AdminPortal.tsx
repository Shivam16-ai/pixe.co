import React, { useEffect, useState } from 'react';
import {
  Shield,
  Layers,
  Printer,
  Package,
  TrendingUp,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  ExternalLink,
  UserCheck,
} from 'lucide-react';
import { AdminPortalTab, UserSession, DarkroomPrintJob } from '../../types';
import { adminApi } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { playPaperTapSound, playShutterSound } from '../../utils/audio';

interface AdminPortalProps {
  userSession: UserSession;
  initialTab?: AdminPortalTab;
  onTabChange?: (tab: AdminPortalTab) => void;
  onLogout: () => void;
  onSwitchToCustomer: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  userSession,
  initialTab = 'dashboard',
  onTabChange,
  onLogout,
  onSwitchToCustomer,
}) => {
  const [activeTab, setActiveTab] = useState<AdminPortalTab>(initialTab);
  const [orders, setOrders] = useState<any[]>([]);
  const [queue, setQueue] = useState<DarkroomPrintJob[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    totalOrders: 0,
    pendingOrders: 0,
    dispatchedOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    lowStockProducts: [],
    hardwareStatus: { mode: 'SIMULATION', spoolerRpm: 120 },
  });
  const [notification, setNotification] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState<'connecting' | 'live' | 'offline' | 'reconnecting'>('connecting');

  const buildQueueFromOrders = (fetchedOrders: any[]) =>
    fetchedOrders
      .filter((order: any) => ['QUEUED', 'EMULSION_PREP', 'OPTICAL_EXPOSURE', 'CRYSTALLIZATION', 'WAX_PACKAGING', 'DISPATCHED'].includes(order.status))
      .slice(0, 8)
      .map((order: any, index: number) => ({
        id: `JOB-${String(index + 1).padStart(3, '0')}`,
        orderId: order.orderNumber || order.id,
        customerName: order.user?.name || 'Customer',
        productType: order.items?.[0]?.quantity && Number(order.items[0].quantity) > 1 ? '3 Polaroids' : '1 Polaroid',
        caption: order.items?.[0]?.caption || 'Archival print job',
        filter: order.items?.[0]?.filterName || 'Classic',
        paperStock: '310gsm Archival Gloss',
        status: order.status === 'QUEUED' ? 'Queued' : order.status === 'EMULSION_PREP' ? 'Thermal Printing' : order.status === 'OPTICAL_EXPOSURE' ? 'Chemical Curing' : order.status === 'CRYSTALLIZATION' ? 'Chemical Curing' : order.status === 'WAX_PACKAGING' ? 'QC Checked' : 'Packed & Dispatched',
        imageUrl: order.items?.[0]?.productImageSnapshot || 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80',
        submittedAt: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today',
      } satisfies DarkroomPrintJob));

  useEffect(() => {
    if (userSession.role !== 'admin') {
      setOrders([]);
      setQueue([]);
      return;
    }

    const loadAdminData = async () => {
      try {
        const [ordersResponse, analyticsResponse] = await Promise.all([
          adminApi.orders(),
          adminApi.analytics(),
        ]);

        const fetchedOrders = Array.isArray(ordersResponse?.orders) ? ordersResponse.orders : [];
        setOrders(fetchedOrders);
        const mappedQueue = buildQueueFromOrders(fetchedOrders);

        setQueue(mappedQueue);
        setAnalytics(analyticsResponse?.analytics || {});
      } catch {
        setOrders([]);
        setQueue([]);
        setAnalytics({
          totalOrders: 0,
          pendingOrders: 0,
          dispatchedOrders: 0,
          totalCustomers: 0,
          totalProducts: 0,
          totalRevenue: 0,
          lowStockProducts: [],
          hardwareStatus: { mode: 'SIMULATION', spoolerRpm: 120 },
        });
      }
    };

    void loadAdminData();
  }, [userSession.role]);

  useEffect(() => {
    if (userSession.role !== 'admin') {
      setSocketStatus('offline');
      return;
    }

    const socket = getSocket();
    if (!socket) {
      return;
    }

    const handleConnect = () => {
      setSocketStatus('live');
      showNotification('Darkroom live feed connected.');
    };

    const handleDisconnect = () => {
      setSocketStatus('offline');
      showNotification('OFFLINE\nRECONNECTING...');
    };

    const handleReconnect = () => {
      setSocketStatus('reconnecting');
      void adminApi.orders().then((response) => {
        const fetchedOrders = Array.isArray(response?.orders) ? response.orders : [];
        setOrders(fetchedOrders);
        setQueue(buildQueueFromOrders(fetchedOrders));
      }).catch(() => {
        // fallback to current state until REST sync completes
      });
    };

    const handleConnectError = () => {
      setSocketStatus('offline');
    };

    const handleOrderCreated = (payload: any) => {
      const key = payload.orderId || payload.orderNumber;
      setOrders((prev) => {
        if (prev.some((order) => String(order.id) === String(key) || String(order.orderNumber) === String(key))) {
          return prev;
        }

        return [
          {
            id: payload.orderId,
            orderNumber: payload.orderNumber,
            status: payload.status,
            total: Number(payload.total || 0),
            createdAt: payload.createdAt,
            user: { name: payload.customerName },
            items: [],
          },
          ...prev,
        ];
      });

      setQueue((prev) => {
        const exists = prev.some((job) => String(job.orderId) === String(key));
        if (exists) {
          return prev;
        }

        const newJob: DarkroomPrintJob = {
          id: `JOB-${String(prev.length + 1).padStart(3, '0')}`,
          orderId: payload.orderNumber || payload.orderId,
          customerName: payload.customerName || 'Customer',
          productType: '3 Polaroids',
          caption: 'New archival print order',
          filter: 'Classic',
          paperStock: '310gsm Archival Gloss',
          status: 'Queued',
          imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80',
          submittedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        };

        return [newJob, ...prev].slice(0, 8);
      });

      setAnalytics((prev: any) => ({
        ...prev,
        totalOrders: Number(prev.totalOrders || 0) + 1,
        pendingOrders: Number(prev.pendingOrders || 0) + 1,
        totalRevenue: Number(prev.totalRevenue || 0) + Number(payload.total || 0),
      }));

      showNotification(`NEW ORDER\n#${payload.orderNumber}`);
    };

    const handleOrderStatusUpdate = (payload: any) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (String(order.id) !== String(payload.orderId) && String(order.orderNumber) !== String(payload.orderNumber)) {
            return order;
          }

          return { ...order, status: payload.status, updatedAt: payload.updatedAt };
        })
      );

      setQueue((prev) =>
        prev.map((job) => {
          if (String(job.orderId) !== String(payload.orderNumber || payload.orderId)) {
            return job;
          }

          const liveStatus = payload.status === 'QUEUED' ? 'Queued' : payload.status === 'EMULSION_PREP' ? 'Thermal Printing' : payload.status === 'OPTICAL_EXPOSURE' ? 'Chemical Curing' : payload.status === 'CRYSTALLIZATION' ? 'Chemical Curing' : payload.status === 'WAX_PACKAGING' ? 'QC Checked' : payload.status === 'DISPATCHED' ? 'Packed & Dispatched' : 'Packed & Dispatched';
          return { ...job, status: liveStatus };
        })
      );

      setAnalytics((prev: any) => {
        const next = { ...prev };
        const pending = ['QUEUED', 'EMULSION_PREP', 'OPTICAL_EXPOSURE', 'CRYSTALLIZATION', 'WAX_PACKAGING'];
        const dispatched = ['DISPATCHED', 'DELIVERED'];
        next.pendingOrders = pending.includes(payload.status) ? Number(prev.pendingOrders || 0) : Number(prev.pendingOrders || 0);
        next.dispatchedOrders = dispatched.includes(payload.status) ? Number(prev.dispatchedOrders || 0) + 1 : Number(prev.dispatchedOrders || 0);
        return next;
      });

      showNotification(`Order #${payload.orderNumber || payload.orderId} moved to ${payload.status}`);
    };

    const handleInventoryUpdated = (_payload: any) => {
      setAnalytics((prev: any) => ({
        ...prev,
        totalProducts: Number(prev.totalProducts || 0),
      }));
    };

    const handleLowStock = (payload: any) => {
      showNotification(`LOW STOCK\nProduct:\n${payload.productName || 'Product'}\nRemaining: ${payload.remaining ?? payload.stockQuantity ?? 0}`);
    };

    const handleOutOfStock = (payload: any) => {
      showNotification(`OUT OF STOCK\nProduct:\n${payload.productName || 'Product'}\nRemaining: ${payload.remaining ?? 0}`);
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);
    socket.on('order.created', handleOrderCreated);
    socket.on('order.status.updated', handleOrderStatusUpdate);
    socket.on('inventory.updated', handleInventoryUpdated);
    socket.on('inventory.low', handleLowStock);
    socket.on('inventory.out', handleOutOfStock);

    if (socket.connected) {
      setSocketStatus('live');
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
      socket.off('order.created', handleOrderCreated);
      socket.off('order.status.updated', handleOrderStatusUpdate);
      socket.off('inventory.updated', handleInventoryUpdated);
      socket.off('inventory.low', handleLowStock);
      socket.off('inventory.out', handleOutOfStock);
    };
  }, [userSession.role]);

  const handleTabSelect = (tab: AdminPortalTab) => {
    playPaperTapSound();
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAdvanceStatus = (jobId: string) => {
    playShutterSound();
    setQueue((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          let nextStatus: DarkroomPrintJob['status'] = 'Queued';
          if (job.status === 'Queued') nextStatus = 'Thermal Printing';
          else if (job.status === 'Thermal Printing') nextStatus = 'Chemical Curing';
          else if (job.status === 'Chemical Curing') nextStatus = 'QC Checked';
          else if (job.status === 'QC Checked') nextStatus = 'Packed & Dispatched';
          else nextStatus = 'Packed & Dispatched';

          showNotification(`Job ${job.id} updated to ${nextStatus}.`);
          return { ...job, status: nextStatus };
        }
        return job;
      })
    );
  };

  const handleReprint = (jobId: string) => {
    playShutterSound();
    setQueue((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          showNotification(`Re-queueing Job ${job.id} for Thermal Calibration...`);
          return { ...job, status: 'Thermal Printing' };
        }
        return job;
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0907] text-[#E8DDC8] flex flex-col justify-between select-none">
      
      {/* ============================================================ */}
      {/* ADMIN PORTAL HEADER */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 bg-[#070605]/95 backdrop-blur-md border-b border-[#27241D] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <span className="font-['Syne'] text-xl font-bold tracking-tight text-[#E8DDC8]">
              PIXÉ<span className="text-[#F4B82A]">.</span>CO
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-red-950/40 border border-red-500/40 text-red-400 font-bold">
              DARKROOM ADMIN OPS
            </span>
          </div>

          {/* Admin Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-[#12100E] rounded-lg border border-[#27241D]">
            {[
              { id: 'dashboard', label: 'DASHBOARD' },
              { id: 'queue', label: 'PRINTING QUEUE' },
              { id: 'orders', label: 'ORDERS' },
              { id: 'inventory', label: 'INVENTORY' },
              { id: 'analytics', label: 'ANALYTICS' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabSelect(tab.id as AdminPortalTab)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#F4B82A] text-[#0B0A08] shadow-sm font-bold'
                    : 'text-[#E8DDC8]/70 hover:text-[#E8DDC8]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Admin Controls */}
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.2em] ${
              socketStatus === 'live' ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' :
              socketStatus === 'offline' ? 'bg-red-950/20 border-red-500/30 text-red-400' :
              'bg-amber-950/20 border-amber-500/30 text-amber-400'
            }`}>
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${socketStatus === 'live' ? 'bg-emerald-400 animate-pulse' : socketStatus === 'offline' ? 'bg-red-400' : 'bg-amber-400'}`} />
              {socketStatus === 'live' ? '● LIVE' : socketStatus === 'offline' ? '○ OFFLINE' : '↻ RECONNECTING'}
            </div>

            <button
              type="button"
              onClick={onSwitchToCustomer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#181612] hover:bg-[#25221B] border border-[#27241D] text-[#F4B82A] text-xs font-mono transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Customer View</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              aria-label="Logout admin"
              className="p-2 rounded-lg bg-[#14120E] hover:bg-red-500/20 text-[#E8DDC8]/60 hover:text-red-400 border border-[#27241D] transition-colors cursor-pointer"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-3 flex items-center gap-1 overflow-x-auto pb-1">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'queue', label: 'Queue' },
            { id: 'orders', label: 'Orders' },
            { id: 'inventory', label: 'Inventory' },
            { id: 'analytics', label: 'Analytics' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabSelect(tab.id as AdminPortalTab)}
              className={`px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap ${
                activeTab === tab.id ? 'bg-[#F4B82A] text-[#0B0A08]' : 'bg-[#14120E] text-[#E8DDC8]/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-16 right-6 z-50 px-4 py-2 bg-[#F4B82A] text-[#0B0A08] text-xs font-mono font-bold rounded-lg shadow-xl animate-in slide-in-from-top-2 whitespace-pre-line">
          {notification}
        </div>
      )}

      {/* ============================================================ */}
      {/* ADMIN WORKSPACE */}
      {/* ============================================================ */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* TAB 1: METRICS OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h1 className="font-['Syne'] text-2xl font-bold text-[#E8DDC8]">
                STUDIO PRODUCTION TELEMETRY
              </h1>
              <p className="text-xs text-[#E8DDC8]/60 font-light">
                Darkroom thermal print performance, dispatch velocity, and consumable supply.
              </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'TOTAL ORDERS', val: `${analytics.totalOrders ?? 0}`, delta: 'Across the darkroom network', color: '#F4B82A' },
                { label: 'ACTIVE DARKROOM QUEUE', val: `${queue.length} JOBS`, delta: `${analytics.pendingOrders ?? 0} pending orders`, color: '#38BDF8' },
                { label: 'TOTAL CUSTOMERS', val: `${analytics.totalCustomers ?? 0}`, delta: 'Marketplace accounts', color: '#34D399' },
                { label: 'TOTAL REVENUE', val: `₹${Number(analytics.totalRevenue ?? 0).toLocaleString('en-IN')}`, delta: `${analytics.dispatchedOrders ?? 0} dispatched`, color: '#F4B82A' },
              ].map((s, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-[#12100E] border border-[#27241D] space-y-2">
                  <div className="text-[10px] font-mono text-[#E8DDC8]/50 uppercase tracking-wider">{s.label}</div>
                  <div className="font-['Syne'] text-3xl font-bold text-[#E8DDC8] tabular-nums" style={{ color: s.color }}>
                    {s.val}
                  </div>
                  <div className="text-[11px] text-[#E8DDC8]/60 font-mono">{s.delta}</div>
                </div>
              ))}
            </div>

            {/* Hardware status is clearly labeled as live demo telemetry for prototype monitoring. */}
            <div className="p-6 rounded-2xl bg-[#12100E] border border-[#27241D] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27241D] pb-3">
                <div>
                  <h3 className="font-['Syne'] text-lg font-bold text-[#E8DDC8]">
                    Darkroom Hardware Telemetry
                  </h3>
                  <p className="text-xs text-[#E8DDC8]/60 font-light">
                    Thermal print head temperature, precision stepper feed velocity, and optical calibration.
                  </p>
                </div>
                <span className="self-start sm:self-auto px-2.5 py-1 rounded bg-[#1C1A14] border border-[#F4B82A]/30 text-[10px] font-mono text-[#F4B82A] uppercase tracking-wider font-semibold">
                  SIMULATED PROTOTYPE DATA · NOT LIVE IOT
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { unit: 'THERMAL UNIT A (3.5×4.2")', temp: '185°C Head', speed: '120 RPM Roller Feed', status: 'Active Emulsion Feed', healthy: true },
                  { unit: 'THERMAL UNIT B (Custom Runs)', temp: '182°C Head', speed: '118 RPM Micro-Drive', status: 'Curing Job #883', healthy: true },
                  { unit: 'DRY PACKAGER UNIT', temp: 'Room 22°C', speed: '90 RPM Seal Press', status: 'Ready for Wax Seals', healthy: true },
                ].map((u, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#0A0907] border border-[#27241D] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[#E8DDC8]">{u.unit}</span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>SIMULATED ONLINE</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#F4B82A]">{u.temp}</span>
                      <span className="text-[#38BDF8] font-semibold">{u.speed}</span>
                    </div>
                    <div className="text-xs text-[#E8DDC8]/60 font-light">{u.status}</div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-mono text-[#E8DDC8]/40 pt-1">
                Note: Hardware readings (including 120 RPM roller rotation and thermal heads) represent prototype fulfillment metrics for architectural testing.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: PRINTING QUEUE */}
        {activeTab === 'queue' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#27241D] pb-4">
              <div>
                <h1 className="font-['Syne'] text-2xl font-bold text-[#E8DDC8]">
                  DARKROOM PRINTING QUEUE
                </h1>
                <p className="text-xs text-[#E8DDC8]/60 font-light">
                  Inspect jobs, advance physical printing states, and approve archival QC passes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => showNotification('Darkroom queue refreshed.')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14120E] border border-[#27241D] text-xs font-mono text-[#F4B82A] cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Queue</span>
              </button>
            </div>

            <div className="space-y-4">
              {queue.map((job) => (
                <div
                  key={job.id}
                  className="p-5 rounded-xl bg-[#12100E] border border-[#27241D] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#F4B82A]/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-16 bg-[#F6F3EB] rounded-[2px] p-1 pb-2 shadow-sm shrink-0">
                      <img src={job.imageUrl} alt={job.caption} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-['Syne'] text-sm font-bold text-[#E8DDC8]">{job.id}</span>
                        <span className="text-[10px] font-mono text-[#E8DDC8]/50">Order {job.orderId}</span>
                        <span className="text-[10px] font-mono text-[#F4B82A]">· {job.submittedAt}</span>
                      </div>
                      <div className="text-xs text-[#E8DDC8]/80">
                        Customer: <strong className="text-white">{job.customerName}</strong> · Type: {job.productType}
                      </div>
                      <div className="text-[11px] font-['Caveat'] text-[#F4B82A]">
                        "{job.caption}" · Stock: {job.paperStock}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                        job.status === 'Queued'
                          ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30'
                          : job.status === 'Thermal Printing'
                          ? 'bg-blue-950/40 text-blue-400 border border-blue-500/30 animate-pulse'
                          : job.status === 'Chemical Curing'
                          ? 'bg-purple-950/40 text-purple-400 border border-purple-500/30'
                          : job.status === 'QC Checked'
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                          : 'bg-green-950/40 text-green-300 border border-green-500/30'
                      }`}
                    >
                      {job.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus(job.id)}
                      className="px-3 py-1.5 bg-[#F4B82A] hover:bg-[#E2A618] text-[#0B0A08] font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Advance →
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReprint(job.id)}
                      className="p-1.5 rounded-lg bg-[#181612] hover:bg-[#25221B] border border-[#27241D] text-[#E8DDC8]/60 hover:text-[#F4B82A] cursor-pointer"
                      title="Re-run Thermal Calibration"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#27241D] pb-4">
              <h1 className="font-['Syne'] text-2xl font-bold text-[#E8DDC8]">
                CUSTOMER ORDER FULFILLMENT
              </h1>
              <p className="text-xs text-[#E8DDC8]/60 font-light">
                Manage dispatch labels and blueDart courier handovers.
              </p>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#12100E] border border-[#27241D] text-[#E8DDC8]/70 text-sm">
                  No orders have been placed yet.
                </div>
              ) : orders.map((ord) => (
                <div key={ord.id} className="p-5 rounded-xl bg-[#12100E] border border-[#27241D] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27241D] pb-3 text-xs">
                    <div>
                      <span className="font-['Syne'] text-base font-bold text-[#E8DDC8]">{ord.orderNumber || ord.id}</span>
                      <span className="text-[#E8DDC8]/60 ml-2">Date: {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}</span>
                    </div>
                    <div className="font-mono text-[#F4B82A] font-bold">
                      {ord.trackingId || 'Tracking pending'}
                    </div>
                  </div>

                  <div className="text-xs text-[#E8DDC8]/80 font-light">
                    Items: {(ord.items || []).map((item: any) => `${item.productTitleSnapshot || 'Print'} (x${item.quantity || 1})`).join(', ') || 'No items'} · Total: ₹{Number(ord.total || 0)}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="px-2.5 py-0.5 rounded bg-[#1F1C16] border border-[#F4B82A]/30 text-[#F4B82A] font-mono">
                      Status: {ord.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => showNotification(`Printed shipping label for Order ${ord.orderNumber || ord.id}.`)}
                      className="px-3 py-1 bg-[#1A1813] hover:bg-[#F4B82A] text-[#E8DDC8] hover:text-[#0B0A08] rounded border border-[#27241D] font-mono text-[11px] cursor-pointer"
                    >
                      PRINT DISPATCH LABEL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#27241D] pb-4">
              <h1 className="font-['Syne'] text-2xl font-bold text-[#E8DDC8]">
                CONSUMABLE INVENTORY & FILM STOCKS
              </h1>
              <p className="text-xs text-[#E8DDC8]/60 font-light">
                Monitor 310gsm paper stock, thermal dye rolls, kraft envelopes, and washi tapes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: '310gsm Archival Gloss Paper Rolls', qty: '1,420 sheets', level: 82, ok: true },
                { name: '310gsm Matte Velvet Rag Paper', qty: '840 sheets', level: 65, ok: true },
                { name: 'YMC Thermal Sublimation Ribbons', qty: '18 cartridges', level: 75, ok: true },
                { name: 'Protective Glassine Acid-Free Sleeves', qty: '3,200 units', level: 90, ok: true },
                { name: 'Rigid Stay-Flat Brown Kraft Mailers', qty: '1,100 units', level: 70, ok: true },
                { name: 'PIXÉ Brass Wax Seal Pellets', qty: '450 batches', level: 45, ok: false },
              ].map((inv, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#12100E] border border-[#27241D] space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-xs text-[#E8DDC8]">{inv.name}</span>
                    <span className="text-xs font-mono text-[#F4B82A]">{inv.qty}</span>
                  </div>
                  <div className="w-full bg-[#0A0907] h-2 rounded-full overflow-hidden border border-[#27241D]">
                    <div
                      className={`h-full rounded-full ${inv.ok ? 'bg-[#F4B82A]' : 'bg-amber-500'}`}
                      style={{ width: `${inv.level}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[#E8DDC8]/50">
                    <span>CAPACITY: {inv.level}%</span>
                    <span>{inv.ok ? 'OPTIMAL' : 'REORDER SOON'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ANALYTICS & PRODUCTION INTELLIGENCE */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27241D] pb-4">
              <div>
                <h1 className="font-['Syne'] text-2xl font-bold text-[#E8DDC8]">
                  STUDIO ARCHIVAL ANALYTICS
                </h1>
                <p className="text-xs text-[#E8DDC8]/60 font-light">
                  Production throughput, franchise demand, packaging economics, and customer quality metrics.
                </p>
              </div>
              <span className="px-3 py-1 rounded bg-[#1F1C16] border border-[#F4B82A]/30 text-[#F4B82A] text-[10px] font-mono uppercase tracking-wider self-start sm:self-auto">
                Prototype Telemetry (Simulated Data)
              </span>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'TOTAL LIFETIME PRINTS', val: '14,820', sub: '310gsm archival emulsion', color: '#E8DDC8' },
                { label: 'AVERAGE ORDER VALUE', val: '₹184', sub: 'Driven by 3-for-₹100 trio pack', color: '#F4B82A' },
                { label: 'CUSTOMER QUALITY RATING', val: '4.98 / 5.0', sub: '340 verified collector reviews', color: '#34D399' },
                { label: 'QC FIRST-PASS SUCCESS', val: '99.4%', sub: 'Thermal calibration accuracy', color: '#38BDF8' },
              ].map((m, i) => (
                <div key={i} className="p-5 rounded-xl bg-[#12100E] border border-[#27241D] space-y-1.5">
                  <span className="text-[10px] font-mono text-[#E8DDC8]/50 uppercase tracking-wider block">{m.label}</span>
                  <div className="font-['Syne'] text-2xl font-bold" style={{ color: m.color }}>{m.val}</div>
                  <span className="text-[11px] text-[#E8DDC8]/60 font-mono block">{m.sub}</span>
                </div>
              ))}
            </div>

            {/* Category Share & Pack Economics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Demand */}
              <div className="p-6 rounded-2xl bg-[#12100E] border border-[#27241D] space-y-4">
                <h3 className="font-['Syne'] text-base font-bold text-[#E8DDC8]">
                  Print Demand by Franchise & Genre
                </h3>
                <div className="space-y-3">
                  {[
                    { cat: 'Anime & Manga (One Piece, Bleach, Naruto)', share: 44, color: '#F4B82A' },
                    { cat: 'Sports & Motorsport (Cricket, F1, Football)', share: 24, color: '#38BDF8' },
                    { cat: 'Cinema & Hollywood Auteur Moments', share: 16, color: '#E8DDC8' },
                    { cat: 'Custom Personal Darkroom Labs', share: 10, color: '#34D399' },
                    { cat: 'Superheroes, Vintage Cars & Travel', share: 6, color: '#A855F7' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-[#E8DDC8]/80">{item.cat}</span>
                        <span className="text-[#F4B82A] font-bold">{item.share}%</span>
                      </div>
                      <div className="w-full bg-[#0A0907] h-2 rounded-full overflow-hidden border border-[#27241D]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.share}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pack Economics */}
              <div className="p-6 rounded-2xl bg-[#12100E] border border-[#27241D] space-y-4">
                <h3 className="font-['Syne'] text-base font-bold text-[#E8DDC8]">
                  Packaging & Bundle Adoption
                </h3>
                <div className="space-y-3">
                  {[
                    { pack: '3-For-₹100 Studio Trio Pack', pct: 68, desc: 'Most popular customer bundle' },
                    { pack: 'Single ₹40 Archival Polaroids', pct: 18, desc: 'A la carte character discovery' },
                    { pack: 'Custom Lab ₹50 Memory Prints', pct: 14, desc: 'Personal camera roll uploads' },
                  ].map((p, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#0A0907] border border-[#27241D] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-[#E8DDC8]">{p.pack}</div>
                        <div className="text-[10px] font-mono text-[#E8DDC8]/50">{p.desc}</div>
                      </div>
                      <span className="font-['Syne'] text-lg font-bold text-[#F4B82A] tabular-nums">{p.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Prototype Notice */}
            <div className="p-4 rounded-xl bg-[#0E0D0A] border border-[#27241D] flex items-center gap-3 text-xs font-mono text-[#E8DDC8]/60">
              <span className="text-[#F4B82A] font-bold">PROTOTYPE NOTE:</span>
              <span>All darkroom metrics and hardware statuses are structured mock values for testing fulfillment pipelines prior to live IoT printer bridging.</span>
            </div>
          </div>
        )}

      </main>

      {/* Admin Footer */}
      <footer className="py-6 bg-[#060504] border-t border-[#1C1A15] text-xs text-[#E8DDC8]/40 font-mono text-center">
        PIXÉ.CO DARKROOM CONTROLLER · INTERNAL USE ONLY · OPERATOR: {userSession.email.toUpperCase()}
      </footer>

    </div>
  );
};
