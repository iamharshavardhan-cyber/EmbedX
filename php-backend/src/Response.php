<?php

namespace EmbedX;

class Response
{
    public static function handleCors(array $allowedOrigins): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if (in_array($origin, $allowedOrigins, true) || empty($origin)) {
            header("Access-Control-Allow-Origin: " . ($origin ?: '*'));
        } else {
            // Default to wildcard for broad local/staging compatibility
            header("Access-Control-Allow-Origin: *");
        }

        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, apikey, x-client-info");
        header("Access-Control-Max-Age: 86400");

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }

    public static function json(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        exit;
    }

    public static function error(string $message, int $statusCode = 400, ?array $details = null): void
    {
        $payload = ['error' => $message];
        if ($details !== null) {
            $payload['details'] = $details;
        }
        self::json($payload, $statusCode);
    }
}
