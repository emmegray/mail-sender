import React from 'react';

export default function EmailForm({ form, onChange, onSend, sending }) {
  return (
    <div className="card">
      <h2>Settings</h2>

      <div className="row">
        <label>Mode</label>
        <div className="inline">
          <label><input type="radio" name="mode" value="service"
                        checked={form.mode === 'service'}
                        onChange={(e) => onChange({ mode: e.target.value })}/> Service</label>
          <label><input type="radio" name="mode" value="custom"
                        checked={form.mode === 'custom'}
                        onChange={(e) => onChange({ mode: e.target.value })}/> Custom SMTP</label>
        </div>
      </div>

      {form.mode === 'service' ? (
        <>
          <div className="row">
            <label>Service</label>
            <select value={form.service} onChange={e => onChange({ service: e.target.value })}>
              <option value="gmail">Gmail</option>
              <option value="hotmail">Hotmail</option>
              <option value="outlook">Outlook</option>
              <option value="yahoo">Yahoo</option>
              <option value="mailtrap">Mailtrap</option>
            </select>
          </div>
        </>
      ) : (
        <>
          <div className="row">
            <label>Host</label>
            <input value={form.host} onChange={e => onChange({ host: e.target.value })} placeholder="smtp.example.com" />
          </div>
          <div className="row">
            <label>Port</label>
            <input type="number" value={form.port} onChange={e => onChange({ port: e.target.value })} />
          </div>
          <div className="row">
            <label>Secure (TLS)</label>
            <input type="checkbox" checked={!!form.secure} onChange={e => onChange({ secure: e.target.checked })} />
          </div>
        </>
      )}

      <div className="row">
        <label>SMTP User</label>
        <input value={form.user} onChange={e => onChange({ user: e.target.value, fromEmail: form.mode==='service' && form.service==='gmail' ? e.target.value : form.fromEmail })} placeholder="your@gmail.com" />
      </div>

      <div className="row">
        <label>SMTP Password (App Password)</label>
        <input type="password" value={form.pass} onChange={e => onChange({ pass: e.target.value })} placeholder="App Password" />
        <small>Not stored. Used only to send.</small>
      </div>

      <hr/>

      <div className="row">
        <label>From Name</label>
        <input value={form.fromName} onChange={e => onChange({ fromName: e.target.value })} />
      </div>

      <div className="row">
        <label>From Email</label>
        <input value={form.fromEmail} onChange={e => onChange({ fromEmail: e.target.value })} />
        <small>If using Gmail service, this must equal SMTP User.</small>
      </div>

      <div className="row">
        <label>To (comma separated)</label>
        <input value={form.toAddresses} onChange={e => onChange({ toAddresses: e.target.value })} placeholder="me@outlook.com, other@mail.com" />
      </div>

      <div className="row">
        <label>Subject</label>
        <input value={form.subject} onChange={e => onChange({ subject: e.target.value })} />
      </div>

      <div className="row">
        <label>Plain Text (optional)</label>
        <textarea rows="3" value={form.text} onChange={e => onChange({ text: e.target.value })} placeholder="Text-only fallback"/>
      </div>

      <button className="send-btn" onClick={onSend} disabled={sending}>
        {sending ? 'Sending…' : 'Send Email'}
      </button>
    </div>
  );
}