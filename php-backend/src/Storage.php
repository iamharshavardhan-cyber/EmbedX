<?php

namespace EmbedX;

class Storage
{
    private string $storageDir;
    private string $secretKey;
    private string $baseUrl;
    private array $allowedExtensions;
    private int $maxFileSize;

    public function __construct(array $config)
    {
        $this->storageDir = rtrim($config['storage_dir'], '/\\');
        $this->secretKey = $config['secret_key'];
        $this->baseUrl = rtrim($config['base_url'], '/');
        $this->allowedExtensions = $config['allowed_extensions'];
        $this->maxFileSize = $config['max_file_size_bytes'];

        if (!is_dir($this->storageDir)) {
            mkdir($this->storageDir, 0755, true);
        }
    }

    /**
     * Creates a signed upload URL that accepts HTTP PUT
     */
    public function createSignedUploadUrl(string $path, int $expiresIn): array
    {
        $expires = time() + $expiresIn;
        $signature = $this->generateSignature("PUT:$path:$expires");
        
        $signedUrl = sprintf(
            '%s/api/upload?path=%s&expires=%d&sig=%s',
            $this->baseUrl,
            urlencode($path),
            $expires,
            $signature
        );

        return [
            'signedUrl' => $signedUrl,
            'path' => $path,
            'token' => $signature,
        ];
    }

    /**
     * Verifies the upload signature and expiration
     */
    public function verifyUploadSignature(string $path, int $expires, string $signature): bool
    {
        if (time() > $expires) {
            return false;
        }

        $expected = $this->generateSignature("PUT:$path:$expires");
        return hash_equals($expected, $signature);
    }

    /**
     * Stores incoming file stream / body to disk at $path
     */
    public function saveUploadedFile(string $path, $inputStream): int
    {
        // Sanitize path against directory traversal
        $safeRelativePath = $this->sanitizePath($path);
        $fullPath = $this->storageDir . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $safeRelativePath);

        $dir = dirname($fullPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $dest = fopen($fullPath, 'wb');
        if (!$dest) {
            throw new \RuntimeException('Failed to open destination file for writing.');
        }

        $bytesWritten = 0;
        while (!feof($inputStream)) {
            $chunk = fread($inputStream, 8192);
            if ($chunk === false) break;
            $bytesWritten += strlen($chunk);

            if ($bytesWritten > $this->maxFileSize) {
                fclose($dest);
                @unlink($fullPath);
                throw new \RuntimeException('Uploaded file exceeds maximum allowed size (5 MB).');
            }

            fwrite($dest, $chunk);
        }
        fclose($dest);

        // Validate image magic bytes
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $fullPath);
        finfo_close($finfo);

        $allowedMimes = ['image/png', 'image/jpeg'];
        if (!in_array($mime, $allowedMimes, true)) {
            @unlink($fullPath);
            throw new \RuntimeException('Invalid file type detected: ' . $mime . '. Only PNG and JPEG are allowed.');
        }

        return $bytesWritten;
    }

    /**
     * Creates a signed view URL for admins to inspect uploaded screenshots
     */
    public function createSignedViewUrl(string $path, int $expiresIn): string
    {
        $expires = time() + $expiresIn;
        $signature = $this->generateSignature("GET:$path:$expires");

        return sprintf(
            '%s/api/view?path=%s&expires=%d&sig=%s',
            $this->baseUrl,
            urlencode($path),
            $expires,
            $signature
        );
    }

    /**
     * Streams file to browser if signature is valid
     */
    public function streamFile(string $path, int $expires, string $signature): void
    {
        if (time() > $expires) {
            Response::error('This preview link has expired. Please refresh the page.', 403);
        }

        $expected = $this->generateSignature("GET:$path:$expires");
        if (!hash_equals($expected, $signature)) {
            Response::error('Invalid signature on preview link.', 403);
        }

        $safeRelativePath = $this->sanitizePath($path);
        $fullPath = $this->storageDir . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $safeRelativePath);

        if (!file_exists($fullPath)) {
            Response::error('Screenshot file not found on server.', 404);
        }

        $mime = mime_content_type($fullPath) ?: 'application/octet-stream';
        $size = filesize($fullPath);

        header("Content-Type: $mime");
        header("Content-Length: $size");
        header("Cache-Control: private, max-age=600");
        readfile($fullPath);
        exit;
    }

    private function generateSignature(string $data): string
    {
        return hash_hmac('sha256', $data, $this->secretKey);
    }

    private function sanitizePath(string $path): string
    {
        // Strip any ../ or ..\ attempts
        $cleaned = str_replace(['../', '..\\', '\\'], ['', '', '/'], $path);
        return ltrim($cleaned, '/');
    }
}
