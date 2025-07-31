import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface EarningsReportData {
  totalRevenue: number;
  monthlyGrowth: number;
  currentMonth: number;
  activeBusinesses: number;
  dailyRevenue: number[];
  monthlyRevenue: number[];
  businessTypes: { [key: string]: number };
  recentTransactions: Array<{
    business: string;
    amount: number;
    time: string;
    type: string;
  }>;
  dateRange: string;
  generatedAt: Date;
}

export class PDFEarningsGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  async generateEarningsReport(data: EarningsReportData): Promise<void> {
    try {
      // Add header
      this.addHeader();
      
      // Add summary section
      this.addSummarySection(data);
      
      // Add revenue breakdown
      this.addRevenueBreakdown(data);
      
      // Add business performance
      this.addBusinessPerformance(data);
      
      // Add recent transactions
      this.addRecentTransactions(data);
      
      // Add charts (if dashboard element exists)
      await this.addChartsFromDashboard();
      
      // Add footer
      this.addFooter(data.generatedAt);
      
      // Save the PDF
      this.doc.save(`DreamSeller-Pro-Earnings-Report-${this.formatDate(data.generatedAt)}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw new Error('Failed to generate PDF report');
    }
  }

  private addHeader(): void {
    // Company logo area (placeholder)
    this.doc.setFillColor(59, 130, 246); // Blue color
    this.doc.rect(this.margin, this.currentY, 30, 20, 'F');
    
    // Company name
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('DreamSeller Pro', this.margin + 35, this.currentY + 15);
    
    // Report title
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Earnings Report', this.pageWidth - this.margin - 60, this.currentY + 15);
    
    this.currentY += 40;
    
    // Add separator line
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 20;
  }

  private addSummarySection(data: EarningsReportData): void {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Executive Summary', this.margin, this.currentY);
    this.currentY += 15;

    // Summary cards
    const cardWidth = (this.pageWidth - 2 * this.margin - 30) / 4;
    const cardHeight = 40;
    
    const summaryData = [
      { label: 'Total Revenue', value: `$${data.totalRevenue.toLocaleString()}`, color: [34, 197, 94] },
      { label: 'Monthly Growth', value: `+${data.monthlyGrowth}%`, color: [59, 130, 246] },
      { label: 'This Month', value: `$${data.currentMonth.toLocaleString()}`, color: [168, 85, 247] },
      { label: 'Active Businesses', value: data.activeBusinesses.toString(), color: [249, 115, 22] }
    ];

    summaryData.forEach((item, index) => {
      const x = this.margin + index * (cardWidth + 10);
      
      // Card background
      this.doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      this.doc.rect(x, this.currentY, cardWidth, cardHeight, 'F');
      
      // Card text
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(item.label, x + 5, this.currentY + 15);
      
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(item.value, x + 5, this.currentY + 30);
    });

    this.currentY += cardHeight + 20;
  }

  private addRevenueBreakdown(data: EarningsReportData): void {
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Revenue Breakdown by Business Type', this.margin, this.currentY);
    this.currentY += 20;

    // Table headers
    const tableStartY = this.currentY;
    const colWidth = (this.pageWidth - 2 * this.margin) / 3;
    
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, tableStartY, this.pageWidth - 2 * this.margin, 15, 'F');
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Business Type', this.margin + 5, tableStartY + 10);
    this.doc.text('Revenue', this.margin + colWidth + 5, tableStartY + 10);
    this.doc.text('Percentage', this.margin + 2 * colWidth + 5, tableStartY + 10);
    
    this.currentY = tableStartY + 20;

    // Table rows
    const totalRevenue = Object.values(data.businessTypes).reduce((sum, value) => sum + value, 0);
    
    Object.entries(data.businessTypes).forEach(([type, revenue], index) => {
      const percentage = ((revenue / totalRevenue) * 100).toFixed(1);
      
      if (index % 2 === 0) {
        this.doc.setFillColor(250, 250, 250);
        this.doc.rect(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, 15, 'F');
      }
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(type, this.margin + 5, this.currentY + 5);
      this.doc.text(`$${revenue.toLocaleString()}`, this.margin + colWidth + 5, this.currentY + 5);
      this.doc.text(`${percentage}%`, this.margin + 2 * colWidth + 5, this.currentY + 5);
      
      this.currentY += 15;
    });

    this.currentY += 20;
  }

  private addBusinessPerformance(data: EarningsReportData): void {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Monthly Performance Trend', this.margin, this.currentY);
    this.currentY += 20;

    // Simple chart representation
    const chartWidth = this.pageWidth - 2 * this.margin;
    const chartHeight = 60;
    const maxRevenue = Math.max(...data.monthlyRevenue);
    
    // Chart background
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(this.margin, this.currentY, chartWidth, chartHeight, 'F');
    
    // Chart border
    this.doc.setDrawColor(200, 200, 200);
    this.doc.rect(this.margin, this.currentY, chartWidth, chartHeight);
    
    // Draw bars
    const barWidth = chartWidth / data.monthlyRevenue.length;
    
    data.monthlyRevenue.forEach((revenue, index) => {
      const barHeight = (revenue / maxRevenue) * (chartHeight - 10);
      const x = this.margin + index * barWidth + 5;
      const y = this.currentY + chartHeight - barHeight - 5;
      
      this.doc.setFillColor(59, 130, 246);
      this.doc.rect(x, y, barWidth - 10, barHeight, 'F');
      
      // Month labels
      this.doc.setFontSize(8);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(`M${index + 1}`, x + (barWidth - 10) / 2 - 5, this.currentY + chartHeight + 10);
    });

    this.currentY += chartHeight + 25;
  }

  private addRecentTransactions(data: EarningsReportData): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 100) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Recent Transactions', this.margin, this.currentY);
    this.currentY += 20;

    // Table headers
    const colWidths = [60, 40, 40, 40];
    let currentX = this.margin;
    
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 15, 'F');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    
    ['Business', 'Amount', 'Type', 'Time'].forEach((header, index) => {
      this.doc.text(header, currentX + 5, this.currentY + 10);
      currentX += colWidths[index];
    });
    
    this.currentY += 20;

    // Transaction rows
    data.recentTransactions.forEach((transaction, index) => {
      if (index % 2 === 0) {
        this.doc.setFillColor(250, 250, 250);
        this.doc.rect(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, 15, 'F');
      }
      
      currentX = this.margin;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(9);
      
      this.doc.text(transaction.business.substring(0, 20), currentX + 5, this.currentY + 5);
      currentX += colWidths[0];
      
      this.doc.text(`$${transaction.amount}`, currentX + 5, this.currentY + 5);
      currentX += colWidths[1];
      
      this.doc.text(transaction.type, currentX + 5, this.currentY + 5);
      currentX += colWidths[2];
      
      this.doc.text(transaction.time, currentX + 5, this.currentY + 5);
      
      this.currentY += 15;
    });

    this.currentY += 20;
  }

  private async addChartsFromDashboard(): Promise<void> {
    try {
      const dashboardElement = document.getElementById('earnings-dashboard');
      if (dashboardElement) {
        this.doc.addPage();
        this.currentY = this.margin;
        
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Dashboard Snapshot', this.margin, this.currentY);
        this.currentY += 20;
        
        const canvas = await html2canvas(dashboardElement, {
          scale: 0.5,
          useCORS: true,
          allowTaint: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = this.pageWidth - 2 * this.margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        this.doc.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight);
      }
    } catch (error) {
      console.warn('Could not capture dashboard screenshot:', error);
    }
  }

  private addFooter(generatedAt: Date): void {
    const footerY = this.pageHeight - 30;
    
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, footerY, this.pageWidth - this.margin, footerY);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    
    this.doc.text('DreamSeller Pro - Automated Business Empire', this.margin, footerY + 15);
    this.doc.text(`Generated on ${this.formatDate(generatedAt)}`, this.pageWidth - this.margin - 60, footerY + 15);
  }

  private formatDate(date: Date): string {
    // Validate date input
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.log("Invalid date provided, using current date");
      date = new Date();
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Export function for easy use
export async function generateEarningsReportPDF(data: EarningsReportData): Promise<void> {
  const generator = new PDFEarningsGenerator();
  await generator.generateEarningsReport(data);
}