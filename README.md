# 📬 DEM Email Tester

A full-stack application for testing and sending HTML email templates (DEM) to real inboxes like Gmail, Outlook, Yahoo, and more.

Useful for checking how a DEM renders across different clients, specifically the damned classic Outlook, I hate you ᕙ( ︡'︡益'︠)ง 💢

## 🎯 Features

- **Web-based UI**: User-friendly React interface to configure and send emails
- **Flexible SMTP Configuration**: Choose between pre-configured services (Gmail, Outlook, etc.) or custom SMTP servers
- **HTML Editor & Dropzone**: Paste HTML directly or drag-and-drop an `.html` file
- **Secure**: SMTP credentials are **never stored** on the server only used for sending
- **Multiple Recipients**: Send to comma-separated email addresses
- **Live Preview**: Real-time preview of your email template
- **Browser Storage**: Save your sender settings locally (passwords excluded)

## 🚀 Requirements

- Node.js ≥ 18
- npm or yarn
- For Gmail: 2-Factor Authentication enabled + App Password
- For other providers: Standard SMTP credentials

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/emmegray/mail-sender.git
cd mail-sender
```

Install dependencies for both backend and frontend:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

## 📁 Project Structure

```
mail-sender/
├─ backend/                    # Express API server
│  ├─ src/
│  │  ├─ server.js            # Main server file (port 5000)
│  │  └─ mailer.js            # Nodemailer integration
│  └─ package.json
├─ frontend/                   # React + Vite UI
│  ├─ src/
│  │  ├─ main.jsx
│  │  ├─ App.jsx              # Main app component
│  │  ├─ components/
│  │  │  ├─ EmailForm.jsx     # SMTP config & email settings
│  │  │  └─ HtmlDropzone.jsx  # HTML editor & dropzone
│  │  └─ style.css
│  ├─ index.html
│  └─ package.json
├─ .env                        # Environment variables (optional, not required for web app)
├─ package.json               # Root package (npm-run-all)
└─ README.md
```

## 🚀 Running the Application

Start both frontend and backend from the **project root**:

```bash
npm run dev
```

This command runs:
- **Backend** (Express): `http://localhost:5000`
- **Frontend** (Vite): `http://localhost:5173` (default)

### Running frontend and backend separately:

**Backend only** (from `backend/` folder):
```bash
npm run dev
```

**Frontend only** (from `frontend/` folder):
```bash
npm run dev
```

## 📧 How to Use

1. **Open the web interface** at `http://localhost:5173`

2. **Configure SMTP Settings** (left panel):
   - Choose between **Service** (Gmail, Outlook, etc.) or **Custom SMTP**
   - Enter your SMTP credentials
   - Provide sender name and email
   - Add recipient email(s)
   - Enter subject and optional plain text fallback

3. **Add Your HTML** (right panel):
   - **Drop** an `.html` file into the dropzone, OR
   - **Paste** HTML directly into the text area
   - See a live preview below

4. **Send Email**:
   - Click the "Send Email" button
   - Watch the result in the response box

## 🔐 Security Notes

- **Credentials are NOT stored** on the server
- They are only used to establish the SMTP connection for sending
- Sender settings are saved in **browser localStorage** (without passwords)
- Use **Gmail App Passwords**, not your main account password

## ⚙️ SMTP Configuration Examples

### Gmail
```
Service: Gmail
User: youraddress@gmail.com
Password: your-16-character-app-password
```
⚠️ **Important**: FROM_EMAIL must match SMTP_USER when using Gmail

### Outlook / Office 365
```
Service: Outlook
User: your@outlook.com
Password: your-password
```

### Custom SMTP
```
Host: smtp.example.com
Port: 587 or 465
Secure: true (for 465), false (for 587)
User: your-email@example.com
Password: your-password
```

## 🛠️ Building for Production

**Frontend** (from `frontend/` folder):
```bash
npm run build
```

**Backend**: Use a process manager like PM2:
```bash
pm2 start backend/src/server.js
```

## Deploy to Netlify

The repository already includes `netlify.toml` and a Netlify Function in `netlify/functions/send.js`.
The configuration publishes the Vite frontend and routes `/api/send` to the Function, so a separate Express server is not needed in production.

1. Import the repository into Netlify.
2. Leave Build command and Publish directory empty: they are already defined in `netlify.toml`.
3. Set Node.js 18 or later in the project settings.
4. Deploy the site. The frontend will automatically use `/api/send` on the same domain.

For local development, the Express backend remains available at `http://localhost:5000`. To test Netlify Identity and Functions locally, install the Netlify CLI, link the project to the Netlify site, and run `netlify dev`; open `http://localhost:8888` instead of the Vite port. Do not add SMTP credentials to Netlify environment variables: users enter their credentials in the browser, and they are used only for the individual request.

For security, the Netlify Function accepts only the preconfigured SMTP services. Custom SMTP is disabled on the public deployment; enable it only in a controlled environment by setting `ALLOW_CUSTOM_SMTP=true` in the Netlify environment variables.

### Protected Public Access

Before deploying:

1. Enable **Identity** in Netlify and set registration to invite-only if the app should remain private.
2. Create an hCaptcha site and add these variables in the Netlify settings:
   - `VITE_HCAPTCHA_SITE_KEY`: public hCaptcha site key.
   - `HCAPTCHA_SECRET`: private hCaptcha secret, available only to Functions.
3. Add authorized users to Netlify Identity and send them an invitation.

`VITE_HCAPTCHA_SITE_KEY` is read at build time. Set it before every Netlify deploy and trigger a new deploy after changing it; adding the variable without rebuilding will leave the CAPTCHA unavailable in the frontend.

The app displays the form only after Netlify Identity login. Every send request must also contain a valid hCaptcha token; the Function verifies both tokens server-side.
