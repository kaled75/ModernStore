import { create } from 'zustand';

export type AlertType = 'success' | 'error' | 'info';

export interface AlertMessage {
  id: string;
  message: string;
  type: AlertType;
}

export interface ConfirmDialog {
  message: string;
  resolve: (value: boolean) => void;
}

interface DialogState {
  alerts: AlertMessage[];
  confirmDialog: ConfirmDialog | null;
  
  showAlert: (message: string, type?: AlertType) => void;
  removeAlert: (id: string) => void;
  
  showConfirm: (message: string) => Promise<boolean>;
  resolveConfirm: (value: boolean) => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  alerts: [],
  confirmDialog: null,

  showAlert: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      alerts: [...state.alerts, { id, message, type }]
    }));

    // Auto remove after 4 seconds
    setTimeout(() => {
      set((state) => ({
        alerts: state.alerts.filter((alert) => alert.id !== id)
      }));
    }, 4000);
  },

  removeAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id)
    }));
  },

  showConfirm: (message) => {
    return new Promise<boolean>((resolve) => {
      set({ confirmDialog: { message, resolve } });
    });
  },

  resolveConfirm: (value) => {
    set((state) => {
      if (state.confirmDialog) {
        state.confirmDialog.resolve(value);
      }
      return { confirmDialog: null };
    });
  }
}));
