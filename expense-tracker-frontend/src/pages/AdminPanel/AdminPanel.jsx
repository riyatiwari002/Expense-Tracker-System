import React, { useState, useEffect } from "react";
import "./AdminPanel.css";
import Cookies from "js-cookie";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GrUserAdmin } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { FaTrashAlt, FaPlusCircle } from "react-icons/fa";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [transactions, setAllTransactions] = useState([]);
  const [userSummary, setUserSummary] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState("users");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const logout = () => {
    Cookies.remove("userInfo");
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // ============= USERS FETCH ===================
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/admin/users");
      const allUsers = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      const registeredUsers = allUsers.filter((user) => user.role !== "admin");
      setUsers(registeredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // ============= TRANSACTIONS FETCH ===================
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/getAllTransaction"
      );
      const allTrans = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setAllTransactions(allTrans);
      setFilteredTransactions(allTrans);
      
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTransactions();
    getAllCategory();
  }, []);

  // ============= USER SUMMARY ===================
  useEffect(() => {
    if (users.length === 0) {
      setUserSummary([]);
      return;
    }

    const summary = users.map((user) => {
      const userTrans = transactions.filter((t) => t.userId === user._id);
      const totalIncome = userTrans
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpense = userTrans
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        name: user.name,
        email: user.email,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      };
    });

    setUserSummary(summary);
  }, [users, transactions]);

  // ============= TRANSACTION FILTERS ===================
  const [filters, setFilters] = useState({
    user: "",
    category: "",
    startDate: "",
    endDate: "",
  });

  const filterTransactions = () => {
    let filtered = [...transactions];
    if (filters.user)
      filtered = filtered.filter((t) => t.userId === filters.user);
    if (filters.category)
      filtered = filtered.filter((t) => t.category === filters.category);
    if (filters.startDate)
      filtered = filtered.filter(
        (t) => new Date(t.date) >= new Date(filters.startDate)
      );
    if (filters.endDate)
      filtered = filtered.filter(
        (t) => new Date(t.date) <= new Date(filters.endDate)
      );
    setFilteredTransactions(filtered);
  };

  const resetFilterd = () => {
    setFilters({
      user: "",
      category: "",
      startDate: "",
      endDate: "",
    });
    setFilteredTransactions(transactions);
  };

    //  Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const [transactionPerPage] = useState(5);
  
    const indexOfLastTransaction = currentPage * transactionPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionPerPage;
    const currentTransactions = filteredTransactions.slice(
      indexOfFirstTransaction,
      indexOfLastTransaction
    );
  
    const totalPages = Math.ceil(filteredTransactions.length / transactionPerPage);
  
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  // ============= CHANGE USER STATUS ===================
  const changeStatus = async (userId, curStatus) => {
    try {
      const newStatus = curStatus === "active" ? "inactive" : "active";
      const response = await axios.put(
        `http://localhost:3000/api/admin/user/${userId}/status`,
        { status: newStatus }
      );
      alert(response.data.message || "Status updated successfully");
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (error) {
      console.error("Error changing status:", error);
    }
  };

  // ============= REPORT DOWNLOAD ===================
  const downloadCSV = () => {
    if (userSummary.length === 0) {
      alert("No data available to download!");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Total Income",
      "Total Expense",
      "Balance",
    ];
    const csvRows = [
      headers.join(","),
      ...userSummary.map(
        (u) =>
          `${u.name},${u.email},${u.totalIncome},${u.totalExpense},${u.balance}`
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "System_Report.csv");
    a.click();
  };
  const totalIncome = userSummary.reduce((sum, u) => sum + u.totalIncome, 0);

  const totalExpense = userSummary.reduce((sum, u) => sum + u.totalExpense, 0);

  const TotalUser = users.length;

  const highestSpender = userSummary.reduce(
    (max, u) => (u.totalExpense > max.totalExpense ? u : max),
    { totalExpense: -1 }
  );

  const totalbalance = totalIncome - totalExpense;

  const AvgUserBlanace = TotalUser > 0 ? totalbalance / TotalUser : 0;

  // ============= CATEGORY SECTION ===================
  const [formData, setFormdata] = useState({
    name: "",
  });

  const [allCategory, setAllCategory] = useState([]);
  const [selectedUserForCategory, setSelectedUserForCategory] = useState("");
  const [filteredCategory, setFilteredCategory] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormdata({ ...formData, [name]: value });
  };

  const addCategory = async (e) => {
    e.preventDefault();
    const userinfo = Cookies.get("userInfo");

    try {
      const adminUser = JSON.parse(userinfo);
      if (!formData.name) return alert("Please enter category name");

      const newCategory = {
        name: formData.name.toLowerCase(),
        createdBy: adminUser.data.role==="admin"?"admin":adminUser.data._id
      };

      const response = await axios.post(
        "http://localhost:3000/addcategory",
        newCategory
      );
      setAllCategory([...allCategory, response.data.data]);
      setFormdata({ name: "" });
      alert("New category added successfully!");
    } catch (error) {
      console.error(
        "Add category error:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "Category addition failed");
    }
  };

  const getAllCategory = async () => {
    try {
      const response = await axios.get("http://localhost:3000/getAllCategory");
      const allCat = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setAllCategory(allCat);
      setFilteredCategory(allCat);
    } catch (error) {
      console.error(error.message);
      alert("Error getting data");
    }
  };

  const deleteCategory = async (index) => {
    try {
      const catId = filteredCategory[index]?._id;
      if (!catId) {
        alert("Category ID not found.");
        return;
      }

      const response = await axios.delete(
        `http://localhost:3000/deleteCategory/${catId}`
      );
      const updated = allCategory.filter((c) => c._id !== catId);
      setAllCategory(updated);
      setFilteredCategory(updated);
      alert("Category deleted successfully");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Something went wrong while deleting category"
      );
    }
  };

  // Filter categories based on selected user
  useEffect(() => {
    if (!selectedUserForCategory) {
      setFilteredCategory(allCategory);
    } else {
      const filtered = allCategory.filter(
        (cat) => cat.createdBy === selectedUserForCategory
      );
      setFilteredCategory(filtered);
    }
  }, [selectedUserForCategory, allCategory]);

  // ==========================================================
  return (
    <div className="admin-container">
      {!isSidebarOpen && (
        <div className="menu-toggle" onClick={toggleSidebar}>
          <GrUserAdmin />
        </div>
      )}

      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <img src="src/assets/logo.png" alt="logo" />
            <span>SmartSpender</span>
          </div>
          <IoMdClose className="close-btn" onClick={toggleSidebar} />
        </div>

        <ul className="menu">
          {["users", "reports", "transactions", "categories"].map((item) => (
            <li
              key={item}
              className={selectedMenu === item ? "active" : ""}
              onClick={() => {
                setSelectedMenu(item);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </li>
          ))}
        </ul>

        <button onClick={logout} className="logout">
          Logout
        </button>
      </div>

      <div className={`main-content ${isSidebarOpen ? "shift" : ""}`}>
        <div className="top-bar">
          <h1 className="admin">Admin Panel</h1>
        </div>

        {/* =================== USERS PAGE =================== */}
        {selectedMenu === "users" && (
          <div className="page-content">
            <h2>All Registered Users</h2>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role || "User"}</td>
                    <td>
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-IN")
                        : "N/A"}
                    </td>
                    <td>
                      <p
                        className={`status-badge ${
                          u.status === "active" ? "active" : "inactive"
                        }`}
                        onClick={() => changeStatus(u._id, u.status)}
                      >
                        {u.status === "active" ? "Active" : "Inactive"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="user-summary-container">
              <h2>User Income / Expense Summary</h2>
              <table className="user-summary-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Total Income</th>
                    <th>Total Expense</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {userSummary.map((u, i) => (
                    <tr key={i}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>₹{u.totalIncome}</td>
                      <td>₹{u.totalExpense}</td>
                      <td
                        className={
                          u.balance >= 0
                            ? "positive-balance"
                            : "negative-balance"
                        }
                      >
                        ₹{u.balance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =================== REPORTS PAGE =================== */}
        {selectedMenu === "reports" && (
          <div className="page-content">
            <h2>Reports & Analytics</h2>
            <div className="report-summary">
              <div className="report-card income">
                <h3>Total Users</h3>
                <p>{TotalUser}</p>
              </div>
              <div className="report-card expense">
                <h3>Total Transactions</h3>
                <p>{transactions.length}</p>
              </div>
              <div className="report-card balance">
                <h3>Top Spender</h3>
                <p>{highestSpender.name || "N/A"}</p>
                <span>Total Expense: ₹{highestSpender.totalExpense}</span>
              </div>
              <div className="report-card" style={{background:"gray"}}>
                <h3> Average Users Balance</h3>
                <p>{Math.round(AvgUserBlanace)}</p>
              </div>
            </div>

            <div className="report-download">
              <button onClick={() => downloadCSV()}>Download CSV Report</button>
            </div>
          </div>
        )}

        {/* =================== TRANSACTIONS PAGE =================== */}
        {selectedMenu === "transactions" && (
          <div className="page-content">
            <h2>Transaction Monitoring</h2>
            <div className="filter-container">
              
              <input type="text" list="users" name="users" value={filters.user} onChange={(e)=>setFilters({...filters,user:e.target.value})} placeholder="Search By User" />
              <datalist id="users">
                {users.map((u) => (
                  <option key={u._id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </datalist>

             
            
              <input type="text" list="categories" name="categories" value={filters.category} onChange={(e)=>setFilters({...filters,category:e.target.value})} placeholder="Search By Category" />
              <datalist id="categories">
                {allCategory.map((cat)=>(
                  <option key={cat._id} value={cat.name}>
                      {cat.name}
                  </option>
                ))}
              </datalist>

              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
              <button onClick={filterTransactions}>Filter</button>
              <button onClick={resetFilterd}>Reset</button>
            </div>

            <table className="transaction-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  currentTransactions.map((t) => (
                    <tr key={t._id}>
                      <td>
                        {users.find((u) => u._id === t.userId)?.name || "N/A"}
                      </td>
                      <td>{t.category}</td>
                      <td
                        className={t.type === "income" ? "income" : "expense"}
                      >
                        {t.type}
                      </td>
                      <td>₹{t.amount}</td>
                      <td>{t.description}</td>
                      <td>
                        {t.date
                          ? new Date(t.date).toLocaleDateString("en-IN")
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? "active-page" : ""}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
          </div>
        )}

        {/* =================== CATEGORY PAGE =================== */}
        {selectedMenu === "categories" && (
          <div className="page-content">
            <h2> Categories Management</h2>

            <div className="filter-by-user">
              <p
                style={{
                  color: "black",
                  marginBottom: "20px",
                  fontWeight: "600",
                }}
              >
                Filter Category By User
              </p>
              <select
                value={selectedUserForCategory}
                onChange={(e) => setSelectedUserForCategory(e.target.value)}
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="add-category">
              <input
                type="text"
                name="name"
                placeholder="Enter new category..."
                value={formData.name}
                onChange={handleChange}
              />
              <button onClick={addCategory}>
                <FaPlusCircle /> Add
              </button>
            </div>

            <div className="categories-list">
              {filteredCategory.map((category, index) => (
                <div className="category-card" key={index}>
                  <span className="category-name">{category.name}</span>
                  <div className="cat-actions">
                    <button
                      className="delete"
                      onClick={() => deleteCategory(index)}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
