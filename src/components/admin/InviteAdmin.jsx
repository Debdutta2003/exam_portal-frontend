// import { useState } from "react";
// import { inviteUser } from "../../api/adminUserApi";

// function InviteAdmin() {
//   const [email, setEmail] = useState("");
//   const [name, setName] = useState("");
//   const [message, setMessage] = useState("");

//   const handleInviteSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       await inviteUser({
//         email: email,
//         name: name,
//         role: "ADMIN",
//         inviteExpiryHours: 1,
//       });

//       setMessage("Admin invitation sent successfully");
//       setEmail("");
//       setName("");
//     } catch (error) {
//       console.error(error);
//       setMessage("Failed to send admin invitation");
//     }
//   };

//   return (
//     <div>
//       <p>
//         Invite a new administrator to the system. The invited admin will
//         receive an email with an activation link.
//       </p>

//       <form onSubmit={handleInviteSubmit} className="admin-invite-form">
//         <div>
//           <label>Admin Email</label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>

//         <div>
//           <label>Admin Name</label>
//           <input
//             type="text"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//           />
//         </div>

//         <button type="submit">Send Invitation</button>
//       </form>

//       {message && <p>{message}</p>}
//     </div>
//   );
// }

// export default InviteAdmin;


import { useState } from "react";
import { inviteUser } from "../../api/adminUserApi";
import "../../styles/InviteAdmin.css";

function InviteAdmin() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState("");

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      await inviteUser({
        email: email,
        name: name,
        role: "ADMIN",
        inviteExpiryHours: 1,
      });

      setMessage("✅ Admin invitation sent successfully! The invited admin will receive an email with activation link.");
      setMessageType("success");
      setEmail("");
      setName("");
    } catch (error) {
      console.error("Invite error:", error);
      setMessage(`❌ Failed to send admin invitation: ${error.response?.data?.message || error.message || "Unknown error"}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-invite-container">
      <div className="invite-header">
        <h1>Invite New Administrator</h1>
        <p>
          Invite a new administrator to the system. The invited admin will
          receive an email with an activation link valid for 1 hour.
        </p>
      </div>

      <div className="form-info">
        <h3>Information</h3>
        <ul>
          <li>Invitation link expires in 1 hour</li>
          <li>Admin will receive an email with activation instructions</li>
          <li>Make sure the email address is correct</li>
        </ul>
      </div>

      <form onSubmit={handleInviteSubmit} className="admin-invite-form">
        <div className="form-group">
          <label htmlFor="adminEmail">Admin Email</label>
          <input
            id="adminEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter admin email address"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="adminName">Admin Name</label>
          <input
            id="adminName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter admin full name"
            required
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          className="invite-btn"
          disabled={loading || !email || !name}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Sending Invitation...
            </>
          ) : (
            "Send Invitation"
          )}
        </button>
      </form>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default InviteAdmin;