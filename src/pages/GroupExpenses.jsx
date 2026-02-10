import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { serverEndpoint } from "../config/appConfig";

function GroupExpenses() {
    const { groupId } = useParams();
    const user = useSelector((state) => state.userDetails);

    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState({});
    const [p2pDebts, setP2pDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state for adding expense
    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        paidBy: user?.email || "",
        splitType: "equal",
        splitDetails: []
    });

    // Modal state for payments
    const [showPayModal, setShowPayModal] = useState(false);
    const [payData, setPayData] = useState({
        toEmail: "",
        amount: "",
        totalOwed: 0
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [groupRes, expenseRes, summaryRes] = await Promise.all([
                axios.get(`${serverEndpoint}/group/${groupId}`, { withCredentials: true }),
                axios.get(`${serverEndpoint}/expense/group/${groupId}`, { withCredentials: true }),
                axios.get(`${serverEndpoint}/expense/summary/${groupId}`, { withCredentials: true })
            ]);

            setGroup(groupRes.data);
            setExpenses(expenseRes.data);
            setBalances(summaryRes.data.balances || {});
            setP2pDebts(summaryRes.data.p2pDebts || []);
            setError(null);

            // Initialize split details for modal
            if (groupRes.data) {
                setFormData(prev => ({
                    ...prev,
                    paidBy: user?.email || groupRes.data.membersEmail[0],
                    splitDetails: groupRes.data.membersEmail.map(email => ({
                        email,
                        amount: 0,
                        excluded: false
                    }))
                }));
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setError("Failed to load group data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [groupId]);

    const handleSplitTypeChange = (type) => {
        setFormData({ ...formData, splitType: type });
    };

    const handleExclusionChange = (email) => {
        setFormData(prev => ({
            ...prev,
            splitDetails: prev.splitDetails.map(member =>
                member.email === email ? { ...member, excluded: !member.excluded } : member
            )
        }));
    };

    const handleCustomAmountChange = (email, value) => {
        setFormData(prev => ({
            ...prev,
            splitDetails: prev.splitDetails.map(member =>
                member.email === email ? { ...member, amount: parseFloat(value) || 0 } : member
            )
        }));
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        setModalLoading(true);

        const amount = parseFloat(formData.amount);
        let finalSplitDetails = [...formData.splitDetails];

        if (formData.splitType === 'equal') {
            const includedMembers = finalSplitDetails.filter(m => !m.excluded);
            const splitAmount = amount / includedMembers.length;
            finalSplitDetails = finalSplitDetails.map(m => ({
                ...m,
                amount: m.excluded ? 0 : splitAmount
            }));
        }

        try {
            await axios.post(`${serverEndpoint}/expense/add`, {
                ...formData,
                amount,
                groupId,
                splitDetails: finalSplitDetails
            }, { withCredentials: true });

            setShowModal(false);
            setFormData({
                title: "",
                amount: "",
                paidBy: user?.email || "",
                splitType: "equal",
                splitDetails: group?.membersEmail.map(email => ({
                    email,
                    amount: 0,
                    excluded: false
                }))
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add expense");
        } finally {
            setModalLoading(false);
        }
    };

    const handleSettle = async () => {
        if (!window.confirm("Are you sure you want to settle all expenses? This will clear all balances.")) return;
        try {
            await axios.post(`${serverEndpoint}/expense/settle`, { groupId }, { withCredentials: true });
            fetchData();
        } catch (err) {
            alert("Failed to settle group");
        }
    };

    const handlePaySubmit = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        try {
            // Razorpay will be implemented here later
            await axios.post(`${serverEndpoint}/expense/record-payment`, {
                groupId,
                fromEmail: user?.email,
                toEmail: payData.toEmail,
                amount: parseFloat(payData.amount)
            }, { withCredentials: true });

            setShowPayModal(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || "Payment failed");
        } finally {
            setModalLoading(false);
        }
    };

    const openPayModal = (toEmail, amount) => {
        setPayData({
            toEmail,
            amount: amount.toString(),
            totalOwed: amount
        });
        setShowPayModal(true);
    };

    if (loading) return <div className="container py-5 text-center"><div className="spinner-border text-primary"></div></div>;
    if (error) return <div className="container py-5 text-center"><p className="text-danger">{error}</p></div>;

    return (
        <div className="container py-5">
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/dashboard">Groups</Link></li>
                    <li className="breadcrumb-item active">{group?.name}</li>
                </ol>
            </nav>

            <div className="row g-4">
                {/* Summary Section */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-4">
                            {/* User's Net Balance Header */}
                            <div className="text-center mb-4 p-3 rounded-4 bg-light">
                                <p className="extra-small text-muted mb-1 text-uppercase fw-bold ls-1">Your Total Balance</p>
                                <h3 className={`fw-bold mb-0 ${balances[user?.email] >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {balances[user?.email] >= 0 ? `+₹${balances[user?.email]?.toFixed(2)}` : `-₹${Math.abs(balances[user?.email])?.toFixed(2)}`}
                                </h3>
                                <p className="extra-small text-muted mt-1">
                                    {balances[user?.email] > 0 ? "Owed to you in total" : balances[user?.email] < 0 ? "You owe in total" : "All settled up!"}
                                </p>
                            </div>

                            <h6 className="fw-bold mb-3 small text-muted text-uppercase ls-1">Who owes who</h6>
                            {p2pDebts.length > 0 ? (
                                p2pDebts.map((debt, index) => {
                                    const isIOwe = debt.from === user?.email;
                                    const isOwedToMe = debt.to === user?.email;

                                    if (!isIOwe && !isOwedToMe) return null;

                                    return (
                                        <div key={index} className="d-flex justify-content-between align-items-center mb-3 p-2 border-bottom border-light">
                                            <div>
                                                <p className="mb-0 fw-medium small text-dark">
                                                    {isIOwe ? `You owe ${debt.to.split('@')[0]}` : `${debt.from.split('@')[0]} owes you`}
                                                </p>
                                                <p className="extra-small text-muted mb-0">
                                                    {isIOwe ? debt.to : debt.from}
                                                </p>
                                            </div>
                                            <div className="text-end">
                                                <span className={`fw-bold d-block small ${isIOwe ? 'text-danger' : 'text-success'}`}>
                                                    ₹{debt.amount.toFixed(2)}
                                                </span>
                                                {isIOwe && (
                                                    <button
                                                        className="btn btn-sm btn-outline-primary extra-small py-0 px-2 mt-1 rounded-pill"
                                                        onClick={() => openPayModal(debt.to, debt.amount)}
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
                                <button className="btn btn-primary rounded-pill fw-bold" onClick={() => setShowAddModal(true)} style={{ display: 'none' }}>Hidden</button>
                                <button className="btn btn-primary rounded-pill fw-bold" onClick={() => setShowModal(true)}>
                                    <i className="bi bi-plus-lg me-2"></i> Add Expense
                                </button>
                                <button className="btn btn-outline-success rounded-pill fw-bold" onClick={handleSettle}>
                                    <i className="bi bi-check-all me-2"></i> Settle Group
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expense List */}
                <div className="col-lg-8">
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
                                                    <td className="text-center small">{exp.paidBy === user?.email ? "You" : exp.paidBy.split("@")[0]}</td>
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
                </div>
            </div>

            {/* Add Expense Modal */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow">
                            <form onSubmit={handleAddExpense}>
                                <div className="modal-header border-0 pt-4 px-4">
                                    <h5 className="modal-title fw-bold">Add New Expense</h5>
                                    <button type="button" className="btn-close shadow-none" onClick={() => setShowModal(false)}></button>
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
                                        {formData.splitDetails.map((member, idx) => (
                                            <div key={member.email} className="d-flex align-items-center mb-2 last-child-mb-0">
                                                <div className="form-check me-2">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={!member.excluded}
                                                        onChange={() => handleExclusionChange(member.email)}
                                                        disabled={formData.splitType === 'unequal' && member.excluded} // Optional constraint
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
                                    <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" disabled={modalLoading}>
                                        {modalLoading ? <span className="spinner-border spinner-border-sm"></span> : "Add Expense"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Payment Modal */}
            {showPayModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <form onSubmit={handlePaySubmit}>
                                <div className="modal-header border-0 px-4 pt-4">
                                    <h5 className="modal-title fw-bold">Pay {payData.toEmail.split('@')[0]}</h5>
                                    <button type="button" className="btn-close shadow-none" onClick={() => setShowPayModal(false)}></button>
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
                                        {/* Razorpay integration will be added here later */}
                                        This is a simulated payment for tracking.
                                    </p>
                                </div>
                                <div className="modal-footer border-0 px-4 pb-4">
                                    <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setShowPayModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" disabled={modalLoading}>
                                        {modalLoading ? <span className="spinner-border spinner-border-sm"></span> : "Confirm Payment"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GroupExpenses;
