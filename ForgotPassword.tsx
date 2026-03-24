import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || isLoading) return;
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setStatus('sent');
    } catch (e: any) {
      setError(e.message);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password?</h2>
        {status === 'sent' ? (
          <div className="text-center">
            <p className="text-green-600 font-bold mb-2">Email sent!</p>
            <p className="text-neutral-600 text-sm">
              Check your inbox for a reset link. Please wait a minute for it to arrive. <br /><br />
              <strong>Note:</strong> If you requested multiple links, only the <strong>most recent one</strong> will work.
            </p>
          </div>
        ) : (
          <>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 mb-4 border rounded-lg focus:outline-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !email}
              className={`w-full text-white p-3 rounded-lg transition-all ${
                isLoading || !email ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Sending...' : 'Send Reset Email'}
            </button>
            {status === 'error' && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
          </>
        )}
        <p className="text-center text-sm text-neutral-500 mt-4">
          Remembered?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}