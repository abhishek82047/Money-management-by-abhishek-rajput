// Chart Initialization and Management
let pieChart, barChart, reportPieChart, reportBarChart;

function initCharts() {
    // Initialize dashboard charts
    pieChart = new Chart(
        document.getElementById('pieChart'),
        getPieChartConfig()
    );
    
    barChart = new Chart(
        document.getElementById('barChart'),
        getBarChartConfig()
    );
    
    // Initialize report charts
    reportPieChart = new Chart(
        document.getElementById('report-pie-chart'),
        getPieChartConfig()
    );
    
    reportBarChart = new Chart(
        document.getElementById('report-bar-chart'),
        getBarChartConfig()
    );
    
    // Update charts with initial data
    updateCharts();
}

function getPieChartConfig() {
    return {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };
}

function getBarChartConfig() {
    return {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Spending',
                data: [],
                backgroundColor: [],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            return `${label}: ₹${value.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    };
}

function updateCharts() {
    updateDashboardCharts();
}

function updateDashboardCharts() {
    // Get current month expenses
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    
    // Calculate totals by category
    const categoryTotals = {};
    let totalSpent = 0;
    
    categories.forEach(category => {
        const categoryExpenses = monthlyExpenses.filter(e => e.categoryId === category.id);
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
    
    // Update pie chart
    pieChart.data.labels = Object.keys(categoryTotals);
    pieChart.data.datasets[0].data = Object.values(categoryTotals).map(c => c.total);
    pieChart.data.datasets[0].backgroundColor = generateColors(Object.keys(categoryTotals).length);
    pieChart.update();
    
    // Update bar chart
    barChart.data.labels = Object.keys(categoryTotals);
    barChart.data.datasets[0].data = Object.values(categoryTotals).map(c => c.total);
    barChart.data.datasets[0].backgroundColor = generateColors(Object.keys(categoryTotals).length, 0.7);
    barChart.update();
}

function updateReportCharts(categoryTotals, totalSpent) {
    // Update report pie chart
    reportPieChart.data.labels = Object.keys(categoryTotals);
    reportPieChart.data.datasets[0].data = Object.values(categoryTotals).map(c => c.total);
    reportPieChart.data.datasets[0].backgroundColor = generateColors(Object.keys(categoryTotals).length);
    reportPieChart.update();
    
    // Update report bar chart
    reportBarChart.data.labels = Object.keys(categoryTotals);
    reportBarChart.data.datasets[0].data = Object.values(categoryTotals).map(c => c.total);
    reportBarChart.data.datasets[0].backgroundColor = generateColors(Object.keys(categoryTotals).length, 0.7);
    reportBarChart.update();
}

function generateColors(count, opacity = 1) {
    const colors = [
        `rgba(75, 192, 192, ${opacity})`,
        `rgba(54, 162, 235, ${opacity})`,
        `rgba(255, 99, 132, ${opacity})`,
        `rgba(255, 159, 64, ${opacity})`,
        `rgba(153, 102, 255, ${opacity})`,
        `rgba(255, 205, 86, ${opacity})`,
        `rgba(201, 203, 207, ${opacity})`,
        `rgba(75, 192, 192, ${opacity})`,
        `rgba(54, 162, 235, ${opacity})`,
        `rgba(255, 99, 132, ${opacity})`
    ];
    
    // Repeat colors if needed
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    
    return result;
}