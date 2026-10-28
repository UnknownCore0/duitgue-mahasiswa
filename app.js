const STORAGE_KEY = 'transaksi-mahasiswa';
const BUDGET_KEY = 'budget-mahasiswa';
const THEME_KEY = 'theme-mahasiswa';
const STREAK_KEY = 'streak-mahasiswa';
const $ = id => document.getElementById(id);

const EMOJI = {
  'Makan': '🍔', 'Transport': '🚌', 'Kuliah': '📚', 'Hiburan': '🎮',
  'Kos & Tagihan': '🏠', 'Uang Saku': '💰', 'Beasiswa': '🎓',
  'Gaji / Part-time': '💼', 'Hadiah': '🎁', 'Lainnya': '✨'
};
const emojiFor = cat => EMOJI[cat] || '✨';

function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } 
  catch { return []; }
}
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}
function loadBudgets() {
  try { return JSON.parse(localStorage.getItem(BUDGET_KEY)) || {}; } 
  catch { return {}; }
}
function saveBudgets() {
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
}
function loadStreak() {
  try { return JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0, lastDate: null }; } 
  catch { return { count: 0, lastDate: null }; }
}
function saveStreak(streak) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
}

let transactions = loadData();
let budgets = loadBudgets(); 
let streak = loadStreak();

const rupiah = n =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
function formatDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}
function getTodayString() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

const CATEGORIES = {
  expense: ['Makan', 'Transport', 'Kuliah', 'Hiburan', 'Kos & Tagihan', 'Lainnya'],
  income: ['Uang Saku', 'Beasiswa', 'Gaji / Part-time', 'Hadiah', 'Lainnya']
};
const PLACEHOLDERS = {
  expense: 'Keterangan (mis. Makan siang)',
  income: 'Keterangan (mis. Uang saku bulanan)'
};

function fillCategories() {
  const type = $('type').value;
  $('category').innerHTML = CATEGORIES[type]
    .map(c => `<option value="${escapeHTML(c)}">${emojiFor(c)} ${escapeHTML(c)}</option>`)
    .join('');
  $('desc').placeholder = PLACEHOLDERS[type];
}

function fillFilterCategories() {
  const all = [...new Set([...CATEGORIES.expense, ...CATEGORIES.income])];
  $('filterCategory').innerHTML =
    '<option value="all">Semua kategori</option>' +
    all.map(c => `<option value="${escapeHTML(c)}">${emojiFor(c)} ${escapeHTML(c)}</option>`).join('');
}

function fillBudgetCategories() {
  $('budgetCategory').innerHTML = CATEGORIES.expense
    .map(c => `<option value="${escapeHTML(c)}">${emojiFor(c)} ${escapeHTML(c)}</option>`)
    .join('');
}

$('type').addEventListener('change', fillCategories);
fillCategories();
fillFilterCategories();
fillBudgetCategories();

const now = new Date();
now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
const today = now.toISOString().slice(0, 10);
$('date').value = today;
$('filterMonth').value = today.slice(0, 7);

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('themeToggle').textContent = theme === 'dark' ? '☀️' : '🌙';
  $('themeToggle').setAttribute('aria-label', theme === 'dark' ? 'Mode terang' : 'Mode gelap');
  localStorage.setItem(THEME_KEY, theme);
}
applyTheme(localStorage.getItem(THEME_KEY) || 'light');
$('themeToggle').addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});

function updateStreak() {
  const todayStr = getTodayString();
  if (streak.lastDate === todayStr) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setMinutes(yesterday.getMinutes() - yesterday.getTimezoneOffset());
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (streak.lastDate === yesterdayStr) {
    streak.count += 1;
  } else {
    streak.count = 1;
  }
  
  streak.lastDate = todayStr;
  saveStreak(streak);
  renderStreak();
}

function checkStreakValidity() {
  const todayStr = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setMinutes(yesterday.getMinutes() - yesterday.getTimezoneOffset());
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (streak.lastDate !== todayStr && streak.lastDate !== yesterdayStr) {
    streak.count = 0;
    saveStreak(streak);
  }
  renderStreak();
}

function renderStreak() {
  const badge = $('streakBadge');
  if (streak.count > 0) {
    $('streakCount').textContent = streak.count;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

checkStreakValidity();

$('form').addEventListener('submit', e => {
  e.preventDefault();
  const amount = Number($('amount').value);
  const desc = $('desc').value.trim();
  if (!desc || !Number.isFinite(amount) || amount <= 0) return;

  transactions.push({
    id: crypto.randomUUID(),
    type: $('type').value,
    date: $('date').value,
    desc,
    amount,
    category: $('category').value
  });
  saveData();
  $('desc').value = '';
  $('amount').value = '';
  
  updateStreak(); 
  render();
  
  const btn = e.target.querySelector('.btn');
  btn.textContent = '✅ Tersimpan!';
  btn.classList.add('saved');
  setTimeout(() => {
    btn.textContent = 'Simpan';
    btn.classList.remove('saved');
  }, 1200);
});

$('exportBtn').addEventListener('click', () => {
  if (transactions.length === 0) {
    alert('Belum ada data transaksi untuk diexport.');
    return;
  }

  const headers = ['Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Jumlah (Rp)'];
  const rows = transactions.map(t => [
    t.date,
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    t.category,
    t.desc,
    t.amount
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `DuitGue_${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
});

$('toggleBudgetBtn').addEventListener('click', () => {
  $('budgetForm').classList.toggle('hidden');
});

$('budgetForm').addEventListener('submit', e => {
  e.preventDefault();
  const cat = $('budgetCategory').value;
  const amt = Number($('budgetAmount').value);
  if (amt > 0) {
    budgets[cat] = amt;
    saveBudgets();
    $('budgetAmount').value = '';
    $('budgetForm').classList.add('hidden');
    renderBudgets();
  }
});

// LOGIKA HAPUS & TOAST YANG SUDAH DISEDERHANAKAN
$('list').addEventListener('click', e => {
  const btn = e.target.closest('.delete');
  if (!btn) return;
  const id = btn.getAttribute('data-id'); 
  const index = transactions.findIndex(t => String(t.id) === String(id));
  if (index === -1) return;

  const removed = transactions[index];
  transactions.splice(index, 1);
  saveData();
  render();

  // Tampilkan Toast
  const toast = $('toast');
  $('toastMsg').textContent = `"${removed.desc}" dihapus`;
  toast.classList.add('show');

  // Sembunyikan setelah 5 detik
  const timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);

  // Tombol Undo
  $('undoBtn').onclick = () => {
    clearTimeout(timer);
    toast.classList.remove('show');
    transactions.splice(index, 0, removed);
    saveData();
    render();
  };
});

$('filterMonth').addEventListener('change', render);
$('filterCategory').addEventListener('change', render);

function getFiltered() {
  const month = $('filterMonth').value;
  const cat = $('filterCategory').value;
  return transactions
    .filter(t => !month || t.date.startsWith(month))
    .filter(t => cat === 'all' || t.category === cat)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.id > a.id ? 1 : -1));
}

function render() {
  const data = getFiltered();

  const income = data.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = data.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  
  $('income').textContent = rupiah(income);
  $('expense').textContent = rupiah(expense);
  $('balance').textContent = rupiah(income - expense);
  $('difference').textContent = rupiah(income - expense);

  $('empty').style.display = data.length ? 'none' : 'block';
  $('list').innerHTML = data.map(t => `
    <li class="item" data-id="${t.id}">
      <span class="item-emoji" aria-hidden="true">${emojiFor(t.category)}</span>
      <div class="item-info">
        <strong>${escapeHTML(t.desc)}</strong>
        <small>${escapeHTML(t.category)} · ${formatDate(t.date)}</small>
      </div>
      <span class="amount ${t.type}">${t.type === 'income' ? '+' : '-'}${rupiah(t.amount)}</span>
      <button class="delete" data-id="${t.id}" aria-label="Hapus">🗑</button>
    </li>
  `).join('');

  renderComparison(); 
  renderBudgets();
  renderBreakdown(data);
}

function renderComparison() {
  const box = $('comparisonBox');
  const currentMonth = $('filterMonth').value;

  if (!currentMonth) {
    box.className = 'comparison-box';
    return;
  }

  const [year, month] = currentMonth.split('-');
  const d = new Date(year, month - 1, 1);
  d.setMonth(d.getMonth() - 1);
  const prevMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  const getExpenseTotal = (m) => transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(m))
    .reduce((s, t) => s + t.amount, 0);

  const currentExpense = getExpenseTotal(currentMonth);
  const prevExpense = getExpenseTotal(prevMonth);

  if (prevExpense === 0 && currentExpense === 0) {
    box.className = 'comparison-box';
    return; 
  } else if (prevExpense === 0 && currentExpense > 0) {
    box.className = 'comparison-box show same';
    box.innerHTML = `Belum ada data pengeluaran di bulan lalu.`;
    return;
  }

  const diff = currentExpense - prevExpense;
  const pct = Math.round(Math.abs(diff) / prevExpense * 100);

  if (diff > 0) {
    box.className = 'comparison-box show up';
    box.innerHTML = `📈 Pengeluaran naik <strong>${pct}%</strong> dari bulan lalu (${rupiah(prevExpense)}).`;
  } else if (diff < 0) {
    box.className = 'comparison-box show down';
    box.innerHTML = `📉 Mantap! Pengeluaran turun <strong>${pct}%</strong> dari bulan lalu.`;
  } else {
    box.className = 'comparison-box show same';
    box.innerHTML = `Pengeluaranmu sama persis dengan bulan lalu.`;
  }
}

function renderBudgets() {
  const month = $('filterMonth').value; 
  
  const monthExpenses = transactions
    .filter(t => t.type === 'expense' && (!month || t.date.startsWith(month)))
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const budgetEntries = Object.entries(budgets);

  if (budgetEntries.length === 0) {
    $('budgetList').innerHTML = '<p class="empty" style="padding: .5rem 0; font-size:.85rem;">Belum ada budget yang diatur.</p>';
    return;
  }

  $('budgetList').innerHTML = budgetEntries.map(([cat, limit]) => {
    const used = monthExpenses[cat] || 0;
    const pct = Math.min((used / limit) * 100, 100);
    
    let color = 'var(--success)';
    let alertMsg = '';
    
    if (pct >= 100) {
      color = 'var(--expense)';
      alertMsg = `<div class="budget-alert" style="color:var(--expense)">⚠️ Budget habis / lebih!</div>`;
    } else if (pct >= 75) {
      color = 'var(--warning)';
      alertMsg = `<div class="budget-alert" style="color:var(--warning)">⚠️ Hampir habis</div>`;
    }

    return `
      <div class="budget-item">
        <div class="budget-info">
          <span class="budget-title">${emojiFor(cat)} ${escapeHTML(cat)}</span>
          <span class="budget-numbers">${rupiah(used)} / ${rupiah(limit)}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${pct}%; background: ${color};"></div>
        </div>
        ${alertMsg}
      </div>
    `;
  }).join('');
}

function renderBreakdown(data) {
  const expenses = data.filter(t => t.type === 'expense');
  const total = expenses.reduce((s, t) => s + t.amount, 0);

  if (!total) {
    $('breakdown').innerHTML = '<p class="empty">Belum ada pengeluaran.</p>';
    return;
  }

  const perCategory = {};
  expenses.forEach(t => {
    perCategory[t.category] = (perCategory[t.category] || 0) + t.amount;
  });

  const entries = Object.entries(perCategory).sort((a, b) => b[1] - a[1]);
  const colors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];
  let acc = 0;
  
  const segments = entries.map(([, sum], i) => {
    const start = acc;
    acc += (sum / total) * 100;
    return `${colors[i % colors.length]} ${start}% ${acc}%`;
  }).join(', ');

  const legend = entries.map(([cat, sum], i) => {
    const pct = Math.round((sum / total) * 100);
    return `
      <li class="legend-item">
        <span class="legend-dot" style="background:${colors[i % colors.length]}"></span>
        <span class="legend-name">${emojiFor(cat)} ${escapeHTML(cat)}</span>
        <span class="legend-val">${rupiah(sum)} (${pct}%)</span>
      </li>`;
  }).join('');

  $('breakdown').innerHTML = `
    <div class="donut-wrap">
      <div class="donut" style="background: conic-gradient(${segments})">
        <div class="donut-hole">
          <span>Total</span>
          <strong>${rupiah(total)}</strong>
        </div>
      </div>
      <ul class="legend">${legend}</ul>
    </div>
  `;
}

render();
// ================= LOGIKA NAVIGATION BAR (FASE 1) =================
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // 1. Hapus class active dari semua tombol nav
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    
    // 2. Tambahkan class active ke tombol yang diklik
    e.currentTarget.classList.add('active');

    // 3. Sembunyikan semua halaman
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    
    // 4. Tampilkan halaman yang dituju
    const targetId = e.currentTarget.getAttribute('data-target');
    document.getElementById(targetId).classList.remove('hidden');
    
    // 5. Scroll ke atas saat pindah tab
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});