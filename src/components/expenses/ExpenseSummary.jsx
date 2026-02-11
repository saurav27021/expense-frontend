import React from 'react';

function ExpenseSummary({ group, balances, p2pDebts, currentUser, onAddExpense, onSettle, onPay }) {
    return (
        <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
                {/* Member Balances Section */}
                <h6 className="fw-bold mb-3 small text-muted text-uppercase ls-1">Member Balances</h6>
                <div className="mb-4">
                    {group?.membersEmail.map(email => (
                        <div key={email} className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <p className="mb-0 fw-medium extra-small text-dark">{email === currentUser?.email ? "You" : email.split("@")[0]}</p>
                            </div>
                            <span className={`fw-bold extra-small ${balances[email] >= 0 ? 'text-success' : 'text-danger'}`}>
                                {balances[email] >= 0 ? `+₹${balances[email]?.toFixed(2)}` : `-₹${Math.abs(balances[email])?.toFixed(2)}`}
                            </span>
                        </div>
                    ))}
                </div>

                <h6 className="fw-bold mb-3 small text-muted text-uppercase ls-1">Who owes who</h6>
                {p2pDebts.length > 0 ? (
                    p2pDebts.map((debt, index) => {
                        const isIOwe = debt.from === currentUser?.email;

                        return (
                            <div key={index} className="d-flex justify-content-between align-items-center mb-3 p-2 border-bottom border-light">
                                <div>
                                    <p className="mb-0 fw-medium extra-small text-dark">
                                        {debt.from.split('@')[0]} owes {debt.to.split('@')[0]}
                                    </p>
                                    <p className="extra-small text-muted mb-0">
                                        {debt.from}
                                    </p>
                                </div>
                                <div className="text-end">
                                    <span className={`fw-bold d-block extra-small ${isIOwe ? 'text-danger' : 'text-success'}`}>
                                        ₹{debt.amount.toFixed(2)}
                                    </span>
                                    {isIOwe && (
                                        <button
                                            className="btn btn-sm btn-outline-primary extra-small py-0 px-2 mt-1 rounded-pill"
                                            onClick={() => onPay(debt.to, debt.amount)}
                                        >
                                            Pay
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-muted extra-small py-3">No pending individual debts.</p>
                )}

                <div className="mt-4 p-3 bg-light rounded-3">
                    <p className="extra-small text-muted mb-0">
                        <strong>How it works:</strong> <br />
                        Balance = (Money you paid) - (Your share). <br />
                        P2P Debts are simplified to show the easiest way for everyone to settle up.
                    </p>
                </div>
                <div className="d-grid gap-2 mt-4 pt-3 border-top">
                    <button className="btn btn-primary rounded-pill fw-bold" onClick={onAddExpense}>
                        <i className="bi bi-plus-lg me-2"></i> Add Expense
                    </button>
                    <button className="btn btn-outline-success rounded-pill fw-bold" onClick={onSettle}>
                        <i className="bi bi-check-all me-2"></i> Settle Group
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExpenseSummary;
