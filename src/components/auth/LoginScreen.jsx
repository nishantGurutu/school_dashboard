import React, { useRef, useState } from 'react';
import { Eye, EyeOff, GraduationCap, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';
import { Spinner } from '../ui/Spinner';

export const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const submittingRef = useRef(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password to continue.');
      return;
    }

    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setError('');
    setIsLoading(true);
    try {
      const user = await authService.login(email.trim(), password);
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      submittingRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-visual-panel" aria-label="EduDash school community">
        <div className="login-visual-overlay" />
        <div className="login-visual-content">
          <div className="login-visual-brand">
            <span className="login-brand-mark"><GraduationCap size={25} /></span>
            <span>EduDash</span>
          </div>
          <div>
            <p className="login-visual-kicker">SMARTER SCHOOL MANAGEMENT</p>
            <h1>Every learner.<br />Every milestone.</h1>
            <p className="login-visual-copy">Bring your school community together in one clear, connected place.</p>
          </div>
          <div className="login-visual-footer">
            <ShieldCheck size={17} /> Secure access for your school team
          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-wrap">
          <div className="login-mobile-brand">
            <span className="login-brand-mark"><GraduationCap size={22} /></span>
            <span>EduDash</span>
          </div>
          <div className="login-heading">
            <p className="login-eyebrow">ADMIN PORTAL</p>
            <h2>Welcome back <span aria-hidden="true">👋</span></h2>
            <p>Log in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label className="login-field-label" htmlFor="login-email">Email address <span>*</span></label>
            <div className="login-input-wrap">
              <Mail size={18} aria-hidden="true" />
              <input id="login-email" type="email" placeholder="Enter your email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
            </div>

            <div className="login-password-label-row">
              <label className="login-field-label" htmlFor="login-password">Password <span>*</span></label>
              <button type="button" className="login-forgot-link" onClick={() => setError('Please contact your school administrator to reset your password.')}>Forgot password?</button>
            </div>
            <div className="login-input-wrap">
              <LockKeyhole size={18} aria-hidden="true" />
              <input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
              <button type="button" className="login-password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            <div className="login-options">
              <label className="login-remember"><input type="checkbox" /><span>Remember me</span></label>
            </div>

            {error && <p className="login-error" role="alert">{error}</p>}
            <button type="submit" className="login-submit" disabled={isLoading}>
              {isLoading ? (<><Spinner size={16} color="#ffffff" /> Signing in...</>) : 'Log in'}{!isLoading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="login-help">Need help signing in? <a href="mailto:support@edudash.example">Contact support</a></p>
        </div>
      </section>
    </main>
  );
};