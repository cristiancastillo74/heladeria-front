import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import logo from "../assets/imagenes/logo.jpeg";
import { ExcelIcon, PdfIcon } from "../assets/icons";
import {
  fetchSalesReport,
  fetchSalesTotal,
  fetchAllSalesPages,
} from "../services/saleService";

export default function SalesReport() {
  // === Estado y configuración ===
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const formatForInput = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  };

  const [data, setData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [startDate, setStartDate] = useState(formatForInput(firstDayOfMonth));
  const [endDate, setEndDate] = useState(formatForInput(today));

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.totalElements / itemsPerPage);

  const getCurrentData = () => data.content || [];

  // === Lógica de obtención de datos ===
  const fetchReport = async () => {
    try {
      const res = await fetchSalesReport(startDate, endDate, currentPage - 1, itemsPerPage);
      setData(res);

      const totalRes = await fetchSalesTotal(startDate, endDate);
      setTotalAmount(totalRes);
    } catch (err) {
      console.error("Error fetching sales report:", err);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [currentPage]);

  // === Exportar a PDF ===
  const exportToPDF = async () => {
    console.log("Generando PDF...");

    if (!data.totalElements || data.totalElements === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      // Logo
      try {
        doc.addImage(logo, "JPEG", 15, 10, 25, 25);
      } catch (err) {
        console.warn("⚠️ No se pudo cargar el logo:", err);
      }

      // Encabezado
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Reporte de Ventas", pageWidth / 2, 20, { align: "center" });

      const firstBranch =
        data.content && data.content.length > 0
          ? data.content[0].branch
          : "Sucursal no especificada";

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(firstBranch, pageWidth / 2, 26, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Periodo: ${startDate} a ${endDate}`, pageWidth / 2, 32, { align: "center" });

      doc.setDrawColor(100);
      doc.line(10, 35, pageWidth - 10, 35);

      // Datos
      const allData = [];
      let totalAmountSum = 0;

      const responses = await fetchAllSalesPages(startDate, endDate, totalPages, itemsPerPage);

      responses.forEach((res) => {
        const rows = Array.isArray(res.content) ? res.content : [];
        rows.forEach((row) => {
          allData.push([
            row.date,
            row.product,
            row.quantity,
            row.branch,
            row.user,
            `$${row.total.toFixed(2)}`,
          ]);
          totalAmountSum += row.total;
        });
      });

      allData.sort((a, b) => new Date(a[0]) - new Date(b[0]));
      allData.push(["TOTAL", "", "", "", "", `$${totalAmountSum.toFixed(2)}`]);

      doc.autoTable({
        startY: 40,
        head: [["Fecha", "Producto", "Cantidad", "Sucursal", "Usuario", "Total"]],
        body: allData,
        styles: { fontSize: 9, halign: "center", valign: "middle" },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        theme: "grid",
      });

      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth - 20,
          doc.internal.pageSize.getHeight() - 10,
          { align: "right" }
        );
        doc.text(
          "Generado automáticamente por el sistema de ventas",
          15,
          doc.internal.pageSize.getHeight() - 10
        );
      }

      doc.save(`reporte_ventas_${startDate}_a_${endDate}.pdf`);
      console.log("✅ PDF generado correctamente.");
    } catch (err) {
      console.error("❌ Error al generar PDF:", err);
      alert("Ocurrió un error al generar el PDF. Ver consola para más detalles.");
    }
  };

  // === Exportar a Excel ===
  const exportToExcel = async () => {
    try {
      const responses = await fetchAllSalesPages(startDate, endDate, totalPages, itemsPerPage);
      const allData = [];

      responses.forEach((res) => {
        const rows = Array.isArray(res.content) ? res.content : [];
        rows.forEach((r) => {
          allData.push({
            Fecha: r.date,
            Producto: r.product,
            Cantidad: r.quantity,
            Total: r.total.toFixed(2),
            Sucursal: r.branch,
            Usuario: r.user,
          });
        });
      });

      allData.sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));

      const ws = XLSX.utils.json_to_sheet(allData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sales Report");

      XLSX.writeFile(wb, "sales_report.xlsx");
      console.log("✅ Excel generado correctamente.");
    } catch (err) {
      console.error("❌ Error exportando Excel:", err);
    }
  };

  // === Render ===
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-primary">📊 Reporte de Ventas</h1>

      {/* Filtro de fechas */}
      <div className="card shadow-lg p-4 mb-6 rounded-xl bg-base-100">
        <h2 className="text-xl font-semibold text-center mb-4">Filtro de Fechas</h2>
        <div className="flex justify-between gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input input-bordered w-full border-2 border-primary rounded-lg"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input input-bordered w-full border-2 border-primary rounded-lg"
          />
          <button onClick={fetchReport} className="btn btn-outline btn-primary">
            Filtrar
          </button>
        </div>
      </div>

      {/* Tabla de datos */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-primary text-white">
              <th className="text-center">Fecha</th>
              <th className="text-center">Producto</th>
              <th className="text-center">Cantidad</th>
              <th className="text-center">Total ($)</th>
              <th className="text-center">Sucursal</th>
              <th className="text-center">Usuario</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentData().map((r, idx) => (
              <tr key={idx}>
                <td className="text-center">{r.date}</td>
                <td className="text-center">{r.product}</td>
                <td className="text-center">{r.quantity}</td>
                <td className="text-center">${r.total.toFixed(2)}</td>
                <td className="text-center">{r.branch}</td>
                <td className="text-center">{r.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total y paginación */}
      {data.content && data.content.length > 0 && (
        <>
          <div className="text-right text-lg font-bold mt-6 text-accent">
            <span className="text-primary">Total del período:</span> ${parseFloat(totalAmount).toFixed(2)}
          </div>
          <div className="flex justify-between items-center mt-6">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="btn btn-secondary" disabled={currentPage === 1}>
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="btn btn-secondary" disabled={currentPage === totalPages}>
              Siguiente
            </button>
          </div>
        </>
      )}

      {/* Botones de exportación */}
      <div className="flex justify-between mt-6">
        <button className="btn btn-outline btn-error" onClick={exportToPDF}>
          <PdfIcon className="w-5 h-5 text-current" /> Exportar a PDF
        </button>
        <button className="btn btn-outline btn-success" onClick={exportToExcel}>
          <ExcelIcon className="w-5 h-5 text-current" /> Exportar a Excel
        </button>
      </div>
    </div>
  );
}
