import React, { useMemo, useState } from 'react';
import EmailForm from './components/EmailForm.jsx';
import HtmlDropzone from './components/HtmlDropzone.jsx';
import axios from 'axios';

const defaultHtml = `<!-- Drop your DEM HTML or paste here -->
<h1 style="font-family:Arial,sans-serif">Hello!</h1>
<p>This is a test email.</p>`;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [html, setHtml] = useState(defaultHtml);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const [form, setForm] = useState(() => {
    // Carica dal localStorage (senza password!)
    const saved = JSON.parse(localStorage.getItem('emailTesterForm') || '{}');
    return {
      // Transport (default Gmail)
      mode: saved.mode || 'service', // 'service' | 'custom'
      service: saved.service || 'gmail',
      host: saved.host || '',
      port: saved.port || 587,
      secure: saved.secure ?? false,

      // Auth
      user: saved.user || '',       // (non sensibile, ok salvare se vuoi)
      pass: '',                     // MAI salvata

      // Email
      fromName: saved.fromName || 'Test DEM',
      fromEmail: saved.fromEmail || saved.user || '',
      toAddresses: saved.toAddresses || '',
      subject: saved.subject || 'Test DEM HTML',
      text: saved.text || ''
    };
  });

  // Salva (tranne pass) ad ogni modifica
  const persist = (next) => {
    const toSave = { ...next };
    delete toSave.pass;
    localStorage.setItem('emailTesterForm', JSON.stringify(toSave));
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
    setSending(true);
    setResult(null);
    try {
      const transportConfig =
        form.mode === 'service'
          ? { service: form.service, user: form.user, pass: form.pass }
          : { host: form.host, port: Number(form.port), secure: Boolean(form.secure), user: form.user, pass: form.pass };

      // Gmail: FROM deve combaciare con USER
      if (form.service === 'gmail' && form.mode === 'service' && form.fromEmail !== form.user) {
        throw new Error('When using Gmail service, FROM_EMAIL must match SMTP_USER.');
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

      const { data } = await axios.post(`${API_URL}/api/send`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      setResult({ ok: data.ok, results: data.results });
    } catch (err) {
      setResult({
        ok: false,
        error: err?.response?.data?.error || 'CLIENT_ERROR',
        details: err?.response?.data?.details || err.message
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container">
      <h1>DEM Email Tester</h1>
      <p className="subtitle">Send your HTML marketing emails to real inboxes (Outlook, Gmail, iCloud...).</p>

      <div className="grid">
        <div className="panel">
          <EmailForm form={form} onChange={update} onSend={handleSend} sending={sending} />
          {result && (
            <div className={`result ${result.ok ? 'ok' : 'err'}`}>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="panel">
          <HtmlDropzone html={html} setHtml={setHtml} />
          <div className="preview">
            <div className="preview-header">Preview</div>
            <iframe
              title="email-preview"
              sandbox="allow-same-origin allow-scripts"
              srcDoc={html}
              style={{ width: '100%', height: 400, border: '1px solid #ddd' }}
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