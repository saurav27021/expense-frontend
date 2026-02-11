import React from 'react';

function ExpenseList({ expenses, currentUser }) {
    return (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white py-3 border-0">
                <h5 className="fw-bold mb-0">Expense History</h5>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="px-4">Title</th>
                                <th className="text-center">Amount</th>
                                <th className="text-center">Paid By</th>
                                <th className="text-center">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted">
                                        No expenses found.
                                    </td>
                                </tr>
                            ) : (
                                expenses.map(exp => (
                                    <tr key={exp._id}>
                                        <td className="px-4">
                                            <div className="fw-bold text-dark">{exp.title}</div>
                                            <div className="extra-small text-muted">{exp.splitType} split</div>
                                        </td>
                                        <td className="text-center fw-bold">₹{exp.amount.toFixed(2)}</td>
                                        <td className="text-center small">{exp.paidBy === currentUser?.email ? "You" : exp.paidBy.split("@")[0]}</td>
                                        <td className="text-center small text-muted">
                                            {new Date(exp.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ExpenseList;
