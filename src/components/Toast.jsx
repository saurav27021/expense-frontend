import React, { useEffect } from 'react';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgClass = type === 'success' ? 'bg-success' : 'bg-danger';

    return (
        <div
            className={`toast-container position-fixed bottom-0 end-0 p-3`}
            style={{ zIndex: 1100 }}
        >
            <div className={`toast show align-items-center text-white ${bgClass} border-0 rounded-4 shadow-lg`} role="alert" aria-live="assertive" aria-atomic="true">
                <div className="d-flex p-3">
                    <div className="toast-body fw-bold">
                        <i className={`bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                        {message}
                    </div>
                    <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={onClose}></button>
                </div>
            </div>
        </div>
    );
};

export default Toast;
