import React from 'react';

function PayModal({ show, payData, setPayData, onSubmit, onHide, loading }) {
    if (!show) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-sm">
                <div className="modal-content border-0 shadow-lg rounded-4">
                    <form onSubmit={onSubmit}>
                        <div className="modal-header border-0 px-4 pt-4">
                            <h5 className="modal-title fw-bold">Pay {payData.toEmail.split('@')[0]}</h5>
                            <button type="button" className="btn-close shadow-none" onClick={onHide}></button>
                        </div>
                        <div className="modal-body px-4">
                            <p className="extra-small text-muted mb-3">Enter the amount you'd like to settle.</p>
                            <div className="mb-3 text-center p-3 rounded-4 bg-light">
                                <label className="form-label extra-small fw-bold text-uppercase text-muted d-block">Amount to pay</label>
                                <div className="d-flex align-items-center justify-content-center">
                                    <span className="h4 mb-0 me-1">₹</span>
                                    <input
                                        type="number"
                                        className="form-control form-control-lg bg-transparent border-0 shadow-none text-center fw-bold p-0"
                                        style={{ width: '120px' }}
                                        value={payData.amount}
                                        onChange={(e) => setPayData({ ...payData, amount: e.target.value })}
                                        max={payData.totalOwed}
                                        min="1"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <p className="extra-small text-primary mt-2 mb-0" onClick={() => setPayData({ ...payData, amount: payData.totalOwed.toString() })} style={{ cursor: 'pointer' }}>
                                    Total Owed: ₹{payData.totalOwed.toFixed(2)} (Click to pay all)
                                </p>
                            </div>
                            <p className="extra-small text-center text-muted">
                                <i className="bi bi-info-circle me-1"></i>
                                This is a simulated payment for tracking.
                            </p>
                        </div>
                        <div className="modal-footer border-0 px-4 pb-4">
                            <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={onHide}>Cancel</button>
                            <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm"></span> : "Confirm Payment"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PayModal;
