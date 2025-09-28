// ------------------- Existing Data Handling -------------------
function loadData() {
    return JSON.parse(localStorage.getItem("waterData") || '{"orders":[], "trips":[]}');
}
function saveData(data) {
    localStorage.setItem("waterData", JSON.stringify(data));
}

// ------------------- Login -------------------
function login() {
    let u = document.getElementById("username").value;
    let p = document.getElementById("password").value;

    if((u==="admin" && p==="admin123") || (u==="driver" && p==="driver123")){
        document.getElementById("loginDiv").style.display="none";
        document.getElementById("dashboard").style.display="block";
        renderSummary();
        renderAdminSummary();
        renderCustomerSummary();
    } else alert("Invalid credentials");
}

// ------------------- Orders -------------------
function renderOrders() {
    let data = loadData();
    let tbody = document.getElementById("orderHistoryBody");
    tbody.innerHTML = "";
    data.orders.forEach(o => {
        tbody.innerHTML += `<tr>
            <td>${o.customer}</td>
            <td>${o.cans}</td>
            <td>${o.cans*30}</td>
            <td>${o.payment}</td>
            <td>${o.date}</td>
        </tr>`;
    });
}

// ------------------- Trips -------------------
function renderTrips() {
    let data = loadData();
    let tbody = document.getElementById("tripHistoryBody");
    tbody.innerHTML = "";
    data.trips.forEach(trip => {
        let customers = trip.customerDeliveries.map(c=>`${c.customerName}: ${c.cans}`).join(", ");
        tbody.innerHTML += `<tr>
            <td>${trip.driverName}</td>
            <td>${trip.tripNumber}</td>
            <td>${trip.fullCans}</td>
            <td>${trip.emptyCans}</td>
            <td>${trip.fullCans*30}</td>
            <td>${customers}</td>
            <td>${trip.date}</td>
        </tr>`;
    });
}

// ------------------- Daily Summary -------------------
function renderSummary() {
    let data = loadData();
    let div = document.getElementById("summaryDiv");
    let today = new Date().toLocaleDateString();
    let totalCans = 0, totalAmount = 0;
    data.orders.forEach(o => { if(o.date===today){ totalCans+=o.cans; totalAmount+=o.cans*30;} });
    div.innerHTML = `<p>Daily Summary: ${totalCans} cans | ₹${totalAmount}</p>`;
}

// ------------------- Admin Summary -------------------
function renderAdminSummary() {
    let data = loadData();
    let div = document.getElementById("adminSummaryDiv");
    let today = new Date().toLocaleDateString();
    let currentMonth = new Date().getMonth();
    let drivers = ["driver1","driver2","driver3","driver4"];
    let html = "";
    drivers.forEach(driver => {
        let trips = data.trips.filter(t=>t.driverName===driver);
        let dailyTrips = trips.filter(t=>t.date===today);
        let dailyCans = dailyTrips.reduce((sum,t)=>sum+t.fullCans,0);
        let dailyAmount = dailyCans*30;
        let dailyEmpties = dailyTrips.reduce((sum,t)=>sum+t.emptyCans,0);

        let monthlyTrips = trips.filter(t=>new Date(t.date).getMonth()===currentMonth);
        let monthlyCans = monthlyTrips.reduce((sum,t)=>sum+t.fullCans,0);
        let monthlyAmount = monthlyCans*30;
        let monthlyEmpties = monthlyTrips.reduce((sum,t)=>sum+t.emptyCans,0);

        html += `<h4>${driver}</h4>
            <p>Daily: ${dailyTrips.length} trips | ${dailyCans} cans | ₹${dailyAmount} | ${dailyEmpties} empties</p>
            <p>Monthly: ${monthlyTrips.length} trips | ${monthlyCans} cans | ₹${monthlyAmount} | ${monthlyEmpties} empties</p>`;
    });
    div.innerHTML = html;
}

// ------------------- Customer Summary (with Driver info) -------------------
function renderCustomerSummary() {
    let data = loadData();
    let div = document.getElementById("customerSummaryDiv");
    let today = new Date().toLocaleDateString();
    let currentMonth = new Date().getMonth();
    let customersMap = {};

    data.trips.forEach(trip => {
        trip.customerDeliveries.forEach(c=>{
            if(!customersMap[c.customerName]){
                customersMap[c.customerName]={dailyCans:0,dailyAmount:0,monthlyCans:0,monthlyAmount:0,driverBreakdown:{}};
            }
            if(!customersMap[c.customerName].driverBreakdown[trip.driverName]){
                customersMap[c.customerName].driverBreakdown[trip.driverName]={daily:0,monthly:0};
            }
            if(trip.date===today){
                customersMap[c.customerName].dailyCans+=c.cans;
                customersMap[c.customerName].dailyAmount+=c.cans*30;
                customersMap[c.customerName].driverBreakdown[trip.driverName].daily+=c.cans;
            }
            if(new Date(trip.date).getMonth()===currentMonth){
                customersMap[c.customerName].monthlyCans+=c.cans;
                customersMap[c.customerName].monthlyAmount+=c.cans*30;
                customersMap[c.customerName].driverBreakdown[trip.driverName].monthly+=c.cans;
            }
        });
    });

    let html="<h3>Customer Summary (with Driver info)</h3>";
    for(let customer in customersMap){
        let info = customersMap[customer];
        html+=`<p><strong>${customer}</strong> | Daily: ${info.dailyCans} cans ₹${info.dailyAmount} | Monthly: ${info.monthlyCans} cans ₹${info.monthlyAmount}</p>`;
        html+="<ul>";
        for(let driver in info.driverBreakdown){
            let d = info.driverBreakdown[driver];
            html+=`<li>${driver}: Daily ${d.daily} cans | Monthly ${d.monthly} cans</li>`;
        }
        html+="</ul>";
    }
    div.innerHTML=html;
}

// ------------------- Auto-refresh -------------------
setInterval(() => {
    renderOrders();
    // renderTrips();  // Trip table updates only when admin clicks button
    renderSummary();
    renderAdminSummary();
    renderCustomerSummary();
    console.log("🔄 Auto-refresh done");
}, 60000);

// ------------------- Optional: Initial Render on Page Load -------------------
renderOrders();
renderSummary();
renderAdminSummary();
renderCustomerSummary();

function renderSummaryByDate() {
    let selectedDate = document.getElementById("summaryDate").value;
    if(!selectedDate) {
        alert("Please select a date");
        return;
    }

    let data = loadData();
    let div = document.getElementById("summaryDiv");
    let totalCans = 0, totalAmount = 0;

    data.orders.forEach(o => {
        if(o.date === selectedDate){
            totalCans += o.cans;
            totalAmount += o.cans * 30;
        }
    });

    div.innerHTML = `<p>Summary for ${selectedDate}: ${totalCans} cans | ₹${totalAmount}</p>`;
}

