import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Para agregar tablas automáticamente

export const downloadPDF = (account, user, transactions) => {
  const doc = new jsPDF();
  // Título del documento
  doc.setFontSize(18);
  doc.text('Estado de Cuenta', 105, 20, null, null, 'center');

  // Información del usuario
  doc.setFontSize(12);
  doc.text(`Nombre: ${user.displayName}`, 20, 40);
  doc.text(`Email: ${account.email}`, 20, 50);
  doc.text(`Saldo: $${account.balance} MXN`, 20, 60);
  doc.text(`Cuenta: ${account.accountType}`, 20, 70);

  // Espacio
  doc.text(``, 20, 70);

  // Agregar la tabla con el historial de transacciones
  const transactionRows = transactions.map((tx) => [
    tx.transaction_id,
    tx.transaction_type,
    `$${tx.amount.toFixed(2)}`, 
    tx.transaction_date.toDate().toLocaleString(),
    tx.description,
    tx.status,

  ]);

  doc.autoTable({
    head: [['ID de Transacción', 'Tipo', 'Monto', 'Fecha', 'Descripción', 'Estado']],
    body: transactionRows,
    startY: 80,
  });

  // Guardar el PDF
  // doc.save(`estado_cuenta_${user.displayName}.pdf`);
};
