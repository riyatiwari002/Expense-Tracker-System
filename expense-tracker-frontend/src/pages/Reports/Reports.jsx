import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Reports.css";
import Cookies from "js-cookie";
import axios from "axios";

const Reports = () => {
  const [transactions,setAllTransaction] = useState([]);
  const [reportType, setReportType] = useState("Monthly");
  const [chartData, setChartData] = useState([]);
  const [errorMsg,setErrorMsg]=useState("");

  //  Fetch All Transactions for Logged-in User
  const getAllTransaction = async () => {
    try {
      const rawuser = Cookies.get("userInfo");
      // if (!rawuser) {
      //   setErrorMsg("User not logged in!");
      //   return;
      // }

      const user = JSON.parse(rawuser);
      const response = await axios.get("http://localhost:3000/getAllTransaction");
      const allTrans = Array.isArray(response.data.data) ? response.data.data : [];

      // Filter by Logged-in User
      const userTransactions = allTrans.filter(
        (t) => t.userId === user.data._id 
      );

      if (userTransactions.length === 0) {
        setErrorMsg("No transactions found for this user.");
      } else {
        setErrorMsg("");
      }

     setAllTransaction(userTransactions);
    } catch (error) {
      console.error("Get transaction error:", error.response?.data || error.message);
      setErrorMsg("Failed to fetch transactions. Please try again later.");
    }
  };

  useEffect(() => {
    getAllTransaction();
  }, []);

  //  Calculate total income, expense & balance
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balance = totalIncome - totalExpense;

  //  Prepare Data for Chart
  useEffect(() => {
    if (transactions.length === 0) {
      setChartData([]);
      return;
    }
    //monthly yearly report
    const groupedData = transactions.reduce((acc, curr) => {
     if (!curr.date) return acc;
    
    const date = new Date(curr.date);
    let key;

    if (reportType === "Monthly") {
      key = date.toLocaleString("default", { month: "short" });
    } 
    // else if (reportType === "Quarterly") {
    //   const quarter = Math.floor(date.getMonth() / 3) + 1;
    //   key = `Q${quarter}`;
    // } 
    else if (reportType === "Yearly") {
      key = date.getFullYear().toString();
    }

    if (!acc[key]) {
      acc[key] = { period: key, income: 0, expense: 0 };
    }
    if (curr.type === "income") {
      acc[key].income += Number(curr.amount);

    }
    if (curr.type === "expense") {
      acc[key].expense += Number(curr.amount);

    }

    return acc;
    }, {});

    //  Convert object to sorted array
    const dataArray = Object.values(groupedData).sort((a, b) => {
      if (reportType === "Monthly") {
        return new Date("01 " + a.period) - new Date("01 " + b.period);
      }
      return a.period - b.period;
    });

    setChartData(dataArray);
  }, [transactions, reportType]);

  //  Download CSV
  const downloadCSV = () => {
    if (chartData.length === 0) {
      alert("No data available to download!");
      return;
    }

    const headers = ["Period", "Income", "Expense", "Balance"];
    const csvRows = [
      headers.join(","),
      ...chartData.map(
        (item) =>
          `${item.period},${item.income},${item.expense},${item.income - item.expense}`
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}_Report.csv`;
    a.click();
  };

  //  Download PDF
  const downloadPDF = () => {
    if (chartData.length === 0) {
      alert("No report data available to print!");
      return;
    }

    const printContent = document.getElementById("report-section").innerHTML;
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write("<html><head><title>Report</title></head><body>");
    printWindow.document.write(printContent);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="reports-page">
      <h1 className="reports-title">Reports</h1>
      <p className="reports-subtitle">
        View and download your {reportType.toLowerCase()} income & expense reports.
      </p>

      {/* Dashboard Summary */}
      <div className="dashboard-stats">
        <div className="card income">
          <h3>Total Income</h3>
          <p>₹{totalIncome}</p>
        </div>
        <div className="card expense">
          <h3>Total Expense</h3>
          <p>₹{totalExpense}</p>
        </div>
        <div className="card balance">
          <h3>Available Balance</h3>
          <p>₹{balance}</p>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="report-type">
        <label>Select Report Type: </label>
        <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <option>Monthly</option>
          <option>Yearly</option>
        </select>
      </div>

      {/* Validation Message */}
      {errorMsg && <p className="error-message">{errorMsg}</p>}

      {/* Chart Section */}
      <div id="report-section" className="chart-container">
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#28a745"
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#dc3545"
                  name="Expense"
                />
              </LineChart>
            </ResponsiveContainer>

            <table className="report-table">
              <thead>
                <tr>
                  <th>{reportType === "Monthly" ? "Month-Year" : "Year"}</th>
                  <th>Income (₹)</th>
                  <th>Expense (₹)</th>
                  <th>Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item, i) => (
                  <tr key={i}>
                    <td>{item.period}</td>
                    <td>{item.income}</td>
                    <td>{item.expense}</td>
                    <td>{item.income - item.expense}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="no-data">No data available for the selected period.</p>
        )}
      </div>

      {/* Download Buttons */}
      <div className="download-buttons">
        <button onClick={downloadCSV}>Download CSV</button>
        <button onClick={downloadPDF}>Download PDF</button>
      </div>
    </div>
  );
};

export default Reports;
