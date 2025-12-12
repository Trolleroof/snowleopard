import { NextResponse } from 'next/server';

export async function GET() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generate PWA Icons - SnowLeopard</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 900px;
      margin: 50px auto;
      padding: 20px;
      background: #0f1f17;
      color: #fff;
    }
    h1 {
      color: #84cc16;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #a3a3a3;
      margin-bottom: 30px;
    }
    .icon-preview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .icon-item {
      background: #1a2f23;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      border: 1px solid #2a4f33;
    }
    .icon-item canvas {
      border: 2px solid #3a5f43;
      border-radius: 8px;
      margin: 10px 0;
      max-width: 100%;
      height: auto;
    }
    button {
      background: linear-gradient(to right, #84cc16, #10b981);
      color: #000;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      margin: 5px 0;
      width: 100%;
      font-size: 14px;
    }
    button:hover {
      opacity: 0.9;
      transform: scale(1.02);
      transition: all 0.2s;
    }
    .download-all {
      max-width: 300px;
      margin: 30px auto;
      padding: 16px 32px;
      font-size: 16px;
    }
    .instructions {
      background: #1a2520;
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #84cc16;
      margin: 20px 0;
    }
    .instructions h2 {
      color: #84cc16;
      margin-top: 0;
      font-size: 18px;
    }
    .instructions ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    .instructions li {
      margin: 8px 0;
      color: #d4d4d4;
    }
    code {
      background: #0a1510;
      padding: 2px 6px;
      border-radius: 4px;
      color: #84cc16;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <h1>🎨 SnowLeopard PWA Icon Generator</h1>
  <p class="subtitle">Generate required icons for your Progressive Web App</p>

  <div class="instructions">
    <h2>📋 Instructions</h2>
    <ol>
      <li>Click <strong>"Download All Icons"</strong> below</li>
      <li>Move the downloaded files to <code>frontend/public/</code> folder</li>
      <li>Replace the existing SVG placeholders</li>
      <li>Refresh your app and install to iPhone home screen!</li>
    </ol>
  </div>

  <div class="icon-preview">
    <div class="icon-item">
      <h3>Apple Touch Icon</h3>
      <canvas id="canvas180" width="180" height="180"></canvas>
      <p style="color: #a3a3a3; font-size: 12px;">180 × 180 px</p>
      <button onclick="downloadIcon(180)">Download</button>
    </div>
    <div class="icon-item">
      <h3>Android Small</h3>
      <canvas id="canvas192" width="192" height="192"></canvas>
      <p style="color: #a3a3a3; font-size: 12px;">192 × 192 px</p>
      <button onclick="downloadIcon(192)">Download</button>
    </div>
    <div class="icon-item">
      <h3>Android Large</h3>
      <canvas id="canvas512" width="512" height="512"></canvas>
      <p style="color: #a3a3a3; font-size: 12px;">512 × 512 px</p>
      <button onclick="downloadIcon(512)">Download</button>
    </div>
  </div>

  <button class="download-all" onclick="downloadAll()">⬇️ Download All Icons</button>

  <script>
    function drawIcon(canvas) {
      const ctx = canvas.getContext('2d');
      const size = canvas.width;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#84cc16');
      gradient.addColorStop(1, '#10b981');

      // Draw background
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Draw 'S' letter
      ctx.fillStyle = 'white';
      ctx.font = \`bold \${size * 0.55}px system-ui, -apple-system, sans-serif\`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', size / 2, size / 2 + size * 0.02);
    }

    // Draw all icons on load
    ['180', '192', '512'].forEach(size => {
      drawIcon(document.getElementById(\`canvas\${size}\`));
    });

    function downloadIcon(size) {
      const canvas = document.getElementById(\`canvas\${size}\`);
      const link = document.createElement('a');

      let filename;
      if (size === 180) filename = 'apple-touch-icon.png';
      else if (size === 192) filename = 'icon-192.png';
      else if (size === 512) filename = 'icon-512.png';

      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();

      // Visual feedback
      const btn = event.target;
      const originalText = btn.textContent;
      btn.textContent = '✓ Downloaded!';
      btn.style.background = '#10b981';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 2000);
    }

    function downloadAll() {
      const btn = event.target;
      const originalText = btn.textContent;
      btn.textContent = '⬇️ Downloading...';
      btn.disabled = true;

      downloadIcon(180);
      setTimeout(() => downloadIcon(192), 200);
      setTimeout(() => downloadIcon(512), 400);

      setTimeout(() => {
        btn.textContent = '✓ All Downloaded!';
        btn.style.background = '#10b981';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 2000);
      }, 600);
    }
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
