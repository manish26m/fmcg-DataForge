# ▶️ How to Run DataForge

You need **2 terminals** open at the same time — one for backend, one for frontend.

---

## Terminal 1 — Backend (FastAPI)

```bash
cd d:\STUDY\Coding\Projects\fmcg-DataForge\backend
python -m uvicorn app.main:app --reload --port 8001
```

✅ You'll see:
```
INFO:     Uvicorn running on http://127.0.0.1:8001
INFO:     Application startup complete.
```

---

## Terminal 2 — Frontend (Next.js)

```bash
cd d:\STUDY\Coding\Projects\fmcg-DataForge\frontend
npm run dev
```

✅ You'll see:
```
▲ Next.js 14.2.3
- Local: http://localhost:3001
✓ Ready in 3.4s
```

---

## Open in browser

👉 **http://localhost:3001**

| Page | URL |
|------|-----|
| Home | http://localhost:3001 |
| Upload CSV | http://localhost:3001/upload |
| Pipeline Monitor | http://localhost:3001/monitor |
| Analytics Dashboard | http://localhost:3001/dashboard |
| AI/BI Dashboard | http://localhost:3001/aibi |
| API Docs (Swagger) | http://localhost:8001/docs |

---

## ⚠️ If something breaks

### "Module not found" or import error on backend
```bash
cd d:\STUDY\Coding\Projects\fmcg-DataForge\backend
pip install -r requirements.txt
```

### "Cannot find module" on frontend
```bash
cd d:\STUDY\Coding\Projects\fmcg-DataForge\frontend
npm install
```

### Port already in use — kill old process and re-run
```bash
# Backend on a different port
python -m uvicorn app.main:app --reload --port 8002
```

---

## 🛑 To stop

Press **Ctrl + C** in each terminal.

---

## Credentials (already set — don't touch)

All credentials live in `backend/.env` — AWS + Databricks are fully wired.  
Do **NOT** commit `.env` to Git.
