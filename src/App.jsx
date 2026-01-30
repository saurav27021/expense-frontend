import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Logout from "./pages/Logout";
import UserLayout from "./components/UserLayout";

function App() {
  const [userDetails, setUserDetails] = useState(null);

  const isUserLoggedIn = async () => {
    try {
      const response = await axios.get("http://localhost:5001/auth/is-user-logged-in", {
        withCredentials: true,
      });
      setUserDetails(response.data.user);
    } catch (error) {
      console.log("Not logged in");
      setUserDetails(null);
    }
  };

  useEffect(() => {
    isUserLoggedIn();
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          userDetails ? (
            <Navigate to="/dashboard" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/login"
        element={
          userDetails ? (
            <Navigate to="/dashboard" />
          ) : (
            <Login setUser={setUserDetails} />
          )
        }
      />

      <Route
        path="/register"
        element={
          userDetails ? (
            <Navigate to="/dashboard" />
          ) : (
            <Register setUser={setUserDetails} />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          userDetails ? (
            <UserLayout>
              <Dashboard user={userDetails} />
            </UserLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/logout"
        element={
          userDetails ? (
            <Logout setUser={setUserDetails} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;
