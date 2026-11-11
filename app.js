const STORAGE_KEY = 'transaksi-mahasiswa';
const BUDGET_KEY = 'budget-mahasiswa';
const THEME_KEY = 'theme-mahasiswa';
const COLOR_KEY = 'color-mahasiswa';
const LANG_KEY = 'lang-mahasiswa';
const STREAK_KEY = 'streak-mahasiswa';
const PROFILE_KEY = 'profile-mahasiswa';
const DEBT_KEY = 'debt-mahasiswa';
const DREAM_KEY = 'dream-mahasiswa';
const CUSTOM_CAT_KEY = 'kategori-kustom-mahasiswa';
const PIN_HASH_KEY = 'pin-keamanan';
const $ = id => document.getElementById(id);

const EMOJI = {
  'Makan': '🍔', 'Transport': '🚌', 'Kuliah': '📚', 'Hiburan': '🎮',
  'Kos & Tagihan': '🏠', 'Uang Saku': '💰', 'Beasiswa': '🎓',
  'Gaji / Part-time': '💼', 'Hadiah': '🎁', 'Lainnya': '✨', 'Tabungan': '🐷',
  'Food': '🍔', 'College': '📚', 'Entertainment': '🎮', 'Rent & Bills': '🏠',
  'Others': '✨', 'Allowance': '💰', 'Scholarship': '🎓', 'Salary / Part-time': '💼', 'Gift': '🎁', 'Savings': '🐷'
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
let debts = loadData(DEBT_KEY, []);
let dreams = loadData(DREAM_KEY, []);
let userLang = localStorage.getItem(LANG_KEY) || 'id';
let editingTxId = null; 
let customCategories = loadData(CUSTOM_CAT_KEY, []); 
let currentPinInput = '';

const rupiah = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

function escapeHTML(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }

function formatDate(iso) {
  const date = new Date(iso + 'T00:00:00');
  return date.toLocaleDateString(userLang === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function getTodayString() { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }

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
    help_center: 'Pusat Bantuan', help_desc: 'Hubungi admin via WhatsApp', privacy_notice: 'Privacy Notice', privacy_desc: 'Kebijakan privasi aplikasi',
    desc_placeholder_exp: 'Keterangan (mis. Makan siang)', desc_placeholder_inc: 'Keterangan (mis. Uang saku bulanan)', amount_placeholder: 'Jumlah (Rp)',
    all_cat: 'Semua kategori',
    cat_expense: ['Makan', 'Transport', 'Kuliah', 'Hiburan', 'Kos & Tagihan', 'Tabungan', 'Lainnya'],
    cat_income: ['Uang Saku', 'Beasiswa', 'Gaji / Part-time', 'Hadiah', 'Lainnya'],
    rekap_title: '📊 Rekap Keuangan', rekap_desc: 'Lihat ringkasan dan evaluasi keuanganmu.',
    total_balance: 'Total Saldo', monthly_activity: 'Aktivitas Per Bulan', no_rekap_data: 'Belum ada data transaksi di tahun ini.',
    debt_desc: 'Catat pinjaman dengan temanmu.', i_owe: 'Aku Berhutang', owe_me: 'Aku Meminjamkan',
    add_debt: 'Tambah Catatan', i_owe_opt: 'Aku Berhutang', they_owe_opt: 'Orang Berhutang',
    debt_list: 'Daftar Hutang', no_debt: 'Belum ada catatan hutang.', mark_paid: 'Tandai Lunas', delete: 'Hapus',
    debt_name_placeholder: 'Nama Teman', debt_amount_placeholder: 'Jumlah (Rp)', debt_desc_placeholder: 'Keterangan (mis. Pinjam beli buku)',
    dream_desc: 'Targetkan barang impianmu.', add_dream: 'Tambah Impian Baru', dream_list: 'Daftar Impian',
    no_dream: 'Belum ada impian yang ditargetkan.', dream_name_placeholder: 'Nama Impian (mis. Beli HP)',
    dream_target_placeholder: 'Target Harga (Rp)', add_saving: 'Tambah Tabungan', target: 'Target',
    collected: 'Terkumpul', dream_achieved: '🎉 Target Tercapai!', delete_dream: 'Hapus',
    saving_desc: 'Menabung untuk impian: ',
    split_bill: 'Bagi Tagihan (Split Bill)', split_people: 'Jumlah Orang', split_my_name: 'Nama Kamu (Pembayar)',
    split_result: 'Masing-masing bayar: '
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
    help_center: 'Help Center', help_desc: 'Contact admin via WhatsApp', privacy_notice: 'Privacy Notice', privacy_desc: 'Application privacy policy',
    desc_placeholder_exp: 'Description (e.g. Lunch)', desc_placeholder_inc: 'Description (e.g. Monthly allowance)', amount_placeholder: 'Amount (Rp)',
    all_cat: 'All categories',
    cat_expense: ['Food', 'Transport', 'College', 'Entertainment', 'Rent & Bills', 'Savings', 'Others'],
    cat_income: ['Allowance', 'Scholarship', 'Salary / Part-time', 'Gift', 'Others'],
    rekap_title: '📊 Financial Summary', rekap_desc: 'View your financial summary and evaluation.',
    total_balance: 'Total Balance', monthly_activity: 'Monthly Activity', no_rekap_data: 'No transaction data for this year.',
    debt_desc: 'Record loans with your friends.', i_owe: 'I Owe', owe_me: 'Owed to Me',
    add_debt: 'Add Record', i_owe_opt: 'I Owe', they_owe_opt: 'They Owe',
    debt_list: 'Debt List', no_debt: 'No debt records yet.', mark_paid: 'Mark as Paid', delete: 'Delete',
    debt_name_placeholder: 'Friend\'s Name', debt_amount_placeholder: 'Amount (Rp)', debt_desc_placeholder: 'Description (e.g. Borrow for book)',
    dream_desc: 'Target your dream items.', add_dream: 'Add New Dream', dream_list: 'Dream List',
    no_dream: 'No dreams targeted yet.', dream_name_placeholder: 'Dream Name (e.g. Buy Phone)',
    dream_target_placeholder: 'Target Price (Rp)', add_saving: 'Add Saving', target: 'Target',
    collected: 'Collected', dream_achieved: '🎉 Target Achieved!', delete_dream: 'Delete',
    saving_desc: 'Saving for dream: ',
    split_bill: 'Split Bill', split_people: 'Number of People', split_my_name: 'Your Name (Payer)',
    split_result: 'Each pays: '
  }
};

const CAT_MAP = {
  'Food': 'Makan', 'College': 'Kuliah', 'Entertainment': 'Hiburan', 'Rent & Bills': 'Kos & Tagihan',
  'Others': 'Lainnya', 'Allowance': 'Uang Saku', 'Scholarship': 'Beasiswa', 'Salary / Part-time': 'Gaji / Part-time', 'Gift': 'Hadiah',
  'Savings': 'Tabungan'
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

  const splitLabel = document.querySelector('.split-bill-toggle label');
  if (splitLabel) splitLabel.textContent = TRANSLATIONS[lang].split_bill;
  if ($('splitPeople')) $('splitPeople').placeholder = TRANSLATIONS[lang].split_people;
  if ($('splitMyName')) $('splitMyName').placeholder = TRANSLATIONS[lang].split_my_name;

  fillCategories(); fillFilterCategories(); fillBudgetCategories(); updateFormPlaceholders();
  updateRekapTitles();
  render(); renderChart(); renderRekap(); renderDebts(); renderDreams();
}

function updateRekapTitles() {
  const rekapHeader = document.querySelector('#page-rekap header h2');
  if (rekapHeader) rekapHeader.textContent = TRANSLATIONS[userLang].rekap_title;
  const rekapDesc = document.querySelector('#page-rekap header p');
  if (rekapDesc) rekapDesc.textContent = TRANSLATIONS[userLang].rekap_desc;
  const totalBalanceLabel = document.querySelector('#rekapTotalBalance').previousElementSibling;
  if (totalBalanceLabel) totalBalanceLabel.textContent = TRANSLATIONS[userLang].total_balance;
  const monthlyActivityTitle = document.querySelector('#rekapList').previousElementSibling;
  if (monthlyActivityTitle) monthlyActivityTitle.textContent = TRANSLATIONS[userLang].monthly_activity;
}

function updateFormPlaceholders() {
  const type = $('type').value;
  $('desc').placeholder = type === 'expense' ? TRANSLATIONS[userLang].desc_placeholder_exp : TRANSLATIONS[userLang].desc_placeholder_inc;
  $('amount').placeholder = TRANSLATIONS[userLang].amount_placeholder;
  $('debtName').placeholder = TRANSLATIONS[userLang].debt_name_placeholder;
  $('debtAmount').placeholder = TRANSLATIONS[userLang].debt_amount_placeholder;
  $('debtDesc').placeholder = TRANSLATIONS[userLang].debt_desc_placeholder;
  $('dreamName').placeholder = TRANSLATIONS[userLang].dream_name_placeholder;
  $('dreamTarget').placeholder = TRANSLATIONS[userLang].dream_target_placeholder;
}

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

function fillCategories() {
  const type = $('type').value;
  const defaultCats = TRANSLATIONS[userLang][type === 'expense' ? 'cat_expense' : 'cat_income'];
  const customCats = customCategories.filter(c => c.type === type).map(c => c.name);
  const allCat = [...new Set([...defaultCats, ...customCats])];
  
  $('category').innerHTML = allCat.map(c => `<option value="${escapeHTML(c)}">${emojiFor(c)} ${escapeHTML(c)}</option>`).join('');
  updateFormPlaceholders();
}

function fillFilterCategories() {
  const defaultCats = [...new Set([...TRANSLATIONS[userLang].cat_expense, ...TRANSLATIONS[userLang].cat_income])];
  const customCats = customCategories.map(c => c.name);
  const allCat = [...new Set([...defaultCats, ...customCats])];
  
  $('filterCategory').innerHTML = `<option value="all">${TRANSLATIONS[userLang].all_cat}</option>` + allCat.map(c => `<option value="${escapeHTML(c)}">${emojiFor(c)} ${escapeHTML(c)}</option>`).join('');
}

function fillBudgetCategories() {
  const defaultCats = TRANSLATIONS[userLang].cat_expense;
  const customCats = customCategories.filter(c => c.type === 'expense').map(c => c.name);
  const allCat = [...new Set([...defaultCats, ...customCats])];
  
  $('budgetCategory').innerHTML = allCat.map(c => `<option value="${escapeHTML(c)}">${emojiFor(c)} ${escapeHTML(c)}</option>`).join('');
}

$('type').addEventListener('change', fillCategories);
fillCategories(); fillFilterCategories(); fillBudgetCategories();

const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
const today = now.toISOString().slice(0, 10);
$('date').value = today; $('filterMonth').value = today.slice(0, 7);

// ================= LOGIKA SPLIT BILL =================
$('isSplitBill').addEventListener('change', (e) => {
  if (e.target.checked) {
    $('splitBillInputs').classList.remove('hidden');
    $('splitResult').classList.remove('hidden');
    updateSplitResult();
  } else {
    $('splitBillInputs').classList.add('hidden');
    $('splitResult').classList.add('hidden');
  }
});

['amount', 'splitPeople', 'splitMyName'].forEach(id => {
  $(id).addEventListener('input', updateSplitResult);
});

function updateSplitResult() {
  const total = Number($('amount').value);
  const people = Number($('splitPeople').value);

  if (total > 0 && people >= 2) {
    const perPerson = Math.round(total / people);
    $('splitResult').textContent = `${TRANSLATIONS[userLang].split_result} ${rupiah(perPerson)}`;
  } else {
    $('splitResult').textContent = '';
  }
}

// ================= FORM SUBMIT (EDIT & SIMPAN) =================
$('form').addEventListener('submit', e => {
  e.preventDefault();
  const amount = Number($('amount').value);
  const desc = $('desc').value.trim();
  if (!desc || !Number.isFinite(amount) || amount <= 0) return;

  const isSplit = $('isSplitBill').checked;
  const splitPeople = Number($('splitPeople').value);
  const myName = $('splitMyName').value.trim() || 'Kamu';

  if (isSplit && (splitPeople < 2 || !myName)) {
    alert('Jumlah orang minimal 2 dan nama pembayar wajib diisi.');
    return;
  }

  let rawCat = $('category').value;
  let standardCat = CAT_MAP[rawCat] || rawCat;
  let finalAmount = amount;
  
  if (!editingTxId && isSplit && $('type').value === 'expense') {
    const perPerson = Math.round(amount / splitPeople);
    const totalFriendShare = amount - perPerson;
    finalAmount = perPerson;

    if (totalFriendShare > 0) {
      debts.push({
        id: crypto.randomUUID(),
        type: 'lend',
        name: `${splitPeople - 1} Teman (Split: ${desc})`,
        amount: totalFriendShare,
        desc: `Patungan dari ${myName}`,
        isPaid: false
      });
      localStorage.setItem(DEBT_KEY, JSON.stringify(debts));
      renderDebts();
    }
  }

  if (editingTxId) {
    const index = transactions.findIndex(t => t.id === editingTxId);
    if (index > -1) {
      const oldTx = transactions[index];
      
      if ((oldTx.category === 'Tabungan' || oldTx.category === 'Savings') && oldTx.amount !== finalAmount) {
         let dreamName = oldTx.desc.replace(TRANSLATIONS.id.saving_desc, '').replace(TRANSLATIONS.en.saving_desc, '');
         const dreamIndex = dreams.findIndex(d => d.name === dreamName);
         if (dreamIndex > -1) {
           dreams[dreamIndex].saved = Math.max(0, dreams[dreamIndex].saved - oldTx.amount + finalAmount);
           localStorage.setItem(DREAM_KEY, JSON.stringify(dreams));
           renderDreams();
         }
      }
      
      transactions[index] = {
        ...oldTx,
        type: $('type').value,
        date: $('date').value,
        desc: desc,
        amount: finalAmount,
        category: standardCat
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  } else {
    const newTx = {
      id: crypto.randomUUID(),
      type: $('type').value,
      date: $('date').value,
      desc: isSplit && $('type').value === 'expense' ? `${desc} (Split ${splitPeople} org)` : desc,
      amount: finalAmount,
      category: standardCat
    };
    transactions.push(newTx);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }

  resetForm();
  updateStreak(); render(); renderRekap();
  
  const btn = $('saveBtn');
  btn.textContent = '✅ Tersimpan!'; btn.classList.add('saved');
  setTimeout(() => { btn.textContent = TRANSLATIONS[userLang].save_btn; btn.classList.remove('saved'); }, 1200);
});

$('cancelEditBtn').addEventListener('click', () => {
  resetForm();
});

function resetForm() {
  editingTxId = null;
  $('form').reset();
  $('date').value = getTodayString();
  $('isSplitBill').checked = false;
  $('splitBillInputs').classList.add('hidden');
  $('splitResult').classList.add('hidden');
  
  $('type').value = 'expense';
  fillCategories();
  $('saveBtn').textContent = TRANSLATIONS[userLang].save_btn;
  $('saveBtn').classList.remove('btn-primary'); 
  $('cancelEditBtn').classList.add('hidden');
}

// ================= EXPORT CSV =================
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

// ================= BUDGET =================
$('toggleBudgetBtn').addEventListener('click', () => $('budgetForm').classList.toggle('hidden'));
$('budgetForm').addEventListener('submit', e => {
  e.preventDefault();
  const cat = $('budgetCategory').value;
  const amt = Number($('budgetAmount').value);
  if (amt > 0) {
    let standardCat = CAT_MAP[cat] || cat;
    budgets[standardCat] = amt;
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
    $('budgetAmount').value = ''; $('budgetForm').classList.add('hidden');
    renderBudgets();
  }
});

// ================= LIST EVENT (EDIT & HAPUS) =================
let pendingDelete = null;
const TOAST_DURATION = 5000;

$('list').addEventListener('click', e => {
  const editBtn = e.target.closest('.edit');
  if (editBtn) {
    const id = editBtn.getAttribute('data-id');
    const tx = transactions.find(t => String(t.id) === String(id));
    if (!tx) return;

    editingTxId = tx.id;
    $('type').value = tx.type;
    $('desc').value = tx.desc;
    $('amount').value = tx.amount;
    $('date').value = tx.date;
    
    fillCategories(); 
    const catToSelect = userLang === 'en' ? Object.keys(CAT_MAP).find(k => CAT_MAP[k] === tx.category) || tx.category : tx.category;
    $('category').value = catToSelect;

    $('saveBtn').textContent = '💾 Update Transaksi';
    $('saveBtn').classList.add('btn-primary');
    $('cancelEditBtn').classList.remove('hidden');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return; 
  }

  const btn = e.target.closest('.delete'); if (!btn) return;
  const id = btn.getAttribute('data-id');
  const index = transactions.findIndex(t => String(t.id) === String(id));
  if (index === -1) return;
  const removed = transactions[index];

  let affectedDream = null;
  if (removed.category === 'Tabungan' || removed.category === 'Savings') {
    const prefixId = TRANSLATIONS.id.saving_desc;
    const prefixEn = TRANSLATIONS.en.saving_desc;
    let dreamName = '';
    if (removed.desc.startsWith(prefixId)) dreamName = removed.desc.replace(prefixId, '');
    else if (removed.desc.startsWith(prefixEn)) dreamName = removed.desc.replace(prefixEn, '');

    if (dreamName) {
      const dreamIndex = dreams.findIndex(d => d.name === dreamName);
      if (dreamIndex > -1) {
        dreams[dreamIndex].saved = Math.max(0, dreams[dreamIndex].saved - removed.amount);
        affectedDream = dreamIndex;
        localStorage.setItem(DREAM_KEY, JSON.stringify(dreams));
        renderDreams();
      }
    }
  }

  let affectedDebtId = null;
  if (removed.desc.includes('(Split')) {
    const debtIndex = debts.findIndex(d => d.type === 'lend' && removed.desc.includes(d.name.split(' (Split')[0]));
    let targetIndex = debtIndex;
    if (targetIndex === -1) {
      targetIndex = debts.findIndex(d => !d.isPaid && d.type === 'lend'); 
    }

    if (targetIndex > -1) {
      affectedDebtId = debts[targetIndex].id;
      window._tempDebt = { index: targetIndex, data: debts[targetIndex] };
      debts.splice(targetIndex, 1);
      localStorage.setItem(DEBT_KEY, JSON.stringify(debts));
      renderDebts();
    }
  }

  transactions.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  render(); renderRekap();

  const toast = $('toast'); $('toastMsg').textContent = `"${removed.desc}" dihapus`; toast.classList.add('show');
  if (pendingDelete) clearTimeout(pendingDelete);
  
  pendingDelete = setTimeout(() => {
    toast.classList.remove('show');
    window._tempDebt = null;
  }, TOAST_DURATION);

  $('undoBtn').onclick = () => {
    clearTimeout(pendingDelete); 
    toast.classList.remove('show');
    
    transactions.splice(index, 0, removed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));

    if (affectedDream !== null) {
      dreams[affectedDream].saved += removed.amount;
      localStorage.setItem(DREAM_KEY, JSON.stringify(dreams));
      renderDreams();
    }

    if (window._tempDebt) {
      debts.splice(window._tempDebt.index, 0, window._tempDebt.data);
      localStorage.setItem(DEBT_KEY, JSON.stringify(debts));
      renderDebts();
      window._tempDebt = null;
    }

    render(); renderRekap();
  };
});

$('filterMonth').addEventListener('change', render);
$('filterCategory').addEventListener('change', render);

function getFiltered() {
  const month = $('filterMonth').value; const cat = $('filterCategory').value;

  let standardCat = cat;
  if (cat !== 'all') {
    for (const [en, id] of Object.entries(CAT_MAP)) {
      if (en === cat) standardCat = id;
    }
  }

  return transactions.filter(t => (!month || t.date.startsWith(month)) && (standardCat === 'all' || t.category === standardCat)).sort((a, b) => b.date.localeCompare(a.date) || (b.id > a.id ? 1 : -1));
}

function render() {
  const data = getFiltered();
  const currentMonth = $('filterMonth').value;

  const income = data.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = data.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  let openingBalance = 0;
  if (currentMonth) {
    const allBefore = transactions.filter(t => t.date < currentMonth + '-01');
    const incBefore = allBefore.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expBefore = allBefore.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    openingBalance = incBefore - expBefore;
  }

  const currentBalance = openingBalance + (income - expense);

  $('income').textContent = rupiah(income);
  $('expense').textContent = rupiah(expense);
  $('balance').textContent = rupiah(currentBalance);
  $('difference').textContent = rupiah(income - expense);

  $('empty').style.display = data.length ? 'none' : 'block';

  $('list').innerHTML = data.map(t => {
    const displayCat = userLang === 'en' ? Object.keys(CAT_MAP).find(key => CAT_MAP[key] === t.category) || t.category : t.category;
    return `
    <li class="item" data-id="${t.id}">
      <span class="item-emoji">${emojiFor(displayCat)}</span>
      <div class="item-info"><strong>${escapeHTML(t.desc)}</strong><small>${escapeHTML(displayCat)} · ${formatDate(t.date)}</small></div>
      <span class="amount ${t.type}">${t.type === 'income' ? '+' : '-'}${rupiah(t.amount)}</span>
      <div class="item-actions">
        <button class="edit" data-id="${t.id}" aria-label="Edit">✏️</button>
        <button class="delete" data-id="${t.id}" aria-label="Hapus">🗑</button>
      </div>
    </li>`;
  }).join('');

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

    const displayCat = userLang === 'en' ? Object.keys(CAT_MAP).find(key => CAT_MAP[key] === cat) || cat : cat;

    return `<div class="budget-item"><div class="budget-info"><span class="budget-title">${emojiFor(displayCat)} ${escapeHTML(displayCat)}</span><span class="budget-numbers">${rupiah(used)} / ${rupiah(limit)}</span></div><div class="progress-track"><div class="progress-fill" style="width: ${pct}%; background: ${color};"></div></div>${alertMsg}</div>`;
  }).join('');
}

function renderBreakdown(data) {
  const expenses = data.filter(t => t.type === 'expense'); const total = expenses.reduce((s, t) => s + t.amount, 0);
  if (!total) { $('breakdown').innerHTML = '<p class="empty">Belum ada pengeluaran.</p>'; return; }
  const perCategory = {}; expenses.forEach(t => { perCategory[t.category] = (perCategory[t.category] || 0) + t.amount; });
  const entries = Object.entries(perCategory).sort((a, b) => b[1] - a[1]); const colors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];
  let acc = 0; const segments = entries.map(([, sum], i) => { const start = acc; acc += (sum / total) * 100; return `${colors[i % colors.length]} ${start}% ${acc}%`; }).join(', ');

  const legend = entries.map(([cat, sum], i) => {
    const pct = Math.round((sum / total) * 100);
    const displayCat = userLang === 'en' ? Object.keys(CAT_MAP).find(key => CAT_MAP[key] === cat) || cat : cat;
    return `<li class="legend-item"><span class="legend-dot" style="background:${colors[i % colors.length]}"></span><span class="legend-name">${emojiFor(displayCat)} ${escapeHTML(displayCat)}</span><span class="legend-val">${rupiah(sum)} (${pct}%)</span></li>`;
  }).join('');

  $('breakdown').innerHTML = `<div class="donut-wrap"><div class="donut" style="background: conic-gradient(${segments})"><div class="donut-hole"><span>Total</span><strong>${rupiah(total)}</strong></div></div><ul class="legend">${legend}</ul></div>`;
}

render();

function initRekapYears() {
  const yearSelect = $('rekapYear');
  const currentYear = new Date().getFullYear();
  let years = [...new Set(transactions.map(t => t.date.split('-')[0]))];
  if (years.length === 0) years.push(currentYear.toString());
  years.sort((a, b) => b - a);
  yearSelect.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
}

function renderRekap() {
  const selectedYear = $('rekapYear').value;
  if (!selectedYear) return;

  const yearTransactions = transactions.filter(t => t.date.startsWith(selectedYear)).sort((a, b) => a.date.localeCompare(b.date));

  const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  let rekapHTML = '';
  let runningBalance = 0;

  let openingBalanceYear = 0;
  const transactionsBeforeYear = transactions.filter(t => t.date < `${selectedYear}-01-01`);
  if (transactionsBeforeYear.length > 0) {
    const incBefore = transactionsBeforeYear.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expBefore = transactionsBeforeYear.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    openingBalanceYear = incBefore - expBefore;
  }

  runningBalance = openingBalanceYear;

  months.forEach(m => {
    const monthStr = `${selectedYear}-${m}`;
    const monthTrans = yearTransactions.filter(t => t.date.startsWith(monthStr));
    const monthDate = new Date(selectedYear, parseInt(m) - 1, 1);
    const monthName = monthDate.toLocaleDateString(userLang === 'en' ? 'en-US' : 'id-ID', { month: 'long' });

    if (monthTrans.length > 0) {
      const inc = monthTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = monthTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      runningBalance += (inc - exp);

      rekapHTML += `
        <div class="rekap-month-card">
          <div class="rekap-month-header"><span>${monthName}</span></div>
          <div class="rekap-month-body">
            <div class="rekap-row income"><span>${TRANSLATIONS[userLang].income}</span><span>+${rupiah(inc)}</span></div>
            <div class="rekap-row expense"><span>${TRANSLATIONS[userLang].expense}</span><span>-${rupiah(exp)}</span></div>
            <div class="rekap-row total"><span>Saldo Berjalan</span><span>${rupiah(runningBalance)}</span></div>
          </div>
        </div>
      `;
    }
  });

  $('rekapTotalBalance').textContent = rupiah(runningBalance);

  const totalIncome = yearTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = yearTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  
  $('rekapTotalIncome').textContent = rupiah(totalIncome);
  $('rekapTotalExpense').textContent = rupiah(totalExpense);

  if (!rekapHTML) {
    rekapHTML = `<p class="empty">${TRANSLATIONS[userLang].no_rekap_data}</p>`;
    $('rekapTotalBalance').textContent = rupiah(openingBalanceYear);
  }
  
  $('rekapList').innerHTML = rekapHTML;
}

$('rekapYear').addEventListener('change', renderRekap);
initRekapYears();
renderRekap();

const originalUpdateStreak = updateStreak;
updateStreak = function() { originalUpdateStreak(); initRekapYears(); };

// ================= LOGIKA HUTANG =================
function renderDebts() {
  const list = $('debtList');
  const empty = $('debtEmpty');
  if (debts.length === 0) {
    list.innerHTML = ''; empty.style.display = 'block';
    $('totalIOwe').textContent = rupiah(0); $('totalOweMe').textContent = rupiah(0);
    return;
  }
  empty.style.display = 'none';
  let totalOwe = 0; let totalLend = 0;
  const sortedDebts = [...debts].sort((a, b) => a.isPaid - b.isPaid);
  list.innerHTML = sortedDebts.map(d => {
    if (d.type === 'owe' && !d.isPaid) totalOwe += d.amount;
    if (d.type === 'lend' && !d.isPaid) totalLend += d.amount;
    const isOwe = d.type === 'owe';
    const statusText = isOwe ? TRANSLATIONS[userLang].i_owe : TRANSLATIONS[userLang].owe_me;
    const statusClass = isOwe ? 'owe' : 'lend';
    const paidClass = d.isPaid ? 'paid' : '';
    const btnPaid = d.isPaid ? '' : `<button class="btn-paid" onclick="markPaid('${d.id}')">${TRANSLATIONS[userLang].mark_paid}</button>`;
    return `
      <div class="debt-card ${paidClass}">
        <div class="debt-header ${statusClass}"><span>${escapeHTML(d.name)}</span><span>${statusText}</span></div>
        <div class="debt-amount">${rupiah(d.amount)}</div>
        ${d.desc ? `<div class="debt-desc">${escapeHTML(d.desc)}</div>` : ''}
        <div class="debt-actions">${btnPaid}<button class="btn-delete-debt" onclick="deleteDebt('${d.id}')">${TRANSLATIONS[userLang].delete}</button></div>
      </div>`;
  }).join('');
  $('totalIOwe').textContent = rupiah(totalOwe); $('totalOweMe').textContent = rupiah(totalLend);
}

window.markPaid = function(id) {
  const index = debts.findIndex(d => d.id === id);
  if (index > -1) {
    const debt = debts[index];
    debt.isPaid = true;
    
    const autoTx = {
      id: crypto.randomUUID(),
      type: debt.type === 'owe' ? 'expense' : 'income',
      date: getTodayString(),
      desc: `Pelunasan Hutang: ${debt.name}`,
      amount: debt.amount,
      category: 'Lainnya'
    };
    
    transactions.push(autoTx);
    localStorage.setItem(DEBT_KEY, JSON.stringify(debts));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    
    renderDebts(); render(); renderRekap();
  }
};

window.deleteDebt = function(id) {
  if (confirm('Yakin ingin menghapus catatan ini?')) {
    debts = debts.filter(d => d.id !== id); localStorage.setItem(DEBT_KEY, JSON.stringify(debts)); renderDebts();
  }
};

$('debtForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('debtName').value.trim();
  const amount = Number($('debtAmount').value);
  const desc = $('debtDesc').value.trim();
  if (!name || amount <= 0) return;
  debts.push({ id: crypto.randomUUID(), type: $('debtType').value, name, amount, desc, isPaid: false });
  localStorage.setItem(DEBT_KEY, JSON.stringify(debts));
  $('debtName').value = ''; $('debtAmount').value = ''; $('debtDesc').value = '';
  renderDebts();
});

renderDebts();

// ================= LOGIKA IMPIAN =================
function renderDreams() {
  const list = $('dreamList');
  const empty = $('dreamEmpty');
  if (dreams.length === 0) {
    list.innerHTML = ''; empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  list.innerHTML = dreams.map(d => {
    const pct = Math.min((d.saved / d.target) * 100, 100);
    const isDone = d.saved >= d.target;
    const displayStatus = isDone ? `<div style="color: var(--success); font-weight:700; font-size:0.8rem; margin-top:0.3rem;">${TRANSLATIONS[userLang].dream_achieved}</div>` : '';

    return `
      <div class="dream-card">
        <div class="dream-header"><span>${escapeHTML(d.name)}</span></div>
        <div class="dream-info">
          <span>${TRANSLATIONS[userLang].target}: ${rupiah(d.target)}</span>
          <span>${TRANSLATIONS[userLang].collected}: ${rupiah(d.saved)}</span>
        </div>
        <div class="dream-progress-track">
          <div class="dream-progress-fill" style="width: ${pct}%;"></div>
        </div>
        <div style="text-align: right; font-size: 0.8rem; font-weight:700; color:var(--primary);">${Math.round(pct)}%</div>
        ${displayStatus}
        <div class="dream-actions">
          ${!isDone ? `<button class="btn-add-save" onclick="addSaving('${d.id}')">+ ${TRANSLATIONS[userLang].add_saving}</button>` : ''}
          <button class="btn-delete-dream" onclick="deleteDream('${d.id}')">${TRANSLATIONS[userLang].delete_dream}</button>
        </div>
      </div>
    `;
  }).join('');
}

window.addSaving = function(id) {
  const amount = prompt(userLang === 'en' ? 'Enter saving amount (Rp):' : 'Masukkan nominal tabungan (Rp):');
  if (amount && !isNaN(amount) && Number(amount) > 0) {
    const index = dreams.findIndex(d => d.id === id);
    if (index > -1) {
      const savedAmount = Number(amount);
      const dreamName = dreams[index].name;

      dreams[index].saved += savedAmount;
      localStorage.setItem(DREAM_KEY, JSON.stringify(dreams));

      const autoTransaction = {
        id: crypto.randomUUID(),
        type: 'expense',
        date: getTodayString(),
        desc: `${TRANSLATIONS[userLang].saving_desc}${dreamName}`,
        amount: savedAmount,
        category: 'Tabungan'
      };
      transactions.push(autoTransaction);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));

      renderDreams(); render(); renderRekap();
    }
  }
};

window.deleteDream = function(id) {
  if (confirm(userLang === 'en' ? 'Delete this dream?' : 'Hapus impian ini?')) {
    dreams = dreams.filter(d => d.id !== id);
    localStorage.setItem(DREAM_KEY, JSON.stringify(dreams));
    renderDreams();
  }
};

$('dreamForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('dreamName').value.trim();
  const target = Number($('dreamTarget').value);
  if (!name || target <= 0) return;
  dreams.push({ id: crypto.randomUUID(), name, target, saved: 0 });
  localStorage.setItem(DREAM_KEY, JSON.stringify(dreams));
  $('dreamName').value = ''; $('dreamTarget').value = '';
  renderDreams();
});

renderDreams();

// ================= LOGIKA KATEGORI KUSTOM =================
function renderCustomCategories() {
  const list = $('customCategoryList');
  const empty = $('categoryEmpty');
  
  if (customCategories.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  
  empty.style.display = 'none';
  list.innerHTML = customCategories.map(c => {
    const icon = c.type === 'expense' ? '🔴' : '🟢';
    const typeText = c.type === 'expense' ? 'Pengeluaran' : 'Pemasukan';
    return `
      <li class="item">
        <div class="item-info">
          <strong>${icon} ${escapeHTML(c.name)}</strong>
          <small>${typeText}</small>
        </div>
        <button class="delete" onclick="deleteCustomCategory('${c.id}')">🗑</button>
      </li>
    `;
  }).join('');
}

window.deleteCustomCategory = function(id) {
  if (confirm('Hapus kategori ini? (Transaksi yang sudah ada tidak akan terhapus)')) {
    customCategories = customCategories.filter(c => c.id !== id);
    localStorage.setItem(CUSTOM_CAT_KEY, JSON.stringify(customCategories));
    renderCustomCategories();
    fillCategories(); fillFilterCategories(); fillBudgetCategories();
  }
};

$('categoryForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('newCatName').value.trim();
  const type = $('newCatType').value;
  if (!name) return;
  
  if (customCategories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    alert('Kategori dengan nama tersebut sudah ada!');
    return;
  }
  
  customCategories.push({ id: crypto.randomUUID(), name: name, type: type });
  localStorage.setItem(CUSTOM_CAT_KEY, JSON.stringify(customCategories));
  
  $('newCatName').value = '';
  renderCustomCategories();
  fillCategories(); fillFilterCategories(); fillBudgetCategories();
});

// ================= LOGIKA KEAMANAN PIN =================
async function hashPIN(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function updatePinDots() {
  const dots = document.querySelectorAll('#pinDots .dot');
  dots.forEach((dot, index) => {
    if (index < currentPinInput.length) dot.classList.add('filled');
    else dot.classList.remove('filled');
  });
}

function updatePinStatus() {
  const savedPin = localStorage.getItem(PIN_HASH_KEY);
  const pinStatusText = $('pinStatusText');
  
  if (savedPin) {
    pinStatusText.textContent = "PIN Aktif (Klik untuk ubah/nonaktifkan)";
  } else {
    pinStatusText.textContent = "Aktifkan PIN aplikasi";
  }
}

$('btn-security').addEventListener('click', async () => {
  const savedPin = localStorage.getItem(PIN_HASH_KEY);
  
  if (!savedPin) {
    const newPin = prompt('Buat PIN baru (4 angka):');
    if (newPin && newPin.length === 4 && /^\d+$/.test(newPin)) {
      const hash = await hashPIN(newPin);
      localStorage.setItem(PIN_HASH_KEY, hash);
      alert('PIN berhasil dibuat!');
      updatePinStatus();
    } else {
      alert('PIN tidak valid. Harus 4 angka.');
    }
  } else {
    const confirmPin = prompt('Masukkan PIN Anda saat ini untuk mematikan PIN:');
    if (confirmPin) {
      const hash = await hashPIN(confirmPin);
      if (hash === savedPin) {
        localStorage.removeItem(PIN_HASH_KEY);
        alert('PIN dinonaktifkan.');
        updatePinStatus();
      } else {
        alert('PIN salah!');
      }
    }
  }
});

document.querySelectorAll('.key[data-val]').forEach(btn => {
  btn.addEventListener('click', async () => {
    if (currentPinInput.length < 4) {
      currentPinInput += btn.getAttribute('data-val');
      updatePinDots();
      
      if (currentPinInput.length === 4) {
        const savedPin = localStorage.getItem(PIN_HASH_KEY);
        const inputHash = await hashPIN(currentPinInput);
        
        if (inputHash === savedPin) {
          $('lockScreen').classList.add('hidden');
          currentPinInput = '';
          updatePinDots();
        } else {
          $('lockError').textContent = 'PIN Salah. Coba lagi.';
          currentPinInput = '';
          setTimeout(() => { updatePinDots(); $('lockError').textContent = ''; }, 500);
        }
      }
    }
  });
});

$('keyDel').addEventListener('click', () => {
  if (currentPinInput.length > 0) {
    currentPinInput = currentPinInput.slice(0, -1);
    updatePinDots();
  }
});

$('forgotPinBtn').addEventListener('click', () => {
  if (confirm('PERINGATAN: Mereset PIN akan menghapus SEMUA data keuangan Anda secara permanen. Lanjutkan?')) {
    localStorage.clear();
    window.location.reload();
  }
});

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

// ================= BACKUP TERENKRIPSI =================
document.getElementById('btn-backup').addEventListener('click', () => {
  const password = prompt("Buat Password untuk mengenkripsi file backup ini (Wajib diingat!):");
  if (!password) {
    alert("Backup dibatalkan. Password diperlukan untuk mengamankan data.");
    return;
  }

  const dataToBackup = { transactions, budgets, streak, profile, debts, dreams, customCategories };
  const dataStr = JSON.stringify(dataToBackup);
  
  // Proses Enkripsi dengan AES
  const encrypted = CryptoJS.AES.encrypt(dataStr, password).toString();
  
  const blob = new Blob([encrypted], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; 
  link.download = `DuitGue_Backup_Terenskripsi_${today}.json`; 
  link.click();
  URL.revokeObjectURL(url);
  
  alert("Backup berhasil diunduh dan diamankan dengan password!");
});

// ================= RESTORE TERENKRIPSI =================
const restoreInput = document.getElementById('restoreInput');
document.getElementById('btn-restore').addEventListener('click', () => { restoreInput.click(); });

restoreInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const encryptedData = event.target.result;
        
        // Minta password untuk dekripsi
        const password = prompt("Masukkan password untuk membuka file backup ini:");
        if (!password) {
          alert("Restore dibatalkan.");
          restoreInput.value = ''; // Reset input file
          return;
        }

        // Proses Dekripsi
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, password);
        const decryptedStr = decryptedBytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedStr) {
          throw new Error("Password salah atau file korup.");
        }

        const parsedData = JSON.parse(decryptedStr);
        if (parsedData.transactions && parsedData.profile) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData.transactions));
          localStorage.setItem(BUDGET_KEY, JSON.stringify(parsedData.budgets || {}));
          localStorage.setItem(STREAK_KEY, JSON.stringify(parsedData.streak || { count: 0, lastDate: null }));
          localStorage.setItem(PROFILE_KEY, JSON.stringify(parsedData.profile));
          localStorage.setItem(DEBT_KEY, JSON.stringify(parsedData.debts || []));
          localStorage.setItem(DREAM_KEY, JSON.stringify(parsedData.dreams || []));
          localStorage.setItem(CUSTOM_CAT_KEY, JSON.stringify(parsedData.customCategories || []));
          alert('Data berhasil dipulihkan! Halaman akan dimuat ulang.'); 
          window.location.reload();
        } else { 
          alert('Format file backup tidak valid.'); 
        }
      } catch (err) { 
        alert('Gagal membuka file. Pastikan password benar dan file dari aplikasi Duit Gue.'); 
        restoreInput.value = ''; // Reset input jika gagal
      }
    };
    reader.readAsText(file);
  }
});

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

document.getElementById('btn-custom-category').addEventListener('click', () => {
  showPage('page-custom-category');
  renderCustomCategories();
});
document.getElementById('backToProfileFromCategory').addEventListener('click', () => showPage('page-profil'));

document.getElementById('btn-dana-statement').addEventListener('click', () => {
  showPage('page-dana-statement');
  setTimeout(() => { renderChart(); }, 50);
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

function renderChart() {
  const chartContainer = document.getElementById('statChart');
  if (!chartContainer) return;
  chartContainer.innerHTML = '';
  const todayDate = new Date();
  const currentYear = todayDate.getFullYear();
  const currentMonth = todayDate.getMonth();
  const monthsData = [];
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
    group.appendChild(barInc); group.appendChild(barExp); group.appendChild(label);
    chartContainer.appendChild(group);
  });
}

// ================= HILANGKAN LOADING SCREEN =================
window.addEventListener('load', () => {
  // --- CEK PIN SAAT APLIKASI DIBUKA ---
  const savedPin = localStorage.getItem(PIN_HASH_KEY);
  if (savedPin) {
    $('lockScreen').classList.remove('hidden');
  } else {
    $('lockScreen').classList.add('hidden');
  }
  
  updatePinStatus(); // Update teks di menu profil

  // --- HILANGKAN LOADING SCREEN ---
  const loader = document.getElementById('loadingScreen');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 1000);
  }
});