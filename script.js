let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const form = document.getElementById("form");
const category = document.getElementById("category");
const amount = document.getElementById("amount");
const date = document.getElementById("date");
const list = document.getElementById("list");
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const search = document.getElementById("search");

const pieChartCanvas = document.getElementById("pieChart");
let pieChart;

function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function addTransaction(e) {
  e.preventDefault();

  const newTransaction = {
    id: Date.now(),
    text: category.value.trim(),
    amount: +amount.value,
    category: category.value.trim(),
    date: date.value
  };

  transactions.push(newTransaction);
  updateLocalStorage();
  renderTransactions();
  form.reset();
}

function renderTransactions() {
  list.innerHTML = "";

  transactions
    .filter(t =>
      t.text.toLowerCase().includes(search.value.toLowerCase())
    )
    .forEach(transaction => {
      const sign = transaction.amount < 0 ? "-" : "+";
      const item = document.createElement("div");
      item.classList.add("transaction-item", transaction.amount < 0 ? "expense" : "income");

      item.innerHTML = `
        <div style="flex: 1;">${transaction.text}</div>
        <div style="flex: 0.6; text-align: center;">${sign}₹${Math.abs(transaction.amount)}</div>
        <div style="flex: 1;">${transaction.category}</div>
        <div style="flex: 1;">${formatDate(transaction.date)}</div>
        <div>
          <button onclick="editTransaction(${transaction.id})">✏️</button>
          <button onclick="deleteTransaction(${transaction.id})">❌</button>
        </div>
      `;
      list.appendChild(item);
    });

  updateSummary();
  updatePieChart();
}

function updateSummary() {
  const amounts = transactions.map(t => t.amount);
  const total = amounts.reduce((acc, val) => acc + val, 0).toFixed(2);
  const income = amounts.filter(val => val > 0).reduce((acc, val) => acc + val, 0).toFixed(2);
  const expense = (amounts.filter(val => val < 0).reduce((acc, val) => acc + val, 0) * -1).toFixed(2);

  balanceEl.textContent = `₹${total}`;
  incomeEl.textContent = `₹${income}`;
  expenseEl.textContent = `₹${expense}`;
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  renderTransactions();
}

function editTransaction(id) {
  const t = transactions.find(t => t.id === id);
  if (t) {
    category.value = t.category;
    amount.value = t.amount;
    date.value = t.date;
    deleteTransaction(id);
  }
}

function updatePieChart() {
  const categoryTotals = {};

  transactions.forEach(t => {
    if (!categoryTotals[t.category]) {
      categoryTotals[t.category] = 0;
    }
    categoryTotals[t.category] += t.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  const backgroundColors = labels.map((_, i) =>
    `hsl(${(i * 360) / labels.length}, 70%, 60%)`
  );

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(pieChartCanvas, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          label: "Category-wise Expenses",
          data,
          backgroundColor: backgroundColors
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

form.addEventListener("submit", addTransaction);
search.addEventListener("input", renderTransactions);

renderTransactions(); // Initial load

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}