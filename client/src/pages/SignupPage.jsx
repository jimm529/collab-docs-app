import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = await api.signup(name, email, password);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#1b3a6b]">
      {/* Blurred gradient background blobs, matching the reference's soft blue glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 w-[32rem] h-[32rem] rounded-full bg-sky-400/40 blur-[110px]" />
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-blue-600/50 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/4 w-[28rem] h-[28rem] rounded-full bg-indigo-500/40 blur-[120px]" />
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-sm px-8 py-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-[#0b2654] border border-white/20 flex items-center justify-center mb-5 shadow-lg">
          <UserIcon />
        </div>

        <h1 className="text-white/90 text-lg tracking-[0.25em] font-light mb-8">CREATE ACCOUNT</h1>

        <div className="w-full space-y-6">
          <FormField icon={<UserIcon small />} value={name} onChange={setName} placeholder="Full Name" type="text" />
          <FormField icon={<MailIcon />} value={email} onChange={setEmail} placeholder="Email ID" type="email" />
          <FormField
            icon={<LockIcon />}
            value={password}
            onChange={setPassword}
            placeholder="Password"
            type="password"
          />
          <FormField
            icon={<LockIcon />}
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm Password"
            type="password"
          />
        </div>

        {error && <p className="w-full mt-5 text-sm text-red-200 bg-red-900/30 border border-red-300/30 rounded px-3 py-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 bg-[#0b2654] hover:bg-[#0f3270] text-white tracking-[0.2em] text-sm font-medium py-3 transition-colors disabled:opacity-50"
        >
          {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
        </button>

        <p className="mt-6 text-sm text-white/70">
          Already have an account?{' '}
          <Link to="/login" className="text-white underline underline-offset-2">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

function FormField({ icon, value, onChange, placeholder, type }) {
  return (
    <div className="flex items-end gap-3 border-b border-white/40 pb-2">
      <span className="text-white/80">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="flex-1 bg-transparent text-white placeholder-white/60 focus:outline-none text-[15px]"
      />
    </div>
  );
}

function UserIcon({ small }) {
  const size = small ? 18 : 34;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
