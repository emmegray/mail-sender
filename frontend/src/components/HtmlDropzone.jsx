import React from 'react';

export default function HtmlDropzone({ html, setHtml }) {
  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (!file.type.includes('text') && !file.name.endsWith('.html')) {
      alert('Please drop an HTML file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setHtml(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="card">
      <h2>HTML Email</h2>

      <div
        className="dropzone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.currentTarget.classList.add('drag')}
        onDragLeave={(e) => e.currentTarget.classList.remove('drag')}
        onClick={() => document.getElementById('html-file-input')?.click()}
      >
        <p>📁 Drop your HTML file here or click to select</p>
        <small>No file is uploaded to the server</small>
      </div>

      <input
        id="html-file-input"
        type="file"
        accept=".html,text/html"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              setHtml(event.target.result);
            };
            reader.readAsText(file);
          }
        }}
      />

      <textarea
        rows="15"
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        placeholder="Paste your HTML here..."
      />
    </div>
  );
}