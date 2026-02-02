// src/pages/InviteVerify.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyExamInvite } from "../../api/examApi";
import "../../styles/InviteVerify.css";

const InviteVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const res = await verifyExamInvite(token);
        setData(res);
      } catch (err) {
        setError(
          err.response?.data?.message || "Invalid or expired invite link"
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchInvite();
    else {
      setError("Token missing");
      setLoading(false);
    }
  }, [token]);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Exam Invitation</h2>

        <p><strong>Name:</strong> {data.name}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Status:</strong> {data.status}</p>
        <p><strong>ACTION:</strong> {data.action}</p>

        <hr />

        {data.action === "LOGIN" && (
          <button onClick={() => navigate("/")}>
            Go to Login
          </button>
        )}

        {/* {data.action === "FIRST_LOGIN" && (
          <button onClick={() => navigate(`/first-login?token=${token}`)}>
            Set Password
          </button>
        )}

        {data.action === "EXAM_START" && (
          <button onClick={() => navigate(`/exam/start?token=${token}`)}>
            Start Exam
          </button>
        )} */}
      </div>
    </div>
  );
};

export default InviteVerify;
