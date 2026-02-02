import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { changePasswordFirstLogin } from "../../api/authApi";
import "../../styles/FirstLoginChangePassword.css";

function FirstLoginChangePassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔐 Validate token presence
  useEffect(() => {
    if (!token) {
      setError("Invalid or missing token");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await changePasswordFirstLogin(token, newPassword);

      alert("Password changed successfully ✅");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data || "Token expired or invalid. Please contact admin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="first-login-container">
      <form className="first-login-card" onSubmit={handleSubmit}>
        <h2>Set Your Password</h2>
        <p className="subtitle">
          This is your first login. Please create a new password.
        </p>

        {error && <div className="error-msg">{error}</div>}

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default FirstLoginChangePassword;
