import { authStorage } from './auth-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export type Chain = 'stellar' | 'solana';
export type IntentStatus = 'pending' | 'routing' | 'executing' | 'completed' | 'failed';

export interface Intent {
  id: string;
  fromChain: Chain;
  toChain: Chain;
  amount: string;
  asset: string;
  recipient: string;
  status: IntentStatus;
  txHash?: string;
  createdAt: string;
}

export interface CreateIntentDto {
  fromChain: Chain;
  toChain: Chain;
  amount: string;
  asset: string;
  recipient: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await authStorage.getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { ...headers, ...init?.headers },
  });
  
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    register: (email: string, password: string, tenantName: string) =>
      request<{ access_token: string; userId: string; tenantId: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, tenantName }),
      }),

    login: (email: string, password: string) =>
      request<{ access_token: string; userId: string; tenantId: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
  },

  intents: {
    create: (dto: CreateIntentDto) =>
      request<Intent>('/intents', { method: 'POST', body: JSON.stringify(dto) }),

    get: (id: string) => request<Intent>(`/intents/${id}`),

    list: () => request<Intent[]>('/intents'),
  },
};
