// GR Discount Approval Interface
// This interface loads Orders and Quotes data through window functions from FileMaker

class DiscountApprovalApp {
  constructor() {
    this.quotesData = [];
    this.ordersData = [];
    this.currentTab = 'quotes';
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupWindowFunctions();
    console.log('GR Discount Approval Interface loaded');
    console.log('Use window.loadQuotes(data) to load quotes data');
    console.log('Use window.loadOrders(data) to load orders data');
  }

  setupEventListeners() {
    // Tab switching
    document.getElementById('quotesTab').addEventListener('click', () => this.switchTab('quotes'));
    document.getElementById('ordersTab').addEventListener('click', () => this.switchTab('orders'));
  }

  setupWindowFunctions() {
    // Expose functions to FileMaker
    window.loadQuotes = (data) => {
      console.log('Loading quotes data (raw):', data);
      try {
        // Parse string data from FileMaker
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        this.quotesData = Array.isArray(parsedData) ? parsedData : (parsedData.value || []);
        console.log('Parsed quotes data:', this.quotesData);
        this.renderQuotes();
      } catch (error) {
        console.error('Error parsing quotes data:', error);
        console.log('Raw data received:', data);
        this.quotesData = [];
        this.renderQuotes();
      }
    };

    window.loadOrders = (data) => {
      console.log('Loading orders data (raw):', data);
      try {
        // Parse string data from FileMaker
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        this.ordersData = Array.isArray(parsedData) ? parsedData : (parsedData.value || []);
        console.log('Parsed orders data:', this.ordersData);
        this.renderOrders();
      } catch (error) {
        console.error('Error parsing orders data:', error);
        console.log('Raw data received:', data);
        this.ordersData = [];
        this.renderOrders();
      }
    };

    window.approveQuote = (quoteId) => {
      console.log('Approve quote:', quoteId);
      this.handleApproval('quote', quoteId, true);
    };

    window.denyQuote = (quoteId) => {
      console.log('Deny quote:', quoteId);
      this.handleApproval('quote', quoteId, false);
    };

    window.approveOrder = (orderId) => {
      console.log('Approve order:', orderId);
      this.handleApproval('order', orderId, true);
    };

    window.denyOrder = (orderId) => {
      console.log('Deny order:', orderId);
      this.handleApproval('order', orderId, false);
    };

    // Function to clear data
    window.clearData = () => {
      this.quotesData = [];
      this.ordersData = [];
      this.renderQuotes();
      this.renderOrders();
    };
  }

  switchTab(tab) {
    this.currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tab + 'Tab').classList.add('active');
    
    // Update sections
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.getElementById(tab + 'Section').classList.add('active');
  }

  renderQuotes() {
    const tbody = document.querySelector('#quotesTable tbody');
    const stats = document.getElementById('quotesStats');
    
    if (this.quotesData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="loading">No quotes loaded. Use window.loadQuotes(data) to load quotes.</td></tr>';
      stats.textContent = 'No quotes loaded';
      return;
    }

    const totalAmount = this.quotesData.reduce((sum, quote) => sum + (quote.Order_Total || 0), 0);
    stats.textContent = `${this.quotesData.length} quotes • Total: $${totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

    tbody.innerHTML = this.quotesData.map(quote => `
      <tr data-id="${quote.__kp_Quote}" class="clickable-row">
        <td>${quote.__kp_Quote}</td>
        <td>${this.formatDate(quote.Quote_Date)}</td>
        <td>${quote.NameCustomer || 'N/A'}</td>
        <td>${quote.NameLocation || 'N/A'}</td>
        <td>${quote.MPName || 'N/A'}</td>
        <td class="amount">$${(quote.Order_Total || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td class="discount ${(quote.DiscountEffective || 0) === 0 ? 'zero' : ''}">
          $${(quote.DiscountEffective || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}<br>
          <small>(${(quote.Order_Total + (quote.DiscountEffective || 0)) > 0 ? (((quote.DiscountEffective || 0) / (quote.Order_Total + (quote.DiscountEffective || 0))) * 100).toFixed(1) : 0}%)</small>
        </td>
        <td class="actions" onclick="event.stopPropagation()">
          <button class="btn btn-approve" onclick="window.approveQuote(${quote.__kp_Quote})">
            Approve
          </button>
          <button class="btn btn-deny" onclick="window.denyQuote(${quote.__kp_Quote})">
            Deny
          </button>
        </td>
      </tr>
    `).join('');

    // Add click event listeners to table rows
    this.addRowClickListeners('#quotesTable', 'quote');
  }

  renderOrders() {
    const tbody = document.querySelector('#ordersTable tbody');
    const stats = document.getElementById('ordersStats');
    
    if (this.ordersData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="loading">No orders loaded. Use window.loadOrders(data) to load orders.</td></tr>';
      stats.textContent = 'No orders loaded';
      return;
    }

    const totalAmount = this.ordersData.reduce((sum, order) => sum + (order.Order_Total || 0), 0);
    stats.textContent = `${this.ordersData.length} orders • Total: $${totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

    tbody.innerHTML = this.ordersData.map(order => `
      <tr data-id="${order.__kp_Order}" class="clickable-row">
        <td>${order.__kp_Order}</td>
        <td>${this.formatDate(order.Order_Date)}</td>
        <td>${order.NameCustomer || 'N/A'}</td>
        <td>${order.NameLocation || 'N/A'}</td>
        <td>${order.MPName || 'N/A'}</td>
        <td class="amount">$${(order.Order_Total || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td class="discount ${(order.DiscountEffective || 0) === 0 ? 'zero' : ''}">
          $${(order.DiscountEffective || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}<br>
          <small>(${(order.Order_Total + (order.DiscountEffective || 0)) > 0 ? (((order.DiscountEffective || 0) / (order.Order_Total + (order.DiscountEffective || 0))) * 100).toFixed(1) : 0}%)</small>
        </td>
        <td class="actions" onclick="event.stopPropagation()">
          <button class="btn btn-approve" onclick="window.approveOrder(${order.__kp_Order})">
            Approve
          </button>
          <button class="btn btn-deny" onclick="window.denyOrder(${order.__kp_Order})">
            Deny
          </button>
        </td>
      </tr>
    `).join('');

    // Add click event listeners to table rows
    this.addRowClickListeners('#ordersTable', 'order');
  }

  handleApproval(type, id, isApproved) {
    const action = isApproved ? 'approved' : 'denied';
    const row = document.querySelector(`tr[data-id="${id}"]`);
    
    if (row) {
      // Disable buttons to prevent double-clicking
      const buttons = row.querySelectorAll('.btn');
      buttons.forEach(btn => btn.disabled = true);
      
      // Add visual feedback
      const actionsCell = row.querySelector('.actions');
      const statusClass = isApproved ? 'status-approved' : 'status-denied';
      actionsCell.innerHTML = `<span class="${statusClass}">${action}</span>`;
      
      // Remove from data array
      if (type === 'quote') {
        this.quotesData = this.quotesData.filter(quote => quote.__kp_Quote !== id);
        this.renderQuotes();
      } else {
        this.ordersData = this.ordersData.filter(order => order.__kp_Order !== id);
        this.renderOrders();
      }
    }

    // Notify FileMaker about the action
    if (window.FileMaker) {
      const mode = `${type}_${isApproved ? 'approve' : 'deny'}`;
      const parameter = {
        mode: mode,
        id: id,
        type: type,
        action: isApproved ? 'approve' : 'deny'
      };
      window.FileMaker.PerformScript('Manage: Discount Approval', JSON.stringify(parameter));
    } else {
      const mode = `${type}_${isApproved ? 'approve' : 'deny'}`;
      const parameter = {
        mode: mode,
        id: id,
        type: type,
        action: isApproved ? 'approve' : 'deny'
      };
      console.log(`FileMaker script would be called: 'Manage: Discount Approval' with parameter:`, parameter);
    }
  }

  addRowClickListeners(tableSelector, type) {
    const table = document.querySelector(tableSelector);
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr.clickable-row');
    rows.forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-id');
        if (id) {
          this.handleRowClick(type, id);
        }
      });
    });
  }

  handleRowClick(type, id) {
    console.log(`View ${type}:`, id);
    
    // Call FileMaker script with appropriate mode
    const mode = type === 'quote' ? 'viewQuote' : 'viewOrder';
    if (window.FileMaker) {
      const parameter = {
        mode: mode,
        id: id,
        type: type
      };
      window.FileMaker.PerformScript('Manage: Discount Approval', JSON.stringify(parameter));
    } else {
      const parameter = {
        mode: mode,
        id: id,
        type: type
      };
      console.log(`FileMaker script would be called: 'Manage: Discount Approval' with parameter:`, parameter);
    }
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

// Initialize the app
new DiscountApprovalApp();