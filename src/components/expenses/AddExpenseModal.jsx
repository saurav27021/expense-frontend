import React from 'react';

function AddExpenseModal({ show, group, formData, setFormData, onSubmit, onHide, loading, currentUser, handleSplitTypeChange, handleExclusionChange, handleCustomAmountChange }) {
    if (!show) return null;

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 rounded-4 shadow">
                    <form onSubmit={onSubmit}>
                        <div className="modal-header border-0 pt-4 px-4">
                            <h5 className="modal-title fw-bold">Add New Expense</h5>
                            <button type="button" className="btn-close shadow-none" onClick={onHide}></button>
                        </div>
                        <div className="modal-body px-4 py-4">
                            <div className="mb-3">
                                <label className="form-label extra-small fw-bold text-uppercase text-muted">Title</label>
                                <input
                                    type="text"
                                    className="form-control bg-light border-0 shadow-none"
                                    placeholder="e.g. Dinner"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label extra-small fw-bold text-uppercase text-muted">Amount</label>
                                <input
                                    type="number"
                                    className="form-control bg-light border-0 shadow-none"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label extra-small fw-bold text-uppercase text-muted">Paid By</label>
                                <select
                                    className="form-select bg-light border-0 shadow-none"
                                    value={formData.paidBy}
                                    onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                                >
                                    {group?.membersEmail.map(email => (
                                        <option key={email} value={email}>{email}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label extra-small fw-bold text-uppercase text-muted">Split Type</label>
                                <div className="btn-group w-100 shadow-none">
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${formData.splitType === 'equal' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => handleSplitTypeChange('equal')}
                                    >Equal</button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${formData.splitType === 'unequal' ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => handleSplitTypeChange('unequal')}
                                    >Unequal</button>
                                </div>
                            </div>

                            <div className="bg-light rounded-3 p-3">
                                <h6 className="extra-small fw-bold text-uppercase text-muted mb-3">Members Split</h6>
                                {formData.splitDetails.map((member) => (
                                    <div key={member.email} className="d-flex align-items-center mb-2 last-child-mb-0">
                                        <div className="form-check me-2">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={!member.excluded}
                                                onChange={() => handleExclusionChange(member.email)}
                                            />
                                        </div>
                                        <span className="small text-truncate flex-grow-1" style={{ maxWidth: '140px' }}>{member.email}</span>
                                        {formData.splitType === 'unequal' && !member.excluded && (
                                            <input
                                                type="number"
                                                className="form-control form-control-sm border-0 py-0 text-end"
                                                style={{ width: '80px', backgroundColor: 'transparent', borderBottom: '1px solid #dee2e6' }}
                                                placeholder="0"
                                                value={member.amount || ""}
                                                onChange={(e) => handleCustomAmountChange(member.email, e.target.value)}
                                            />
                                        )}
                                        {formData.splitType === 'equal' && !member.excluded && (
                                            <span className="small text-muted ms-auto">Split</span>
                                        )}
                                        {member.excluded && <span className="small text-danger ms-auto">Excluded</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer border-0 px-4 pb-4">
                            <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={onHide}>Cancel</button>
                            <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm"></span> : "Add Expense"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddExpenseModal;
