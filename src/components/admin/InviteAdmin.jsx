import { useState } from "react";
import { inviteUser } from "../../api/adminUserApi";

function InviteAdmin() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleInviteSubmit = async (e) => {
    e.preventDefault();

    try {
      await inviteUser({
        email: email,
        name: name,
        role: "ADMIN",
        inviteExpiryHours: 1,
      });

      setMessage("Admin invitation sent successfully");
      setEmail("");
      setName("");
    } catch (error) {
      console.error(error);
      setMessage("Failed to send admin invitation");
    }
  };

  return (
    <div>
      <p>
        Invite a new administrator to the system. The invited admin will
        receive an email with an activation link.
      </p>

      <form onSubmit={handleInviteSubmit} className="admin-invite-form">
        <div>
          <label>Admin Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Admin Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <button type="submit">Send Invitation</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default InviteAdmin;