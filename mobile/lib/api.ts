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
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const api = {
  createIntent: (dto: CreateIntentDto) =>
    request<Intent>('/intents', { method: 'POST', body: JSON.stringify(dto) }),

  getIntent: (id: string) => request<Intent>(`/intents/${id}`),
};
