import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmButtonClass = "bg-red-600 hover:bg-red-700"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-4 text-gray-600">{message}</p>
        
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-3 ${confirmButtonClass} text-white rounded-md transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
