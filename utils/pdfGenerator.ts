
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import type { Appointment, Trip, User } from '../types';

// Tipagem para o autoTable (workaround para TypeScript)
interface AutoTableUserOptions {
    startY?: number;
    head?: string[][];
    body?: (string | number)[][];
    theme?: 'striped' | 'grid' | 'plain';
    styles?: any;
    headStyles?: any;
    columnStyles?: any;
    didDrawPage?: (data: any) => void;
    margin?: any;
}

// Configurações do Cabeçalho Oficial
const addHeader = (doc: jsPDF, title: string, subtitle?: string) => {
    const pageWidth = doc.internal.pageSize.width;
    
    // Brasão (Simulado com um círculo cinza se não tiver imagem)
    doc.setFillColor(220, 220, 220);
    doc.circle(20, 20, 10, 'F');
    doc.setFontSize(8);
    doc.text("BRASÃO", 15, 21);

    // Texto Prefeitura
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("PREFEITURA MUNICIPAL DE GUARANÉSIA", pageWidth / 2, 15, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("SECRETARIA MUNICIPAL DE SAÚDE - SIAGA", pageWidth / 2, 20, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(10, 32, pageWidth - 10, 32);

    // Título do Relatório
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title.toUpperCase(), pageWidth / 2, 42, { align: "center" });
    
    if (subtitle) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(subtitle, pageWidth / 2, 48, { align: "center" });
    }

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    // Date only on top right if strictly needed, usually signature date allows manual input or bottom
    // doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 10, 20, { align: "right" });

    return 55; // Retorna a posição Y onde o conteúdo deve começar
};

const addFooter = (doc: jsPDF) => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Sistema SIAGA - Documento emitido eletronicamente.`, 14, doc.internal.pageSize.height - 10);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: "right" });
    }
};

// 1. Relatório Geral de Agendamentos (Admin)
export const generateGeneralReport = (appointments: Appointment[], period: string) => {
    const doc = new jsPDF();
    const startY = addHeader(doc, "Relatório Geral de Atendimentos", `Período: ${period}`);

    const tableData = appointments.map(appt => [
        new Date(appt.date).toLocaleDateString('pt-BR'),
        appt.time,
        appt.client_name,
        appt.service_name,
        appt.professional_name,
        appt.locationType === 'external' ? 'TFD' : 'Local',
        appt.status === 'upcoming' ? 'Agendado' : appt.status === 'completed' ? 'Realizado' : 'Cancelado'
    ]);

    (doc as any).autoTable({
        startY: startY,
        head: [['Data', 'Hora', 'Paciente', 'Serviço', 'Profissional', 'Tipo', 'Status']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [15, 118, 110] } // Teal-700
    } as AutoTableUserOptions);

    // Resumo Estatístico
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    
    doc.setFontSize(10);
    doc.text(`Total de Registros: ${total}`, 14, finalY);
    doc.text(`Atendimentos Concluídos: ${completed}`, 14, finalY + 5);
    doc.text(`Assinatura do Responsável: __________________________________________`, 14, finalY + 20);

    addFooter(doc);
    doc.save(`relatorio_geral_siaga_${new Date().toISOString().split('T')[0]}.pdf`);
};

// 2. Manifesto de Transporte TFD (Motorista/Admin)
export const generateTFDManifest = (trip: Trip, passengers: Appointment[]) => {
    const doc = new jsPDF();
    const startY = addHeader(doc, "Manifesto de Transporte (TFD)", `Viagem para: ${trip.destination_name}`);

    // Dados da Viagem
    doc.setFontSize(10);
    doc.text(`Data: ${new Date(trip.date).toLocaleDateString('pt-BR')}`, 14, startY);
    doc.text(`Horário Saída: ${trip.time}`, 80, startY);
    doc.text(`Veículo: ${trip.vehicle_name}`, 140, startY);
    doc.text(`Motorista: ${trip.driver_name}`, 14, startY + 6);
    
    const tableData = passengers.map((p, index) => [
        index + 1,
        p.client_name,
        p.hasCompanion ? 'SIM' : 'NÃO',
        p.healthUnit || 'N/D', // Local destino
        p.time, // Horário do exame
        '___/___' // Campo para check
    ]);

    (doc as any).autoTable({
        startY: startY + 12,
        head: [['#', 'Paciente', 'Acomp.', 'Local Destino', 'Hr. Exame', 'Embarque']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [217, 119, 6] }, // Amber-600
        columnStyles: { 0: { cellWidth: 10 }, 5: { cellWidth: 25 } }
    } as AutoTableUserOptions);

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(9);
    doc.text("Termo de Responsabilidade:", 14, finalY);
    doc.setFont("helvetica", "italic");
    doc.text("Declaro que realizei o transporte dos pacientes listados acima, seguindo as normas da Secretaria de Saúde.", 14, finalY + 5);
    
    doc.text("__________________________________________", 14, finalY + 20);
    doc.text(`Assinatura do Motorista: ${trip.driver_name}`, 14, finalY + 25);

    addFooter(doc);
    doc.save(`manifesto_tfd_${trip.destination_name.replace(/\s+/g, '_')}_${trip.date}.pdf`);
};

// 3. Agenda Diária (Médico/Profissional)
export const generateDailyAgenda = (professionalName: string, date: Date, appointments: Appointment[]) => {
    const doc = new jsPDF();
    const dateStr = date.toLocaleDateString('pt-BR');
    const startY = addHeader(doc, "Agenda Diária de Atendimentos", `${professionalName} - ${dateStr}`);

    const tableData = appointments.map(appt => [
        appt.time,
        appt.client_name,
        appt.service_name,
        appt.notes || '',
        '   ' // Espaço para check manual
    ]);

    (doc as any).autoTable({
        startY: startY,
        head: [['Horário', 'Paciente', 'Procedimento', 'Observações', 'Visto']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10, minCellHeight: 10 },
        headStyles: { fillColor: [60, 60, 60] }, // Stone-800
        columnStyles: { 0: { cellWidth: 20 }, 4: { cellWidth: 20 } }
    } as AutoTableUserOptions);

    addFooter(doc);
    doc.save(`agenda_${professionalName.replace(/\s+/g, '_')}_${dateStr.replace(/\//g, '-')}.pdf`);
};

// 4. Receituário e Atestado
export const generatePrescription = (
    type: 'Receita Médica' | 'Atestado Médico',
    professionalName: string,
    patientName: string,
    content: string,
    date: Date = new Date()
) => {
    const doc = new jsPDF();
    const startY = addHeader(doc, type.toUpperCase());

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    // Info do Paciente
    doc.text(`Paciente: ${patientName}`, 20, startY + 10);
    doc.text(`Data: ${date.toLocaleDateString('pt-BR')}`, 150, startY + 10);
    
    doc.setLineWidth(0.5);
    doc.line(20, startY + 15, 190, startY + 15);

    // Conteúdo
    doc.setFontSize(12);
    // Split text to fit page width
    const splitText = doc.splitTextToSize(content, 170);
    doc.text(splitText, 20, startY + 25);

    // Assinatura
    const pageHeight = doc.internal.pageSize.height;
    const signatureY = pageHeight - 40;

    doc.setLineWidth(0.5);
    doc.line(60, signatureY, 150, signatureY);
    doc.setFontSize(10);
    doc.text(professionalName, 105, signatureY + 5, { align: "center" });
    doc.setFontSize(8);
    doc.text("Assinatura e Carimbo", 105, signatureY + 10, { align: "center" });

    addFooter(doc);
    doc.save(`${type.toLowerCase().split(' ')[0]}_${patientName.replace(/\s+/g, '_')}.pdf`);
};
