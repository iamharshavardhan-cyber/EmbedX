<?php
/**
 * PHP Backend Configuration for EmbedX PCB Workshop
 */

// Allow environment variables or defaults
return [
    'app_name' => 'EmbedX PCB Workshop PHP Backend',
    'app_env' => getenv('APP_ENV') ?: 'development',
    'port' => getenv('PORT') ?: 8000,
    
    // Base URL for generated signed links
    'base_url' => getenv('BASE_URL') ?: 'http://localhost:8000',
    
    // Allowed CORS Origins
    'cors_allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'https://embedx-pcb-workshop.web.app',
        'https://embedx-pcb-workshop.firebaseapp.com',
    ],
    
    // Storage paths
    'storage_dir' => __DIR__ . '/storage/payment-screenshots',
    'max_file_size_bytes' => 5 * 1024 * 1024, // 5 MB
    'allowed_extensions' => ['png', 'jpg', 'jpeg'],
    'allowed_mime_types' => ['image/png', 'image/jpeg'],
    
    // Firebase Web API Key for ID token verification
    'firebase_api_key' => getenv('FIREBASE_API_KEY') ?: 'AIzaSyB2IslI67kKSzP-2tqWjXFpuANB2zahXdY',
    'firebase_project_id' => getenv('FIREBASE_PROJECT_ID') ?: 'embedx-pcb-workshop',
    
    // Secret used to sign short-lived view and upload tokens
    'secret_key' => getenv('BACKEND_SECRET_KEY') ?: 'embedx_pcb_workshop_secret_key_2026_php_backend',
    
    // Token validity durations (in seconds)
    'upload_url_expires_in' => 900,  // 15 minutes
    'admin_view_expires_in' => 1800, // 30 minutes
];
