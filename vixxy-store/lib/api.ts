import { Product, CartItem, User } from '@/lib/types';
import { API_BASE } from '@/lib/env';
const TOKEN_KEY = 'vixxy_access_token';
const REFRESH_TOKEN_KEY = 'vixxy_refresh_token';
const USER_KEY = 'vixxy_user';
const LOCAL_USERS_KEY = 'vixxy_demo_users';

type LocalUserRecord = User & { password: string };

const customerRole = { id: 1, roleName: 'CUSTOMER', description: 'Customer' };
const adminRole = { id: 2, roleName: 'ADMIN', description: 'Admin' };

function shouldUseLocalAuth() {
  return typeof window !== 'undefined' && (!API_BASE || API_BASE === '/api' || API_BASE.startsWith('/api'));
}

function nowIso() {
  return new Date().toISOString();
}

function createToken(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function seedLocalUsers(): LocalUserRecord[] {
  return [
    {
      id: 1,
      email: 'user@vixxy.com',
      password: 'user123',
      phone: '0900000000',
      username: 'vixxy_user',
      fullName: 'Vixxy Nguyen',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      roleId: customerRole.id,
      role: customerRole,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: 2,
      email: 'admin@vixxy.com',
      password: 'admin123',
      phone: '0900000001',
      username: 'vixxy_admin',
      fullName: 'Vixxy Admin',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      roleId: adminRole.id,
      role: adminRole,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];
}

function getLocalUsers(): LocalUserRecord[] {
  if (typeof window === 'undefined') return seedLocalUsers();

  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const users = JSON.parse(raw) as LocalUserRecord[];
      const seededUsers = seedLocalUsers();
      const mergedUsers = [
        ...users,
        ...seededUsers.filter(
          (seededUser) => !users.some((user) => user.email.toLowerCase() === seededUser.email.toLowerCase())
        ),
      ];
      if (mergedUsers.length !== users.length) saveLocalUsers(mergedUsers);
      return mergedUsers;
    }
  } catch {
    // Fall through and reseed demo users.
  }

  const seeded = seedLocalUsers();
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveLocalUsers(users: LocalUserRecord[]) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function publicUser(user: LocalUserRecord): User {
  const { password, ...safeUser } = user;
  return safeUser;
}

function saveLocalSession(user: User) {
  const accessToken = createToken('local_access');
  const refreshToken = createToken('local_refresh');
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { accessToken, refreshToken, user };
}

const localAuthAPI = {
  login: async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = getLocalUsers().find(
      (item) => item.email.toLowerCase() === normalizedEmail && item.password === password
    );

    if (!user) {
      throw new Error('Email or password is incorrect');
    }

    const updatedUser = { ...user, lastLoginAt: nowIso(), updatedAt: nowIso() };
    const users = getLocalUsers().map((item) => (item.id === user.id ? updatedUser : item));
    saveLocalUsers(users);
    return saveLocalSession(publicUser(updatedUser));
  },

  register: async (email: string, password: string, fullName: string, phone?: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const users = getLocalUsers();

    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      throw new Error('Email already exists');
    }

    const user: LocalUserRecord = {
      id: Date.now(),
      email: normalizedEmail,
      password,
      phone,
      username: normalizedEmail.split('@')[0],
      fullName,
      status: 'active',
      emailVerified: true,
      phoneVerified: Boolean(phone),
      roleId: customerRole.id,
      role: customerRole,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    saveLocalUsers([...users, user]);
    return { user: publicUser(user) };
  },

  getMe: async () => {
    const rawUser = localStorage.getItem(USER_KEY);
    if (!rawUser) throw new Error('Not logged in');
    return { user: JSON.parse(rawUser) as User };
  },

  updateProfile: async (profileData: Partial<User>) => {
    const rawUser = localStorage.getItem(USER_KEY);
    if (!rawUser) throw new Error('Not logged in');

    const currentUser = JSON.parse(rawUser) as User;
    const updatedUser = { ...currentUser, ...profileData, updatedAt: nowIso() };
    const users = getLocalUsers().map((user) =>
      user.id === currentUser.id ? { ...user, ...profileData, updatedAt: nowIso() } : user
    );

    saveLocalUsers(users);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    return { user: updatedUser };
  },

  forgotPassword: async (email: string) => ({ success: true, email }),
  resetPassword: async () => ({ success: true }),
  logout: async () => {
    logout();
    return { success: true };
  },
};

let isRefreshing: boolean = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await fetch(`${API_BASE}/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'Token refresh failed');
  }

  const tokenData = data.data;
  localStorage.setItem(TOKEN_KEY, tokenData.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokenData.refreshToken);

  return tokenData.accessToken;
}

async function fetchAPI<T>(
  endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    ...options,
  });

  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh-token')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newAccessToken = await refreshAccessToken();
        onTokenRefreshed(newAccessToken);
        return fetchAPI(endpoint, options);
      } catch (err) {
        logout();
        throw err;
      } finally {
        isRefreshing = false;
      }
    } else {
      return new Promise((resolve, reject) => {
        addRefreshSubscriber((token: string) => {
          const newHeaders = { ...headers, Authorization: `Bearer ${token}` };
          return fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: newHeaders
          }).then(resolve).catch(reject);
        });
      });
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.statusText}`);
  }

  return data.data || data;
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export const authAPI = {
  login: async (email: string, password: string) => {
    if (shouldUseLocalAuth()) return localAuthAPI.login(email, password);

    const result = await fetchAPI<{ tokens: { accessToken: string; refreshToken: string }; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const tokens = result.tokens ?? (result as any).data?.tokens;
    const user = result.user ?? (result as any).data?.user;

    if (tokens?.accessToken && user) {
      localStorage.setItem(TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      };
    }

    throw new Error('Invalid login response');
  },
  register: async (email: string, password: string, fullName: string, phone?: string) => {
    if (shouldUseLocalAuth()) return localAuthAPI.register(email, password, fullName, phone);

    const result = await fetchAPI<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, phone }),
    });
    return result;
  },
  forgotPassword: async (email: string) => {
    if (shouldUseLocalAuth()) return localAuthAPI.forgotPassword(email);

    return fetchAPI('/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  resetPassword: async (token: string, password: string, confirmPassword: string) => {
    if (shouldUseLocalAuth()) return localAuthAPI.resetPassword();

    return fetchAPI('/password/reset', {
      method: 'POST',
      body: JSON.stringify({ token, password, confirmPassword }),
    });
  },
  getMe: async () => {
    if (shouldUseLocalAuth()) return localAuthAPI.getMe();

    const result = await fetchAPI<{ user: User }>('/auth/me');
    if ((result as any).data) {
      return (result as any).data;
    }
    return result;
  },
  updateProfile: async (profileData: Partial<User>) => {
    if (shouldUseLocalAuth()) return localAuthAPI.updateProfile(profileData);

    const result = await fetchAPI<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    if ((result as any).data) {
      return (result as any).data;
    }
    return result;
  },
  logout: async () => {
    if (shouldUseLocalAuth()) return localAuthAPI.logout();

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    try {
      await fetchAPI('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      logout();
    }
  },
};

export const productsAPI = {
  getAll: (options?: { category?: string; search?: string; sort?: string }) => {
    const params = new URLSearchParams();
    if (options?.category) params.set('category', options.category);
    if (options?.search) params.set('search', options.search);
    if (options?.sort) params.set('sort', options.sort);
    const queryString = params.toString();
    return fetchAPI<{ success: boolean; data: Product[] }>(
      `/products${queryString ? `?${queryString}` : ''}`
    );
  },
  getById: (id: string | number) =>
    fetchAPI<{ success: boolean; data: Product }>(`/products/${id}`),
};

export const cartAPI = {
  get: (userId?: string) =>
    fetchAPI<CartItem[]>(`/cart${userId ? `?userId=${userId}` : ''}`),
  add: (productId: string, size?: string, userId?: string) =>
    fetchAPI<CartItem[]>('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, size, userId }),
    }),
  update: (productId: string, size: string | undefined, quantity: number, userId?: string) =>
    fetchAPI<CartItem[]>('/cart', {
      method: 'PUT',
      body: JSON.stringify({ productId, size, quantity, userId }),
    }),
  delete: (productId?: string, size?: string, clearAll?: boolean, userId?: string) =>
    fetchAPI<CartItem[]>('/cart', {
      method: 'DELETE',
      body: JSON.stringify({ productId, size, clearAll, userId }),
    }),
};

export const wishlistAPI = {
  get: (userId?: string) =>
    fetchAPI<Product[]>(`/wishlist${userId ? `?userId=${userId}` : ''}`),
  add: (productId: string, userId?: string) =>
    fetchAPI<string[]>('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId, userId }),
    }),
  delete: (productId: string, userId?: string) =>
    fetchAPI<string[]>('/wishlist', {
      method: 'DELETE',
      body: JSON.stringify({ productId, userId }),
    }),
};

export const ordersAPI = {
  get: (userId?: string) =>
    fetchAPI<any[]>(`/orders${userId ? `?userId=${userId}` : ''}`),
  create: (orderData: any, userId?: string) =>
    fetchAPI<any>('/orders', {
      method: 'POST',
      body: JSON.stringify({ ...orderData, userId }),
    }),
};

export const chatSessionAPI = {
  create: (customerId: number, priority: string = "MEDIUM") =>
    fetchAPI<{ success: boolean; session: any }>('/chat-sessions', {
      method: 'POST',
      body: JSON.stringify({ customerId, priority }),
    }),
  getById: (id: number) =>
    fetchAPI<{ success: boolean; session: any }>(`/chat-sessions/${id}`),
  getAll: () =>
    fetchAPI<{ success: boolean; sessions: any[] }>('/chat-sessions'),
  transfer: (sessionId: number, fromStaffId: number, toStaffId: number, reason?: string) =>
    fetchAPI<{ success: boolean; session: any }>('/chat-sessions/transfer', {
      method: 'POST',
      body: JSON.stringify({ sessionId, fromStaffId, toStaffId, reason }),
    }),
  close: (sessionId: number) =>
    fetchAPI<{ success: boolean; session: any }>('/chat-sessions/close', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }),
};

export const chatMessageAPI = {
  send: (sessionId: number, senderType: string, senderId: number, messageContent: string, messageType: string = "TEXT") =>
    fetchAPI<{ success: boolean; message: any }>('/chat-messages', {
      method: 'POST',
      body: JSON.stringify({ sessionId, senderType, senderId, messageContent, messageType }),
    }),
  getBySessionId: (sessionId: number) =>
    fetchAPI<{ success: boolean; messages: any[] }>(`/chat-messages/${sessionId}`),
  getHistory: (userId?: number) =>
    fetchAPI<{ success: boolean; sessions: any[] }>(`/chat-messages${userId ? `?userId=${userId}` : ''}`),
};
