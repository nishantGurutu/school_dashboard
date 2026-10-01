import React, { useRef, useState } from 'react';
import { AlertCircle, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
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

    const trimmedInput = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedInput || !trimmedPassword) {
      setError('Please enter your email or user ID and password to continue.');
      return;
    }

    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setError('');
    setIsLoading(true);

    try {
      const result = await authService.login(trimmedInput, trimmedPassword);

      // STRICT VALIDATION: Navigate to dashboard ONLY if 200 success response returned
      if (result && result.success && result.user && result.user.userId) {
        onLogin(result.user);
      } else {
        // Under no circumstances navigate if response is not completely successful
        setError(result?.message || 'Invalid credentials');
      }
    } catch (err) {
      // Do NOT navigate. Show the API's exact message to the user
      const apiMessage = err.apiMessage || err.message || 'Invalid credentials';
      setError(apiMessage);
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
            <label className="login-field-label" htmlFor="login-email">Email or User ID <span>*</span></label>
            <div className="login-input-wrap">
              <Mail size={18} aria-hidden="true" />
              <input
                id="login-email"
                type="text"
                placeholder="Enter your email or user ID"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError('');
                }}
                autoComplete="username"
              />
            </div>

            <div className="login-password-label-row">
              <label className="login-field-label" htmlFor="login-password">Password <span>*</span></label>
              <button type="button" className="login-forgot-link" onClick={() => setError('Please contact your school administrator to reset your password.')}>Forgot password?</button>
            </div>
            <div className="login-input-wrap">
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError('');
                }}
                autoComplete="current-password"
              />
              <button type="button" className="login-password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            <div className="login-options">
              <label className="login-remember"><input type="checkbox" /><span>Remember me</span></label>
            </div>

            {error && (
              <div
                className="login-error-banner"
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#b91c1c',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  marginBottom: '18px',
                  lineHeight: 1.4
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, color: '#dc2626' }} />
                <span>{error}</span>
              </div>
            )}

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