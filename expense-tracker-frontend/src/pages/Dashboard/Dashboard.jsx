// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
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
import "./Dashboard.css";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [reportType, setReportType] = useState("Monthly");
  //  Fetch all transactions for logged-in user
  const getAllTransaction = async () => {
    try {
      const rawuser = Cookies.get("userInfo");
      if (!rawuser) {
        alert("User not logged in!");
        return;
      }

      const user = JSON.parse(rawuser);
      const response = await axios.get("http://localhost:3000/getAllTransaction");
      const allTrans = Array.isArray(response.data.data) ? response.data.data : [];

      const userTransactions = allTrans.filter(
        (t) => t.userId === user.data._id || t.email === user.data.email
      );

      setTransactions(userTransactions);
    } catch (error) {
      console.error("Get transaction error:", error.response?.data || error.message);
      alert("Failed to fetch transactions");
    }
  };

  useEffect(() => {
    getAllTransaction();
  }, []);

  //  Calculate total income, expense, and balance
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balance = totalIncome - totalExpense;

  //  Group transactions for Monthly/Yearly report
  useEffect(() => {
    if (transactions.length === 0) {
      setChartData([]);
      return;
    }

    const groupedData = transactions.reduce((acc, curr) => {
      if (!curr.date || !curr.type) return acc;

      const date = new Date(curr.date);
      if (isNaN(date.getTime())) return acc;

      const key =
        reportType === "Monthly"
          ? date.toLocaleString("default", { month: "short", year: "numeric" })
          : date.getFullYear();

      if (!acc[key]) acc[key] = { period: key, income: 0, expense: 0 };

      if (curr.type === "income") acc[key].income += Number(curr.amount || 0);
      else if (curr.type === "expense") acc[key].expense += Number(curr.amount || 0);

      return acc;
    }, {});

    //  Convert object to sorted array (old → new)
    const dataArray = Object.values(groupedData).sort((a, b) => {
      if (reportType === "Monthly") {
        return new Date("01 " + a.period) - new Date("01 " + b.period);
      }
      return a.period - b.period;
    });

    setChartData(dataArray);
  }, [transactions, reportType]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard Overview</h1>

        {/* Report Type Selector */}
        <div className="report-type">
          {/* <div>
              <button className="toggle-btn" style={{width:"200px",color:"white",marginBottom:"20px"}}><Link to='/transaction' style={{textDecoration:"none"}}>
              
         Add Transaction</Link>
        </button>
          </div> */}
          <label>Select Report Type:</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option>Monthly</option>
            <option>Yearly</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
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

      {/* Chart Section */}
      <div className="chart-section">
        <h2>{reportType} Report</h2>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey="period" stroke="#555" />
              <YAxis stroke="#555" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#28a745"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#dc3545"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
                name="Expense"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="no-data">No data available for {reportType} report.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
