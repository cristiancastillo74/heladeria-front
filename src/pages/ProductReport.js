import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // Importa xlsx
import { jsPDF } from 'jspdf';  // Importar jsPDF correctamente
import 'jspdf-autotable';       // Importar autoTable
import logo from "../assets/imagenes/logo.jpeg"; // ✅ tu import
import { ExcelIcon, PdfIcon } from "../assets/icons";


export default function ProductReport() {
  const [data, setData]                 = useState([]);
  const [totalAmount, setTotalAmount]   = useState(0);
  //const [startDate, setStartDate]       = useState("2025-10-01");
  //const [endDate, setEndDate]           = useState("2025-10-21");
  // Paginación
  const [currentPage, setCurrentPage]   = useState(1);
  const itemsPerPage                    = 10;

  // Función para calcular los elementos visibles en la página actual
  const getCurrentData = () => {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return Array.isArray(data) ? data.slice(start, end) : data.content || [];
};



  // Cambiar de página
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const totalPages = Math.ceil((data.length || 0) / itemsPerPage);

  const fetchReport = async () => {
  try {
    const res = await axios.get("http://localhost:8080/api/reports/inventory/products");
    console.log("✅ Datos recibidos:", res.data);
    setData(res.data); // res.data es un array
  } catch (err) {
    console.error("Error fetching report", err);
  }
};


  useEffect(() => {
    fetchReport();
  }, [currentPage]); // Vuelve a cargar los datos cada vez que cambia la página



const exportToPDF = async () => {
  console.log("Generando PDF...");

   const rows = Array.isArray(data) ? data : data.content || [];

  if (!rows.length) {
    alert("No hay datos para exportar.");
    return;
  }


  try {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // === Convertir imagen importada a Base64 ===
    const getBase64Image = (imgSrc) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imgSrc;
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL("image/png");
          resolve(dataURL);
        };
        img.onerror = (err) => reject(err);
      });
    };

    // === Agregar logo ===
    try {
      const logoBase64 = await getBase64Image(logo);
      doc.addImage(logoBase64, "PNG", 15, 10, 25, 25); // (x, y, width, height)
    } catch (err) {
      console.warn("⚠️ No se pudo cargar el logo:", err);
    }

    // === Encabezado ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Reporte de Inventario de Productos", pageWidth / 2, 20, { align: "center" });
    
    const rows = Array.isArray(data) ? data : data.content || [];
    const firstBranch = rows.length > 0 ? rows[0].branch : "Sucursal no especificada";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(firstBranch, pageWidth / 2, 26, { align: "center" });

    const today = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`emitido: ${today}`, pageWidth / 2, 32, { align: "center" });

    doc.setDrawColor(100);
    doc.line(10, 35, pageWidth - 10, 35);

    // === Datos ===
    const allData = [];
    const totalPages = Math.ceil((data.length || 0) / itemsPerPage);


    const requests = Array.from({ length: totalPages }, (_, page) =>
      axios.get("http://localhost:8080/api/reports/inventory/products", {
        params: { page, size: itemsPerPage },
      })
    );

    const responses = await Promise.all(requests);

    responses.forEach((res) => {
      res.data.forEach((row) => {
  allData.push([
    row.product,
    row.category,
    row.stock,
    row.branch,
  ]);
});

    });


     doc.autoTable({
      startY: 40,
      head: [["Producto", "Categoría", "Stock", "Sucursal"]],
      body: allData,
      styles: { fontSize: 9, halign: "center", valign: "middle" },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      theme: "grid",
    });


    // === Pie de página ===
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
        "Generado automáticamente por el sistema de inventarios",
        15,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // === Guardar PDF ===
    doc.save(`reporte_inventario_producto.pdf`);
    console.log("✅ PDF generado correctamente.");
  } catch (err) {
    console.error("❌ Error al generar PDF:", err);
    alert("Ocurrió un error al generar el PDF. Ver consola para más detalles.");
  }
};







  // Función para exportar a Excel
  const exportToExcel = () => {
  // Normalizamos los datos (por si luego cambias la estructura)
  const rows = Array.isArray(data) ? data : data.content || [];

  if (!rows.length) {
    alert("No hay datos para exportar.");
    return;
  }

  // Prepara los datos para Excel
  const excelData = rows.map((r) => ({
    Producto: r.product,
    Categoria: r.category,
    Stock: r.stock,
    Sucursal: r.branch,
  }));

  // Crea hoja y libro
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventario");

  // Guarda el archivo
  XLSX.writeFile(wb, "reporte_inventario_productos.xlsx");

  console.log("✅ Excel generado correctamente.");
};



  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-primary">📊 Reporte de Inventario de Producto</h1>

      {/* Filtro de fechas */}
      <div className="card shadow-lg p-4 mb-6 rounded-xl bg-base-100">
        <h2 className="text-xl font-semibold text-center mb-4">Obtener inventario de productos</h2>
        
      </div>

      {/* Tabla de inventario */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-primary text-white">
              <th className="text-center">Producto</th>
              <th className="text-center">Categoria</th>
              <th className="text-center">Stock</th>
              <th className="text-center">Sucursal</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentData().map((r, idx) => (
              <tr key={idx}>
                <td className="text-center">{r.product}</td>
                <td className="text-center">{r.category}</td>
                <td className="text-center">{r.stock}</td>
                <td className="text-center">{r.branch}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Paginación */}
      {data.content && data.content.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <button 
            onClick={goToPreviousPage} 
            className="btn btn-secondary w-auto rounded-lg disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span className="text-lg">
            Página {currentPage} de {totalPages}
          </span>
          <button 
            onClick={goToNextPage} 
            className="btn btn-secondary w-auto rounded-lg disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Botones de exportación */}
      <div className="flex justify-between mt-6">
        <button className="btn btn-outline btn-error" onClick={exportToPDF}>
          <PdfIcon className="w-5 h-5 text-current " />
          Exportar a PDF</button>
        <button className='btn btn-outline btn-success' onClick={exportToExcel}>
          <ExcelIcon className="w-5 h-5 text-current " />
         Exportar a Excel </button>
      </div>
    </div>
  );
}
