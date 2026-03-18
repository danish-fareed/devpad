import { create } from "zustand";
import type { VaultStatusResult, VaultVariable } from "../lib/types";
import * as vault from "../lib/vault";

interface VaultStore {
  // State
  status: VaultStatusResult | null;
  loading: boolean;
  error: string | null;
  variables: VaultVariable[];
  globalVariables: Record<string, VaultVariable[]>; // projectId -> variables
  sharedVariables: Record<string, VaultVariable[]>; // projectId -> variables shared WITH this project
  // Actions
  checkStatus: () => Promise<void>;
  setup: (password: string) => Promise<void>;
  unlock: (password: string, remember?: boolean) => Promise<void>;
  tryAutoUnlock: () => Promise<boolean>;
  lock: () => Promise<void>;
  loadVariables: (projectId: string, envName: string) => Promise<void>;
  loadAllGlobalVariables: (projects: any[]) => Promise<void>;
  setVariable: (
    projectId: string,
    envName: string,
    key: string,
    value: string,
    varType?: string,
    sensitive?: boolean,
    required?: boolean,
    description?: string
  ) => Promise<void>;
  deleteVariable: (
    projectId: string,
    envName: string,
    key: string
  ) => Promise<void>;
  shareVariable: (
    sourceProjectId: string,
    envName: string,
    key: string,
    targetProjectIds: string[]
  ) => Promise<void>;
  unshareVariable: (
    sourceProjectId: string,
    envName: string,
    key: string,
    targetProjectId: string
  ) => Promise<boolean>;
  importEnv: (
    projectId: string,
    envName: string,
    envContent: string,
    sensitiveKeys: string[]
  ) => Promise<string>;
  generateSecret: (
    secretType: string,
    length?: number
  ) => Promise<string>;
  clearError: () => void;
}

export const useVaultStore = create<VaultStore>((set, get) => ({
  status: null,
  loading: false,
  error: null,
  variables: [],
  globalVariables: {},
  sharedVariables: {},

  checkStatus: async () => {
    try {
      const status = await vault.vaultStatus();
      set({ status });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  setup: async (password) => {
    set({ loading: true, error: null });
    try {
      await vault.vaultSetup(password);
      const status = await vault.vaultStatus();
      set({ status, loading: false });
    } catch (e) {
      set({ loading: false, error: String(e) });
      throw e;
    }
  },

  unlock: async (password, remember = false) => {
    set({ loading: true, error: null });
    try {
      await vault.vaultUnlock(password, remember);
      const status = await vault.vaultStatus();
      set({ status, loading: false });
    } catch (e) {
      set({ loading: false, error: String(e) });
      throw e;
    }
  },

  tryAutoUnlock: async () => {
    try {
      const success = await vault.vaultAutoUnlock();
      if (success) {
        const status = await vault.vaultStatus();
        set({ status });
      }
      return success;
    } catch {
      return false;
    }
  },

  lock: async () => {
    try {
      await vault.vaultLock();
      const status = await vault.vaultStatus();
      set({ status, variables: [], globalVariables: {} });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  loadVariables: async (projectId, envName) => {
    try {
      const variables = await vault.vaultGetVariables(projectId, envName);
      set({ variables });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  loadAllGlobalVariables: async (projects) => {
    set({ loading: true });
    try {
      const allVariables = await vault.vaultGetAllVariables();
      
      const results: Record<string, VaultVariable[]> = {};
      const sharedResults: Record<string, VaultVariable[]> = {};
      
      // Initialize arrays for all known projects to ensure they appear
      for (const p of projects) {
        results[p.id] = [];
        sharedResults[p.id] = [];
      }
      
      // Group the returned variables by project
      for (const v of allVariables) {
        const pId = v.projectId;
        if (!results[pId]) {
          results[pId] = [];
        }
        // Exclude projectId from the stored object if we just want VaultVariable
        const { projectId, ...rest } = v;
        results[pId].push(rest);
      }
      
      // Fetch shared variables for each active project
      await Promise.all(projects.map(async (p) => {
        try {
           const shared = await vault.vaultGetVariablesSharedWith(p.id);
           sharedResults[p.id] = shared.map(sv => {
             const { projectId, ...rest } = sv;
             return rest;
           });
        } catch {
           // Silently ignore if a single project fails to load shared vars
        }
      }));
      
      set({ 
        globalVariables: results, 
        sharedVariables: sharedResults,
        loading: false 
      });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  setVariable: async (projectId, envName, key, value, varType = "string", sensitive = false, required = true, description = "") => {
    try {
      await vault.vaultSetVariable(projectId, envName, key, value, varType, sensitive, required, description);
      // Reload variables for this project/env
      await get().loadVariables(projectId, envName);
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },

  deleteVariable: async (projectId, envName, key) => {
    try {
      await vault.vaultDeleteVariable(projectId, envName, key);
      await get().loadVariables(projectId, envName);
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },

  shareVariable: async (sourceProjectId, envName, key, targetProjectIds) => {
    try {
      await vault.vaultShareVariable(sourceProjectId, envName, key, targetProjectIds);
      // Optional: you could reload global variables here if you intend to show shared status
      // in the global list, but typically sharing is an action that might reload the target project's vars
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },

  unshareVariable: async (sourceProjectId, envName, key, targetProjectId) => {
    try {
      const result = await vault.vaultUnshareVariable(sourceProjectId, envName, key, targetProjectId);
      return result;
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },

  importEnv: async (projectId, envName, envContent, sensitiveKeys) => {
    try {
      return await vault.vaultImportEnv(projectId, envName, envContent, sensitiveKeys);
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },

  generateSecret: async (secretType, length) => {
    return vault.vaultGenerateSecret(secretType, length);
  },

  clearError: () => set({ error: null }),
}));
