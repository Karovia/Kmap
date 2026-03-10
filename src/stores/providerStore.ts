import { create } from 'zustand';
import type { LLMProvider } from '../types/domain';

interface ProviderStoreState {
  providers: LLMProvider[];
  loading: boolean;
  setProviders: (providers: LLMProvider[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useProviderStore = create<ProviderStoreState>(set => ({
  providers: [],
  loading: true,
  setProviders: providers => set({ providers }),
  setLoading: loading => set({ loading }),
}));
