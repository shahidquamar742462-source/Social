// --- CONFIGURATION ---
const adminPassword = "admin123"; // Admin Password yahan change karein
const whatsappNumber = "+91 8235584590"; // Apna WhatsApp Number yahan daalein
let isAdmin = false;
let revenueChart = null;
let currentLang = 'en';

// --- LANGUAGE TOGGLE ---
const langToggle = document.getElementById('langToggle');
langToggle.addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'hi' : 'en';
  langToggle.innerText = currentLang === 'en' ? '🌐 Hindi' : '🌐 English';
  document.querySelectorAll('[data-en]').forEach(el => {
    el.innerText = el.getAttribute(`data-${currentLang}`);
  });
});

// --- DARK MODE ---
const darkModeToggle = document.getElementById('darkModeToggle');
if (localStorage.getItem('theme') === 'dark') { document.body.classList.add('dark-mode'); darkModeToggle.innerText = "☀️"; }
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  darkModeToggle.innerText = isDark ? "☀️" : "🌙";
});

// --- ADMIN LOGIC ---
const adminBtn = document.getElementById('adminBtn');
function toggleAdminUI() {
  document.querySelectorAll('.admin-only').forEach(form => form.style.display = isAdmin ? 'flex' : 'none');
  document.querySelectorAll('.delete-btn').forEach(btn => btn.style.display = isAdmin ? 'inline-block' : 'none');
  adminBtn.innerText = isAdmin ? "🔓 Logout" : "🔐 Admin";
}
adminBtn.addEventListener('click', () => {
  if (isAdmin) { isAdmin = false; toggleAdminUI(); } 
  else {
    const pass = prompt("Enter Admin Password:");
    if (pass === adminPassword) { isAdmin = true; toggleAdminUI(); }
    else if (pass !== null) { alert("Incorrect Password!"); }
  }
});

// --- PWA INSTALL & SHARE ---
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; installBtn.style.display = 'block'; });
installBtn.addEventListener('click', async () => {
  if (deferredPrompt) { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; if (outcome === 'accepted') installBtn.style.display = 'none'; deferredPrompt = null; }
});
document.getElementById('shareBtn').addEventListener('click', () => {
  if (navigator.share) { navigator.share({ title: 'PWTA App', text: 'Support our cause!', url: window.location.href }); } 
  else { alert("Link copied!"); navigator.clipboard.writeText(window.location.href); }
});

// --- LAST UPDATE TIMER ---
function updateLastUpdateTime() {
  const lastUpdate = localStorage.getItem('pwta_last_update');
  const el = document.getElementById('lastUpdateTime');
  if (!lastUpdate) { el.innerText = "No data yet"; return; }
  const diff = Date.now() - parseInt(lastUpdate);
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) el.innerText = "Just now";
  else if (mins < 60) el.innerText = `${mins} mins ago`;
  else if (hours < 24) el.innerText = `${hours} hours ago`;
  else el.innerText = `${days} days ago`;
}
setInterval(updateLastUpdateTime, 60000);
function setLastUpdate() { localStorage.setItem('pwta_last_update', Date.now()); updateLastUpdateTime(); }

// --- HELPER FUNCTION ---
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
}

// --- NOTICE BOARD LOGIC ---
let notices = JSON.parse(localStorage.getItem('pwta_notices')) || [];
const noticeList = document.getElementById('noticeList');
function renderNotices() {
  noticeList.innerHTML = '';
  if(notices.length === 0) { noticeList.innerHTML = '<p style="text-align:center; color:gray;">No notices currently.</p>'; return; }
  notices.slice().reverse().forEach((notice, index) => {
    let deleteBtn = isAdmin ? `<button class="delete-btn" onclick="deleteNotice(${notices.length - 1 - index})">🗑️</button>` : '';
    noticeList.innerHTML += `
      <div class="notice-card">
        <div style="display:flex; justify-content:space-between;">
          <h4>${notice.title}</h4> ${deleteBtn}
        </div>
        <p>${notice.message}</p>
        <small>Posted: ${notice.date}</small>
      </div>
    `;
  });
}
document.getElementById('noticeForm').addEventListener('submit', (e) => {
  e.preventDefault();
  notices.push({ title: document.getElementById('noticeTitle').value, message: document.getElementById('noticeMsg').value, date: new Date().toLocaleString() });
  localStorage.setItem('pwta_notices', JSON.stringify(notices));
  renderNotices(); e.target.reset(); alert("Notice Posted!");
});
function deleteNotice(index) { if(isAdmin && confirm('Delete this notice?')) { notices.splice(index, 1); localStorage.setItem('pwta_notices', JSON.stringify(notices)); renderNotices(); } }

// --- BLOOD DONOR LOGIC ---
let donors = JSON.parse(localStorage.getItem('pwta_donors')) || [];
const bloodList = document.getElementById('bloodList');
const searchBlood = document.getElementById('searchBlood');
function renderDonors() {
  bloodList.innerHTML = '';
  const term = searchBlood.value.toLowerCase();
  const filtered = donors.filter(d => d.name.toLowerCase().includes(term) || d.group.toLowerCase().includes(term));
  if(filtered.length === 0) { bloodList.innerHTML = '<p style="color:gray; grid-column: span 2; text-align:center;">No donors found.</p>'; return; }
  filtered.forEach((donor) => {
    let deleteBtn = isAdmin ? `<button class="delete-btn" onclick="deleteDonor(${donors.indexOf(donor)})">🗑️</button>` : '';
    bloodList.innerHTML += `
      <li>
        <div><b>${donor.name}</b><br><small>📞 ${donor.phone}</small> ${deleteBtn}</div>
        <div class="blood-group-badge">${donor.group}</div>
      </li>
    `;
  });
}
searchBlood.addEventListener('input', renderDonors);
document.getElementById('bloodForm').addEventListener('submit', (e) => {
  e.preventDefault();
  donors.push({ name: document.getElementById('bloodName').value, group: document.getElementById('bloodGroup').value, phone: document.getElementById('bloodPhone').value });
  localStorage.setItem('pwta_donors', JSON.stringify(donors));
  renderDonors(); e.target.reset(); alert("Donor Registered!");
});
function deleteDonor(index) { if(isAdmin && confirm('Remove this donor?')) { donors.splice(index, 1); localStorage.setItem('pwta_donors', JSON.stringify(donors)); renderDonors(); } }

// --- FINANCE LOGIC ---
let revenues = JSON.parse(localStorage.getItem('pwta_revenues')) || [];
let expenditures = JSON.parse(localStorage.getItem('pwta_expenditures')) || [];

function renderRevenues() {
  const revList = document.getElementById('revenueList');
  revList.innerHTML = '';
  let total = 0;
  const term = document.getElementById('searchRev').value.toLowerCase();
  revenues.forEach((item, index) => {
    if(item.name.toLowerCase().includes(term) || item.date.includes(term)) {
      total += Number(item.amount);
      let receiptHTML = item.fileData ? `<a href="${item.fileData}" target="_blank" class="receipt-link">👁️ Receipt</a>` : '';
      let deleteBtnHTML = isAdmin ? `<button class="delete-btn" onclick="deleteRevenue(${index})">🗑️</button>` : '';
      revList.innerHTML += `<li><div class="record-top"><b>${item.name}</b><span>₹${item.amount}</span></div><div class="record-bottom"><span>${item.date}</span><div>${receiptHTML} ${deleteBtnHTML}</div></div></li>`;
    }
  });
  document.getElementById('totalRevenue').innerText = total;
  updateStats();
}

function renderExpenditures() {
  const expList = document.getElementById('expenditureList');
  expList.innerHTML = '';
  let total = 0;
  const term = document.getElementById('searchExp').value.toLowerCase();
  expenditures.forEach((item, index) => {
    if(item.name.toLowerCase().includes(term) || item.date.includes(term) || item.category.toLowerCase().includes(term)) {
      total += Number(item.amount);
      let receiptHTML = item.fileData ? `<a href="${item.fileData}" target="_blank" class="receipt-link">👁️ Receipt</a>` : '';
      let deleteBtnHTML = isAdmin ? `<button class="delete-btn" onclick="deleteExpenditure(${index})">🗑️</button>` : '';
      expList.innerHTML += `<li><div class="record-top"><b>${item.name} <small>(${item.category})</small></b><span>₹${item.amount}</span></div><div class="record-bottom"><span>${item.date}</span><div>${receiptHTML} ${deleteBtnHTML}</div></div></li>`;
    }
  });
  document.getElementById('totalExpenditure').innerText = total;
  updateStats();
}

document.getElementById('searchRev').addEventListener('input', renderRevenues);
document.getElementById('searchExp').addEventListener('input', renderExpenditures);

document.getElementById('revenueForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileData = await readFileAsDataURL(document.getElementById('revFile').files[0]);
  revenues.push({ name: document.getElementById('revName').value, date: document.getElementById('revDate').value, amount: document.getElementById('revAmount').value, fileData });
  saveData(); renderRevenues(); e.target.reset(); setLastUpdate(); alert("Revenue Added!");
});

document.getElementById('expenditureForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileData = await readFileAsDataURL(document.getElementById('expFile').files[0]);
  expenditures.push({ name: document.getElementById('expName').value, category: document.getElementById('expCategory').value, date: document.getElementById('expDate').value, amount: document.getElementById('expAmount').value, fileData });
  saveData(); renderExpenditures(); e.target.reset(); setLastUpdate(); alert("Expense Added!");
});

function deleteRevenue(index) { if(isAdmin && confirm('Delete?')) { revenues.splice(index, 1); saveData(); renderRevenues(); setLastUpdate(); } }
function deleteExpenditure(index) { if(isAdmin && confirm('Delete?')) { expenditures.splice(index, 1); saveData(); renderExpenditures(); setLastUpdate(); } }
function saveData() { localStorage.setItem('pwta_revenues', JSON.stringify(revenues)); localStorage.setItem('pwta_expenditures', JSON.stringify(expenditures)); }

function updateStats() {
  let rev = revenues.reduce((s, i) => s + Number(i.amount), 0);
  let exp = expenditures.reduce((s, i) => s + Number(i.amount), 0);
  let bal = rev - exp;
  document.getElementById('balanceAmount').innerText = bal;
  document.getElementById('balanceAmount').style.color = bal < 0 ? '#ffcccc' : 'white';
  updateChart(rev, exp);
}

function updateChart(rev, exp) {
  const ctx = document.getElementById('financeChart').getContext('2d');
  if (revenueChart) revenueChart.destroy();
  revenueChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Revenue', 'Expenditure'], datasets: [{ data: [rev, exp], backgroundColor: ['#8cc63f', '#e53935'] }] }, options: { responsive: true } });
}

// --- VOLUNTEER ID CARD LOGIC ---
const idCardModal = document.getElementById('idCardModal');
document.getElementById('volunteerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = document.getElementById('volName').value;
  const phone = document.getElementById('volPhone').value;
  const city = document.getElementById('volCity').value;
  
  document.getElementById('cardName').innerText = name;
  document.getElementById('cardPhone').innerText = phone;
  document.getElementById('cardCity').innerText = city;
  
  const randomId = Math.floor(1000 + Math.random() * 9000);
  document.getElementById('cardId').innerText = randomId;
  
  idCardModal.style.display = 'block';

  // Close hone par WhatsApp open hoga
  document.getElementById('closeCardBtn').onclick = () => {
    idCardModal.style.display = 'none';
    const whatsappMsg = `Hello PWTA, I have joined as a Volunteer.%0A*Name:* ${name}%0A*Phone:* ${phone}%0A*City:* ${city}%0A*ID:* PWTA-VOL-${randomId}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`, '_blank');
    document.getElementById('volunteerForm').reset();
  };
});

// --- EXPORT & BACKUP ---
document.getElementById('downloadCSV').addEventListener('click', () => {
  let csv = "Type,Name,Category,Date,Amount\n";
  revenues.forEach(r => csv += `Revenue,"${r.name}",-,${r.date},${r.amount}\n`);
  expenditures.forEach(ex => csv += `Expense,"${ex.name}",${ex.category},${ex.date},${ex.amount}\n`);
  const blob = new Blob([csv], { type: 'text/csv' }); const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'PWTA_Data.csv'; a.click();
});

document.getElementById('downloadPDF').addEventListener('click', () => {
  const element = document.getElementById('reportArea');
  const opt = { margin: 0.5, filename: 'PWTA_Report.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' } };
  alert("Generating PDF..."); html2pdf().set(opt).from(element).save();
});

document.getElementById('backupBtn').addEventListener('click', () => {
  const data = { revenues, expenditures, notices, donors };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'PWTA_Backup.json'; a.click();
});

document.getElementById('restoreFile').addEventListener('change', (e) => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (data.revenues) { revenues = data.revenues; expenditures = data.expenditures; notices = data.notices || []; donors = data.donors || []; }
      saveData(); localStorage.setItem('pwta_notices', JSON.stringify(notices)); localStorage.setItem('pwta_donors', JSON.stringify(donors));
      renderRevenues(); renderExpenditures(); renderNotices(); renderDonors();
      alert("Data Restored Successfully!");
    } catch (err) { alert("Invalid Backup File!"); }
  };
  reader.readAsText(file);
});

// INITIALIZE
renderRevenues(); renderExpenditures(); renderNotices(); renderDonors(); toggleAdminUI(); updateLastUpdateTime();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
