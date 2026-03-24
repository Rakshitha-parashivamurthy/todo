import { useSearchParams } from "react-router-dom";
import { useState } from "react";

const AcceptInvite = () => {
  const [params] = useSearchParams();
  const inviteId = params.get("inviteId");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAccept = async () => {
    const res = await fetch("http://localhost:5000/api/users/complete-invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inviteId, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Account created! Now login.");
      window.location.href = "/login";
    } else {
      alert(data.error);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Accept Invitation</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Set Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleAccept}>Accept & Create Account</button>
    </div>
  );
};

export default AcceptInvite;