// Initialize state from localStorage or set defaults
let paymentMethods = JSON.parse(localStorage.getItem('paymentMethods')) || [
    { name: 'فودافون كاش', balance: 500 },
    { name: 'QNB', balance: 10000 },
    { name: 'فلوس كاش', balance: -200 }
];
let weeklySummary = JSON.parse(localStorage.getItem('weeklySummary')) || [];
let financialGoal = localStorage.getItem('financialGoal') || 10000;

document.getElementById('financial-goal').value = financialGoal;

// --- CORE FUNCTIONS ---
function saveData() {
    localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
    localStorage.setItem('weeklySummary', JSON.stringify(weeklySummary));
    localStorage.setItem('financialGoal', document.getElementById('financial-goal').value);
}

function renderPaymentMethods() {
    const list = document.getElementById('payment-methods-list');
    list.innerHTML = '';
    let total = 0;

    if (paymentMethods.length === 0) {
        list.innerHTML = `<p class="text-center text-sm text-gray-400 p-4">أضف طرق الدفع الخاصة بك لتبدأ.</p>`;
    }

    paymentMethods.forEach((method, index) => {
        const methodEl = document.createElement('div');
        methodEl.className = 'flex items-center gap-2';
        methodEl.innerHTML = `
            <input type="text" value="${method.name}" onchange="updateMethodName(${index}, this.value)" class="flex-grow text-sm" placeholder="اسم الطريقة">
            <input type="number" value="${method.balance}" oninput="updateBalance(${index}, this.value)" class="w-24 text-sm" placeholder="الرصيد">
            <button onclick="deleteMethod(${index})" class="text-red-500 hover:text-red-700 text-lg">&times;</button>
        `;
        list.appendChild(methodEl);
        total += parseFloat(method.balance) || 0;
    });

    document.getElementById('total-balance').textContent = total.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
    return total;
}

function renderWeeklySummary() {
    const tableBody = document.getElementById('summary-table-body');
    const noSummaryMsg = document.getElementById('no-summary-message');
    tableBody.innerHTML = '';

    if (weeklySummary.length === 0) {
        noSummaryMsg.style.display = 'block';
        return;
    }

    noSummaryMsg.style.display = 'none';

    weeklySummary.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by most recent

    weeklySummary.forEach((entry, index) => {
        const gainLoss = entry.gainLoss;
        const gainLossClass = gainLoss > 0 ? 'gain' : (gainLoss < 0 ? 'loss' : 'text-gray-500');
        const gainLossText = gainLoss.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
        const remainder = entry.remainder;
        const remainderClass = remainder >= 0 ? 'gain' : 'loss';
        const remainderText = remainder.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });

        const row = document.createElement('tr');
        row.className = 'bg-white border-b hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-3 font-medium text-gray-900">${new Date(entry.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
            <td class="px-4 py-3 font-semibold">${entry.total.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</td>
            <td class="px-4 py-3 ${gainLossClass}">${gainLossText}</td>
            <td class="px-4 py-3 ${remainderClass}">${remainderText}</td>
            <td class="px-4 py-3"><button onclick="deleteSummaryEntry(${index})" class="text-gray-400 hover:text-red-500 text-xs">حذف</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// --- EVENT HANDLER FUNCTIONS ---

function addMethod() {
    const nameInput = document.getElementById('new-method-name');
    const balanceInput = document.getElementById('new-method-balance');
    const name = nameInput.value.trim();
    const balance = parseFloat(balanceInput.value) || 0;

    if (name) {
        paymentMethods.push({ name, balance });
        nameInput.value = '';
        balanceInput.value = '';
        nameInput.focus();
        updateAndRender();
    }
}

function updateMethodName(index, newName) {
    paymentMethods[index].name = newName.trim();
    updateAndRender();
}

function updateBalance(index, newBalance) {
    paymentMethods[index].balance = parseFloat(newBalance) || 0;
    renderPaymentMethods(); // Just update total, no need to save yet
}

function deleteMethod(index) {
    paymentMethods.splice(index, 1);
    updateAndRender();
}

function deleteSummaryEntry(index) {
    // Because we render sorted, we need to find the original index
    const entryToDelete = weeklySummary.sort((a, b) => new Date(b.date) - new Date(a.date))[index];
    const originalIndex = weeklySummary.findIndex(item => item.date === entryToDelete.date && item.total === entryToDelete.total);
    if (originalIndex > -1) {
        weeklySummary.splice(originalIndex, 1);
        updateAndRender();
    }
}


function logWeeklyTotal() {
    const total = renderPaymentMethods();
    const lastSummary = weeklySummary.length > 0 ? weeklySummary.sort((a, b) => new Date(b.date) - new Date(a.date))[0] : { total: 0 };
    const gainLoss = total - lastSummary.total;
    const goal = parseFloat(document.getElementById('financial-goal').value) || 0;

    const newEntry = {
        date: new Date().toISOString().split('T')[0],
        total: total,
        gainLoss: weeklySummary.length > 0 ? gainLoss : 0, // No gain/loss for the first entry
        remainder: total - goal
    };

    // Check if an entry for today already exists
    const todayStr = new Date().toISOString().split('T')[0];
    const existingEntryIndex = weeklySummary.findIndex(entry => entry.date === todayStr);

    if (existingEntryIndex > -1) {
        // Update existing entry for today
        weeklySummary[existingEntryIndex] = newEntry;
    } else {
        // Add new entry
        weeklySummary.push(newEntry);
    }

    updateAndRender();
}

function updateAndRender() {
    saveData();
    renderPaymentMethods();
    renderWeeklySummary();
}

// --- INITIAL RENDER ---
window.onload = function () {
    updateAndRender();
};

