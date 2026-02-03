import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Register({ setUser }) {
    const navigate = useNavigate();
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

            
            if (setUser) {
                setUser(response.data.user);
            }

            setTimeout(() => {
                navigate("/dashboard");
            }, 1500);

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
        <div className="container mt-5" >
            <div className="card shadow-sm">
                <div className="card-body">
                    <h3 className="card-title text-center mb-4">Create Account</h3>

                    {errors.message && (
                        <div className="alert alert-danger">{errors.message}</div>
                    )}

                    {message && (
                        <div className="alert alert-success">{message}</div>
                    )}

                    <form onSubmit={handleFormSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Full Name</label>
                            <input
                                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                type="text"
                                name="name"
                                value={formData.name}
                                placeholder="John Doe"
                                onChange={handleChange}
                            />
                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Email Address</label>
                            <input
                                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                type="email"
                                name="email"
                                value={formData.email}
                                placeholder="name@example.com"
                                onChange={handleChange}
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input
                                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                                type="password"
                                name="password"
                                value={formData.password}
                                placeholder="Min 6 characters"
                                onChange={handleChange}
                            />
                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                        </div>

                        <button
                            className="btn btn-primary w-100 mb-3"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Register"}
                        </button>

                        <div className="text-center">
                            <span>Already have an account? </span>
                            <Link to="/login">Login here</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
