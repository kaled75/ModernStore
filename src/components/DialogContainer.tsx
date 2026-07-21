import React from 'react';
import { useDialogStore } from '../store/useDialogStore';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const DialogContainer: React.FC = () => {
  const { alerts, confirmDialog, removeAlert, resolveConfirm } = useDialogStore();

  return (
    <>
      {/* Toasts Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border transition-all transform duration-300 ease-in-out ${
              alert.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : alert.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            {alert.type === 'success' && <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" />}
            {alert.type === 'error' && <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />}
            {alert.type === 'info' && <Info className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />}
            
            <p className="font-medium text-sm flex-grow">{alert.message}</p>
            
            <button
              onClick={() => removeAlert(alert.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4 text-gray-900">
                <div className="bg-primary-100 p-3 rounded-full text-primary-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">تأكيد الإجراء</h3>
              </div>
              <p className="text-gray-600 mb-8">{confirmDialog.message}</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => resolveConfirm(false)}
                  className="px-5 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => resolveConfirm(true)}
                  className="px-5 py-2.5 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-md shadow-primary-200"
                >
                  تأكيد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DialogContainer;
