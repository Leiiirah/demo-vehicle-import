import { jsPDF } from 'jspdf';

interface PasseportData {
  nom: string;
  prenom: string;
  telephone: string;
  adresse?: string;
  numeroPasseport: string;
  nin?: string;
  createdAt?: string;
}

export function exportPasseportPDF(passeport: PasseportData) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let y = 30;

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Fiche Passeport', pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Export date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(120, 120, 120);
  pdf.text(`Date d'export : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, y, { align: 'center' });
  pdf.setTextColor(0, 0, 0);
  y += 15;

  // Separator line
  pdf.setDrawColor(30, 30, 50);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 12;

  // Fields
  const fields = [
    { label: 'Nom', value: passeport.nom },
    { label: 'Prénom', value: passeport.prenom },
    { label: 'Téléphone', value: passeport.telephone },
    { label: 'Adresse', value: passeport.adresse || '-' },
    { label: 'Numéro de passeport', value: passeport.numeroPasseport },
    { label: 'NIN', value: passeport.nin || '-' },
  ];

  if (passeport.createdAt) {
    fields.push({ label: 'Date de création', value: new Date(passeport.createdAt).toLocaleDateString('fr-FR') });
  }

  fields.forEach((field) => {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(80, 80, 80);
    pdf.text(`${field.label} :`, margin, y);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(field.value, margin + 65, y);

    // Light separator
    y += 3;
    pdf.setDrawColor(230, 230, 230);
    pdf.setLineWidth(0.2);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 9;
  });

  pdf.save(`passeport-${passeport.nom}-${passeport.prenom}.pdf`);
}
