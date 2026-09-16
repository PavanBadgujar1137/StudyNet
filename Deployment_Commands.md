### 1. Go to project

cd ~/websites/StudyNet

### 2. Pull latest code

git pull origin Yash

### 3. Go to frontend

cd frontend/

### 4. Install frontend dependencies

npm install

### 5. Build frontend

npm run build

### 6. Reload Nginx

sudo nginx -t && sudo systemctl reload nginx

### 7. Go back to project root

cd ..

### 8. Go to backend

cd backend/

### 9. Install backend dependencies

npm install

### 10. Restart PM2 applications

pm2 restart all

# Copy Version

```bash
cd ~/websites/StudyNet
git pull origin Yash
cd frontend
npm install
npm run build
sudo nginx -t && sudo systemctl reload nginx
cd ../backend
npm install
pm2 restart all
```

---

### IMPORTANT: S3 CORS Configuration (One-time setup for direct video uploads)
If you haven't yet configured CORS on your AWS S3 bucket, uploads from the browser will fail with CORS:
1. In AWS Console, open your S3 bucket -> **Permissions** -> **Cross-origin resource sharing (CORS)**.
2. Paste the contents of `deploy/s3-cors-policy.json`:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET", "HEAD"],
    "AllowedOrigins": [
      "https://openhand.live",
      "https://www.openhand.live",
      "https://uat.openhand.live",
      "http://localhost:3000",
      "http://localhost:5173"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 86400
  }
]
```
3. Save changes.

