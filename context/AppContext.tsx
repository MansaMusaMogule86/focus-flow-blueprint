
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, AssetStatus, UserAsset, VaultEntry } from '../types';
import { CURRICULUM } from '../constants';

interface AppContextType {
  state: AppState;
  vault: VaultEntry[];
  updateAsset: (week: number, data: any, status: AssetStatus, generatedAsset?: string) => void;
  unlockWeek: (week: number) => void;
  saveToVault: (entry: Omit<VaultEntry, 'id' | 'createdAt'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_STATE: AppState = {
  currentWeek: 1,
  progress: CURRICULUM.reduce((acc, week) => {
    acc[week.week] = {
      week: week.week,
      status: week.week === 1 ? AssetStatus.IN_PROGRESS : AssetStatus.LOCKED,
      data: {}
    };
    return acc;
  }, {} as Record<number, UserAsset>)
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('focus_flow_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  const [vault, setVault] = useState<VaultEntry[]>(() => {
    const saved = localStorage.getItem('focus_flow_vault');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('focus_flow_v1', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('focus_flow_vault', JSON.stringify(vault));
  }, [vault]);

  const updateAsset = (week: number, data: any, status: AssetStatus, generatedAsset?: string) => {
    setState(prev => {
      const newProgress = { ...prev.progress };
      newProgress[week] = {
        ...newProgress[week],
        data,
        status,
        generatedAsset: generatedAsset || newProgress[week].generatedAsset
      };

      // Auto-unlock next week
      if (status === AssetStatus.COMPLETED && week < 8) {
        if (newProgress[week + 1].status === AssetStatus.LOCKED) {
          newProgress[week + 1].status = AssetStatus.IN_PROGRESS;
        }
      }

      return { ...prev, progress: newProgress };
    });
  };

  const unlockWeek = (week: number) => {
    setState(prev => {
      const newProgress = { ...prev.progress };
      if (newProgress[week].status === AssetStatus.LOCKED) {
        newProgress[week].status = AssetStatus.IN_PROGRESS;
      }
      return { ...prev, progress: newProgress };
    });
  };

  const saveToVault = (entry: Omit<VaultEntry, 'id' | 'createdAt'>) => {
    const newEntry: VaultEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setVault(prev => [newEntry, ...prev]);
  };

  return (
    <AppContext.Provider value={{ state, vault, updateAsset, unlockWeek, saveToVault }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
