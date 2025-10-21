import { useEffect, useState } from "react";
import axios from "axios";

export default function SalesReport() {
  const [data, setData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0); // <--- nuevo estado
  const [startDate, setStartDate] = useState("2025-10-01");
  const [endDate, setEndDate] = useState("2025-10-21");

  const fetchReport = async () => {
    try {
      // Llamada a los datos paginados (podés manejar paginación luego si querés)
      const res = await axios.get("http://localhost:8080/api/reports/sales", {
        params: { startDate, endDate },
      });
      setData(res.data.content); // Spring devuelve paginación dentro de "content"

      // Llamada al total del periodo
      const totalRes = await axios.get("http://localhost:8080/api/reports/sales/total", {
        params: {
          startDate: `${startDate}T00:00:00`,
          endDate: `${endDate}T23:59:59`,
        },
      });
      setTotalAmount(totalRes.data);
    } catch (err) {
      console.error("Error fetching report", err);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📊 Sales Report</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="input input-bordered"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="input input-bordered"
        />
        <button onClick={fetchReport} className="btn btn-primary">
          Filter
        </button>
      </div>

      <table className="table w-full">
        <thead>
          <tr>
            <th>Date</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Total ($)</th>
            <th>Branch</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, idx) => (
            <tr key={idx}>
              <td>{r.date}</td>
              <td>{r.product}</td>
              <td>{r.quantity}</td>
              <td>{r.total.toFixed(2)}</td>
              <td>{r.branch}</td>
              <td>{r.user}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.length > 0 && (
        <div className="text-right font-bold mt-4">
          Total del período (todas las ventas): ${parseFloat(totalAmount).toFixed(2)}
        </div>
      )}
    </div>
  );
}
