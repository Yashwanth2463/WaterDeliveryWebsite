let cansAvailable = 50;
const pricePerCan = 30;
let totalRevenue = 0;

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

    const totalPrice = orderQuantity * pricePerCan;
    cansAvailable -= orderQuantity;

    // Update total revenue
    totalRevenue += totalPrice;
    document.getElementById("totalRevenue").innerText = `Total Revenue: ₹${totalRevenue}`;

    // Update status
    document.getElementById("status").innerText =
        `Order placed for ${customerName}, ${orderQuantity} cans via ${paymentType}. Total: ₹${totalPrice}. Cans left: ${cansAvailable}`;

    // Low stock warning
    if (cansAvailable <= 5) {
        alert(`Warning: Low inventory! Only ${cansAvailable} cans left.`);
    }

    // Add order to history table
    const table = document.getElementById("orderHistory");
    const row = table.insertRow(1);
    row.insertCell(0).innerText = customerName;
    row.insertCell(1).innerText = orderQuantity;
    row.insertCell(2).innerText = paymentType;
    row.insertCell(3).innerText = totalPrice;
    row.insertCell(4).innerText = new Date().toLocaleTimeString();

    alert(`Order placed for ${customerName}, ${orderQuantity} cans. Total: ₹${totalPrice}`);

    // Clear input fields
    document.getElementById("customerName").value = "";
    document.getElementById("orderQuantity").value = 1;
}

function showInventory() {
    alert(`Cans available: ${cansAvailable}`);
    document.getElementById("status").innerText = `Cans available: ${cansAvailable}`;
}
