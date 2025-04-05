// PDF Report Generation
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Expense Report', 105, 15, { align: 'center' });
    
    // Add date
    doc.setFontSize(12);
    const today = new Date().toLocaleDateString();
    doc.text(`Generated on: ${today}`, 105, 25, { align: 'center' });
    
    // Add summary
    doc.setFontSize(14);
    doc.text('Monthly Summary', 14, 40);
    
    doc.setFontSize(12);
    doc.text(`Total Budget: ₹${document.getElementById('monthly-budget').textContent}`, 14, 50);
    doc.text(`Total Spent: ₹${document.getElementById('total-spent').textContent}`, 14, 60);
    doc.text(`Remaining: ₹${document.getElementById('remaining-budget').textContent}`, 14, 70);
    
    // Add charts
    const canvas = document.getElementById('pieChart');
    const canvasImage = canvas.toDataURL('image/png');
    doc.addImage(canvasImage, 'PNG', 14, 80, 85, 85);
    
    const barCanvas = document.getElementById('barChart');
    const barCanvasImage = barCanvas.toDataURL('image/png');
    doc.addImage(barCanvasImage, 'PNG', 105, 80, 85, 85);
    
    // Add expense table
    doc.setFontSize(14);
    doc.text('Recent Transactions', 14, 180);
    
    doc.setFontSize(10);
    const headers = [['Date', 'Category', 'Amount', 'Description']];
    const tableData = [];
    
    const recentRows = document.querySelectorAll('#recent-transactions tbody tr');
    recentRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) { // Skip rows without enough cells
            tableData.push([
                cells[0].textContent,
                cells[1].textContent,
                cells[2].textContent,
                cells[3].textContent
            ]);
        }
    });
    
    doc.autoTable({
        head: headers,
        body: tableData,
        startY: 185,
        margin: { left: 14 },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [67, 97, 238] }
    });
    
    // Save the PDF
    doc.save('expense-report.pdf');
}

// Event listener for the download button
document.getElementById('download-report')?.addEventListener('click', generatePDF);