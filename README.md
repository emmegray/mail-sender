# 📬 DEM email tester with Node.js

A simple Node.js project for sending HTML email tests to inboxes such as Outlook, Gmail and more.
Useful for checking how a DEM renders across different clients.

The system uses:

- Nodemailer for sending emails
- Gmail App PAsswords as SMTP
- Environment variables via dotenv to keep you credentials safe
- A customizable dem.html file containing your email template

## 🚀 Requirements

- Node.js > 18
- npm, pnpm or yarn
- A Gmail account with:
  - 2-Factor Authentication enabled
  - An App Password generated (required for SMTP)

## 🛠️ Installation

Clone the repository:

``` JS
git clone https://github.com/your-username/your-repo.git
```

``` JS
cd your-repo
```

Install dependencies:

``` JS
npm install
```

## 📁 Project Structure

``` JS
mail-sender/
├─ html_test/
│  └─ dem-base.html
├─ src/
│  ├─ config.js 
│  └─ send.js
├─ .env              # DO NOT commit this file
├─ .env.example      # template without secrets – commit this
├─ .gitignore
├─ package-lock.json
├─ package.json
└─ README.md
```

## 🔐 Environment Variables Setup

1. Create your local .env file

``` JS
cp .env.example .env
```

2. Fill .env with your credentials

Example:

``` JS
# SMTP Settings
SMTP_SERVICE=gmail
SMTP_USER=youraddress@gmail.com
SMTP_PASS=your_app_password

# Sender info
FROM_NAME=Test DEM
FROM_EMAIL=youraddress@gmail.com

# Recipients (comma-separated list)
TO_ADDRESSES=your.outlook@outlook.com,another.mail@gmail.com
```

  > ⚠️ **Important**: If you use Gmail as SMTP, FROM_EMAIL must match SMTP_USER.

## 📨 Sending the DEM

The HTML template used for the email is:

``` JS
dem.html
```

Edit it as needed.
Then send the email:

``` JS
node send.js
```

Emails will be sent **one by one** to each address defined in TO_ADDRESSES.
