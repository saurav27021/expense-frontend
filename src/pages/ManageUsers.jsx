import { useEffect, useState } from "react";
import { serverEndpoint } from "../config/appConfig";
import axios from "axios";
import Can from "../components/Can";
import { usePermission } from "../rbac/userPermissions";

function ManageUsers() {
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const permissions = usePermission();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "Select",
    });

    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${serverEndpoint}/rbac/`, {
                withCredentials: true,
            });
            setUsers(response.data);
        } catch (error) {
            console.log(error);
            setErrors({ message: "Unable to fetch users, please try again" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validate = () => {
        let isValid = true;
        let newErrors = {};

        if (formData.name.trim().length === 0) {
            isValid = false;
            newErrors.name = "Name is required";
        }

        if (!isEditMode && formData.email.trim().length === 0) {
            isValid = false;
            newErrors.email = "Email is required";
        }

        if (formData.role === "Select") {
            isValid = false;
            newErrors.role = "Role is required";
        }

        setErrors(newErrors);
        return isValid;
    };

    const resetForm = () => {
        setFormData({ name: "", email: "", role: "Select" });
        setIsEditMode(false);
        setEditingUserId(null);
        setErrors({});
        setMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            setActionLoading(true);
            try {
                if (isEditMode) {
                    const response = await axios.patch(
                        `${serverEndpoint}/rbac/`,
                        {
                            userId: editingUserId,
                            name: formData.name,
                            role: formData.role,
                        },
                        { withCredentials: true }
                    );
                    const updatedUser = response.data;
                    console.log("User updated successfully, response:", updatedUser);
                    setUsers(users.map(u => (u._id || u.id) === editingUserId ? updatedUser : u));
                    setMessage("User updated successfully!");
                } else {
                    const response = await axios.post(
                        `${serverEndpoint}/rbac/`,
                        {
                            name: formData.name,
                            email: formData.email,
                            role: formData.role,
                        },
                        { withCredentials: true }
                    );
                    setUsers([...users, response.data.user]);
                    setMessage("User added successfully!");
                }
                setTimeout(() => resetForm(), 2000);
            } catch (error) {
                console.log(error);
                setErrors({ message: isEditMode ? "Unable to update user" : "Unable to add user" });
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleEditClick = (user) => {
        setIsEditMode(true);
        const actualId = user._id || user.id;
        setEditingUserId(actualId);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
        });
        setErrors({});
        setMessage(null);
    };

    const handleDelete = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.post(
                    `${serverEndpoint}/rbac/delete`,
                    { userId },
                    { withCredentials: true }
                );
                setUsers(users.filter((user) => (user._id || user.id) !== userId));
                setMessage("User deleted successfully!");
                setTimeout(() => setMessage(null), 3000);
            } catch (error) {
                console.log(error);
                setErrors({ message: "Unable to delete user" });
            }
        }
    };

    if (loading) {
        return (
            <div className="container p-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5 px-4 px-md-5">
            <div className="row align-items-center mb-5">
                <div className="col-md-8 text-center text-md-start mb-3 mb-md-0">
                    <h2 className="fw-bold text-dark display-6">
                        Manage <span className="text-primary">Users</span>
                    </h2>
                    <p className="text-muted mb-0">
                        View and manage all the users along with their permissions
                    </p>
                </div>
            </div>

            {errors.message && (
                <div className="alert alert-danger shadow-sm border-0 mb-4" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {errors.message}
                </div>
            )}

            {message && (
                <div className="alert alert-success shadow-sm border-0 mb-4" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {message}
                </div>
            )}

            <div className="row g-4">
                {/* Form Section */}
                <Can requiredPermission="canCreateUsers">
                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 rounded-4 p-2">
                            <div className="card-header bg-white border-0 pt-4 pb-0">
                                <h5 className="fw-bold mb-0">
                                    {isEditMode ? "Update Member" : "Add Team Member"}
                                </h5>
                                <p className="text-muted small mb-0">
                                    {isEditMode ? "Modify account details and role." : "Invite a new member to your team."}
                                </p>
                            </div>
                            <div className="card-body py-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className={`form-control form-control-lg bg-light border-0 fs-6 ${errors.name ? "is-invalid" : ""}`}
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="e.g. John Doe"
                                        />
                                        {errors.name && <div className="invalid-feedback ps-1">{errors.name}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className={`form-control form-control-lg bg-light border-0 fs-6 ${errors.email ? "is-invalid" : ""}`}
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="email@example.com"
                                            disabled={isEditMode}
                                        />
                                        {errors.email && <div className="invalid-feedback ps-1">{errors.email}</div>}
                                        {isEditMode && <small className="text-muted ms-1">Email cannot be changed.</small>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">Assign Role</label>
                                        <select
                                            name="role"
                                            className={`form-select form-select-lg bg-light border-0 fs-6 ${errors.role ? "is-invalid" : ""}`}
                                            value={formData.role}
                                            onChange={handleChange}
                                        >
                                            <option value="Select">Choose a role...</option>
                                            <option value="admin">Admin (Full Access)</option>
                                            <option value="manager">Manager (Can Update)</option>
                                            <option value="viewer">Viewer (Read Only)</option>
                                        </select>
                                        {errors.role && <div className="invalid-feedback ps-1">{errors.role}</div>}
                                    </div>

                                    <div className="d-grid gap-2">
                                        <button type="submit" className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm" disabled={actionLoading}>
                                            {actionLoading ? (
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            ) : (
                                                isEditMode ? "Save Changes" : "Create Account"
                                            )}
                                        </button>
                                        {isEditMode && (
                                            <button type="button" className="btn btn-link text-secondary text-decoration-none fw-medium" onClick={resetForm}>
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </Can>

                {/* Grid Section */}
                <div className={permissions.canCreateUsers ? "col-lg-8" : "col-12"}>
                    <div className="row g-3">
                        {users.length === 0 ? (
                            <div className="col-12 text-center py-5 bg-light rounded-4 border border-dashed">
                                <i className="bi bi-people display-4 text-muted opacity-25 d-block mb-3"></i>
                                <h5 className="fw-bold text-secondary">No team members yet</h5>
                                <p className="text-muted mb-0">Start by adding your first team member.</p>
                            </div>
                        ) : (
                            users.map((u) => (
                                <div className="col-md-6" key={u._id}>
                                    <div className="card h-100 border-0 shadow-sm rounded-4 transition-hover">
                                        <div className="card-body p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="d-flex align-items-center">
                                                    <div
                                                        className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold me-3 shadow-sm"
                                                        style={{ width: "48px", height: "48px", fontSize: "1.2rem" }}
                                                    >
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h6 className="fw-bold mb-0 text-dark">{u.name}</h6>
                                                        <span className="text-muted small">{u.email}</span>
                                                    </div>
                                                </div>
                                                <span className={`badge rounded-pill px-3 py-2 border-0 ${u.role === 'admin' ? 'bg-primary bg-opacity-10 text-primary' :
                                                    (u.role === 'manager' ? 'bg-info bg-opacity-10 text-info' : 'bg-secondary bg-opacity-10 text-secondary')
                                                    } small fw-bold text-uppercase`}>
                                                    {u.role}
                                                </span>
                                            </div>

                                            <div className="d-flex gap-2 border-top pt-3 mt-3">
                                                <Can requiredPermission="canUpdateUsers">
                                                    <button
                                                        className="btn btn-light btn-sm flex-grow-1 rounded-pill fw-bold text-primary border-0"
                                                        onClick={() => handleEditClick(u)}
                                                    >
                                                        <i className="bi bi-pencil-square me-1"></i> Edit
                                                    </button>
                                                </Can>
                                                <Can requiredPermission="canDeleteUsers">
                                                    <button
                                                        className="btn btn-light btn-sm flex-grow-1 rounded-pill fw-bold text-danger border-0"
                                                        onClick={() => handleDelete(u._id)}
                                                    >
                                                        <i className="bi bi-trash me-1"></i> Remove
                                                    </button>
                                                </Can>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManageUsers;
