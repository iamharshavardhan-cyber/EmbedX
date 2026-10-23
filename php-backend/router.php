<?php
/**
 * Router script for PHP Built-in Web Server
 * Usage: php -S localhost:8000 router.php
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve static file if it exists directly under public
$filePath = __DIR__ . '/public' . $uri;
if ($uri !== '/' && file_exists($filePath) && !is_dir($filePath)) {
    return false;
}

// Forward everything to index.php
require_once __DIR__ . '/public/index.php';
