import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { API_URL } from "../apiConfig"; // ✅ MUST BE AT TOP

const AcceptInvite = () => {
  const [params] = useSearchParams();
  const inviteId = params.get("inviteId");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAccept = async () => {
    try {
      const res = await fetch(`${API_URL}/users/complete-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteId, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to accept invite");
      }

      alert("✅ Account created successfully!");
      console.log(data);
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Accept Invite</h2>

      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Set password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleAccept}>Accept Invite</button>
    </div>
  );
};

export default AcceptInvite;