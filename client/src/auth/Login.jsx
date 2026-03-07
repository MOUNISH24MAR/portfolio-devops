import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../context/CompanyContext";
import "./auth_css/Login.css";

const Login = ({ portalName }) => {
  const { company } = useCompany();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username", data.username);
        localStorage.setItem("role", data.role);

        // Role-based redirection
        if (data.role === "ADMIN") {
          navigate("/admin");
        } else if (data.role === "MANAGER") {
          navigate("/manager/dashboard");
        } else {
          setError("Unauthorized role.");
        }
      } else {
        setError(data.msg || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Unable to connect to service. Please try again later.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <header className="login-header">
          <h1>{company?.name || "V R fashions"}</h1>
          <p>{portalName || "Internal Operations Portal"}</p>
        </header>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Identity / Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              autoComplete="off"
              required
            />
          </div>

          <div className="form-group">
            <label>Secure Key / Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-btn">Verify & Enter</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
