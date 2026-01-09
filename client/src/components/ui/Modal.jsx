import React from "react";
import ReactDOM from "react-dom";

const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />

      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 p-6 z-50">
        <header className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </header>

        <div className="space-y-4">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
