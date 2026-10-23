FROM php:8.3-cli-alpine

WORKDIR /app

# Install fileinfo and curl extensions (built-in in alpine cli)
COPY . /app

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "router.php"]
