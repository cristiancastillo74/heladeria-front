import React, { useState } from "react";
import Card from '../component/ui/Card';
import Button from '../component/ui/Button';
import Input from '../component/ui/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../assets/imagenes/logo.jpeg"; // ✅ tu import
import { PdfIcon } from "../assets/icons";

export default function BalanceReport() {

  // Obtener fecha actual
  const today = new Date();
  // Primer día del mes actual
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const formatForInput = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Mes 0-11
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
  };


  const [startDate, setStartDate] = useState(formatForInput(firstDayOfMonth));
  const [endDate, setEndDate] = useState(formatForInput(today));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      alert("Por favor selecciona ambas fechas.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/reports/balance?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error(error);
      alert("Error al obtener el reporte.");
    } finally {
      setLoading(false);
    }
  };

  // 🧾 Función para exportar a PDF sin romper estilos originales
  const exportToPDF = async () => {
  const reportElement = document.getElementById("report-content");
  if (!reportElement) return;

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = 10;

  // Logo
  if (logo) {
    pdf.addImage(logo, "PNG", pageWidth / 2 - 20, yPosition, 35, 35);
    yPosition += 40;
  }

  pdf.setFontSize(18);
  pdf.text("Reporte de Balance", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.text(`Desde: ${startDate}  Hasta: ${endDate}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  try {
    // 1️⃣ Guardar los estilos originales
    const originalStyles = [];
    document.querySelectorAll("*").forEach(el => {
      const computed = getComputedStyle(el);
      ["color", "backgroundColor", "borderColor"].forEach(prop => {
        if (computed[prop].includes("oklch")) {
          originalStyles.push({ el, prop, value: el.style[prop] });
          el.style[prop] = prop.includes("background") ? "#ffffff" : "#000000";
        }
      });
    });

    // 2️⃣ Reemplazar colores en SVGs (charts)
    document.querySelectorAll("svg *").forEach(el => {
      ["fill", "stroke"].forEach(attr => {
        if (el.getAttribute(attr)?.includes("oklch")) {
          el.setAttribute(attr, "#000000");
        }
      });
    });

    // 3️⃣ Generar canvas
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 180;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 15, yPosition, imgWidth, imgHeight);
    pdf.save(`Balance_${startDate}_a_${endDate}.pdf`);

    // 4️⃣ Restaurar estilos originales
    originalStyles.forEach(item => {
      item.el.style[item.prop] = item.value;
    });

  } catch (error) {
    console.error("Error al generar PDF:", error);
    alert("Error al generar PDF. Revisa la consola.");
  }
};


  const COLORS = ["#00C49F", "#FF8042"];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">📊 Balance del Mes</h1>

      <Card className="p-4 shadow-md">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-sm text-gray-600">Fecha inicio</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Fecha fin</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button  className="btn btn-outline btn-primary" onClick={fetchReport} disabled={loading}>
            {loading ? "Cargando..." : "Generar reporte"}
          </button>

          {report && (
            
            <button className="btn btn-outline btn-error" onClick={exportToPDF}>
          <PdfIcon className="w-5 h-5 text-current " />
          Exportar a PDF</button>
          )}
        </div>
      </Card>

      {report && (
        <div id="report-content" className="space-y-6">
          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <h2 className="text-gray-500 text-sm">Ventas Totales</h2>
              <p className="text-xl font-bold text-blue-600">${report.totalSale.toFixed(2)}</p>
            </Card>
            <Card className="p-4 text-center">
              <h2 className="text-gray-500 text-sm">Gastos Totales</h2>
              <p className="text-xl font-bold text-orange-600">${report.totalExpenses.toFixed(2)}</p>
            </Card>
            <Card className="p-4 text-center">
              <h2 className="text-gray-500 text-sm">Gastos Fijos</h2>
              <p className="text-lg font-semibold text-yellow-600">${report.fixedExpenses.toFixed(2)}</p>
            </Card>
            <Card className="p-4 text-center">
              <h2 className="text-gray-500 text-sm">Gastos Variables</h2>
              <p className="text-lg font-semibold text-orange-600">${report.variableExpenses.toFixed(2)}</p>
            </Card>

            <Card className="w-full col-span-1 md:col-span-4 p-4 text-center">
              <h2 className="text-black-500 font-bold text-sm">RESUMEN DEL MES</h2>
              {report.netBalance >= 0 ? (
                <p className="text-lg font-semibold text-green-600">${report.netBalance.toFixed(2)}</p>
              ) : (
                <p className="text-lg font-semibold text-red-600">${report.netBalance.toFixed(2)}</p>
              )}
            </Card>
          </div>

          {/* Gráficos */}
          <div className="flex flex-col md:flex-row gap-6">
            <Card className="flex-1 p-6">
    <h2 className="text-lg font-semibold mb-3 text-gray-700">Comparación de Ingresos y Egresos</h2>
    <BarChart width={700} height={300} data={[
      { name: "Ventas", valor: report.totalSale },
      { name: "Gastos", valor: report.totalExpenses },
      { name: "Balance", valor: report.netBalance },
    ]}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="valor">
        {[
          { name: "Ventas", valor: report.totalSale },
          { name: "Gastos", valor: report.totalExpenses },
          { name: "Balance", valor: report.netBalance },
        ].map((entry, index) => {
          let color = "#4F46E5";
          if (entry.name === "Balance") color = entry.valor >= 0 ? "#16A34A" : "#DC2626";
          return <Cell key={`cell-${index}`} fill={color} />;
        })}
      </Bar>
    </BarChart>
  </Card>

  <Card className="flex-1 p-6">
    <h2 className="text-lg font-semibold mb-3 text-gray-700">Distribución de Gastos</h2>
    <PieChart width={300} height={300}>
      <Pie
        data={[
          { name: "Fijos", value: report.fixedExpenses },
          { name: "Variables", value: report.variableExpenses },
        ]}
        dataKey="value"
        cx="50%"
        cy="50%"
        outerRadius={100}
        fill="#8884d8"
        label
      >
        {COLORS.map((color, index) => (
          <Cell key={`cell-${index}`} fill={color} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </Card>

          </div>
        </div>
        
      )}
    </div>
  );
}
