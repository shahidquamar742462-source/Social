// --- HELPER FUNCTION: FILE KO READ KARNA ---
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
    
    revList.innerHTML += `
      <li>
        <div class="record-top">
          <b>${item.name}</b>
          <span>₹${item.amount}</span>
        </div>
        <div class="record-bottom">
          <span>${item.date}</span>
          <div>${receiptHTML} <button class="delete-btn" onclick="deleteRevenue(${index})">🗑️</button></div>
        </div>
      </li>
    `;
  });
  totalRevEl.innerText = total;
  localStorage.setItem('pwta_revenues', JSON.stringify(revenues));
  updateBalance(); // Balance update function call
}

revForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('revFile');
  if (!fileInput.files[0]) { alert("Receipt upload karna mandatory hai!"); return; }

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
  alert("Revenue added with receipt successfully!");
});

function deleteRevenue(index) {
  if(confirm('Delete this revenue entry?')) {
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

    expList.innerHTML += `
      <li>
        <div class="record-top">
          <b>${item.name}</b>
          <span>₹${item.amount}</span>
        </div>
        <div class="record-bottom">
          <span>${item.date}</span>
          <div>${receiptHTML} <button class="delete-btn" onclick="deleteExpenditure(${index})">🗑️</button></div>
        </div>
      </li>
    `;
  });
  totalExpEl.innerText = total;
  localStorage.setItem('pwta_expenditures', JSON.stringify(expenditures));
  updateBalance(); // Balance update function call
}

expForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('expFile');
  if (!fileInput.files[0]) { alert("Receipt upload karna mandatory hai!"); return; }

  const fileData = await readFileAsDataURL(fileInput.files[0]);

  const newExp = {
    name: document.getElementById('expName').value,
    date: document.getElementById('expDate').value,
    amount: document.getElementById('expAmount').value,
    fileData: fileData
  };
  expenditures.push(newExp);
  renderExpenditures();
  expForm.reset();
  alert("Expenditure added with receipt successfully!");
});

function deleteExpenditure(index) {
  if(confirm('Delete this expenditure entry?')) {
    expenditures.splice(index, 1);
    renderExpenditures();
  }
}

// --- BALANCE CALCULATION LOGIC ---
function updateBalance() {
  let revTotal = revenues.reduce((sum, item) => sum + Number(item.amount), 0);
  let expTotal = expenditures.reduce((sum, item) => sum + Number(item.amount), 0);
  let balance = revTotal - expTotal;
  
  const balanceEl = document.getElementById('balanceAmount');
  balanceEl.innerText = balance;
  
  // Agar balance negative (minus) ho jaye toh text red kar denge
  if (balance < 0) {
    balanceEl.style.color = '#ffcccc'; 
  } else {
    balanceEl.style.color = 'white';
  }
}

// --- PDF GENERATE KARNE KA LOGIC ---
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

// Initialize
renderRevenues();
renderExpenditures();

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
