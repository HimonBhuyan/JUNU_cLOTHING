<?php
/**
 * JUNU OFFICIAL • Local & XAMPP Router
 * Seamlessly serves index.html or provides clean URL routing for local testing
 */
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = trim($uri, '/');

// If root requested
if ($uri === '' || $uri === 'index.html' || $uri === 'index.php') {
    readfile(__DIR__ . '/index.html');
    exit;
}

// If exact file exists
if (file_exists(__DIR__ . '/' . $uri)) {
    return false; // let built-in server handle static asset
}

// If clean URL matches an .html file
if (file_exists(__DIR__ . '/' . $uri . '.html')) {
    readfile(__DIR__ . '/' . $uri . '.html');
    exit;
}

// Fallback to 404
if (file_exists(__DIR__ . '/404.html')) {
    http_response_code(404);
    readfile(__DIR__ . '/404.html');
    exit;
}

echo "JUNU OFFICIAL: Page not found.";
