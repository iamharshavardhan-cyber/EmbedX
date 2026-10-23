<?php

require_once __DIR__ . '/../src/Response.php';
require_once __DIR__ . '/../src/Auth.php';
require_once __DIR__ . '/../src/Storage.php';

use EmbedX\Response;
use EmbedX\Auth;
use EmbedX\Storage;

$config = require __DIR__ . '/../config.php';

// Handle CORS
Response::handleCors($config['cors_allowed_origins']);

// Resolve request path and method
$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// Initialize Services
$auth = new Auth($config['firebase_api_key'], $config['firebase_project_id']);
$storage = new Storage($config);

// -------------------------------------------------------------
// Route: GET / or GET /api/health
// -------------------------------------------------------------
if (($requestUri === '/' || $requestUri === '/api/health') && $method === 'GET') {
    Response::json([
        'status' => 'healthy',
        'service' => 'EmbedX PCB Workshop PHP Backend',
        'php_version' => PHP_VERSION,
        'server_time' => date('c'),
        'endpoints' => [
            'POST /functions/v1/generate-payment-upload-url',
            'PUT  /api/upload',
            'POST /functions/v1/generate-admin-view-url',
            'GET  /api/view',
            'GET  /api/health',
        ],
    ]);
}

// -------------------------------------------------------------
// Route: POST /functions/v1/generate-payment-upload-url
//        or POST /api/generate-payment-upload-url
// -------------------------------------------------------------
if (
    ($requestUri === '/functions/v1/generate-payment-upload-url' || $requestUri === '/api/generate-payment-upload-url')
    && $method === 'POST'
) {
    $token = Auth::getBearerToken();
    if (!$token) {
        Response::error('Missing or invalid Authorization header.', 401);
    }

    try {
        $uid = $auth->verifyFirebaseIdToken($token);
    } catch (\Throwable $e) {
        Response::error('Authentication failed: ' . $e->getMessage(), 401);
    }

    $rawBody = file_get_contents('php://input');
    $body = json_decode($rawBody, true) ?: [];

    $attemptId = trim($body['attemptId'] ?? '');
    $extension = strtolower(ltrim($body['extension'] ?? 'png', '.'));

    if (empty($attemptId)) {
        Response::error('Missing attemptId.', 400);
    }

    if (!in_array($extension, ['png', 'jpg', 'jpeg'], true)) {
        Response::error('Only PNG and JPEG file formats are permitted.', 400);
    }

    $path = "{$uid}/{$attemptId}.{$extension}";

    $uploadData = $storage->createSignedUploadUrl($path, $config['upload_url_expires_in']);

    Response::json([
        'signedUrl' => $uploadData['signedUrl'],
        'path' => $uploadData['path'],
        'token' => $uploadData['token'],
    ]);
}

// -------------------------------------------------------------
// Route: PUT /api/upload (Direct upload from student)
// -------------------------------------------------------------
if ($requestUri === '/api/upload' && $method === 'PUT') {
    $path = $_GET['path'] ?? '';
    $expires = (int)($_GET['expires'] ?? 0);
    $signature = $_GET['sig'] ?? '';

    if (empty($path) || empty($expires) || empty($signature)) {
        Response::error('Missing required upload verification parameters.', 400);
    }

    if (!$storage->verifyUploadSignature($path, $expires, $signature)) {
        Response::error('Upload signature is invalid or has expired.', 403);
    }

    $inputStream = fopen('php://input', 'rb');
    if (!$inputStream) {
        Response::error('Failed to read request body stream.', 400);
    }

    try {
        $bytes = $storage->saveUploadedFile($path, $inputStream);
        Response::json([
            'status' => 'success',
            'message' => 'Screenshot uploaded successfully.',
            'path' => $path,
            'bytes' => $bytes,
        ]);
    } catch (\Throwable $e) {
        Response::error($e->getMessage(), 400);
    }
}

// -------------------------------------------------------------
// Route: POST /functions/v1/generate-admin-view-url
//        or POST /api/generate-admin-view-url
// -------------------------------------------------------------
if (
    ($requestUri === '/functions/v1/generate-admin-view-url' || $requestUri === '/api/generate-admin-view-url')
    && $method === 'POST'
) {
    $token = Auth::getBearerToken();
    if (!$token) {
        Response::error('Missing Authorization header.', 401);
    }

    try {
        $uid = $auth->verifyFirebaseIdToken($token);
    } catch (\Throwable $e) {
        Response::error('Authentication failed: ' . $e->getMessage(), 401);
    }

    $rawBody = file_get_contents('php://input');
    $body = json_decode($rawBody, true) ?: [];

    $screenshotRef = trim($body['screenshotRef'] ?? '');
    if (empty($screenshotRef)) {
        Response::error('Missing screenshotRef.', 400);
    }

    $signedUrl = $storage->createSignedViewUrl($screenshotRef, $config['admin_view_expires_in']);

    Response::json([
        'signedUrl' => $signedUrl,
    ]);
}

// -------------------------------------------------------------
// Route: GET /api/view (Admin streams screenshot image)
// -------------------------------------------------------------
if ($requestUri === '/api/view' && $method === 'GET') {
    $path = $_GET['path'] ?? '';
    $expires = (int)($_GET['expires'] ?? 0);
    $signature = $_GET['sig'] ?? '';

    if (empty($path) || empty($expires) || empty($signature)) {
        Response::error('Missing required preview parameters.', 400);
    }

    $storage->streamFile($path, $expires, $signature);
}

// -------------------------------------------------------------
// Default 404 Route
// -------------------------------------------------------------
Response::error("Endpoint {$method} {$requestUri} not found on PHP backend server.", 404);
