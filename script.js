// --- FEATURE 1: ADMIN LOGIC ---
const adminPassword = "admin123"; // Password yahan change kar sakte hain
let isAdmin = false;

const adminBtn = document.getElementById('adminBtn');
const adminForms = document.querySelectorAll('.admin-only');
const deleteBtns = document.querySelectorAll('.delete-btn'); // Will be applied dynamically

function toggleAdminUI() {
  if (isAdmin) {
    adminForms.forEach(form => form.style.display = 'flex');
    document.querySelectorAll('.delete-btn').forEach(btn => btn.style.display = 'inline-block');
    adminBtn.innerText = "🔓 Logout";
  } else {
    adminForms.forEach(form => form.style.display = 'none');
    document.querySelectorAll('.delete-btn').forEach(btn => btn.style.display = 'none');
    adminBtn.innerText = "🔐 Admin";
  }
}

adminBtn.addEventListener('click', () => {
  if (isAdmin) {
    isAdmin = false;
    toggleAdminUI();
    alert("Logged out successfully.");
  } else {
    const pass = prompt("Enter Admin Password:");
    if (pass === adminPassword) {
      isAdmin = true;
      toggleAdminUI();
      alert("Welcome Admin! You can now add/edit records.");
    } else if (pass !== null) {
      alert("Incorrect Password!");
    }
  }
});

// --- FEATURE 6: DARK MODE LOGIC ---
const darkModeToggle = document.getElementById('darkModeToggle');
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  darkModeToggle.innerText = "☀️";
}

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
    darkModeToggle.innerText = "☀️";
  } else {
    localStorage.setItem('theme', 'light');
    darkModeToggle.innerText = "🌙";
  }
});

// --- FEATURE 5: SHARE APP LOGIC ---
document.getElementById('shareBtn').addEventListener('click', () => {
  if (navigator.share) {
    navigator.share({
      title: 'Public Welfare Trust Araria',
      text: 'Support our cause! Check out our app.',
      url: window.location.href
    }).catch(console.error);
  } else {
    alert("Link copied to clipboard!");
    navigator.clipboard.writeText(window.location.href);
  }
});

// --- HELPER FUNCTION ---
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// --- REVENUE LOGIC ---
const revForm = document.getElementById('revenueForm');
const revList = document.getElementById('revenueList');
const totalRevEl = document.getElementById('totalRevenue');
let revenues = JSON.parse(localStorage.getItem('pwta_revenues')) || [];

function renderRevenues() {
  revList.innerHTML = '';
  let total = 0;
  revenues.forEach((item, index) => {
    total += Number(item.amount);
    let receiptHTML = item.fileData ? `<a href="${item.fileData}" target="_blank" class="receipt-link">👁️ View Receipt</a>` : 'No Receipt';
    let deleteBtnHTML = isAdmin ? `<button class="delete-btn" style="display:inline-block" onclick="deleteRevenue(${index})">🗑️</button>` : '';
    
    revList.innerHTML += `
      <li>
        <div class="record-top"><b>${item.name}</b><span>₹${item.amount}</span></div>
        <div class="record-bottom"><span>${item.date}</span><div>${receiptHTML} ${deleteBtnHTML}</div></div>
      </li>
    `;
  });
  totalRevEl.innerText = total;
  localStorage.setItem('pwta_revenues', JSON.stringify(revenues));
  updateBalance();
}

revForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('revFile');
  if (!fileInput.files[0]) { alert("Receipt upload mandatory!"); return; }

  const fileData = await readFileAsDataURL(fileInput.files[0]);
  const newRev = {
    name: document.getElementById('revName').value,
    date: document.getElementById('revDate').value,
    amount: document.getElementById('revAmount').value,
    fileData: fileData
  };
  revenues.push(newRev);
  renderRevenues();
  revForm.reset();
  alert("Revenue added!");
});

function deleteRevenue(index) {
  if(isAdmin && confirm('Delete this revenue entry?')) {
    revenues.splice(index, 1);
    renderRevenues();
  }
}

// --- EXPENDITURE LOGIC ---
const expForm = document.getElementById('expenditureForm');
const expList = document.getElementById('expenditureList');
const totalExpEl = document.getElementById('totalExpenditure');
let expenditures = JSON.parse(localStorage.getItem('pwta_expenditures')) || [];

function renderExpenditures() {
  expList.innerHTML = '';
  let total = 0;
  expenditures.forEach((item, index) => {
    total += Number(item.amount);
    let receiptHTML = item.fileData ? `<a href="${item.fileData}" target="_blank" class="receipt-link">👁️ View Receipt</a>` : 'No Receipt';
    let deleteBtnHTML = isAdmin ? `<button class="delete-btn" style="display:inline-block" onclick="deleteExpenditure(${index})">🗑️</button>` : '';
    
    // Feature 3: Showing Category
    let categoryText = item.category ? `(${item.category})` : '';

    expList.innerHTML += `
      <li>
        <div class="record-top"><b>${item.name} <small>${categoryText}</small></b><span>₹${item.amount}</span></div>
        <div class="record-bottom"><span>${item.date}</span><div>${receiptHTML} ${deleteBtnHTML}</div></div>
      </li>
    `;
  });
  totalExpEl.innerText = total;
  localStorage.setItem('pwta_expenditures', JSON.stringify(expenditures));
  updateBalance();
}

expForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('expFile');
  if (!fileInput.files[0]) { alert("Receipt upload mandatory!"); return; }

  const fileData = await readFileAsDataURL(fileInput.files[0]);
  const newExp = {
    name: document.getElementById('expName').value,
    category: document.getElementById('expCategory').value, // Feature 3
    date: document.getElementById('expDate').value,
    amount: document.getElementById('expAmount').value,
    fileData: fileData
  };
  expenditures.push(newExp);
  renderExpenditures();
  expForm.reset();
  alert("Expenditure added!");
});

function deleteExpenditure(index) {
  if(isAdmin && confirm('Delete this expenditure entry?')) {
    expenditures.splice(index, 1);
    renderExpenditures();
  }
}

// --- BALANCE LOGIC ---
function updateBalance() {
  let revTotal = revenues.reduce((sum, item) => sum + Number(item.amount), 0);
  let expTotal = expenditures.reduce((sum, item) => sum + Number(item.amount), 0);
  let balance = revTotal - expTotal;
  
  const balanceEl = document.getElementById('balanceAmount');
  balanceEl.innerText = balance;
  balanceEl.style.color = balance < 0 ? '#ffcccc' : 'white';
}

// --- PDF LOGIC ---
document.getElementById('downloadPDF').addEventListener('click', () => {
  const element = document.getElementById('reportArea');
  const opt = {
    margin:       0.5,
    filename:     'PWTA_Financial_Report.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
  };
  alert("Generating PDF... Please wait.");
  html2pdf().set(opt).from(element).save();
});

// Initialize All
renderRevenues();
renderExpenditures();
toggleAdminUI(); // Ensure forms are hidden by default

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
