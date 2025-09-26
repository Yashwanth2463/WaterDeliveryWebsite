let cansAvailable = 50;
let totalOrders = 0;
let totalRevenue = 0;
const pricePerCan = 30;

function updateDashboard() {
  document.getElementById("totalOrders").innerText = "Total Orders: " + totalOrders;
  document.getElementById("totalRevenue").innerText = "Total Revenue: ₹" + totalRevenue;
  document.getElementById("cansLeft").innerText = "Cans Remaining: " + cansAvailable;
}

function placeOrder() {
  const customerName = document.getElementById("customerName").value.trim();
  const orderQuantity = parseInt(document.getElementById("orderQuantity").value);
  const paymentType = document.getElementById("paymentType").value;

  if (!customerName) {
    alert("Please enter customer name!");
    return;
  }

  if (orderQuantity <= 0) {
    alert("Order quantity must be at least 1");
    return;
  }

  if (orderQuantity > cansAvailable) {
    alert(`Only ${cansAvailable} cans available!`);
    return;
  }

  const price = orderQuantity * pricePerCan;

  cansAvailable -= orderQuantity;
  totalOrders++;
  totalRevenue += price;

  const time = new Date().toLocaleTimeString();

  const statusMessage = `Order placed for ${customerName}, ${orderQuantity} cans via ${paymentType}. Total price: ₹${price}. Cans left: ${cansAvailable}`;
  document.getElementById("status").innerText = statusMessage;

  const table = document.getElementById("orderHistory");
  const row = table.insertRow(1);
  row.insertCell(0).innerText = customerName;
  row.insertCell(1).innerText = orderQuantity;
  row.insertCell(2).innerText = paymentType;
  row.insertCell(3).innerText = `₹${price}`;
  row.insertCell(4).innerText = time;

  alert(statusMessage);

  updateDashboard();

  document.getElementById("customerName").value = "";
  document.getElementById("orderQuantity").value = 1;

  if (cansAvailable <= 5) {
    alert("Warning: Low inventory! Only " + cansAvailable + " cans left.");
  }
}

function showInventory() {
  alert("Cans available: " + cansAvailable);
}

function filterOrders() {
  const filterText = document.getElementById("filterCustomer").value.toLowerCase();
  const table = document.getElementById("orderHistory");
  for (let i = 1; i < table.rows.length; i++) {
    const customerCell = table.rows[i].cells[0].innerText.toLowerCase();
    table.rows[i].style.display = customerCell.includes(filterText) ? "" : "none";
  }
}

function resetInventory() {
  if (confirm("Are you sure you want to reset all orders and inventory?")) {
    cansAvailable = 50;
    totalOrders = 0;
    totalRevenue = 0;

    document.getElementById("status").innerText = "";

    const table = document.getElementById("orderHistory");
    while (table.rows.length > 1) {
      table.deleteRow(1);
    }

    updateDashboard();
    alert("Inventory and orders have been reset!");
  }
}

// Initialize dashboard
updateDashboard();
