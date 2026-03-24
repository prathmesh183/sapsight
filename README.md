# SAPSight

> **Enterprise Analytics. Without the Enterprise Price.**

SAPSight is a full-stack business intelligence platform inspired by SAP Analytics Cloud and SAP Joule. Upload any CSV dataset and instantly get AI-powered insights, auto-generated dashboards, and a conversational AI analyst — all without the enterprise price tag.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | JWT-based registration & login |
| 📂 **Data Hub** | Drag-and-drop CSV upload with live data preview |
| 📊 **Analytics Dashboard** | Auto-generated bar, line, pie & grouped charts from your data |
| 🤖 **AI Copilot** | Conversational AI analyst powered by Groq (LLaMA 3) — ask questions about your data in plain English |
| 🗄️ **Persistent Storage** | All datasets stored in MongoDB per user |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Pure CSS-in-JS (no UI library)
- Custom SVG charts (no Chart.js dependency)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads) + csv-parser
- Groq SDK (LLaMA 3 70B)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Groq API Key → [console.groq.com](https://console.groq.com)

### 1. Clone the repo
```bash
git clone https://github.com/prathmesh183/sapsight.git
cd sapsight
```

### 2. Setup the backend
```bash
cd server
npm install
```

Create a `.env` file inside `/server`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sapsight
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

Start the server:
```bash
node index.js
```

You should see:
```
Server running on port 5000
MongoDB connected
```

### 3. Setup the frontend
```bash
cd ../client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
sapsight/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/             # API calls (auth, data, AI)
│   │   ├── components/      # Layout
│   │   └── pages/           # AuthPage, DataHub, Dashboard, AICopilot
│   └── package.json
│
└── server/                  # Node.js + Express backend
    ├── config/              # MongoDB connection
    ├── middleware/           # JWT auth middleware
    ├── models/              # User, Dataset schemas
    ├── routes/              # auth, data, ai routes
    ├── uploads/             # Temporary CSV storage
    └── index.js
```

---

## 🖼️ Screenshots

### Auth Page
> Clean split-screen login/register inspired by SAP Fiori design language.

### Data Hub
> Drag-and-drop CSV upload with instant tabular preview.

### Analytics Dashboard
> Auto-generated KPI cards, bar charts, line trends, pie distribution, and grouped comparisons — all from your CSV columns.

### AI Copilot
> Ask natural language questions about your data. Powered by LLaMA 3 70B via Groq.

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Express server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `GROQ_API_KEY` | API key from [console.groq.com](https://console.groq.com) |

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

---

## 🗺️ Roadmap

- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Render
- [ ] Multi-dataset support per user
- [ ] Export charts as PNG/PDF
- [ ] Natural language chart generation
- [ ] SAP BTP OAuth integration

---

## 👨‍💻 Author

**Prathmesh Vilas Sakore**
- GitHub: [@prathmesh183](https://github.com/prathmesh183)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ · Inspired by SAP Analytics Cloud & SAP Joule · Powered by React + Node.js + Groq
</p>
