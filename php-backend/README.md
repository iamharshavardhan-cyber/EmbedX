# EmbedX PCB Workshop — PHP Backend Server

This backend server is a drop-in replacement for the payment screenshot upload & admin preview services. It handles secure signed upload URLs, screenshot storage on disk, and signed preview links for administrators.

---

## Features

- **Drop-in Compatible**: Exposes the exact endpoints required by the frontend (`/functions/v1/generate-payment-upload-url`, `/functions/v1/generate-admin-view-url`).
- **HMAC SHA-256 Signatures**: Generates tamper-proof, time-limited upload and view URLs.
- **MIME & Size Validation**: Enforces PNG/JPEG validation and a 5 MB maximum file size.
- **Cross-Origin (CORS) Ready**: Pre-configured headers for `localhost:5173`, `localhost:3000`, and Firebase Hosting.
- **Zero Heavy Dependencies**: Uses standard PHP core libraries (curl, fileinfo, hash).

---

## How to Run

### Option 1: Using PHP CLI (Built-in Server)

If PHP is installed on your computer:
```bash
cd php-backend
php -S localhost:8000 router.php
```

Visit [http://localhost:8000/api/health](http://localhost:8000/api/health) to verify that the server is running.

---

### Option 2: Using Docker

If you have Docker Desktop installed, you can launch the PHP backend in one command without installing PHP on Windows:
```bash
cd php-backend
docker compose up -d
```

To stop:
```bash
docker compose down
```

---

### Option 3: Using XAMPP

1. Copy the `php-backend` folder to your XAMPP `htdocs` directory:
   ```text
   C:\xampp\htdocs\embedx-backend
   ```
2. Start the **Apache** module in the XAMPP Control Panel.
3. Access the API at:
   ```text
   http://localhost/embedx-backend/public/api/health
   ```

---

## Connecting the Frontend

To point your React frontend to this PHP backend server instead of Supabase, update your project root's `.env.local` file:

```env
# Point to your PHP Backend Server
VITE_SUPABASE_FUNCTIONS_URL=http://localhost:8000/functions/v1
```

Then restart your Vite development server:
```bash
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck and server status |
| `POST` | `/functions/v1/generate-payment-upload-url` | Generates a signed upload URL for student payment screenshot |
| `PUT` | `/api/upload` | Receives and stores the binary image stream |
| `POST` | `/functions/v1/generate-admin-view-url` | Generates a signed preview URL for admin verification |
| `GET` | `/api/view` | Streams the preview image to the admin |
