import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-500 to-purple-600">
      <div className="glass p-8 rounded-3xl shadow-2xl w-96 text-white">
        <h2 className="text-3xl font-bold mb-2 text-center">Welcome Back</h2>
        <p className="text-center text-white/70 mb-6">Sign in to your account</p>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
          onChange={(e) => setPassword(e.target.value)}
        />

        <p className="text-right mb-6">
          <Link to="/forgot-password" className="text-sm text-white/70 hover:text-white transition">
            Forgot password?
          </Link>
        </p>

        <button
          onClick={handleLogin}
          className="w-full bg-white text-indigo-600 font-semibold p-3 rounded-lg hover:bg-white/90 transition shadow-lg"
        >
          Login
        </button>

        <p className="text-center text-sm text-neutral-500 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;