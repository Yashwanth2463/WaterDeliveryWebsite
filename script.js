// ------------------- USERS -------------------
const users = [
  {name: "admin", pass: "admin123"},
  {name: "driver1", pass: "driver123"},
  {name: "driver2", pass: "driver123"},
  {name: "driver3", pass: "driver123"},
  {name: "driver4", pass: "driver123"}
];

// ------------------- DATA HANDLING -------------------
function loadData() {
  return JSON.parse(localStorage.getItem("waterData") || '{"orders":[], "trips":[]}');
}
function saveData(data) {
  localStorage.setItem("waterData", JSON.stringify(data));
}

// ------------------- LOGIN / LOGOUT -------------------
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const user = users.find(u => u.name === username && u.pass === password);
  if (user) {
    alert("Login successful: " + username);
    document.getElementById("loginDiv").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    renderAll();
  } else {
    alert("Invalid username or password");
  }
}

function logout() {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("loginDiv").style.display = "block";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  alert("Logged out successfully!");
}

// ------------------- DATE FILTER -------------------
let activeFilterDate = null;
function applyDateFilter() {
  const dateInput = document.getElementById("filterDate").value;
  activeFilterDate = dateInput ? new Date(dateInput).toLocaleDateString() : null;
  renderAll();
}
function clearDateFilter() {
  activeFilterDate = null;
  document.getElementById("filterDate").value = "";
  renderAll();
}

// ------------------- ORDERS UI -------------------
function addOrder() {
  const customer = document.getElementById("orderCustomer").value.trim();
  const cans = parseInt(document.getElementById("orderCans").value) || 0;
  const payment = document.getElementById("orderPayment").value;
  if (!customer || cans <= 0) {
    alert("Enter customer name and number of cans (>0).");
    return;
  }
  const date = new Date().toLocaleDateString();
  const data = loadData();
  data.orders.push({ customer, cans, payment, date });
  saveData(data);
  document.getElementById("orderCustomer").value = "";
  document.getElementById("orderCans").value = "1";
  alert("Order added.");
  renderAll();
}

// ------------------- CUSTOMER LIST (for trips) -------------------
const customers = ["Customer1","Customer2","Customer3","Customer4"]; // modify list as needed
function generateCustomerTripFields() {
  const container = document.getElementById("customerTripInputs");
  container.innerHTML = "";
  customers.forEach(c => {
    const div = document.createElement("div");
    div.innerHTML = `
      <label style="display:inline-block;width:140px">${c}</label>
      <label>Full:</label><input type="number" min="0" id="full_${c}" value="0">
      <label>Empty:</label><input type="number" min="0" id="empty_${c}" value="0">
    `;
    container.appendChild(div);
  });
}
generateCustomerTripFields();

// ------------------- SAVE TRIP -------------------
function saveTrip() {
  const driver = document.getElementById("tripDriver").value;
  const type = document.getElementById("tripType").value;
  const date = new Date().toLocaleDateString();
  const tripNumber = type === "morning" ? 1 : 2;
  const customerDeliveries = [];
  let fullCans = 0, emptyCans = 0;

  customers.forEach(c => {
    const f = parseInt(document.getElementById(`full_${c}`).value) || 0;
    const e = parseInt(document.getElementById(`empty_${c}`).value) || 0;
    if (f > 0 || e > 0) customerDeliveries.push({ customerName: c, cans: f, empty: e });
    fullCans += f;
    emptyCans += e;
  });

  const data = loadData();
  data.trips.push({ driverName: driver, tripNumber, fullCans, emptyCans, customerDeliveries, date });
  saveData(data);
  alert(`Trip saved for ${driver} (${type}).`);
  // reset inputs to 0
  customers.forEach(c => {
    document.getElementById(`full_${c}`).value = "0";
    document.getElementById(`empty_${c}`).value = "0";
  });
  renderAll();
}

// ------------------- RENDER HELPERS -------------------
function renderOrders() {
  const data = loadData();
  const tbody = document.getElementById("orderHistoryBody");
  tbody.innerHTML = "";
  data.orders.forEach(o => {
    if (activeFilterDate && o.date !== activeFilterDate) return;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${o.customer}</td><td>${o.cans}</td><td>${o.cans*30}</td><td>${o.payment}</td><td>${o.date}</td>`;
    tbody.appendChild(tr);
  });
}

function renderTrips() {
  const data = loadData();
  const tbody = document.getElementById("tripHistoryBody");
  tbody.innerHTML = "";
  data.trips.forEach(trip => {
    if (activeFilterDate && trip.date !== activeFilterDate) return;
    const custText = trip.customerDeliveries.map(c => `${c.customerName}:${c.cans}/e${c.empty}`).join(" | ");
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${trip.driverName}</td><td>${trip.tripNumber}</td><td>${trip.fullCans}</td><td>${trip.emptyCans}</td><td>${trip.fullCans*30}</td><td>${custText}</td><td>${trip.date}</td>`;
    tbody.appendChild(tr);
  });
}

function renderSummary() {
  const data = loadData();
  const div = document.getElementById("summaryDiv");
  const today = new Date().toLocaleDateString();
  let totalCans = 0, totalAmount = 0;
  data.orders.forEach(o => {
    if (!activeFilterDate || o.date === activeFilterDate) {
      totalCans += o.cans;
      totalAmount += o.cans * 30;
    }
  });
  div.innerHTML = `<strong>Daily Summary:</strong> ${totalCans} cans | ₹${totalAmount}`;
}

function renderAdminSummary() {
  const data = loadData();
  const div = document.getElementById("adminSummaryDiv");
  const today = new Date().toLocaleDateString();
  const currentMonth = new Date().getMonth();
  let html = "";
  ["driver1","driver2","driver3","driver4"].forEach(driver => {
    let trips = data.trips.filter(t => t.driverName === driver);
    let dailyTrips = trips.filter(t => t.date === today);
    if (activeFilterDate) dailyTrips = dailyTrips.filter(t => t.date === activeFilterDate);
    let dailyCans = dailyTrips.reduce((s,t) => s + t.fullCans, 0);
    let dailyEmpties = dailyTrips.reduce((s,t) => s + t.emptyCans, 0);
    let monthlyTrips = trips.filter(t => new Date(t.date).getMonth() === currentMonth);
    let monthlyCans = monthlyTrips.reduce((s,t)=>s + t.fullCans, 0);
    html += `<p><strong>${driver}</strong>: Daily trips ${dailyTrips.length} | Cans ${dailyCans} | Empties ${dailyEmpties} | Monthly cans ${monthlyCans}</p>`;
  });
  div.innerHTML = html;
}

// ------------------- TRIP-WISE DISCREPANCY CHECK -------------------
function checkTripDiscrepancy() {
  const data = loadData();
  const orderMap = {};      // orderMap[date][customer] = totalOrdered
  data.orders.forEach(o => {
    if (!orderMap[o.date]) orderMap[o.date] = {};
    orderMap[o.date][o.customer] = (orderMap[o.date][o.customer] || 0) + o.cans;
  });

  const deliveredMap = {};  // deliveredMap[date][customer] = totalDeliveredAcrossTrips
  data.trips.forEach(t => {
    if (!deliveredMap[t.date]) deliveredMap[t.date] = {};
    t.customerDeliveries.forEach(c => {
      deliveredMap[t.date][c.customerName] = (deliveredMap[t.date][c.customerName] || 0) + c.cans;
    });
  });

  const discrepancies = []; // list of {date, customer, ordered, delivered}
  for (const date in orderMap) {
    for (const customer in orderMap[date]) {
      const ordered = orderMap[date][customer] || 0;
      const delivered = (deliveredMap[date] && deliveredMap[date][customer]) || 0;
      if (delivered < ordered) discrepancies.push({ date, customer, ordered, delivered });
    }
  }
  return discrepancies;
}

// ------------------- CUSTOMER SUMMARY (with discrepancies & empties) -------------------
function renderCustomerSummary() {
  const data = loadData();
  const div = document.getElementById("customerSummaryDiv");
  const today = new Date().toLocaleDateString();
  const currentMonth = new Date().getMonth();
  const customersMap = {}; // customer => { dailyCans, dailyAmount, monthlyCans, monthlyAmount, drivers: {driver: {daily,monthly}} }

  data.trips.forEach(trip => {
    if (activeFilterDate && trip.date !== activeFilterDate) return;
    trip.customerDeliveries.forEach(c => {
      if (!customersMap[c.customerName]) customersMap[c.customerName] = { dailyCans:0,dailyAmount:0,monthlyCans:0,monthlyAmount:0,drivers:{} };
      if (!customersMap[c.customerName].drivers[trip.driverName]) customersMap[c.customerName].drivers[trip.driverName] = { daily:0, monthly:0 };
      if (trip.date === today) {
        customersMap[c.customerName].dailyCans += c.cans;
        customersMap[c.customerName].dailyAmount += c.cans * 30;
        customersMap[c.customerName].drivers[trip.driverName].daily += c.cans;
      }
      if (new Date(trip.date).getMonth() === currentMonth) {
        customersMap[c.customerName].monthlyCans += c.cans;
        customersMap[c.customerName].monthlyAmount += c.cans * 30;
        customersMap[c.customerName].drivers[trip.driverName].monthly += c.cans;
      }
    });
  });

  // compute empties returned per customer (all trips)
  const emptiesMap = {};
  data.trips.forEach(trip => {
    if (activeFilterDate && trip.date !== activeFilterDate) return;
    trip.customerDeliveries.forEach(c => {
      emptiesMap[c.customerName] = (emptiesMap[c.customerName] || 0) + (c.empty || 0);
    });
  });

  const discrepancies = checkTripDiscrepancy(); // for highlighting

  let html = "";
  for (const customer in customersMap) {
    const info = customersMap[customer];
    const driverText = Object.keys(info.drivers).map(d => `${d}: Daily ${info.drivers[d].daily}, Monthly ${info.drivers[d].monthly}`).join(" | ");
    const totalEmpties = emptiesMap[customer] || 0;
    const isDiscrepancy = discrepancies.some(d => d.customer === customer && (!activeFilterDate || d.date === activeFilterDate));
    const cls = isDiscrepancy ? 'class="discrepancy"' : '';
    html += `<p ${cls}><strong>${customer}</strong>: Daily ${info.dailyCans} cans (₹${info.dailyAmount}) | Monthly ${info.monthlyCans} cans (₹${info.monthlyAmount}) | Empties returned: ${totalEmpties} | Drivers: ${driverText}</p>`;
  }

  // Also show customers who had orders but no trips (to surface missing deliveries)
  const dataOrders = loadData().orders;
  const orderedCustomersSet = new Set();
  dataOrders.forEach(o => {
    if (activeFilterDate && o.date !== activeFilterDate) return;
    orderedCustomersSet.add(o.customer);
  });
  orderedCustomersSet.forEach(cust => {
    if (!customersMap[cust]) {
      // ordered but not in trips => definitely discrepancy
      html += `<p class="discrepancy"><strong>${cust}</strong>: Ordered but no deliveries recorded today.</p>`;
    }
  });

  div.innerHTML = html || "<p>No customer deliveries recorded.</p>";
}

// ------------------- CSV EXPORT -------------------
function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function exportOrdersCSV() {
  const data = loadData();
  const rows = [["Customer","Cans","Amount","Payment","Date"]];
  data.orders.forEach(o => {
    if (activeFilterDate && o.date !== activeFilterDate) return;
    rows.push([o.customer, o.cans, o.cans*30, o.payment, o.date]);
  });
  downloadCSV("orders.csv", rows);
}

function exportTripsCSV() {
  const data = loadData();
  const rows = [["Driver","Trip No","Full Cans","Empty Cans","Amount","CustomerDeliveries","Date"]];
  data.trips.forEach(trip => {
    if (activeFilterDate && trip.date !== activeFilterDate) return;
    const custText = trip.customerDeliveries.map(c => `${c.customerName}:${c.cans}/e${c.empty}`).join(" | ");
    rows.push([trip.driverName, trip.tripNumber, trip.fullCans, trip.emptyCans, trip.fullCans*30, custText, trip.date]);
  });
  downloadCSV("trips.csv", rows);
}

function exportAdminSummaryCSV() {
  const data = loadData();
  const rows = [["Driver","DailyTrips","DailyCans","DailyAmount","DailyEmpties","MonthlyTrips","MonthlyCans","MonthlyAmount","MonthlyEmpties"]];
  const today = new Date().toLocaleDateString();
  const currentMonth = new Date().getMonth();
  ["driver1","driver2","driver3","driver4"].forEach(driver => {
    const trips = data.trips.filter(t => t.driverName === driver);
    const dailyTrips = trips.filter(t => t.date === today);
    const dailyCans = dailyTrips.reduce((s,t)=>s+t.fullCans,0);
    const dailyEmpties = dailyTrips.reduce((s,t)=>s+t.emptyCans,0);
    const monthlyTrips = trips.filter(t => new Date(t.date).getMonth() === currentMonth);
    const monthlyCans = monthlyTrips.reduce((s,t)=>s+t.fullCans,0);
    const monthlyEmpties = monthlyTrips.reduce((s,t)=>s+t.emptyCans,0);
    rows.push([driver, dailyTrips.length, dailyCans, dailyCans*30, dailyEmpties, monthlyTrips.length, monthlyCans, monthlyCans*30, monthlyEmpties]);
  });
  downloadCSV("admin_summary.csv", rows);
}

function exportCustomerSummaryCSV() {
  const data = loadData();
  const rows = [["Customer","DailyCans","DailyAmount","MonthlyCans","MonthlyAmount","DriverBreakdown"]];
  const today = new Date().toLocaleDateString();
  const currentMonth = new Date().getMonth();
  const customersMap = {};

  data.trips.forEach(trip => {
    if (activeFilterDate && trip.date !== activeFilterDate) return;
    trip.customerDeliveries.forEach(c => {
      if (!customersMap[c.customerName]) customersMap[c.customerName] = { dailyCans:0, dailyAmount:0, monthlyCans:0, monthlyAmount:0, driverBreakdown:{} };
      if (!customersMap[c.customerName].driverBreakdown[trip.driverName]) customersMap[c.customerName].driverBreakdown[trip.driverName] = { daily:0, monthly:0 };
      if (trip.date === today) {
        customersMap[c.customerName].dailyCans += c.cans;
        customersMap[c.customerName].dailyAmount += c.cans*30;
        customersMap[c.customerName].driverBreakdown[trip.driverName].daily += c.cans;
      }
      if (new Date(trip.date).getMonth() === currentMonth) {
        customersMap[c.customerName].monthlyCans += c.cans;
        customersMap[c.customerName].monthlyAmount += c.cans*30;
        customersMap[c.customerName].driverBreakdown[trip.driverName].monthly += c.cans;
      }
    });
  });

  for (const customer in customersMap) {
    const info = customersMap[customer];
    const drivers = Object.keys(info.driverBreakdown).map(d => `${d}: D${info.driverBreakdown[d].daily}, M${info.driverBreakdown[d].monthly}`).join(" | ");
    rows.push([customer, info.dailyCans, info.dailyAmount, info.monthlyCans, info.monthlyAmount, drivers]);
  }

  downloadCSV("customer_summary.csv", rows);
}

// ------------------- AUTO-REFRESH -------------------
setInterval(() => {
  renderOrders();
  renderTrips();
  renderSummary();
  renderAdminSummary();
  renderCustomerSummary();
  // console.log("Auto-refresh");
}, 60000);

// ------------------- INITIAL RENDER -------------------
function renderAll() {
  renderOrders();
  renderTrips();
  renderSummary();
  renderAdminSummary();
  renderCustomerSummary();
}
renderAll();
