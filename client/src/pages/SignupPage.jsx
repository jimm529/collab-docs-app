import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { AuthBackground, AuthIconBadge, AuthTitle, AuthButton, FormField, UserIcon, MailIcon, LockIcon } from '../components/authUi';

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
    <AuthBackground>
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-sm px-8 py-10 flex flex-col items-center">
        <AuthIconBadge>
          <UserIcon />
        </AuthIconBadge>

        <AuthTitle>CREATE ACCOUNT</AuthTitle>

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

        <AuthButton type="submit" disabled={loading}>
          {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
        </AuthButton>

        <p className="mt-6 text-sm text-white/70">
          Already have an account?{' '}
          <Link to="/login" className="text-white underline underline-offset-2">
            Log in
          </Link>
        </p>
      </form>
    </AuthBackground>
  );
}
