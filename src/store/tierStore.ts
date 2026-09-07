import { create } from "zustand";
import tierService, { type TierItem } from "../services/user/tierService";

interface TierState {
  tiers: TierItem[];
  loading: boolean;
  error: string | null;
  fetchTiers: (force?: boolean) => Promise<TierItem[]>;
  getOriginalPrice: (tierCode: string) => number | null;
  getTierItem: (tierCode: string) => TierItem | undefined;
}

export const useTierStore = create<TierState>((set, get) => ({
  tiers: [],
  loading: false,
  error: null,

  fetchTiers: async (force = false) => {
    if (!force && get().tiers.length > 0) {
      return get().tiers;
    }
    set({ loading: true, error: null });
    try {
      const res = await tierService.getTiers();
      const fetchedTiers = res.data?.data ?? [];
      set({ tiers: fetchedTiers, loading: false });
      return fetchedTiers;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load tier pricing";
      set({ error: msg, loading: false });
      return [];
    }
  },

  getOriginalPrice: (tierCode: string) => {
    if (!tierCode) return null;
    const tier = get().tiers.find(
      (t) => t.tierCode.toUpperCase() === tierCode.toUpperCase()
    );
    return tier ? tier.originalPrice : null;
  },

  getTierItem: (tierCode: string) => {
    if (!tierCode) return undefined;
    return get().tiers.find(
      (t) => t.tierCode.toUpperCase() === tierCode.toUpperCase()
    );
  },
}));

export default useTierStore;
