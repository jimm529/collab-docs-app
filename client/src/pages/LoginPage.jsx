import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { AuthBackground, AuthIconBadge, AuthTitle, AuthButton, FormField, UserIcon, MailIcon, LockIcon } from '../components/authUi';

export default function LoginPage() {
  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthBackground>
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-sm px-8 py-10 flex flex-col items-center">
        <AuthIconBadge>
          <UserIcon />
        </AuthIconBadge>

        <AuthTitle>SIGN IN</AuthTitle>

        <p className="w-full -mt-4 mb-6 text-xs text-white/60 text-center">
          Use a seeded account: alice@example.com / bob@example.com / carol@example.com
        </p>

        <div className="w-full space-y-6">
          <FormField icon={<MailIcon />} value={email} onChange={setEmail} placeholder="Email ID" type="email" />
          <FormField
            icon={<LockIcon />}
            value={password}
            onChange={setPassword}
            placeholder="Password"
            type="password"
          />
        </div>

        {error && <p className="w-full mt-5 text-sm text-red-200 bg-red-900/30 border border-red-300/30 rounded px-3 py-2">{error}</p>}

        <AuthButton type="submit" disabled={loading}>
          {loading ? 'SIGNING IN...' : 'LOGIN'}
        </AuthButton>

        <p className="mt-6 text-sm text-white/70">
          Don't have an account?{' '}
          <Link to="/signup" className="text-white underline underline-offset-2">
            Sign up
          </Link>
        </p>
      </form>
    </AuthBackground>
  );
}
