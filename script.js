const CATEGORIES = {
  income: ["Salary","Freelance","Investments","Gift","Other Income"],
  expense: ["Food","Transport","Housing","Utilities","Entertainment","Shopping","Health","Education","Other Expense"]
};

const STORAGE_KEY = "expense_tracker_transactions_v1";
let transactions = loadTransactions();
let currentType = "income";
let editingId = null;

const form = document.getElementById("txForm");
const amountInput = document.getElementById("amount");
const categorySelect = document.getElementById("category");
const dateInput = document.getElementById("date");
const descInput = document.getElementById("description");
const formError = document.getElementById("formError");
const submitBtn = document.getElementById("submitBtn");
const formTitle = document.getElementById("formTitle");
const btnIncome = document.getElementById("btnIncome");
const btnExpense = document.getElementById("btnExpense");
const txList = document.getElementById("txList");
const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");
const filterSearch = document.getElementById("filterSearch");
const chartEl = document.getElementById("chart");
const stampEl = document.getElementById("stampBalance");

function loadTransactions(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.error("Failed to load transactions", e);
    return [];
  }
}

function saveTransactions(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function setType(type){
  currentType = type;
  btnIncome.classList.toggle("active", type==="income");
  btnIncome.classList.toggle("income-active", type==="income");
  btnExpense.classList.toggle("active", type==="expense");
  btnExpense.classList.toggle("expense-active", type==="expense");
  populateCategorySelect();
}

function populateCategorySelect(){
  categorySelect.innerHTML = "";
  CATEGORIES[currentType].forEach(cat=>{
    const opt = document.createElement("option");
    opt.value = cat; opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

function populateFilterCategories(){
  const allCats = [...new Set(transactions.map(t=>t.category))].sort();
  filterCategory.innerHTML = '<option value="all">All categories</option>';
  allCats.forEach(cat=>{
    const opt = document.createElement("option");
    opt.value = cat; opt.textContent = cat;
    filterCategory.appendChild(opt);
  });
}

btnIncome.addEventListener("click", ()=>setType("income"));
btnExpense.addEventListener("click", ()=>setType("expense"));

form.addEventListener("submit", e=>{
  e.preventDefault();
  formError.textContent = "";

  const amount = parseFloat(amountInput.value);
  const category = categorySelect.value;
  const date = dateInput.value;
  const description = descInput.value.trim();

  if(!amount || isNaN(amount) || amount <= 0){
    formError.textContent = "Please enter a valid amount greater than 0.";
    return;
  }
  if(!date){
    formError.textContent = "Please select a date.";
    return;
  }
  if(!category){
    formError.textContent = "Please select a category.";
    return;
  }

  if(editingId){
    const tx = transactions.find(t=>t.id===editingId);
    if(tx){
      tx.type = currentType;
      tx.amount = amount;
      tx.category = category;
      tx.date = date;
      tx.description = description;
    }
    editingId = null;
    submitBtn.textContent = "Add Transaction";
    formTitle.textContent = "Add transaction";
  } else {
    transactions.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
      type: currentType,
      amount, category, date, description
    });
  }

  saveTransactions();
  form.reset();
  dateInput.value = todayStr();
  populateFilterCategories();
  render();
  pulseStamp();
});

function todayStr(){
  const d = new Date();
  return d.toISOString().slice(0,10);
}

function deleteTx(id){
  if(!confirm("Delete this transaction?")) return;
  transactions = transactions.filter(t=>t.id!==id);
  saveTransactions();
  populateFilterCategories();
  render();
  pulseStamp();
}

function editTx(id){
  const tx = transactions.find(t=>t.id===id);
  if(!tx) return;
  editingId = id;
  setType(tx.type);
  amountInput.value = tx.amount;
  categorySelect.value = tx.category;
  dateInput.value = tx.date;
  descInput.value = tx.description;
  submitBtn.textContent = "Save Changes";
  formTitle.textContent = "Edit transaction";
  window.scrollTo({top:0, behavior:"smooth"});
}

function getFiltered(){
  const type = filterType.value;
  const cat = filterCategory.value;
  const search = filterSearch.value.trim().toLowerCase();
  return transactions
    .filter(t => type==="all" || t.type===type)
    .filter(t => cat==="all" || t.category===cat)
    .filter(t => !search || t.description.toLowerCase().includes(search))
    .sort((a,b)=> new Date(b.date) - new Date(a.date));
}

function fmt(n){
  return "₹" + Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
}

function pulseStamp(){
  stampEl.classList.remove("pulse");
  void stampEl.offsetWidth;
  stampEl.classList.add("pulse");
}

function renderSummary(){
  const income = transactions.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const expense = transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  document.getElementById("totalIncome").textContent = fmt(income);
  document.getElementById("totalExpense").textContent = fmt(expense);
  document.getElementById("totalBalance").textContent = fmt(income-expense);
}

function renderList(){
  const list = getFiltered();
  txList.innerHTML = "";
  if(list.length===0){
    txList.innerHTML = '<tr><td colspan="6"><div class="empty">No entries yet. Add your first transaction on the left.</div></td></tr>';
    return;
  }
  list.forEach(t=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.date}</td>
      <td class="desc"><div class="d">${escapeHtml(t.description || t.category)}</div></td>
      <td>${escapeHtml(t.category)}</td>
      <td class="num debit">${t.type==="expense" ? fmt(t.amount) : ""}</td>
      <td class="num credit">${t.type==="income" ? fmt(t.amount) : ""}</td>
      <td class="actions">
        <button data-edit="${t.id}">edit</button><span class="sep"></span><button data-del="${t.id}">delete</button>
      </td>
    `;
    txList.appendChild(tr);
  });

  txList.querySelectorAll("[data-edit]").forEach(btn=>{
    btn.addEventListener("click", ()=>editTx(btn.dataset.edit));
  });
  txList.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click", ()=>deleteTx(btn.dataset.del));
  });
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderChart(){
  const now = new Date();
  const monthTx = transactions.filter(t=>{
    const d = new Date(t.date);
    return t.type==="expense" && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  });
  const totals = {};
  monthTx.forEach(t=>{ totals[t.category] = (totals[t.category]||0) + t.amount; });
  const entries = Object.entries(totals).sort((a,b)=>b[1]-a[1]);
  chartEl.innerHTML = "";
  if(entries.length===0){
    chartEl.innerHTML = '<div class="empty" style="padding:10px 0;">No expenses this month yet.</div>';
    return;
  }
  const max = Math.max(...entries.map(e=>e[1]));
  entries.forEach(([cat, amt])=>{
    const row = document.createElement("div");
    row.className = "tape-row";
    row.innerHTML = `
      <div class="cat">${escapeHtml(cat)}</div>
      <div class="row-main">
        <div class="leader"></div>
        <div class="bar" style="width:${(amt/max*100).toFixed(1)}%"></div>
      </div>
      <div class="amt">${fmt(amt)}</div>
    `;
    chartEl.appendChild(row);
  });
}

function render(){
  renderSummary();
  renderList();
  renderChart();
}

filterType.addEventListener("change", renderList);
filterCategory.addEventListener("change", renderList);
filterSearch.addEventListener("input", renderList);

// init
setType("income");
dateInput.value = todayStr();
populateFilterCategories();
render();
