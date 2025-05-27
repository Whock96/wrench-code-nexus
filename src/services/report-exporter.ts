
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Tipos para os diferentes relatórios
export interface RevenueReportData {
  period: string;
  revenue: number;
}

export interface StatusDistributionData {
  status: string;
  count: number;
  color: string;
}

export interface ServiceTrendData {
  period: string;
  created: number;
  completed: number;
}

export interface CustomerReportData {
  id: string;
  name: string;
  totalOrders: number;
  totalRevenue: number;
  lastServiceDate: string;
}

export interface VehicleReportData {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  customerName: string;
  totalOrders: number;
  totalRevenue: number;
  lastServiceDate: string;
}

// Classe principal para exportação
export class ReportExporter {
  // Tradução dos status para português
  private static translateStatus(status: string): string {
    const translations: Record<string, string> = {
      pending: "Pendente",
      approved: "Aprovada",
      in_progress: "Em Andamento",
      waiting_parts: "Aguardando Peças",
      completed: "Concluída",
      canceled: "Cancelada"
    };
    return translations[status] || status;
  }

  // Formatação de moeda
  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  }

  // Exportar relatório de faturamento para PDF
  static exportRevenueToPDF(
    data: RevenueReportData[],
    dateRange: { from: Date; to: Date }
  ): void {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Relatório de Faturamento", 14, 22);
    
    // Período
    doc.setFontSize(11);
    doc.text(
      `Período: ${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} a ${format(
        dateRange.to,
        "dd/MM/yyyy",
        { locale: ptBR }
      )}`,
      14,
      32
    );
    
    // Tabela
    const tableData = data.map(item => [
      item.period,
      this.formatCurrency(item.revenue)
    ]);
    
    autoTable(doc, {
      head: [["Período", "Faturamento"]],
      body: tableData,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [66, 66, 66] }
    });
    
    // Total
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    doc.setFontSize(12);
    doc.text(
      `Faturamento Total: ${this.formatCurrency(totalRevenue)}`,
      14,
      (doc as any).lastAutoTable.finalY + 10
    );
    
    // Rodapé
    doc.setFontSize(10);
    doc.text(
      `Relatório gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
      14,
      doc.internal.pageSize.height - 10
    );
    
    // Download
    doc.save(`relatorio-faturamento-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  }
  
  // Exportar relatório de distribuição de status para PDF
  static exportStatusDistributionToPDF(
    data: StatusDistributionData[],
    dateRange: { from: Date; to: Date }
  ): void {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Relatório de Distribuição de Status", 14, 22);
    
    // Período
    doc.setFontSize(11);
    doc.text(
      `Período: ${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} a ${format(
        dateRange.to,
        "dd/MM/yyyy",
        { locale: ptBR }
      )}`,
      14,
      32
    );
    
    // Tabela
    const tableData = data.map(item => [
      this.translateStatus(item.status),
      item.count.toString(),
      `${((item.count / data.reduce((sum, i) => sum + i.count, 0)) * 100).toFixed(2)}%`
    ]);
    
    autoTable(doc, {
      head: [["Status", "Quantidade", "Porcentagem"]],
      body: tableData,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [66, 66, 66] }
    });
    
    // Total
    const totalOrders = data.reduce((sum, item) => sum + item.count, 0);
    doc.setFontSize(12);
    doc.text(
      `Total de Ordens: ${totalOrders}`,
      14,
      (doc as any).lastAutoTable.finalY + 10
    );
    
    // Rodapé
    doc.setFontSize(10);
    doc.text(
      `Relatório gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
      14,
      doc.internal.pageSize.height - 10
    );
    
    // Download
    doc.save(`relatorio-status-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  }
  
  // Exportar relatório de clientes para PDF
  static exportCustomerReportToPDF(
    data: CustomerReportData[],
    dateRange: { from: Date; to: Date }
  ): void {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Relatório de Clientes", 14, 22);
    
    // Período
    doc.setFontSize(11);
    doc.text(
      `Período: ${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} a ${format(
        dateRange.to,
        "dd/MM/yyyy",
        { locale: ptBR }
      )}`,
      14,
      32
    );
    
    // Tabela
    const tableData = data.map(item => [
      item.name,
      item.totalOrders.toString(),
      this.formatCurrency(item.totalRevenue),
      item.lastServiceDate
    ]);
    
    autoTable(doc, {
      head: [["Cliente", "Total de OS", "Faturamento", "Último Serviço"]],
      body: tableData,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [66, 66, 66] }
    });
    
    // Totais
    const totalOrders = data.reduce((sum, item) => sum + item.totalOrders, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
    
    doc.setFontSize(12);
    doc.text(
      `Total de Ordens: ${totalOrders}`,
      14,
      (doc as any).lastAutoTable.finalY + 10
    );
    doc.text(
      `Faturamento Total: ${this.formatCurrency(totalRevenue)}`,
      14,
      (doc as any).lastAutoTable.finalY + 20
    );
    
    // Rodapé
    doc.setFontSize(10);
    doc.text(
      `Relatório gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
      14,
      doc.internal.pageSize.height - 10
    );
    
    // Download
    doc.save(`relatorio-clientes-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  }
  
  // Exportar relatório de veículos para PDF
  static exportVehicleReportToPDF(
    data: VehicleReportData[],
    dateRange: { from: Date; to: Date }
  ): void {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Relatório de Veículos", 14, 22);
    
    // Período
    doc.setFontSize(11);
    doc.text(
      `Período: ${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} a ${format(
        dateRange.to,
        "dd/MM/yyyy",
        { locale: ptBR }
      )}`,
      14,
      32
    );
    
    // Tabela
    const tableData = data.map(item => [
      item.licensePlate,
      `${item.make} ${item.model} (${item.year})`,
      item.customerName,
      item.totalOrders.toString(),
      this.formatCurrency(item.totalRevenue),
      item.lastServiceDate
    ]);
    
    autoTable(doc, {
      head: [["Placa", "Veículo", "Cliente", "Total de OS", "Faturamento", "Último Serviço"]],
      body: tableData,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [66, 66, 66] }
    });
    
    // Totais
    const totalOrders = data.reduce((sum, item) => sum + item.totalOrders, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
    
    doc.setFontSize(12);
    doc.text(
      `Total de Ordens: ${totalOrders}`,
      14,
      (doc as any).lastAutoTable.finalY + 10
    );
    doc.text(
      `Faturamento Total: ${this.formatCurrency(totalRevenue)}`,
      14,
      (doc as any).lastAutoTable.finalY + 20
    );
    
    // Rodapé
    doc.setFontSize(10);
    doc.text(
      `Relatório gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
      14,
      doc.internal.pageSize.height - 10
    );
    
    // Download
    doc.save(`relatorio-veiculos-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  }
  
  // Exportar relatório para Excel (genérico)
  static exportToExcel<T>(
    data: T[],
    sheetName: string,
    fileName: string
  ): void {
    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Criar worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Download
    XLSX.writeFile(wb, `${fileName}-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  }
}
