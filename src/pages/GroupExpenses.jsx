import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { serverEndpoint } from "../config/appConfig";

// Modular Components
import ExpenseSummary from "../components/expenses/ExpenseSummary";
import ExpenseList from "../components/expenses/ExpenseList";
import AddExpenseModal from "../components/expenses/AddExpenseModal";
import PayModal from "../components/expenses/PayModal";

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
            if (includedMembers.length > 0) {
                const splitAmount = Math.floor((amount / includedMembers.length) * 100) / 100;
                const remainder = Number((amount - (splitAmount * includedMembers.length)).toFixed(2));

                let remainderHandled = false;
                finalSplitDetails = finalSplitDetails.map(m => {
                    if (m.excluded) return { ...m, amount: 0 };

                    let share = splitAmount;
                    if (!remainderHandled) {
                        share = Number((splitAmount + remainder).toFixed(2));
                        remainderHandled = true;
                    }
                    return { ...m, amount: share };
                });
            }
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
                <div className="col-lg-4">
                    <ExpenseSummary
                        group={group}
                        balances={balances}
                        p2pDebts={p2pDebts}
                        currentUser={user}
                        onAddExpense={() => setShowModal(true)}
                        onSettle={handleSettle}
                        onPay={openPayModal}
                    />
                </div>

                <div className="col-lg-8">
                    <ExpenseList
                        expenses={expenses}
                        currentUser={user}
                    />
                </div>
            </div>

            <AddExpenseModal
                show={showModal}
                group={group}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleAddExpense}
                onHide={() => setShowModal(false)}
                loading={modalLoading}
                currentUser={user}
                handleSplitTypeChange={handleSplitTypeChange}
                handleExclusionChange={handleExclusionChange}
                handleCustomAmountChange={handleCustomAmountChange}
            />

            <PayModal
                show={showPayModal}
                payData={payData}
                setPayData={setPayData}
                onSubmit={handlePaySubmit}
                onHide={() => setShowPayModal(false)}
                loading={modalLoading}
            />
        </div>
    );
}

export default GroupExpenses;
