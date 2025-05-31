interface AppState {
  templates: any;
  multiTabGraph: any;
  singleTabGraph: any;
  settings: {
    theme?: string;
  };
}

const STORAGE_KEY = 'form-builder-app-state';
const STORAGE_VERSION = '1.1';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const saveAppStateToLocalStorage = (
  templateStore: any,
  multiTabStore: any,
  singleTabStore: any,
  settings: { theme?: string } = {}
): boolean => {
  if (!isBrowser) return false;
  
  try {
    // Get the multi-tab store state and exclude tabCanvasStores
    const multiTabState = multiTabStore.getState();
    const { tabCanvasStores, ...multiTabStateToSave } = multiTabState;
    
    const appState: AppState = {
      templates: templateStore.getState(),
      multiTabGraph: multiTabStateToSave, // Save without tabCanvasStores
      singleTabGraph: singleTabStore.getState(),
      settings,
    };

    const stateWithVersion = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      data: appState,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithVersion));
    return true;
  } catch (error) {
    console.error('Failed to save app state to localStorage:', error);
    return false;
  }
};

export const loadAppStateFromLocalStorage = (): {
  success: boolean;
  data?: AppState;
  error?: string;
} => {
  if (!isBrowser) {
    return { success: false, error: 'Not in browser environment' };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { success: false, error: 'No saved state found' };
    }

    const parsed = JSON.parse(stored);
    
    // Check version compatibility - allow backward compatibility
    if (parsed.version && parsed.version !== STORAGE_VERSION) {
      console.warn(`Version mismatch. Saved: ${parsed.version}, Current: ${STORAGE_VERSION}. Attempting to load anyway.`);
    }

    return { success: true, data: parsed.data };
  } catch (error) {
    console.error('Failed to load app state from localStorage:', error);
    return { success: false, error: 'Failed to parse saved state' };
  }
};

export const clearAppStateFromLocalStorage = (): boolean => {
  if (!isBrowser) return false;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear app state from localStorage:', error);
    return false;
  }
};

export const getStorageInfo = () => {
  if (!isBrowser) return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return {
      version: parsed.version,
      timestamp: parsed.timestamp,
      size: new Blob([stored]).size,
    };
  } catch {
    return null;
  }
};

export const hasStoredState = (): boolean => {
  if (!isBrowser) return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
};

// Auto-save functionality with debouncing
let autosaveTimeout: NodeJS.Timeout | null = null;

export const scheduleAutoSave = (
  templateStore: any,
  multiTabStore: any,
  singleTabStore: any,
  settings: { theme?: string } = {},
  delay: number = 2000
) => {
  if (!isBrowser) return;
  
  // Clear existing timeout
  if (autosaveTimeout) {
    clearTimeout(autosaveTimeout);
  }
  
  // Schedule new save
  autosaveTimeout = setTimeout(() => {
    saveAppStateToLocalStorage(templateStore, multiTabStore, singleTabStore, settings);
  }, delay);
};

// Initialize auto-save on app start
export const initializeAutoSave = () => {
  if (!isBrowser) return null;
  
  // Load state on initialization
  const result = loadAppStateFromLocalStorage();
  return result;
}; 