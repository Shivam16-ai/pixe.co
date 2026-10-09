import type { UserSession } from '../types';

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  user?: UserSession & { id?: string; email?: string; avatar?: string | null; phone?: string | null; memberSince?: string };
  items?: T[];
  product?: T;
  relatedProducts?: T[];
  orders?: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasNextPage?: boolean;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'message' in payload ? String((payload as { message?: string }).message) : 'Request failed.';
    throw new Error(message);
  }

  return (payload ?? ({} as T));
}

export const authApi = {
  async me() {
    return request<{ success: boolean; user?: UserSession & { id?: string; email?: string; avatar?: string | null; phone?: string | null } }>(`/api/auth/me`);
  },

  async login(payload: { email: string; password: string }) {
    const result = await request<{ success: boolean; user?: UserSession & { id?: string; email?: string; avatar?: string | null; phone?: string | null; memberSince?: string }; message?: string }>(`/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (result.user) {
      return {
        ...result.user,
        role: (result.user.role || 'customer').toLowerCase() as 'customer' | 'admin',
        name: result.user.name || 'Collector',
        email: result.user.email || payload.email,
      } satisfies UserSession;
    }

    return null;
  },

  async register(payload: { name: string; email: string; password: string }) {
    const result = await request<{ success: boolean; user?: UserSession & { id?: string; email?: string; avatar?: string | null; phone?: string | null; memberSince?: string }; message?: string }>(`/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (result.user) {
      return {
        ...result.user,
        role: (result.user.role || 'customer').toLowerCase() as 'customer' | 'admin',
        name: result.user.name || payload.name,
        email: result.user.email || payload.email,
      } satisfies UserSession;
    }

    return null;
  },

  async logout() {
    return request<{ success: boolean; message?: string }>(`/api/auth/logout`, { method: 'POST' });
  },
};

export const productApi = {
  async list(params: Record<string, string | number | boolean | undefined> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    });

    const qs = query.toString();
    return request<{ success: boolean; items?: unknown[]; total?: number; page?: number; limit?: number; totalPages?: number; hasNextPage?: boolean }>(`/api/products${qs ? `?${qs}` : ''}`);
  },

  async get(id: string) {
    return request<{ success: boolean; product?: unknown; relatedProducts?: unknown[] }>(`/api/products/${id}`);
  },
};

export const cartApi = {
  async get() {
    return request<{ success: boolean; items?: unknown[]; subtotal?: number; total?: number }>(`/api/cart`);
  },

  async addItem(payload: Record<string, unknown>) {
    return request<{ success: boolean; item?: unknown; message?: string }>(`/api/cart/items`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const orderApi = {
  async list() {
    return request<{ success: boolean; orders?: unknown[] }>(`/api/orders`);
  },

  async create(payload: Record<string, unknown>) {
    return request<{ success: boolean; order?: unknown; message?: string }>(`/api/orders`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const profileApi = {
  async get() {
    return request<{ success: boolean; profile?: unknown }>(`/api/profile`);
  },

  async update(payload: Record<string, unknown>) {
    return request<{ success: boolean; profile?: unknown; message?: string }>(`/api/profile`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};

export const favoriteApi = {
  async list() {
    return request<{ success: boolean; items?: unknown[] }>(`/api/favorites`);
  },
};

export const adminApi = {
  async orders() {
    return request<{ success: boolean; orders?: unknown[] }>(`/api/admin/orders`);
  },

  async analytics() {
    return request<{ success: boolean; analytics?: unknown }>(`/api/admin/analytics`);
  },
};

export default { authApi, productApi, cartApi, orderApi, profileApi, favoriteApi, adminApi };
