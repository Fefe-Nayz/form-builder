import { create } from "zustand";

export interface FormVariable {
  id: string;
  key: string;
  label_json: Record<string, string>;
  value: string;
}

interface VariableStore {
  variables: FormVariable[];
  addVariable: (variable: Omit<FormVariable, "id">) => string;
  updateVariable: (id: string, updates: Partial<FormVariable>) => void;
  updateVariableByKey: (key: string, updates: Partial<FormVariable>) => void;
  deleteVariable: (id: string) => void;
}

export const useVariableStore = create<VariableStore>((set) => ({
  variables: [],
  addVariable: (variable) => {
    const id = `var_${Date.now()}`;
    set((state) => ({ variables: [...state.variables, { id, ...variable }] }));
    return id;
  },
  updateVariable: (id, updates) =>
    set((state) => ({
      variables: state.variables.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    })),
  updateVariableByKey: (key, updates) =>
    set((state) => ({
      variables: state.variables.map((v) => (v.key === key ? { ...v, ...updates } : v)),
    })),
  deleteVariable: (id) =>
    set((state) => ({ variables: state.variables.filter((v) => v.id !== id) })),
}));
