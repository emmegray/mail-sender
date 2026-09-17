import React, { useEffect, useMemo, useRef, useState } from 'react';
import EmailForm from './components/EmailForm.jsx';
import HtmlDropzone from './components/HtmlDropzone.jsx';
import axios from 'axios';
import netlifyIdentity from 'netlify-identity-widget';

const defaultHtml = `<!-- Drop your DEM HTML or paste here -->
<h1 style="font-family:Arial,sans-serif">Hello!</h1>
<p>This is a test email.</p>`;

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
const DELIVERY_GIF_URL = 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzV1Y2Jsd3NmbHJnM2xmNjJ5ZWhmazBkeW1teDRyemE4NzAzejk3bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/sIayC6DgB9QOsPj4jd/giphy.gif';
const DELIVERY_SUCCESS_GIF_URL = 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDJobmtyNWdqc3ZlMnh5Ym15ZnJ1Yjg4bmJ4d2MwbmI4ZDNpaXRldSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/XTy2LXPJDaCTvCH859/giphy.gif';
const DELIVERY_FAILURE_GIF_URL = 'https://i.imgur.com/4pftrxu.gif';
const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

const getSendErrorMessage = (err) => {
  const response = err?.response?.data;
  const details = response?.details;
  const serializedDetails = JSON.stringify(details || response?.message || err?.message || '').toLowerCase();

  if (serializedDetails.includes('pass') && (serializedDetails.includes('required') || serializedDetails.includes('too_small'))) {
    return 'Enter an SMTP password with at least 8 characters.';
  }

  if (/invalid login|authentication|auth|535|password.*(wrong|incorrect|invalid)/i.test(serializedDetails)) {
    return 'The SMTP password is incorrect. Check your app password and try again.';
  }

  if (response?.error === 'VALIDATION_ERROR') {
    return 'Check your details: email addresses, recipients, and SMTP settings must be valid.';
  }

  return response?.message || err?.message || 'An error occurred while sending the email.';
};

export default function App() {
  const [html, setHtml] = useState(defaultHtml);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [user, setUser] = useState(null);
  const [identityReady, setIdentityReady] = useState(false);
  const [identityError, setIdentityError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const captchaContainerRef = useRef(null);
  const captchaWidgetRef = useRef(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const [form, setForm] = useState(() => {
    // Load from localStorage (without password!)
    const saved = JSON.parse(localStorage.getItem('emailTesterForm') || '{}');
    return {
      // Transport (default Gmail)
      mode: saved.mode || 'service', // 'service' | 'custom'
      service: saved.service || 'gmail',
      host: saved.host || '',
      port: saved.port || 587,
      secure: saved.secure ?? false,

      // Auth
      user: saved.user || '',       // (not sensitive, ok to save if you want)
      pass: '',                     // NEVER saved

      // Email
      fromName: saved.fromName || 'Test DEM',
      fromEmail: saved.fromEmail || saved.user || '',
      toAddresses: saved.toAddresses || '',
      subject: saved.subject || 'Test DEM HTML',
      text: saved.text || ''
    };
  });

  useEffect(() => {
    const handleLogin = (loggedInUser) => {
      setUser(loggedInUser);
      netlifyIdentity.close();
    };
    const handleLogout = () => setUser(null);
    const handleIdentityError = () => {
      setIdentityError('Netlify Identity is not available on this address. Enable Identity on the Netlify site or run the app with netlify dev.');
      setIdentityReady(true);
    };

    netlifyIdentity.on('login', handleLogin);
    netlifyIdentity.on('logout', handleLogout);
    netlifyIdentity.on('error', handleIdentityError);
    netlifyIdentity.init();
    setUser(netlifyIdentity.currentUser());
    setIdentityReady(true);

    return () => {
      netlifyIdentity.off('login', handleLogin);
      netlifyIdentity.off('logout', handleLogout);
      netlifyIdentity.off('error', handleIdentityError);
    };
  }, []);

  useEffect(() => {
    if (!user || !HCAPTCHA_SITE_KEY || !captchaContainerRef.current) return undefined;

    let script = document.querySelector('script[src="https://js.hcaptcha.com/1/api.js"]');
    const renderCaptcha = () => {
      if (!captchaContainerRef.current || captchaWidgetRef.current !== null || !window.hcaptcha) return;
      captchaWidgetRef.current = window.hcaptcha.render(captchaContainerRef.current, {
        sitekey: HCAPTCHA_SITE_KEY,
        callback: setCaptchaToken,
        'expired-callback': () => setCaptchaToken(''),
        'error-callback': () => setCaptchaError('CAPTCHA could not be loaded. Please try again.')
      });
    };

    if (!script) {
      script = document.createElement('script');
      script.src = 'https://js.hcaptcha.com/1/api.js';
      script.async = true;
      script.defer = true;
      script.onload = renderCaptcha;
      document.head.appendChild(script);
    } else {
      renderCaptcha();
    }

    return () => {
      if (captchaWidgetRef.current !== null && window.hcaptcha) {
        window.hcaptcha.reset(captchaWidgetRef.current);
      }
      captchaWidgetRef.current = null;
      setCaptchaToken('');
    };
  }, [user]);

  // Save (except pass) on every change
  const persist = (next) => {
    const toSave = { ...next };
    delete toSave.pass;
    localStorage.setItem('emailTesterForm', JSON.stringify(toSave));
  };

  // Apply the theme to the DOM
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Inject styling CSS into the preview based on the theme
  const getStyledHtml = (htmlContent) => {
    const styles = theme === 'dark' 
      ? `<style>body { background: #1e293b; color: #f1f5f9; font-family: Arial, sans-serif; }</style>`
      : `<style>body { background: #ffffff; color: #111827; font-family: Arial, sans-serif; }</style>`;
    return styles + htmlContent;
  };

  const update = (patch) => {
    const next = { ...form, ...patch };
    setForm(next);
    persist(next);
  };

  const toList = useMemo(() =>
    form.toAddresses.split(',')
      .map(s => s.trim())
      .filter(Boolean), [form.toAddresses]
  );

  const handleSend = async () => {
    if (!user) {
      setResult({ ok: false, recipients: toList, details: 'Please sign in before sending email.' });
      return;
    }
    if (!HCAPTCHA_SITE_KEY || !captchaToken) {
      setResult({ ok: false, recipients: toList, details: 'Please complete the CAPTCHA before sending.' });
      return;
    }

    setSending(true);
    setResult({ ok: null, recipients: toList });
    try {
      const transportConfig =
        form.mode === 'service'
          ? { service: form.service, user: form.user, pass: form.pass }
          : { host: form.host, port: Number(form.port), secure: Boolean(form.secure), user: form.user, pass: form.pass };

      // Gmail: FROM deve combaciare con USER
      if (form.service === 'gmail' && form.mode === 'service' && form.fromEmail !== form.user) {
        throw new Error('With Gmail, the sender must match the SMTP user.');
      }

      const payload = {
        transportConfig,
        fromName: form.fromName,
        fromEmail: form.fromEmail,
        toAddresses: toList,
        subject: form.subject,
        html,
        text: form.text || undefined
      };

      const identityToken = await user.jwt();

      const { data } = await axios.post(`${API_URL}/api/send`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${identityToken}`,
          'X-HCaptcha-Token': captchaToken
        }
      });

      setResult({ ok: data.ok, recipients: toList, results: data.results });
    } catch (err) {
      setResult({
        ok: false,
        recipients: toList,
        details: getSendErrorMessage(err)
      });
    } finally {
      setSending(false);
      if (captchaWidgetRef.current !== null && window.hcaptcha) {
        window.hcaptcha.reset(captchaWidgetRef.current);
      }
      setCaptchaToken('');
    }
  };

  if (!identityReady) return <div className="auth-screen">Loading secure access…</div>;

  if (!user) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h1>DEM Email Tester</h1>
          {identityError ? (
            <p className="auth-error">{identityError}</p>
          ) : (
            <>
              <p>Sign in to access the email tester.</p>
              <button className="send-btn" onClick={() => netlifyIdentity.open('login')}>Sign in</button>
              <button className="auth-link" onClick={() => netlifyIdentity.open('signup')}>Create an account</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      <button className="logout-btn" onClick={() => netlifyIdentity.logout()}>Sign out</button>

      <h1>DEM Email Tester</h1>
      <p className="subtitle">Send your HTML marketing emails to real inboxes (Outlook, Gmail, iCloud...).</p>

      <div className="grid">
        <div className="panel">
          <EmailForm
            form={form}
            onChange={update}
            onSend={handleSend}
            sending={sending}
            captchaContainerRef={captchaContainerRef}
            captchaEnabled={Boolean(HCAPTCHA_SITE_KEY)}
            captchaError={captchaError}
          />
          {result && (
            <div className={`result ${result.ok === null ? 'sending' : result.ok ? 'ok' : 'err'}`}>
              <div className="delivery-scene" aria-hidden="true">
                <div className={`delivery-gif-slot ${result.ok === null ? 'sending' : result.ok ? 'success' : 'failure'}`}>
                  {result.ok === null && <img className="delivery-gif" src={DELIVERY_GIF_URL} alt="" />}
                  {result.ok === true && <img className="delivery-gif" src={DELIVERY_SUCCESS_GIF_URL} alt="" />}
                  {result.ok === false && <img className="delivery-gif" src={DELIVERY_FAILURE_GIF_URL} alt="" />}
                </div>
                {result.ok !== null && (
                  <span className={`delivery-mark ${result.ok ? 'success' : 'failure'}`}>
                    {result.ok ? '✓' : '×'}
                  </span>
                )}
              </div>
              <div className="result-copy">
                <strong>
                  {result.ok === null ? 'Sending…' : result.ok ? 'Email sent' : 'Sending failed'}
                </strong>
                <span>
                  {result.ok === null ? 'Sending to' : result.ok ? 'Email sent to' : 'Problem sending to'}:{' '}
                  {result.recipients?.join(', ') || 'no recipients'}
                </span>
                {result.ok === false && <small>{result.details}</small>}
              </div>
            </div>
          )}
        </div>

        <div className="panel">
          <HtmlDropzone html={html} setHtml={setHtml} />
          <div className="preview">
            <div className="preview-header">Preview</div>
            <iframe
              title="email-preview"
              sandbox="allow-same-origin"
              srcDoc={getStyledHtml(html)}
              style={{ width: '100%', height: 400, border: `1px solid var(--border)` }}
            />
          </div>

          <button className="send-btn" onClick={handleSend} disabled={sending || !html || toList.length === 0}>
            {sending ? 'Sending…' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
}