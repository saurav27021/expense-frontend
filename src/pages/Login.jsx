import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    let newError = {};
    let isValid = true;

    if (!formData.email) {
      newError.email = "Email is required";
      isValid = false;
    }

    if (!formData.password) {
      newError.password = "Password is required";
      isValid = false;
    }

    setErrors(newError);
    return isValid;
  };

  /* ================= LOGIN ================= */
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      const response = await axios.post(
        "http://localhost:5001/auth/login",
        formData,
        { withCredentials: true }
      );

      setMessage(response.data.message || "Login successful");
      setErrors({});

      // Set user details and redirect
      if (setUser) {
        setUser(response.data.user || { email: formData.email });
      }
      navigate("/dashboard");
    } catch (error) {
      setErrors({
        message:
          error.response?.data?.message ||
          "Something went wrong. Please try again later",
      });
      setMessage("");
    }
  };

  /* ================= REGISTER (TEMP) ================= */
  const registerFirstUser = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5001/auth/register",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      alert(response.data.message);
    } catch (error) {
      console.log("LOGIN ERROR FULL:", error);
      console.log("LOGIN ERROR RESPONSE:", error.response);

      setErrors({
        message:
          error.response?.data?.message ||
          error.message ||
          "Login failed",
      });
      setMessage("");
    }

  };

  return (
    <div className="container text-center">
      <h3>Login to continue</h3>

      {errors.message && (
        <div className="alert alert-danger">{errors.message}</div>
      )}

      {message && (
        <div className="alert alert-success">{message}</div>
      )}

      <form onSubmit={handleFormSubmit}>
        <div className="mb-3">
          <label>Email:</label>
          <input
            className="form-control"
            type="email"
            name="email"
            value={formData.email}
            placeholder="Enter email"
            onChange={handleChange}
          />
          {errors.email && (
            <div className="text-danger">{errors.email}</div>
          )}
        </div>

        <div className="mb-3">
          <label>Password:</label>
          <input
            className="form-control"
            type="password"
            name="password"
            value={formData.password}
            placeholder="Enter password"
            onChange={handleChange}
          />
          {errors.password && (
            <div className="text-danger">{errors.password}</div>
          )}
        </div>

        <button className="btn btn-primary w-100 mb-3" type="submit">
          Login
        </button>

        <div className="text-center">
          <span>Don't have an account? </span>
          <Link to="/register">Register here</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
