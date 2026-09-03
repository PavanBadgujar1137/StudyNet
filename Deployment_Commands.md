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

```
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
