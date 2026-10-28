const STORAGE_KEY = 'transaksi-mahasiswa';
const BUDGET_KEY = 'budget-mahasiswa';
const THEME_KEY = 'theme-mahasiswa';
const COLOR_KEY = 'color-mahasiswa';
const LANG_KEY = 'lang-mahasiswa';
const STREAK_KEY = 'streak-mahasiswa';
const PROFILE_KEY = 'profile-mahasiswa';
const $ = id => document.getElementById(id);

const EMOJI = {
  'Makan': '🍔', 'Transport': '🚌', 'Kuliah': '📚', 'Hiburan': '🎮',
  'Kos & Tagihan': '🏠', 'Uang Saku': '💰', 'Beasiswa': '🎓',
  'Gaji / Part-time': '💼', 'Hadiah': '🎁', 'Lainnya': '✨'
};
const emojiFor = cat => EMOJI[cat] || '✨';

function loadData(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } 
  catch { return fallback; }
}

let transactions = loadData(STORAGE_KEY, []);
let budgets = loadData(BUDGET_KEY, {}); 
let streak = loadData(STREAK_KEY, { count: 0, lastDate: null });
let profile = loadData(PROFILE_KEY, { name: 'Halo, Mahasiswa!', photo: null });
let userLang = localStorage.getItem(LANG_KEY) || 'id';

const rupiah = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

function escapeHTML(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }
function formatDate(iso) { return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); }
function getTodayString() { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }

// KAMUS BAHASA
const TRANSLATIONS = {
  id: {
    app_desc: 'Catat pemasukan dan pengeluaran harianmu dengan mudah.',
    balance: 'Saldo', income: 'Pemasukan', expense: 'Pengeluaran', diff: 'Selisih',
    add_transaction: 'Tambah Transaksi', expense_opt: 'Pengeluaran', income_opt: 'Pemasukan', save_btn: 'Simpan',
    monthly_budget: '🎯 Budget Bulanan', set_budget: 'Atur Budget', history: 'Riwayat', export: '📥 Export',
    no_transaction: 'Belum ada transaksi. Yuk catat pengeluaran pertamamu 👇', expense_per_cat: 'Pengeluaran per Kategori',
    profile_desc: 'Atur aplikasi Duit Gue kamu di sini.', dana_statement: 'Dana Statement', dana_desc: 'Lihat ringkasan & grafik bulanan',
    theme_skin: 'Tema (Skin)', theme_desc: 'Ubah warna tampilan aplikasi', language: 'Bahasa', language_desc: 'Ganti bahasa aplikasi',
    backup_data: 'Backup Data', backup_desc: 'Simpan data ke file .json', restore_data: 'Restore Data', restore_desc: 'Pulihkan data dari file .json',
    info: 'Info Umum', info_desc: 'Tentang aplikasi & versi',
    nav_home: 'Transaksi', nav_rekap: 'Rekap', nav_hutang: 'Hutang', nav_impian: 'Impian', nav_profil: 'Profil',
    choose_color: 'Pilih Warna Gradasi', chart_title: 'Grafik 2 Bulan Terakhir',
    help_center: 'Pusat Bantuan', help_desc: 'Hubungi admin via WhatsApp', privacy_notice: 'Privacy Notice', privacy_desc: 'Kebijakan privasi aplikasi'
  },
  en: {
    app_desc: 'Record your daily income and expenses easily.',
    balance: 'Balance', income: 'Income', expense: 'Expense', diff: 'Difference',
    add_transaction: 'Add Transaction', expense_opt: 'Expense', income_opt: 'Income', save_btn: 'Save',
    monthly_budget: '🎯 Monthly Budget', set_budget: 'Set Budget', history: 'History', export: '📥 Export',
    no_transaction: 'No transactions yet. Let\'s record your first expense 👇', expense_per_cat: 'Expense per Category',
    profile_desc: 'Manage your Duit Gue app here.', dana_statement: 'Dana Statement', dana_desc: 'View monthly summary & chart',
    theme_skin: 'Theme (Skin)', theme_desc: 'Change app color theme', language: 'Language', language_desc: 'Change app language',
    backup_data: 'Backup Data', backup_desc: 'Save data to .json file', restore_data: 'Restore Data', restore_desc: 'Restore data from .json file',
    info: 'General Info', info_desc: 'About app & version',
    nav_home: 'Transaction', nav_rekap: 'Summary', nav_hutang: 'Debt', nav_impian: 'Dream', nav_profil: 'Profile',
    choose_color: 'Choose Gradient Color', chart_title: 'Last 2 Months Chart',
    help_center: 'Help Center', help_desc: 'Contact admin via WhatsApp', privacy_notice: 'Privacy Notice', privacy_desc: 'Application privacy policy'
  }
};

function applyLanguage(lang) {
  userLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  document.querySelectorAll('[data-lang]').forEach(el => {
    const key = el.getAttribute('data-lang');
    if (TRANSLATIONS[lang][key]) {
      if (el.tagName === 'INPUT') el.placeholder = TRANSLATIONS[lang][key];
      else el.textContent = TRANSLATIONS[lang][key];
    }
  });
  document.querySelectorAll('.btn-lang').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

// SISTEM TEMA & WARNA GRADASI
function applyTheme(theme, color) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.color = color;
  $('themeToggle').textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem(THEME_KEY, theme);
  localStorage.setItem(COLOR_KEY, color);
  
  document.querySelectorAll('.color-opt').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-color') === color);
  });
}

const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
const savedColor = localStorage.getItem(COLOR_KEY) || 'indigo';
applyTheme(savedTheme, savedColor);
applyLanguage(userLang);

$('themeToggle').addEventListener('click', () => {
  const newTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme, document.documentElement.dataset.color);
});

// STREAK
function updateStreak() {
  const todayStr = getTodayString();
  if (streak.lastDate === todayStr) return;
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); yesterday.setMinutes(yesterday.getMinutes() - yesterday.getTimezoneOffset());
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  streak.count = (streak.lastDate === yesterdayStr) ? streak.count + 1 : 1;
  streak.lastDate = todayStr;
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  renderStreak();
}
function checkStreakValidity() {
  const todayStr = getTodayString();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); yesterday.setMinutes(yesterday.getMinutes() - yesterday.getTimezoneOffset());
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  if (streak.lastDate !== todayStr && streak.lastDate !== yesterdayStr) { streak.count = 0; localStorage.setItem(STREAK_KEY, JSON.stringify(streak)); }
  renderStreak();
}
function renderStreak() {
  const badge = $('streakBadge');
  if (streak.count > 0) { $('streakCount').textContent = streak.count; badge.classList.remove('hidden'); } 
  else { badge.classList.add('hidden'); }
}
checkStreakValidity();

const CATEGORIES = {
  expense: ['Makan', 'Transport', 'Kuliah', 'Hiburan', 'Kos & Tagihan', 'Lainnya'],
  income: ['Uang Saku', 'Beasiswa', 'Gaji / Part-time', 'Hadiah', 'Lainnya']
};
const PLACEHOLDERS = {
  expense: 'Keterangan (mis. Makan siang)', income: 'Keterangan (mis. Uang saku bulanan)'
};

function fillCategories() {
  const type = $('type').value;
  $('category').innerHTML = CATEGORIES[type].map(c => `<option value="${escapeHTML(c)}">${emojiFor(c)} ${escapeHTML(c)}</option>`).join('');
  $('desc').placeholder = PLACEHOLDERS[type];
}
function fillFilterCategories() {
  const all = [...new Set([...CATEGORIES.expense, ...CATEGORIES.income])];
  $('filterCategory').innerHTML = '<option value="all">Semua kategori</option>' + all.map(c => `<option value="${escapeHTML(c)}">${emojiFor(c)} ${escapeHTML(c)}</option>`).join('');
}
function fillBudgetCategories() {
  $('budgetCategory').innerHTML = CATEGORIES.expense.map(c => `<option value="${escapeHTML(c)}">${emojiFor(c)} ${escapeHTML(c)}</option>`).join('');
}

$('type').addEventListener('change', fillCategories);
fillCategories(); fillFilterCategories(); fillBudgetCategories();

const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
const today = now.toISOString().slice(0, 10);
$('date').value = today; $('filterMonth').value = today.slice(0, 7);

$('form').addEventListener('submit', e => {
  e.preventDefault();
  const amount = Number($('amount').value);
  const desc = $('desc').value.trim();
  if (!desc || !Number.isFinite(amount) || amount <= 0) return;
  transactions.push({ id: crypto.randomUUID(), type: $('type').value, date: $('date').value, desc, amount, category: $('category').value });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  $('desc').value = ''; $('amount').value = '';
  updateStreak(); render();
  const btn = e.target.querySelector('.btn');
  btn.textContent = '✅ Tersimpan!'; btn.classList.add('saved');
  setTimeout(() => { btn.textContent = TRANSLATIONS[userLang].save_btn; btn.classList.remove('saved'); }, 1200);
});

$('exportBtn').addEventListener('click', () => {
  if (transactions.length === 0) return alert('Belum ada data transaksi.');
  const headers = ['Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Jumlah (Rp)'];
  const rows = transactions.map(t => [t.date, t.type === 'income' ? 'Pemasukan' : 'Pengeluaran', t.category, t.desc, t.amount]);
  const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `DuitGue_Laporan_${today}.csv`);
  link.click();
});

$('toggleBudgetBtn').addEventListener('click', () => $('budgetForm').classList.toggle('hidden'));
$('budgetForm').addEventListener('submit', e => {
  e.preventDefault();
  const cat = $('budgetCategory').value;
  const amt = Number($('budgetAmount').value);
  if (amt > 0) {
    budgets[cat] = amt;
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
    $('budgetAmount').value = ''; $('budgetForm').classList.add('hidden');
    renderBudgets();
  }
});

let pendingDelete = null; 
const TOAST_DURATION = 5000;
$('list').addEventListener('click', e => {
  const btn = e.target.closest('.delete'); if (!btn) return;
  const id = btn.getAttribute('data-id'); 
  const index = transactions.findIndex(t => String(t.id) === String(id));
  if (index === -1) return;
  const removed = transactions[index];
  transactions.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  render();
  const toast = $('toast'); $('toastMsg').textContent = `"${removed.desc}" dihapus`; toast.classList.add('show');
  if (pendingDelete) clearTimeout(pendingDelete);
  pendingDelete = setTimeout(() => toast.classList.remove('show'), TOAST_DURATION);
  $('undoBtn').onclick = () => {
    clearTimeout(pendingDelete); toast.classList.remove('show');
    transactions.splice(index, 0, removed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    render();
  };
});

$('filterMonth').addEventListener('change', render);
$('filterCategory').addEventListener('change', render);

function getFiltered() {
  const month = $('filterMonth').value; const cat = $('filterCategory').value;
  return transactions.filter(t => (!month || t.date.startsWith(month)) && (cat === 'all' || t.category === cat)).sort((a, b) => b.date.localeCompare(a.date) || (b.id > a.id ? 1 : -1));
}

function render() {
  const data = getFiltered();
  const income = data.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = data.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  $('income').textContent = rupiah(income); $('expense').textContent = rupiah(expense);
  $('balance').textContent = rupiah(income - expense); $('difference').textContent = rupiah(income - expense);
  $('empty').style.display = data.length ? 'none' : 'block';
  $('list').innerHTML = data.map(t => `
    <li class="item" data-id="${t.id}">
      <span class="item-emoji">${emojiFor(t.category)}</span>
      <div class="item-info"><strong>${escapeHTML(t.desc)}</strong><small>${escapeHTML(t.category)} · ${formatDate(t.date)}</small></div>
      <span class="amount ${t.type}">${t.type === 'income' ? '+' : '-'}${rupiah(t.amount)}</span>
      <button class="delete" data-id="${t.id}">🗑</button>
    </li>`).join('');
  renderComparison(); renderBudgets(); renderBreakdown(data);
}

function renderComparison() {
  const box = $('comparisonBox'); const currentMonth = $('filterMonth').value;
  if (!currentMonth) { box.className = 'comparison-box'; return; }
  const [year, month] = currentMonth.split('-'); const d = new Date(year, month - 1, 1); d.setMonth(d.getMonth() - 1);
  const prevMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  const getExpenseTotal = (m) => transactions.filter(t => t.type === 'expense' && t.date.startsWith(m)).reduce((s, t) => s + t.amount, 0);
  const currentExpense = getExpenseTotal(currentMonth); const prevExpense = getExpenseTotal(prevMonth);
  if (prevExpense === 0 && currentExpense === 0) { box.className = 'comparison-box'; return; }
  else if (prevExpense === 0 && currentExpense > 0) { box.className = 'comparison-box show same'; box.innerHTML = `Belum ada data pengeluaran di bulan lalu.`; return; }
  const diff = currentExpense - prevExpense; const pct = Math.round(Math.abs(diff) / prevExpense * 100);
  if (diff > 0) { box.className = 'comparison-box show up'; box.innerHTML = `📈 Pengeluaran naik <strong>${pct}%</strong> dari bulan lalu.`; }
  else if (diff < 0) { box.className = 'comparison-box show down'; box.innerHTML = `📉 Mantap! Pengeluaran turun <strong>${pct}%</strong> dari bulan lalu.`; }
  else { box.className = 'comparison-box show same'; box.innerHTML = `Pengeluaranmu sama persis dengan bulan lalu.`; }
}

function renderBudgets() {
  const month = $('filterMonth').value; 
  const monthExpenses = transactions.filter(t => t.type === 'expense' && (!month || t.date.startsWith(month))).reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
  const budgetEntries = Object.entries(budgets);
  if (budgetEntries.length === 0) { $('budgetList').innerHTML = '<p class="empty" style="padding: .5rem 0; font-size:.85rem;">Belum ada budget.</p>'; return; }
  $('budgetList').innerHTML = budgetEntries.map(([cat, limit]) => {
    const used = monthExpenses[cat] || 0; const pct = Math.min((used / limit) * 100, 100);
    let color = 'var(--success)', alertMsg = '';
    if (pct >= 100) { color = 'var(--expense)'; alertMsg = `<div class="budget-alert" style="color:var(--expense)">⚠️ Budget habis!</div>`; } 
    else if (pct >= 75) { color = 'var(--warning)'; alertMsg = `<div class="budget-alert" style="color:var(--warning)">⚠️ Hampir habis</div>`; }
    return `<div class="budget-item"><div class="budget-info"><span class="budget-title">${emojiFor(cat)} ${escapeHTML(cat)}</span><span class="budget-numbers">${rupiah(used)} / ${rupiah(limit)}</span></div><div class="progress-track"><div class="progress-fill" style="width: ${pct}%; background: ${color};"></div></div>${alertMsg}</div>`;
  }).join('');
}

function renderBreakdown(data) {
  const expenses = data.filter(t => t.type === 'expense'); const total = expenses.reduce((s, t) => s + t.amount, 0);
  if (!total) { $('breakdown').innerHTML = '<p class="empty">Belum ada pengeluaran.</p>'; return; }
  const perCategory = {}; expenses.forEach(t => { perCategory[t.category] = (perCategory[t.category] || 0) + t.amount; });
  const entries = Object.entries(perCategory).sort((a, b) => b[1] - a[1]); const colors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];
  let acc = 0; const segments = entries.map(([, sum], i) => { const start = acc; acc += (sum / total) * 100; return `${colors[i % colors.length]} ${start}% ${acc}%`; }).join(', ');
  const legend = entries.map(([cat, sum], i) => { const pct = Math.round((sum / total) * 100); return `<li class="legend-item"><span class="legend-dot" style="background:${colors[i % colors.length]}"></span><span class="legend-name">${emojiFor(cat)} ${escapeHTML(cat)}</span><span class="legend-val">${rupiah(sum)} (${pct}%)</span></li>`; }).join('');
  $('breakdown').innerHTML = `<div class="donut-wrap"><div class="donut" style="background: conic-gradient(${segments})"><div class="donut-hole"><span>Total</span><strong>${rupiah(total)}</strong></div></div><ul class="legend">${legend}</ul></div>`;
}

render();

// ================= NAVIGASI & PROFIL =================
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    e.currentTarget.classList.add('active');
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById(e.currentTarget.getAttribute('data-target')).classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

function renderProfile() {
  if (profile.name) document.getElementById('profileName').textContent = profile.name;
  if (profile.photo) {
    document.getElementById('avatarEmoji').style.display = 'none';
    const img = document.getElementById('avatarImage'); img.src = profile.photo; img.style.display = 'block';
  }
}
renderProfile();

document.getElementById('editProfileBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  const newName = prompt('Masukkan nama panggilanmu:', profile.name);
  if (newName && newName.trim() !== '') {
    profile.name = newName.trim(); localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); renderProfile();
  }
});

const photoInput = document.getElementById('photoInput');
document.getElementById('profileAvatar').addEventListener('click', (e) => { e.stopPropagation(); photoInput.click(); });
photoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      profile.photo = event.target.result; localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); renderProfile();
    };
    reader.readAsDataURL(file);
  }
});

// BACKUP & RESTORE
document.getElementById('btn-backup').addEventListener('click', () => {
  const dataToBackup = { transactions, budgets, streak, profile };
  const dataStr = JSON.stringify(dataToBackup, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `DuitGue_Backup_${today}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

const restoreInput = document.getElementById('restoreInput');
document.getElementById('btn-restore').addEventListener('click', () => { restoreInput.click(); });

restoreInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const parsedData = JSON.parse(event.target.result);
        if (parsedData.transactions && parsedData.profile) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData.transactions));
          localStorage.setItem(BUDGET_KEY, JSON.stringify(parsedData.budgets || {}));
          localStorage.setItem(STREAK_KEY, JSON.stringify(parsedData.streak || { count: 0, lastDate: null }));
          localStorage.setItem(PROFILE_KEY, JSON.stringify(parsedData.profile));
          alert('Data berhasil dipulihkan! Halaman akan dimuat ulang.');
          window.location.reload();
        } else { alert('Format file backup tidak valid.'); }
      } catch (err) { alert('Gagal membaca file. Pastikan file berekstensi .json dari aplikasi Duit Gue.'); }
    };
    reader.readAsText(file);
  }
});

// FUNGSI NAVIGASI SUB-MENU
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
  document.getElementById(pageId).classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('btn-theme').addEventListener('click', () => showPage('page-theme'));
document.getElementById('backToProfileFromTheme').addEventListener('click', () => showPage('page-profil'));
document.querySelectorAll('.color-opt').forEach(btn => {
  btn.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme, btn.getAttribute('data-color')));
});

document.getElementById('btn-language').addEventListener('click', () => showPage('page-language'));
document.getElementById('backToProfileFromLang').addEventListener('click', () => showPage('page-profil'));
document.querySelectorAll('.btn-lang').forEach(btn => {
  btn.addEventListener('click', () => applyLanguage(btn.getAttribute('data-lang')));
});

// KHUSUS DANA STATEMENT
document.getElementById('btn-dana-statement').addEventListener('click', () => {
  showPage('page-dana-statement');
  // Beri jeda sedikit (50ms) agar DOM sepenuhnya terlihat, baru gambar grafiknya
  setTimeout(() => {
    renderChart();
  }, 50); 
});
document.getElementById('backToProfileFromDana').addEventListener('click', () => showPage('page-profil'));

document.getElementById('btn-info').addEventListener('click', () => showPage('page-info-umum'));
document.getElementById('backToProfile').addEventListener('click', () => showPage('page-profil'));
document.getElementById('backToInfo').addEventListener('click', () => showPage('page-info-umum'));
document.getElementById('btn-bantuan').addEventListener('click', () => {
  const waNumber = '6281992053002'; 
  const waMessage = encodeURIComponent('Halo Admin Duit Gue, saya butuh bantuan terkait aplikasi.');
  window.open(`https://wa.me/${waNumber}?text=${waMessage}`, '_blank');
});
document.getElementById('btn-privacy').addEventListener('click', () => showPage('page-privacy'));

// FUNGSI RENDER GRAFIK (SUDAH DIPERBAIKI)
function renderChart() {
  const chartContainer = document.getElementById('statChart');
  if (!chartContainer) return;
  chartContainer.innerHTML = ''; 

  const todayDate = new Date();
  const currentYear = todayDate.getFullYear();
  const currentMonth = todayDate.getMonth();

  const monthsData = [];
  // Looping 2 bulan terakhir
  for (let i = 1; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    
    const label = d.toLocaleDateString(userLang === 'en' ? 'en-US' : 'id-ID', { month: 'short' });
    
    const inc = transactions.filter(t => t.type === 'income' && t.date.startsWith(monthStr)).reduce((s, t) => s + t.amount, 0);
    const exp = transactions.filter(t => t.type === 'expense' && t.date.startsWith(monthStr)).reduce((s, t) => s + t.amount, 0);
    
    monthsData.push({ label, inc, exp });
  }

  const maxVal = Math.max(...monthsData.flatMap(m => [m.inc, m.exp]), 10000);

  monthsData.forEach(data => {
    const group = document.createElement('div');
    group.className = 'chart-bar-group';

    const barInc = document.createElement('div');
    barInc.className = 'chart-bar income';
    const heightInc = data.inc > 0 ? (data.inc / maxVal) * 100 : 0;
    barInc.style.height = `${Math.max(heightInc, 2)}%`; 
    if (data.inc > 0) barInc.title = `Pemasukan: ${rupiah(data.inc)}`;
    
    const barExp = document.createElement('div');
    barExp.className = 'chart-bar expense';
    const heightExp = data.exp > 0 ? (data.exp / maxVal) * 100 : 0;
    barExp.style.height = `${Math.max(heightExp, 2)}%`;
    if (data.exp > 0) barExp.title = `Pengeluaran: ${rupiah(data.exp)}`;

    const label = document.createElement('div');
    label.className = 'chart-label';
    label.textContent = data.label;

    group.appendChild(barInc);
    group.appendChild(barExp);
    group.appendChild(label);
    
    chartContainer.appendChild(group);
  });
}