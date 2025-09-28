// ======================= INITIAL VARIABLES =======================
let currentDriver = ""; 
let totalCans = parseInt(localStorage.getItem("totalCans")) || 100;
let totalCash = parseInt(localStorage.getItem("totalCash")) || 0;
let totalUPI = parseInt(localStorage.getItem("totalUPI")) || 0;
let orders = JSON.parse(localStorage.getItem("orders")) || [];
let trips = JSON.parse(localStorage.getItem("trips")) || [];

let savedPasswords = JSON.parse(localStorage.getItem("driverPasswords")) || {
    "admin": "waterBoss",
    "auto1": "autoOne123",
    "auto2": "autoTwo123",
    "auto3": "autoThree123",
    "auto4": "autoFour123"
};

// ======================= LOGIN =======================
function loginDriver(event){
    event.preventDefault();
    let selectedDriver = document.getElementById("roleSelect").value;
    let enteredPassword = document.getElementById("driverPassword").value.trim();

    if(!selectedDriver){ alert("⚠️ Select driver"); return; }
    if(!savedPasswords[selectedDriver]){ alert("❌ Driver not found"); return; }
    if(savedPasswords[selectedDriver] !== enteredPassword){ alert("❌ Wrong password"); return; }

    currentDriver = selectedDriver;
    localStorage.setItem("currentDriver", currentDriver);
    document.getElementById("currentDriverName").innerText = currentDriver;

    document.getElementById("loginForm").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    refreshAll();
}

// ======================= LOGOUT =======================
function logoutDriver(){
    localStorage.removeItem("currentDriver");
    currentDriver = "";
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
}

// ======================= PLACE ORDER =======================
function placeOrderUpdated(event){
    event.preventDefault();
    let customerName = document.getElementById("orderCustomer").value.trim();
    let cans = parseInt(document.getElementById("orderCans").value);
    let paymentType = document.getElementById("orderPaymentType").value;
    let amount = cans * 30;
    let date = new Date().toISOString().slice(0,10);

    let order = { customerName, cans, paymentType, amount, date, delivered:false };
    
    orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    refreshAll();
    alert("✅ Order placed!");
    document.getElementById("orderForm").reset();
}

function renderOrdersUpdated(displayOrders = null){
    let ordersList = JSON.parse(localStorage.getItem("orders")) || [];
    let tbody = document.getElementById("ordersTableBody");
    if(!tbody) return;

    let list = displayOrders || ordersList;

    tbody.innerHTML = "";
    list.forEach(order=>{
        tbody.innerHTML += `<tr>
            <td>${order.customerName}</td>
            <td>${order.cans}</td>
            <td>₹${order.amount}</td>
            <td>${order.paymentType}</td>
            <td>${order.date}</td>
            <td>${order.delivered ? "✅" : "❌"}</td>
        </tr>`;
    });
}

function exportOrdersCSV(){
    let csv = "Customer,Cans,Amount,Payment Type,Date,Delivered\n";
    orders.forEach(o=>{
        csv += `${o.customerName},${o.cans},${o.amount},${o.paymentType},${o.date},${o.delivered ? "Yes":"No"}\n`;
    });
    let blob = new Blob([csv], {type: "text/csv"});
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
}

// ======================= TRIP SYSTEM =======================
function addDeliveryRow(){
    let container = document.getElementById("customerDeliveries");
    let div = document.createElement("div");
    div.className = "deliveryRow";
    div.innerHTML = `
        <input type="text" placeholder="Customer Name" class="customerName" required>
        <input type="number" placeholder="Cans Delivered" class="cansDelivered" required>
        <input type="number" placeholder="Amount Paid" class="amountPaid" required>
        <select class="paymentType">
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
        </select>
        <button type="button" onclick="removeDeliveryRow(this)">Remove</button>
    `;
    container.appendChild(div);
}

function removeDeliveryRow(btn){
    btn.parentElement.remove();
}

function logTrip(event){
    event.preventDefault();
    let tripNumber = document.getElementById("tripNumber").value;
    let collectedEmpties = parseInt(document.getElementById("tripCollected").value);
    let deliveryRows = document.querySelectorAll(".deliveryRow");

    let deliveries = [];
    let totalDelivered = 0;
    let totalAmountPaid = 0;

    deliveryRows.forEach(row=>{
        let customerName = row.querySelector(".customerName").value.trim();
        let cansDelivered = parseInt(row.querySelector(".cansDelivered").value);
        let amountPaid = parseInt(row.querySelector(".amountPaid").value);
        let paymentType = row.querySelector(".paymentType").value;

        deliveries.push({customerName, cansDelivered, amountPaid, paymentType});
        totalDelivered += cansDelivered;
        totalAmountPaid += amountPaid;
    });

    let trip = {
        driver: currentDriver,
        tripNumber,
        collectedEmpties,
        deliveries,
        totalDelivered,
        totalAmountPaid,
        time: new Date().toLocaleString()
    };

    trips.push(trip);
    localStorage.setItem("trips", JSON.stringify(trips));
    refreshAll();
    alert("✅ Trip logged!");
    document.getElementById("tripForm").reset();
    document.getElementById("customerDeliveries").innerHTML = "";
}

function renderTripsUpdated(displayTrips = null){
    let tripsList = JSON.parse(localStorage.getItem("trips")) || [];
    let tbody = document.getElementById("tripHistoryBody");
    if(!tbody) return;

    let list = displayTrips || tripsList;
    let driverTrips = list.filter(t => currentDriver==="admin" ? true : t.driver===currentDriver);

    tbody.innerHTML = "";

    driverTrips.forEach(trip=>{
        let deliveriesHTML = trip.deliveries.map(d=>{
            return `${d.customerName}: ${d.cansDelivered} cans, ₹${d.amountPaid} (${d.paymentType})`;
        }).join("<br>");
        tbody.innerHTML += `<tr>
            <td>${trip.driver}</td>
            <td>${trip.tripNumber}</td>
            <td>${trip.totalDelivered}</td>
            <td>${trip.collectedEmpties}</td>
            <td>₹${trip.totalAmountPaid}</td>
            <td>${deliveriesHTML}</td>
            <td>${trip.time}</td>
        </tr>`;
    });
}

// ======================= DRIVER MANAGEMENT =======================
function renderDriverManagement(){
    if(currentDriver !== "admin"){ document.getElementById("driverManagementDiv").style.display="none"; return; }
    document.getElementById("driverManagementDiv").style.display="block";
    let tbody = document.getElementById("driverManagementBody");
    tbody.innerHTML = "";

    for(let driver in savedPasswords){
        tbody.innerHTML += `<tr>
            <td>${driver}</td>
            <td>${savedPasswords[driver]}</td>
            <td>
              <button onclick="editDriver('${driver}')">Edit</button>
              <button onclick="resetDriverPassword('${driver}')">Reset Password</button>
            </td>
        </tr>`;
    }
}

function editDriver(driverId){
    if(currentDriver !== "admin"){ alert("Only admin!"); return; }
    let newName = prompt("Enter new name for "+driverId, driverId);
    if(!newName){ alert("Invalid name!"); return; }
    savedPasswords[newName] = savedPasswords[driverId];
    delete savedPasswords[driverId];
    localStorage.setItem("driverPasswords", JSON.stringify(savedPasswords));
    renderDriverManagement();
    alert("Driver updated!");
}

function resetDriverPassword(driverId){
    if(currentDriver !== "admin"){ alert("Only admin!"); return; }
    let newPass = prompt("Enter new password for "+driverId+":", savedPasswords[driverId]);
    if(!newPass){ alert("Invalid password!"); return; }
    savedPasswords[driverId] = newPass;
    localStorage.setItem("driverPasswords", JSON.stringify(savedPasswords));
    renderDriverManagement();
    alert("Password updated!");
}

// ======================= DATE FILTER =======================
function filterByDate(){
    let selectedDate = document.getElementById("filterDate").value;
    if(!selectedDate){ alert("Select a date!"); return; }

    let filteredOrders = orders.filter(o => o.date.startsWith(selectedDate));
    renderOrdersUpdated(filteredOrders);

    let filteredTrips = trips.filter(t => t.time.startsWith(selectedDate));
    renderTripsUpdated(filteredTrips);
}

// ======================= DAILY SUMMARY =======================
function renderDailySummary(){
    let today = new Date().toISOString().slice(0,10);
    
    let todayTrips = trips.filter(t => t.time.startsWith(today));
    let totalCansDelivered = 0;
    let totalCash = 0;
    let totalUPI = 0;

    todayTrips.forEach(trip=>{
        totalCansDelivered += trip.totalDelivered;
        trip.deliveries.forEach(d=>{
            if(d.paymentType === "Cash") totalCash += d.amountPaid;
            else if(d.paymentType === "UPI") totalUPI += d.amountPaid;
        });
    });

    let pendingOrders = orders.filter(o => !o.delivered);

    document.getElementById("summaryCans").innerText = totalCansDelivered;
    document.getElementById("summaryCash").innerText = totalCash;
    document.getElementById("summaryUPI").innerText = totalUPI;
    document.getElementById("summaryPending").innerText = pendingOrders.length;
}

// ======================= REFRESH ALL =======================
function refreshAll(){
    renderOrdersUpdated();
    renderTripsUpdated();
    renderDriverManagement();
    renderDailySummary();
}

// ======================= ON LOAD =======================
window.onload = function(){
    let savedDriver = localStorage.getItem("currentDriver");
    if(savedDriver){
        currentDriver = savedDriver;
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        document.getElementById("currentDriverName").innerText = currentDriver;
        refreshAll();
    }
};
