// Main Application Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

// Data Management
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { id: 1, name: 'Food', icon: 'utensils', budget: 500 },
    { id: 2, name: 'Transport', icon: 'car', budget: 300 },
    { id: 3, name: 'Shopping', icon: 'shopping-cart', budget: 400 },
    { id: 4, name: 'Entertainment', icon: 'gamepad', budget: 200 },
    { id: 5, name: 'Utilities', icon: 'bolt', budget: 250 }
];
let splitBills = JSON.parse(localStorage.getItem('splitBills')) || [];
let monthlyBudget = parseInt(localStorage.getItem('monthlyBudget')) || 2000;

function initApp() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleIcon(savedTheme);

    // Initialize event listeners
    setupEventListeners();document.getElementById('set-budget').addEventListener('click', setMonthlyBudget);

    // Load initial data
    loadInitialData();

    // Set current date as default for expense forms
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expense-date').value = today;
    document.getElementById('edit-expense-date').value = today;
}

function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Navigation
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section') + '-section';
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.add('d-none');
            });
            document.getElementById(sectionId).classList.remove('d-none');
        });
    });

    // Expense form
    document.getElementById('expense-form').addEventListener('submit', handleAddExpense);

    // Edit expense modal
    document.getElementById('save-expense-changes').addEventListener('click', saveExpenseChanges);

    // Split bill form
    document.getElementById('split-bill-form').addEventListener('submit', handleSplitBill);
    document.getElementById('copy-split').addEventListener('click', copySplitResult);

    // Report form
    document.getElementById('report-form').addEventListener('submit', generateReport);
    document.getElementById('report-type').addEventListener('change', updateReportForm);
    document.getElementById('download-report').addEventListener('click', downloadReport);

    // Category form
    document.getElementById('category-form').addEventListener('submit', handleAddCategory);
    document.getElementById('save-category-changes').addEventListener('click', saveCategoryChanges);

    // Confirmation modal
    document.getElementById('confirm-action').addEventListener('click', executeConfirmedAction);

    // Export data
    document.getElementById('exportData').addEventListener('click', exportData);
    document.getElementById('generateReport').addEventListener('click', generateFullReport);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggleIcon(newTheme);
}

function updateThemeToggleIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

function saveData() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('splitBills', JSON.stringify(splitBills));
    localStorage.setItem('monthlyBudget', monthlyBudget);
    updateUI();
}

function loadInitialData() {
    // Populate category selects
    updateCategorySelects();
    
    // Load expenses table
    renderExpensesTable();
    
    // Load recent transactions
    renderRecentTransactions();
    
    // Load categories table
    renderCategoriesTable();
    
    // Load split bill history
    renderSplitBillHistory();
    
    // Initialize charts
    initCharts();
    
    // Set current year in report form
    setReportYearOptions();
    
    // Update summary cards
    updateSummaryCards();
}

// Expense Management
function handleAddExpense(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const categoryId = parseInt(document.getElementById('expense-category').value);
    const date = document.getElementById('expense-date').value;
    const description = document.getElementById('expense-description').value;
    
    if (!amount || !categoryId || !date) {
        alert('Please fill in all required fields');
        return;
    }
    
    const category = categories.find(c => c.id === categoryId);
    
    const newExpense = {
        id: Date.now(),
        amount,
        categoryId,
        categoryName: category.name,
        date,
        description
    };
    
    expenses.push(newExpense);
    saveData();
    
    // Reset form
    e.target.reset();
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
}

function renderExpensesTable() {
    const tableBody = document.querySelector('#all-expenses tbody');
    tableBody.innerHTML = '';
    
    // Sort by date (newest first)
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedExpenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td><i class="fas fa-${getCategoryIcon(expense.categoryId)} me-2"></i>${expense.categoryName}</td>
            <td>₹${expense.amount.toFixed(2)}</td>
            <td>${expense.description || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1 edit-expense" data-id="${expense.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-expense" data-id="${expense.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-expense').forEach(btn => {
        btn.addEventListener('click', () => openEditExpenseModal(parseInt(btn.dataset.id)));
    });
    
    document.querySelectorAll('.delete-expense').forEach(btn => {
        btn.addEventListener('click', () => confirmDelete('expense', parseInt(btn.dataset.id)));
    });
}

function renderRecentTransactions() {
    const tableBody = document.querySelector('#recent-transactions tbody');
    tableBody.innerHTML = '';
    
    // Get 5 most recent expenses
    const recentExpenses = [...expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    recentExpenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td><i class="fas fa-${getCategoryIcon(expense.categoryId)} me-2"></i>${expense.categoryName}</td>
            <td>$${expense.amount.toFixed(2)}</td>
            <td>${expense.description || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1 edit-expense" data-id="${expense.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-expense" data-id="${expense.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function openEditExpenseModal(id) {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;
    
    document.getElementById('edit-expense-id').value = expense.id;
    document.getElementById('edit-expense-amount').value = expense.amount;
    document.getElementById('edit-expense-date').value = expense.date;
    document.getElementById('edit-expense-description').value = expense.description || '';
    
    // Initialize category select
    const categorySelect = document.getElementById('edit-expense-category');
    categorySelect.innerHTML = '<option value="">Select Category</option>' + 
        categories.map(cat => 
            `<option value="${cat.id}" ${cat.id === expense.categoryId ? 'selected' : ''}>${cat.name}</option>`
        ).join('');
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editExpenseModal'));
    modal.show();
}

function saveExpenseChanges() {
    const id = parseInt(document.getElementById('edit-expense-id').value);
    const amount = parseFloat(document.getElementById('edit-expense-amount').value);
    const categoryId = parseInt(document.getElementById('edit-expense-category').value);
    const date = document.getElementById('edit-expense-date').value;
    const description = document.getElementById('edit-expense-description').value;
    
    if (!amount || !categoryId || !date) {
        alert('Please fill in all required fields');
        return;
    }
    
    const expenseIndex = expenses.findIndex(e => e.id === id);
    if (expenseIndex === -1) return;
    
    const category = categories.find(c => c.id === categoryId);
    
    expenses[expenseIndex] = {
        ...expenses[expenseIndex],
        amount,
        categoryId,
        categoryName: category.name,
        date,
        description
    };
    
    saveData();
    
    // Hide modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editExpenseModal'));
    modal.hide();
}

// Split Bill Functionality
function handleSplitBill(e) {
    e.preventDefault();
    
    const totalAmount = parseFloat(document.getElementById('bill-amount').value);
    const peopleCount = parseInt(document.getElementById('people-count').value);
    const tipPercentage = parseFloat(document.getElementById('tip-percentage').value) || 0;
    const saveAsExpense = document.getElementById('save-as-expense').checked;
    
    if (!totalAmount || !peopleCount) {
        alert('Please fill in all required fields');
        return;
    }
    
    const totalWithTip = totalAmount * (1 + tipPercentage / 100);
    const perPerson = totalWithTip / peopleCount;
    
    // Display result
    const resultDiv = document.getElementById('split-result');
    resultDiv.innerHTML = `
    <h3 class="split-amount">₹${perPerson.toFixed(2)}</h3>
    <p class="split-details">per person (${peopleCount} people)</p>
    <p class="split-details">Total: ₹${totalWithTip.toFixed(2)} (including ₹${(totalWithTip - totalAmount).toFixed(2)} tip)</p>
    `;
    
    // Save to history
    const newSplitBill = {
        id: Date.now(),
        totalAmount,
        peopleCount,
        tipPercentage,
        perPerson,
        date: new Date().toISOString().split('T')[0]
    };
    
    splitBills.push(newSplitBill);
    
    // Save as expense if requested
    if (saveAsExpense) {
        const newExpense = {
            id: Date.now() + 1,
            amount: totalAmount,
            categoryId: categories.find(c => c.name === 'Food')?.id || categories[0].id,
            categoryName: categories.find(c => c.name === 'Food')?.name || categories[0].name,
            date: new Date().toISOString().split('T')[0],
            description: `Split bill with ${peopleCount} people (incl. ${tipPercentage}% tip)`
        };
        
        expenses.push(newExpense);
    }
    
    saveData();
    
    // Reset form
    document.getElementById('bill-amount').value = '';
    document.getElementById('people-count').value = '';
}

function copySplitResult() {
    const resultDiv = document.getElementById('split-result');
    if (!resultDiv.textContent.includes('per person')) {
        alert('No split result to copy');
        return;
    }
    
    const text = resultDiv.textContent.replace(/\s+/g, ' ').trim();
    navigator.clipboard.writeText(text)
        .then(() => alert('Copied to clipboard!'))
        .catch(err => console.error('Failed to copy: ', err));
}

function renderSplitBillHistory() {
    const tableBody = document.querySelector('#split-history tbody');
    tableBody.innerHTML = '';
    
    // Sort by date (newest first)
    const sortedBills = [...splitBills].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedBills.forEach(bill => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(bill.date)}</td>
            <td>₹${bill.totalAmount.toFixed(2)} ${bill.tipPercentage > 0 ? `(+${bill.tipPercentage}%)` : ''}</td>
            <td>${bill.peopleCount}</td>
            <td>₹${bill.perPerson.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger delete-split" data-id="${bill.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-split').forEach(btn => {
        btn.addEventListener('click', () => confirmDelete('splitBill', parseInt(btn.dataset.id)));
    });
}

// Category Management
function handleAddCategory(e) {
    e.preventDefault();
    
    const name = document.getElementById('category-name').value.trim();
    const icon = document.getElementById('category-icon').value;
    const budget = parseFloat(document.getElementById('category-budget').value) || null;
    
    if (!name) {
        alert('Please enter a category name');
        return;
    }
    
    // Check if category already exists
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        alert('Category already exists');
        return;
    }
    
    const newCategory = {
        id: Date.now(),
        name,
        icon,
        budget
    };
    
    categories.push(newCategory);
    saveData();
    
    // Reset form
    e.target.reset();
}

function renderCategoriesTable() {
    const tableBody = document.querySelector('#categories-table tbody');
    tableBody.innerHTML = '';
    
    categories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><i class="fas fa-${category.icon}"></i></td>
            <td>${category.name}</td>
            <td>${category.budget ? `₹${category.budget.toFixed(2)}` : '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1 edit-category" data-id="${category.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-category" data-id="${category.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-category').forEach(btn => {
        btn.addEventListener('click', () => openEditCategoryModal(parseInt(btn.dataset.id)));
    });
    
    document.querySelectorAll('.delete-category').forEach(btn => {
        btn.addEventListener('click', () => confirmDelete('category', parseInt(btn.dataset.id)));
    });
}

function openEditCategoryModal(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    document.getElementById('edit-category-id').value = category.id;
    document.getElementById('edit-category-name').value = category.name;
    document.getElementById('edit-category-icon').value = category.icon;
    document.getElementById('edit-category-budget').value = category.budget || '';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
    modal.show();
}

function saveCategoryChanges() {
    const id = parseInt(document.getElementById('edit-category-id').value);
    const name = document.getElementById('edit-category-name').value.trim();
    const icon = document.getElementById('edit-category-icon').value;
    const budget = parseFloat(document.getElementById('edit-category-budget').value) || null;
    
    if (!name) {
        alert('Please enter a category name');
        return;
    }
    
    const categoryIndex = categories.findIndex(c => c.id === id);
    if (categoryIndex === -1) return;
    
    // Check if another category already has this name
    if (categories.some((c, index) => index !== categoryIndex && c.name.toLowerCase() === name.toLowerCase())) {
        alert('Category name already exists');
        return;
    }
    
    categories[categoryIndex] = {
        ...categories[categoryIndex],
        name,
        icon,
        budget
    };
    
    saveData();
    
    // Hide modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editCategoryModal'));
    modal.hide();
}

// Report Generation
function updateReportForm() {
    const reportType = document.getElementById('report-type').value;
    
    document.getElementById('month-select-container').classList.add('d-none');
    document.getElementById('year-select-container').classList.add('d-none');
    document.getElementById('custom-range-container').classList.add('d-none');
    document.getElementById('custom-range-end-container').classList.add('d-none');
    
    if (reportType === 'monthly') {
        document.getElementById('month-select-container').classList.remove('d-none');
        document.getElementById('year-select-container').classList.remove('d-none');
    } else if (reportType === 'yearly') {
        document.getElementById('year-select-container').classList.remove('d-none');
    } else if (reportType === 'custom') {
        document.getElementById('custom-range-container').classList.remove('d-none');
        document.getElementById('custom-range-end-container').classList.remove('d-none');
    }
}

function setReportYearOptions() {
    const yearSelect = document.getElementById('report-year');
    const currentYear = new Date().getFullYear();
    
    yearSelect.innerHTML = '';
    for (let year = currentYear; year >= currentYear - 5; year--) {
        yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
    }
}

function generateReport(e) {
    e.preventDefault();
    
    const reportType = document.getElementById('report-type').value;
    let startDate, endDate;
    
    if (reportType === 'monthly') {
        const month = parseInt(document.getElementById('report-month').value);
        const year = parseInt(document.getElementById('report-year').value);
        startDate = new Date(year, month, 1);
        endDate = new Date(year, month + 1, 0);
    } else if (reportType === 'yearly') {
        const year = parseInt(document.getElementById('report-year').value);
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
    } else if (reportType === 'custom') {
        startDate = new Date(document.getElementById('report-start-date').value);
        endDate = new Date(document.getElementById('report-end-date').value);
        
        if (isNaN(startDate.getTime())) {
            alert('Please select a valid start date');
            return;
        }
        
        if (isNaN(endDate.getTime())) {
            alert('Please select a valid end date');
            return;
        }
        
        if (startDate > endDate) {
            alert('Start date must be before end date');
            return;
        }
    }
    
    // Filter expenses by date range
    const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
    });
    
    // Calculate totals by category
    const categoryTotals = {};
    let totalSpent = 0;
    
    categories.forEach(category => {
        const categoryExpenses = filteredExpenses.filter(e => e.categoryId === category.id);
        const categoryTotal = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        if (categoryTotal > 0) {
            categoryTotals[category.name] = {
                total: categoryTotal,
                icon: category.icon,
                budget: category.budget
            };
            totalSpent += categoryTotal;
        }
    });
    
    // Update report table
    const reportTableBody = document.querySelector('#report-table tbody');
    reportTableBody.innerHTML = '';
    
    for (const [category, data] of Object.entries(categoryTotals)) {
        const percentage = ((data.total / totalSpent) * 100).toFixed(1);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><i class="fas fa-${data.icon} me-2"></i>${category}</td>
            <td>₹${data.total.toFixed(2)} ${data.budget ? `/ ₹${data.budget.toFixed(2)}` : ''}</td>
            <td>${percentage}%</td>
        `;
        reportTableBody.appendChild(row);
    }
    
    // Update charts
    updateReportCharts(categoryTotals, totalSpent);
}

function downloadReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Expense Report', 105, 15, { align: 'center' });
    
    // Add date range
    doc.setFontSize(12);
    const reportType = document.getElementById('report-type').value;
    let dateRange = '';
    
    if (reportType === 'monthly') {
        const month = document.getElementById('report-month').options[document.getElementById('report-month').selectedIndex].text;
        const year = document.getElementById('report-year').value;
        dateRange = `${month} ${year}`;
    } else if (reportType === 'yearly') {
        const year = document.getElementById('report-year').value;
        dateRange = `Year ${year}`;
    } else if (reportType === 'custom') {
        const startDate = formatDate(document.getElementById('report-start-date').value);
        const endDate = formatDate(document.getElementById('report-end-date').value);
        dateRange = `${startDate} to ${endDate}`;
    }
    
    doc.text(dateRange, 105, 25, { align: 'center' });
    
    // Add charts (we'll use html2canvas to capture them)
    const reportContent = document.getElementById('report-content');
    
    html2canvas(reportContent).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = doc.internal.pageSize.getWidth() - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        doc.addImage(imgData, 'PNG', 10, 30, imgWidth, imgHeight);
        doc.save('expense-report.pdf');
    });
}

function generateFullReport() {
    // Set report type to "yearly" and current year
    document.getElementById('report-type').value = 'yearly';
    document.getElementById('report-year').value = new Date().getFullYear();
    updateReportForm();
    
    // Trigger report generation
    document.getElementById('report-form').dispatchEvent(new Event('submit'));
    
    // Switch to reports section
    document.querySelector('[data-section="reports"]').click();
}

// Utility Functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function getCategoryIcon(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : 'ellipsis-h';
}

function confirmDelete(type, id) {
    let message = '';
    
    if (type === 'expense') {
        message = 'Are you sure you want to delete this expense?';
    } else if (type === 'category') {
        message = 'Are you sure you want to delete this category? All associated expenses will be uncategorized.';
    } else if (type === 'splitBill') {
        message = 'Are you sure you want to delete this split bill record?';
    }
    
    document.getElementById('confirmation-message').textContent = message;
    document.getElementById('confirm-action').dataset.type = type;
    document.getElementById('confirm-action').dataset.id = id;
    
    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modal.show();
}

function executeConfirmedAction() {
    const type = this.dataset.type;
    const id = parseInt(this.dataset.id);
    
    if (type === 'expense') {
        expenses = expenses.filter(e => e.id !== id);
    } else if (type === 'category') {
        // First, remove category from expenses
        expenses.forEach(expense => {
            if (expense.categoryId === id) {
                expense.categoryId = null;
                expense.categoryName = 'Uncategorized';
            }
        });
        
        // Then remove the category
        categories = categories.filter(c => c.id !== id);
    } else if (type === 'splitBill') {
        splitBills = splitBills.filter(b => b.id !== id);
    }
    
    saveData();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
    modal.hide();
}

function updateSummaryCards() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    
    const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remainingBudget = monthlyBudget - totalSpent;
    
    document.getElementById('total-spent').textContent = totalSpent.toFixed(2);
document.getElementById('remaining-budget').textContent = remainingBudget.toFixed(2);
document.getElementById('monthly-budget').textContent = monthlyBudget.toFixed(2);
}

function updateUI() {
    renderExpensesTable();
    renderRecentTransactions();
    renderCategoriesTable();
    renderSplitBillHistory();
    updateCategorySelects();
    updateCharts();
    updateSummaryCards();
}

function exportData() {
    const data = {
        expenses,
        categories,
        splitBills,
        monthlyBudget
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'money-manager-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function updateCategorySelects() {
    const categorySelects = [
        document.getElementById('expense-category'),
        document.getElementById('edit-expense-category')
    ];
    
    categorySelects.forEach(select => {
        if (select) {
            select.innerHTML = '<option value="">Select Category</option>' + 
                categories.map(cat => 
                    `<option value="${cat.id}">${cat.name}</option>`
                ).join('');
        }
    });
}
function setMonthlyBudget() {
    const currentBudget = parseInt(localStorage.getItem('monthlyBudget')) || 2000;
    const newBudget = prompt('Enter your monthly budget:', currentBudget);
    
    if (newBudget && !isNaN(newBudget)) {
        monthlyBudget = parseFloat(newBudget);
        localStorage.setItem('monthlyBudget', monthlyBudget);
        updateSummaryCards();
    }
}