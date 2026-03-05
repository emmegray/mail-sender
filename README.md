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
