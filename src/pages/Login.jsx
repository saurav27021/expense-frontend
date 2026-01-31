import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
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
  // throw an error during login when a user who registered via Google SSO attempts to authenticate using a ausername and password . Handle this error on the UI by displaying a clear message :"please login using google sso"


  const handleGoogleSuccess = async (authResponse) => {
    try {
      const body = {
        idToken: authResponse?.credential,
      };

      const response = await axios.post('http://localhost:5001/auth/google-auth', body, { withCredentials: true });
      setUser(response.data.user);
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      setErrors({ message: "error occured" });
    }


  }

  const handleGoogleFaliure = (error) => {
    console.log(error);
    setErrors({
      message: "something went wrong while performing google single sign-on"
    });

  }

  return (
    <div className="container text-center">
      <h3>Login to continue</h3>

      {errors.message && (
        <div className="alert alert-danger">{errors.message}</div>
      )}

      {message && (
        <div className="alert alert-success">{message}</div>
      )}
      <div className="row justify-content-center">
        <div className="col-6 justify-content-center">

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
      </div>
      <div className="row justify-content-center">
        <div className="col-6">
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFaliure} />

          </GoogleOAuthProvider>

        </div>
      </div>
    </div>
  );
}

export default Login;
