const fs = require('fs');
const path = require('path');

// Read the source files
const css = fs.readFileSync(path.join(__dirname, '../src/style.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../src/index.js'), 'utf8');

// Create the self-contained HTML
const selfContainedHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GR Discount Approval</title>
    <style>
${css}
    </style>
  </head>
  <body>
    <div class="header">
      <h1>GR Discount Approval</h1>
      <div class="tab-buttons">
        <button id="quotesTab" class="tab-button active">Quotes</button>
        <button id="ordersTab" class="tab-button">Orders</button>
      </div>
    </div>

    <div class="content">
      <div id="quotesSection" class="section active">
        <div class="section-header">
          <h2>Quotes Pending Approval</h2>
          <div class="stats" id="quotesStats">Loading...</div>
        </div>
        <div class="table-container">
          <table id="quotesTable">
            <thead>
              <tr>
                <th>Quote ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Location</th>
                <th>MP Name</th>
                <th>Total</th>
                <th>Discount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="8" class="loading">No quotes loaded. Use window.loadQuotes(data) to load quotes.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div id="ordersSection" class="section">
        <div class="section-header">
          <h2>Orders Pending Approval</h2>
          <div class="stats" id="ordersStats">Loading...</div>
        </div>
        <div class="table-container">
          <table id="ordersTable">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Location</th>
                <th>MP Name</th>
                <th>Total</th>
                <th>Discount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="8" class="loading">No orders loaded. Use window.loadOrders(data) to load orders.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <script>
${js}
    </script>
  </body>
</html>`;

// Ensure dist directory exists
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write the self-contained HTML file
const outputPath = path.join(distDir, 'index.html');
fs.writeFileSync(outputPath, selfContainedHtml, 'utf8');

console.log('✅ Self-contained HTML file created at:', outputPath);
console.log('📦 File includes embedded CSS and JavaScript');
console.log('🔧 Ready for FileMaker deployment');