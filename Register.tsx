import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import { addUserToFirestore } from "./repos/firestoreUsers";
import { createCompany } from "./repos/firestoreCompanies";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const role = 'admin';
  const navigate = useNavigate();

  // simple SHA-256 encoder to store a hash (client-side only, not truly secure)
  const hashPassword = async (pw: string) => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleRegister = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      const pwHash = await hashPassword(password);

      let companyId;
      if (role === 'admin') {
        companyId = crypto.randomUUID();
      }

      // store user record in Firestore with username and password_hash
      await addUserToFirestore({
        uid: user.uid,
        email: user.email,
        username: username || user.email?.split('@')[0] || 'user',
        password_hash: pwHash,
        role,
        companyId
      });

      if (role === 'admin' && companyId) {
        await createCompany({
          companyId,
          companyName: username ? `${username}'s Company` : 'My Company',
          adminId: user.uid,
          subscriptionId: ''
        });
      }

      // use unicode escape to avoid encoding issues
      alert("Account created successfully \u{1F389}");
      navigate("/");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 mb-4 border rounded-lg"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 border rounded-lg"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700"
        >
          Register
        </button>

        <p className="text-center text-sm text-neutral-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;