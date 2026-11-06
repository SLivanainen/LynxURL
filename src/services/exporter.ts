import JSZip from 'jszip';
import { StorageService } from './storage';

export const PHP_CONFIG_CODE = `<?php
/**
 * LynxURL - Production Configuration File
 * Supports SQLite (Zero config, works instantly on all PHP hosting) 
 * and MySQL/MariaDB for large enterprise scale.
 */

// Choose database driver: 'sqlite' or 'mysql'
define('DB_DRIVER', 'sqlite');

// SQLite configuration (Stored securely in data directory)
define('SQLITE_FILE', __DIR__ . '/data/lynxurl.sqlite');

// MySQL configuration (Used when DB_DRIVER is 'mysql')
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'lynxurl_db');
define('DB_USER', 'db_username');
define('DB_PASS', 'db_password');
define('DB_CHARSET', 'utf8mb4');

// Application Settings
define('APP_NAME', 'LynxURL');
define('APP_URL', (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost'));
define('ALLOW_GUEST_SHORTENING', true);
define('DEFAULT_SLUG_LENGTH', 6);
define('API_SECRET_KEY', 'lx_sec_' . hash('sha256', 'lynxurl_salt_2026'));

// Helper: Get PDO Database Connection
function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    try {
        if (DB_DRIVER === 'sqlite') {
            $dir = dirname(SQLITE_FILE);
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
            $pdo = new PDO('sqlite:' . SQLITE_FILE);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
            // Auto initialize SQLite tables if not exist
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS links (
                    id TEXT PRIMARY KEY,
                    slug TEXT UNIQUE NOT NULL,
                    destination_url TEXT NOT NULL,
                    title TEXT,
                    password_hash TEXT,
                    expires_at TEXT,
                    click_limit INTEGER,
                    clicks_count INTEGER DEFAULT 0,
                    is_active INTEGER DEFAULT 1,
                    ios_url TEXT,
                    android_url TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS clicks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    link_id TEXT NOT NULL,
                    slug TEXT NOT NULL,
                    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                    referrer TEXT,
                    ip_address TEXT,
                    user_agent TEXT,
                    country TEXT
                );
            ");
        } else {
            $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET);
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        }
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        die("Database Connection Error: " . htmlspecialchars($e->getMessage()));
    }
}
`;

export const PHP_REDIRECT_CODE = `<?php
/**
 * LynxURL - Fast Redirection Engine & Click Tracker
 * Handles: /s/{slug}
 * Features: 301/302 redirects, device targeting, password gating, click logging
 */

require_once __DIR__ . '/config.php';

$slug = trim($_GET['slug'] ?? '');
if (empty($slug)) {
    header("Location: " . APP_URL);
    exit;
}

$db = getDbConnection();
$stmt = $db->prepare("SELECT * FROM links WHERE LOWER(slug) = LOWER(:slug) LIMIT 1");
$stmt->execute([':slug' => $slug]);
$link = $stmt->fetch();

if (!$link) {
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Link Not Found</title><style>body{font-family:sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;} .box{text-align:center;padding:2rem;background:#1e293b;border-radius:12px;max-width:400px;border:1px solid #334155;} h1{color:#ef4444;margin-bottom:0.5rem;} a{color:#38bdf8;text-decoration:none;}</style></head><body><div class="box"><h1>404 - Not Found</h1><p>The shortened link you requested does not exist or was removed.</p><a href="' . APP_URL . '">Return to Homepage &rarr;</a></div></body></html>';
    exit;
}

// 1. Check if active
if (empty($link['is_active'])) {
    http_response_code(403);
    echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Link Paused</title><style>body{font-family:sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;} .box{text-align:center;padding:2rem;background:#1e293b;border-radius:12px;max-width:400px;border:1px solid #334155;} h1{color:#f59e0b;margin-bottom:0.5rem;} a{color:#38bdf8;text-decoration:none;}</style></head><body><div class="box"><h1>Link Paused</h1><p>This link is temporarily paused by its creator.</p><a href="' . APP_URL . '">Go Home &rarr;</a></div></body></html>';
    exit;
}

// 2. Check expiration
if (!empty($link['expires_at']) && strtotime($link['expires_at']) < time()) {
    http_response_code(410);
    echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Link Expired</title><style>body{font-family:sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;} .box{text-align:center;padding:2rem;background:#1e293b;border-radius:12px;max-width:400px;border:1px solid #334155;} h1{color:#f97316;margin-bottom:0.5rem;} a{color:#38bdf8;text-decoration:none;}</style></head><body><div class="box"><h1>Link Expired</h1><p>This link reached its scheduled expiration date.</p><a href="' . APP_URL . '">Go Home &rarr;</a></div></body></html>';
    exit;
}

// 3. Check click limit
if (!empty($link['click_limit']) && (int)$link['clicks_count'] >= (int)$link['click_limit']) {
    http_response_code(410);
    echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Click Limit Reached</title><style>body{font-family:sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;} .box{text-align:center;padding:2rem;background:#1e293b;border-radius:12px;max-width:400px;border:1px solid #334155;} h1{color:#f97316;margin-bottom:0.5rem;} a{color:#38bdf8;text-decoration:none;}</style></head><body><div class="box"><h1>Limit Reached</h1><p>This link has reached its maximum allowed clicks.</p><a href="' . APP_URL . '">Go Home &rarr;</a></div></body></html>';
    exit;
}

// 4. Check password protection
if (!empty($link['password_hash'])) {
    session_start();
    $sessionKey = 'auth_slug_' . $link['id'];
    $enteredPass = $_POST['password'] ?? '';
    
    if (isset($_SESSION[$sessionKey]) && $_SESSION[$sessionKey] === true) {
        // Authenticated in session
    } elseif (!empty($enteredPass) && password_verify($enteredPass, $link['password_hash'])) {
        $_SESSION[$sessionKey] = true;
    } else {
        $errorMsg = !empty($enteredPass) ? 'Incorrect password. Please try again.' : '';
        echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Password Protected Link</title><style>body{font-family:sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;} .box{background:#1e293b;padding:2.5rem;border-radius:12px;width:340px;border:1px solid #334155;text-align:center;} input{width:100%;box-sizing:border-box;padding:0.75rem;background:#0f172a;border:1px solid #475569;border-radius:6px;color:#fff;margin:1rem 0;font-size:1rem;} button{width:100%;padding:0.75rem;background:#3b82f6;color:#fff;border:none;border-radius:6px;font-size:1rem;font-weight:600;cursor:pointer;} button:hover{background:#2563eb;} .err{color:#ef4444;font-size:0.875rem;margin-bottom:1rem;}</style></head><body><div class="box"><h2>Protected Link</h2><p style="color:#94a3b8;font-size:0.875rem;">Enter password to unlock this destination:</p>' . ($errorMsg ? '<div class="err">'.htmlspecialchars($errorMsg).'</div>' : '') . '<form method="POST"><input type="password" name="password" placeholder="Passcode" required autofocus><button type="submit">Unlock & Continue &rarr;</button></form></div></body></html>';
        exit;
    }
}

// 5. Determine target destination (Device targeting)
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
$destination = $link['destination_url'];

if (stripos($ua, 'iPhone') !== false || stripos($ua, 'iPad') !== false) {
    if (!empty($link['ios_url'])) $destination = $link['ios_url'];
} elseif (stripos($ua, 'Android') !== false) {
    if (!empty($link['android_url'])) $destination = $link['android_url'];
}

// 6. Record click event
$referrer = $_SERVER['HTTP_REFERER'] ?? 'Direct';
$ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

try {
    $db->beginTransaction();
    $updateStmt = $db->prepare("UPDATE links SET clicks_count = clicks_count + 1 WHERE id = :id");
    $updateStmt->execute([':id' => $link['id']]);

    $clickStmt = $db->prepare("INSERT INTO clicks (link_id, slug, referrer, ip_address, user_agent, country) VALUES (:link_id, :slug, :referrer, :ip, :ua, :country)");
    $clickStmt->execute([
        ':link_id' => $link['id'],
        ':slug' => $link['slug'],
        ':referrer' => substr($referrer, 0, 255),
        ':ip' => $ip,
        ':ua' => substr($ua, 0, 255),
        ':country' => 'Global'
    ]);
    $db->commit();
} catch (Exception $e) {
    // Fail gracefully on click logging without breaking redirect
}

// 7. Redirect visitor
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
header("Location: " . $destination, true, 302);
exit;
`;

export const PHP_API_CODE = `<?php
/**
 * LynxURL - RESTful API
 * Endpoints:
 *   POST /api.php?action=shorten
 *   GET  /api.php?action=links
 *   GET  /api.php?action=stats&slug={slug}
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';
$db = getDbConnection();

// Authentication via Bearer token (optional for public guest shortening)
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
$token = '';
if (preg_match('/Bearer\\s+(.*)$/i', $authHeader, $matches)) {
    $token = $matches[1];
}

if ($action === 'shorten' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    $url = trim($data['url'] ?? '');
    $customSlug = trim($data['custom_slug'] ?? '');
    $title = trim($data['title'] ?? '');
    $password = trim($data['password'] ?? '');
    $expiresAt = trim($data['expires_at'] ?? '');
    $clickLimit = isset($data['click_limit']) ? (int)$data['click_limit'] : null;

    if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Valid destination URL is required']);
        exit;
    }

    if (!empty($customSlug)) {
        if (!preg_match('/^[a-zA-Z0-9_-]{3,50}$/', $customSlug)) {
            http_response_code(400);
            echo json_encode(['error' => 'Custom alias must be 3-50 alphanumeric characters or hyphens']);
            exit;
        }
        $check = $db->prepare("SELECT id FROM links WHERE LOWER(slug) = LOWER(:s) LIMIT 1");
        $check->execute([':s' => $customSlug]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Custom slug already in use']);
            exit;
        }
        $slug = $customSlug;
    } else {
        $chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        do {
            $slug = '';
            for ($i = 0; $i < DEFAULT_SLUG_LENGTH; $i++) {
                $slug .= $chars[random_int(0, strlen($chars) - 1)];
            }
            $check = $db->prepare("SELECT id FROM links WHERE slug = :s LIMIT 1");
            $check->execute([':s' => $slug]);
        } while ($check->fetch());
    }

    $id = 'lnk_' . bin2hex(random_bytes(6));
    $passHash = !empty($password) ? password_hash($password, PASSWORD_BCRYPT) : null;

    $stmt = $db->prepare("INSERT INTO links (id, slug, destination_url, title, password_hash, expires_at, click_limit, is_active) VALUES (:id, :slug, :url, :title, :pass, :exp, :lim, 1)");
    $stmt->execute([
        ':id' => $id,
        ':slug' => $slug,
        ':url' => $url,
        ':title' => $title ?: parse_url($url, PHP_URL_HOST),
        ':pass' => $passHash,
        ':exp' => !empty($expiresAt) ? $expiresAt : null,
        ':lim' => $clickLimit ?: null
    ]);

    echo json_encode([
        'success' => true,
        'id' => $id,
        'slug' => $slug,
        'short_url' => APP_URL . '/s/' . $slug,
        'destination_url' => $url,
        'created_at' => date('c')
    ]);
    exit;
}

if ($action === 'links') {
    $stmt = $db->query("SELECT id, slug, destination_url, title, clicks_count, is_active, created_at, expires_at, click_limit FROM links ORDER BY created_at DESC LIMIT 100");
    $links = $stmt->fetchAll();
    echo json_encode(['success' => true, 'links' => $links]);
    exit;
}

if ($action === 'stats') {
    $slug = trim($_GET['slug'] ?? '');
    if (empty($slug)) {
        http_response_code(400);
        echo json_encode(['error' => 'Slug parameter is required']);
        exit;
    }

    $stmt = $db->prepare("SELECT * FROM links WHERE LOWER(slug) = LOWER(:s) LIMIT 1");
    $stmt->execute([':s' => $slug]);
    $link = $stmt->fetch();

    if (!$link) {
        http_response_code(404);
        echo json_encode(['error' => 'Link not found']);
        exit;
    }

    $clickStmt = $db->prepare("SELECT timestamp, referrer, country FROM clicks WHERE link_id = :id ORDER BY timestamp DESC LIMIT 50");
    $clickStmt->execute([':id' => $link['id']]);
    $clicks = $clickStmt->fetchAll();

    echo json_encode([
        'success' => true,
        'link' => [
            'id' => $link['id'],
            'slug' => $link['slug'],
            'destination_url' => $link['destination_url'],
            'clicks_count' => (int)$link['clicks_count'],
            'created_at' => $link['created_at'],
        ],
        'recent_clicks' => $clicks
    ]);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Unknown action. Allowed: shorten, links, stats']);
`;

export const PHP_HTACCESS_CODE = `# Apache .htaccess for LynxURL Shortener Platform
# Enables mod_rewrite, security headers, and clean URLs

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Ensure HTTPS
    # RewriteCond %{HTTPS} off
    # RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # Block access to SQLite database directory and sensitive files
    RewriteRule ^data/ - [F,L]
    RewriteRule ^config\\.php$ - [F,L]
    RewriteRule ^\\.git - [F,L]
    RewriteRule ^database\\.sql$ - [F,L]

    # Redirect /s/{slug} to redirect.php?slug={slug}
    RewriteRule ^s/([a-zA-Z0-9_-]+)/?$ redirect.php?slug=$1 [L,QSA]
    RewriteRule ^r/([a-zA-Z0-9_-]+)/?$ redirect.php?slug=$1 [L,QSA]

    # Route /api/* to api.php
    RewriteRule ^api/?$ api.php [L,QSA]

    # If requested file or directory exists, serve directly
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . index.php [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
`;

export const MYSQL_DATABASE_SQL = `-- LynxURL Production MySQL Schema
-- Character Set: utf8mb4 (Full Emoji & Multilingual URL Support)

CREATE DATABASE IF NOT EXISTS \`lynxurl_db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`lynxurl_db\`;

-- Users Table
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` VARCHAR(36) NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(191) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('admin', 'user', 'guest') NOT NULL DEFAULT 'user',
  \`api_key\` VARCHAR(64) UNIQUE,
  \`plan\` VARCHAR(50) DEFAULT 'Free Starter',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_user_email\` (\`email\`),
  INDEX \`idx_user_api_key\` (\`api_key\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Links Table
CREATE TABLE IF NOT EXISTS \`links\` (
  \`id\` VARCHAR(36) NOT NULL,
  \`user_id\` VARCHAR(36) NULL,
  \`slug\` VARCHAR(64) NOT NULL UNIQUE,
  \`destination_url\` TEXT NOT NULL,
  \`title\` VARCHAR(255) NULL,
  \`password_hash\` VARCHAR(255) NULL,
  \`expires_at\` DATETIME NULL,
  \`click_limit\` INT UNSIGNED NULL,
  \`clicks_count\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`tags\` VARCHAR(255) NULL,
  \`ios_url\` TEXT NULL,
  \`android_url\` TEXT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_links_slug\` (\`slug\`),
  INDEX \`idx_links_user\` (\`user_id\`),
  INDEX \`idx_links_active\` (\`is_active\`),
  CONSTRAINT \`fk_links_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clicks Analytics Table
CREATE TABLE IF NOT EXISTS \`clicks\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`link_id\` VARCHAR(36) NOT NULL,
  \`slug\` VARCHAR(64) NOT NULL,
  \`timestamp\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`referrer\` VARCHAR(255) NULL,
  \`country\` VARCHAR(64) NULL,
  \`country_code\` CHAR(2) NULL,
  \`city\` VARCHAR(100) NULL,
  \`device\` ENUM('desktop', 'mobile', 'tablet') DEFAULT 'desktop',
  \`browser\` VARCHAR(50) NULL,
  \`os\` VARCHAR(50) NULL,
  \`ip_address\` VARCHAR(45) NULL,
  INDEX \`idx_clicks_link_id\` (\`link_id\`),
  INDEX \`idx_clicks_slug\` (\`slug\`),
  INDEX \`idx_clicks_time\` (\`timestamp\`),
  CONSTRAINT \`fk_clicks_link\` FOREIGN KEY (\`link_id\`) REFERENCES \`links\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Seed Admin
INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password_hash\`, \`role\`, \`api_key\`, \`plan\`)
VALUES ('usr_admin_01', 'Admin', 'admin@lynxurl.io', '$2y$10$w09xGvF4zR1b45j8vWvTseH.7fQ7pW9tK3dJ2.7r2c.7Kz1jZ5nK', 'admin', 'lx_live_8f3a9e2d1c7b45a60e9d2f8c1b4e6a8', 'Pro')
ON DUPLICATE KEY UPDATE \`name\` = \`name\`;
`;

export const NETLIFY_TOML_CODE = `# Netlify Configuration for LynxURL Platform
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"

# Redirect rules
[[redirects]]
  from = "/s/:slug"
  to = "/.netlify/functions/redirect?slug=:slug"
  status = 200

[[redirects]]
  from = "/r/:slug"
  to = "/.netlify/functions/redirect?slug=:slug"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security Headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
`;

export const NETLIFY_REDIRECTS_CODE = `# Netlify Redirects File
/s/:slug  /.netlify/functions/redirect?slug=:slug  200
/r/:slug  /.netlify/functions/redirect?slug=:slug  200
/api/*    /.netlify/functions/api/:splat          200
/*        /index.html                             200
`;

export const NETLIFY_FUNCTION_REDIRECT = `// Netlify Serverless Function: redirect.js
exports.handler = async function(event, context) {
  const slug = event.queryStringParameters.slug;
  if (!slug) {
    return {
      statusCode: 302,
      headers: { Location: '/' }
    };
  }

  // In production, query your KV / Supabase / PlanetScale / Firebase store
  // Sample fallback demonstration:
  return {
    statusCode: 302,
    headers: {
      Location: 'https://lynxurl.io?ref=' + encodeURIComponent(slug),
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  };
};
`;

export const PHP_INDEX_HTML_WRAPPER = `<?php
/**
 * LynxURL - Web Dashboard Entry Point
 */
require_once __DIR__ . '/config.php';
$db = getDbConnection();

$totalLinks = $db->query("SELECT COUNT(*) FROM links")->fetchColumn();
$totalClicks = $db->query("SELECT COALESCE(SUM(clicks_count), 0) FROM links")->fetchColumn();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo APP_NAME; ?> - Self-Hosted Shortener</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
    <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div class="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
            <?php echo APP_NAME; ?>
        </div>
        <div class="text-sm text-slate-400">
            Self-Hosted PHP Engine &bull; <?php echo number_format($totalLinks); ?> Links &bull; <?php echo number_format($totalClicks); ?> Clicks
        </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-12">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-extrabold text-white mb-2">Shorten, Track &amp; Manage Any Link</h1>
            <p class="text-slate-400">Ultra-fast self-hosted redirection running on your own domain.</p>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-10">
            <form id="shortenForm" class="space-y-4">
                <div class="flex flex-col sm:flex-row gap-3">
                    <input type="url" id="destUrl" placeholder="Paste your long destination URL (https://...)" required class="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500">
                    <button type="submit" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 font-semibold text-white rounded-xl transition">Shorten URL</button>
                </div>
                <div class="flex flex-wrap gap-4 text-xs text-slate-400 pt-2">
                    <input type="text" id="customSlug" placeholder="Custom alias (optional)" class="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white">
                    <input type="password" id="linkPassword" placeholder="Passcode (optional)" class="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white">
                </div>
            </form>

            <div id="resultBox" class="hidden mt-6 p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                    <span class="text-xs text-slate-500">Shortened URL</span>
                    <a id="shortUrlLink" href="#" target="_blank" class="block text-emerald-400 font-mono text-base font-semibold hover:underline"></a>
                </div>
                <button onclick="copyResult()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg">Copy</button>
            </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 class="text-lg font-bold text-white mb-4">Latest Active Links</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-slate-300">
                    <thead class="text-xs uppercase bg-slate-950/50 text-slate-500 border-b border-slate-800">
                        <tr>
                            <th class="py-3 px-4">Short Link</th>
                            <th class="py-3 px-4">Destination</th>
                            <th class="py-3 px-4 text-right">Clicks</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/60 font-mono text-xs">
                        <?php
                        $links = $db->query("SELECT slug, destination_url, clicks_count FROM links ORDER BY created_at DESC LIMIT 10")->fetchAll();
                        if (empty($links)) {
                            echo '<tr><td colspan="3" class="py-6 text-center text-slate-500 font-sans">No links created yet.</td></tr>';
                        }
                        foreach ($links as $l): ?>
                        <tr>
                            <td class="py-3 px-4 text-blue-400 font-semibold">/s/<?php echo htmlspecialchars($l['slug']); ?></td>
                            <td class="py-3 px-4 truncate max-w-xs text-slate-400"><?php echo htmlspecialchars($l['destination_url']); ?></td>
                            <td class="py-3 px-4 text-right text-emerald-400"><?php echo number_format($l['clicks_count']); ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </main>

    <script>
    document.getElementById('shortenForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = document.getElementById('destUrl').value;
        const custom_slug = document.getElementById('customSlug').value;
        const password = document.getElementById('linkPassword').value;

        const res = await fetch('api.php?action=shorten', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, custom_slug, password })
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('resultBox').classList.remove('hidden');
            const linkA = document.getElementById('shortUrlLink');
            linkA.href = data.short_url;
            linkA.textContent = data.short_url;
        } else {
            alert(data.error || 'Failed to shorten URL');
        }
    });

    function copyResult() {
        const text = document.getElementById('shortUrlLink').href;
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    }
    </script>
</body>
</html>
`;

export const PHP_README_GUIDE = `# LynxURL - Production Self-Hosted PHP URL Shortener

LynxURL is a self-hosted, lightweight URL Shortener and click tracker ready for any standard LAMP/cPanel/Shared PHP hosting.

## Requirements
- PHP 8.0, 8.1, 8.2, or 8.3
- PDO Extension with SQLite (default zero-config) or MySQL/MariaDB
- Apache with \`mod_rewrite\` enabled OR Nginx

## 5-Minute Installation (cPanel / Shared Hosting)

1. **Upload Files**:
   - Extract this zip into your \`public_html\` directory or a subdomain folder (e.g., \`link.yoursite.com\`).

2. **File Permissions**:
   - Ensure the \`/data\` folder is writable (chmod 755 or 775) so SQLite can create the database file.

3. **Configure**:
   - Open \`config.php\`.
   - By default, it uses SQLite with zero setup required.
   - If using MySQL, change \`define('DB_DRIVER', 'mysql');\` and enter your MySQL host, database name, user, and password. Import \`database.sql\` via phpMyAdmin.

4. **Test**:
   - Visit your domain in a browser: \`https://yoursite.com\`
   - Shorten a link, then test redirection at: \`https://yoursite.com/s/{slug}\`

5. **REST API**:
   - \`POST /api.php?action=shorten\`
   - \`GET  /api.php?action=links\`
   - \`GET  /api.php?action=stats&slug={slug}\`
`;

export const NETLIFY_README_GUIDE = `# LynxURL - Netlify Deployment Guide

Deploy LynxURL to Netlify with zero server maintenance.

## Option A: Drag & Drop (Instant)
1. Build the frontend production bundle: \`npm run build\`
2. In Netlify Dashboard, drag and drop the \`dist\` folder.
3. Add the \`_redirects\` file to ensure client-side and serverless redirection works seamlessly.

## Option B: Connect to Git Repository
1. Push your repository to GitHub / GitLab.
2. In Netlify, click **Add new site** -> **Import an existing project**.
3. Netlify will detect:
   - Build command: \`npm run build\`
   - Publish directory: \`dist\`
4. Click **Deploy Site**.
`;

export class ExporterService {
  static async generateDeploymentZip(): Promise<Blob> {
    const zip = new JSZip();

    // 1. PHP Self-Hosted Hosting Folder
    const phpFolder = zip.folder('php-self-hosted');
    if (phpFolder) {
      phpFolder.file('index.php', PHP_INDEX_HTML_WRAPPER);
      phpFolder.file('redirect.php', PHP_REDIRECT_CODE);
      phpFolder.file('api.php', PHP_API_CODE);
      phpFolder.file('config.php', PHP_CONFIG_CODE);
      phpFolder.file('.htaccess', PHP_HTACCESS_CODE);
      phpFolder.file('database.sql', MYSQL_DATABASE_SQL);
      phpFolder.file('README.md', PHP_README_GUIDE);
      
      const dataFolder = phpFolder.folder('data');
      if (dataFolder) {
        dataFolder.file('.htaccess', 'Deny from all');
        dataFolder.file('index.html', '<!DOCTYPE html><html><body style="background:#000;">Forbidden</body></html>');
      }
    }

    // 2. Netlify Hosting Folder
    const netlifyFolder = zip.folder('netlify-deployment');
    if (netlifyFolder) {
      netlifyFolder.file('netlify.toml', NETLIFY_TOML_CODE);
      netlifyFolder.file('_redirects', NETLIFY_REDIRECTS_CODE);
      netlifyFolder.file('README.md', NETLIFY_README_GUIDE);
      
      const funcFolder = netlifyFolder.folder('functions');
      if (funcFolder) {
        funcFolder.file('redirect.js', NETLIFY_FUNCTION_REDIRECT);
        funcFolder.file('api.js', PHP_API_CODE);
      }
    }

    // 3. Database & Current Data Snapshot
    zip.file('lynxurl-database-export.json', StorageService.exportDatabaseJson());
    zip.file('database-mysql.sql', MYSQL_DATABASE_SQL);
    zip.file('README-START-HERE.txt', `LYNXURL PRODUCTION DEPLOYMENT BUNDLE
========================================
Thank you for downloading LynxURL.

Included in this archive:
1. /php-self-hosted/
   Full standalone PHP 8.x application ready to upload to cPanel, Apache, or Nginx.
   Supports SQLite (zero-config) & MySQL. Includes .htaccess and redirect engine.

2. /netlify-deployment/
   Netlify configuration (netlify.toml, _redirects, and serverless functions).

3. lynxurl-database-export.json
   Snapshot of your current links and analytics.

4. database-mysql.sql
   Production MySQL/MariaDB database dump with schema and seed admin user.
`);

    return await zip.generateAsync({ type: 'blob' });
  }

  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }
}
