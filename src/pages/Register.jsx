import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { serverEndpoint } from "../config/appConfig";
import { useDispatch } from "react-redux";
import { SET_USER } from "../redux/user/action";

function Register() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validate = () => {
        let newErrors = {};
        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (!validate()) return;

        setLoading(true);
        setMessage("");
        setErrors({});

        try {
            const response = await axios.post(
                `${serverEndpoint}/auth/register`,
                formData,
                { withCredentials: true }
            );

            setMessage(response.data.message || "Registration successful!");

            dispatch({
                type: SET_USER,
                payload: response.data.user,
            });

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);
        } catch (error) {
            setErrors({
                message:
                    error.response?.data?.message ||
                    "Registration failed. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-dark">
                                    Create <span className="text-primary">Account</span>
                                </h2>
                                <p className="text-muted">
                                    Join MergeMoney to manage your finances
                                </p>
                            </div>

                            {(message || errors.message) && (
                                <div className={`alert ${message ? "alert-success" : "alert-danger"} py-2 small border-0 shadow-sm mb-4`}>
                                    <i className={`bi ${message ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"} me-2`}></i>
                                    {message || errors.message}
                                </div>
                            )}

                            <form onSubmit={handleFormSubmit} noValidate>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-secondary">
                                        Full Name
                                    </label>
                                    <input
                                        className={`form-control form-control-lg rounded-3 fs-6 ${errors.name ? "is-invalid" : ""
                                            }`}
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        placeholder="John Doe"
                                        onChange={handleChange}
                                    />
                                    {errors.name && (
                                        <div className="invalid-feedback">
                                            {errors.name}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-secondary">
                                        Email Address
                                    </label>
                                    <input
                                        className={`form-control form-control-lg rounded-3 fs-6 ${errors.email ? "is-invalid" : ""
                                            }`}
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        placeholder="name@example.com"
                                        onChange={handleChange}
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-secondary">
                                        Password
                                    </label>
                                    <input
                                        className={`form-control form-control-lg rounded-3 fs-6 ${errors.password ? "is-invalid" : ""
                                            }`}
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        placeholder="Min 6 characters"
                                        onChange={handleChange}
                                    />
                                    {errors.password && (
                                        <div className="invalid-feedback">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                <button
                                    className="btn btn-primary w-100 btn-md rounded-pill fw-bold shadow-sm mb-3"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Creating Account...
                                        </>
                                    ) : (
                                        "Register"
                                    )}
                                </button>

                                <div className="text-center mt-4 pt-2 border-top">
                                    <p className="text-muted small mb-0">
                                        Already have an account?{" "}
                                        <Link to="/login" className="text-primary fw-bold text-decoration-none">
                                            Login here
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
