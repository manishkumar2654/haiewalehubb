# Logs – Local vs Railway (Live)

## Live logs kahan dekhen (Railway pe)

Saare logs **console (stdout)** pe bhi jaate hain. Railway inhein apne dashboard pe dikhata hai.

### Railway pe live logs kaise dekhen

1. **Railway Dashboard** → apna project kholo  
2. **Service** select karo (jo backend hai)  
3. **Deployments** tab → koi bhi deployment pe click karo → **Logs** section  
   **ya**  
4. Upar **Observability** tab → **Log Explorer** – yahan saare logs (live + filter) milte hain  
5. **CLI se:** `railway logs` chalao (Railway CLI install ho)

Jo bhi `logger.info()`, action logs, API request logs likhte ho, woh sab **console** pe jaata hai, isliye **Railway pe live yahi logs dikhenge**.

---

## File mein save (app.log)

- **Local:** `server/logs/app.log` – yahi pe file banti hai  
- **Railway:** By default file container ke andar `server/logs/app.log` pe likhi jati hai, lekin **redeploy/restart pe yeh file gayab ho jati hai** (ephemeral filesystem)

### Railway pe app.log ko permanent rakhna (optional)

Agar chaho ki Railway pe bhi `app.log` **persist** ho (redeploy ke baad bhi bache):

1. Railway project → Service → **Volumes**  
2. **Add Volume** – mount path daalo: `/app/logs`  
3. Same service ke **Variables** me env add karo:  
   `LOG_DIR=/app/logs`  
4. Redeploy karo  

Ab logs file `/app/logs/app.log` me likhi jayegi jo volume pe persist rahegi.

---

## Short

| Kahan dekhna hai      | Kahan / Kaise |
|-----------------------|----------------|
| **Live (Railway)**   | Dashboard → Service → Deployments → Logs **ya** Observability → Log Explorer |
| **Local file**       | `server/logs/app.log` |
| **Railway file**     | Volume mount `/app/logs` + env `LOG_DIR=/app/logs` (optional) |
