import "./Transactions.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const Transactions = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [category, setAllCategory] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
  });

  const [formData, setFormData] = useState({
    type: "",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [showForm, setShowForm] = useState(false);
  const [allTransaction, setAllTransaction] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addTransaction = async () => {
    const userInfo = Cookies.get("userInfo");
    try {
      const user = JSON.parse(userInfo);

      if (!formData.date) {
        alert("please select a valid date");
        return;
      }

      const selectedDate = new Date(formData.date);
      const today = new Date();

      if (selectedDate >= today) {
        alert("upcoming date transaction adding is not allow");
        return;
      }

      const newTransaction = {
        userId: user.data._id,
        type: formData.type,
        category: formData.category,
        amount: formData.amount,
        description: formData.description,
        date: formData.date,
      };

      await axios.post("http://localhost:3000/addTransaction", newTransaction);
      alert("Transaction added successfully!");

      setFormData({
        type: "",
        category: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      getAllTransaction();
    } catch (error) {
      console.error("Add transaction error:", error);
      alert("Transaction add failed");
    }
  };

  const getAllTransaction = async () => {
    try {
      const rawuser = Cookies.get("userInfo");
      const user = JSON.parse(rawuser);

      const response = await axios.get("http://localhost:3000/getAllTransaction");
      const allTrans = Array.isArray(response.data.data) ? response.data.data : [];

      const userTransactions = allTrans.filter((t) => t.userId === user.data._id);

      setAllTransaction(userTransactions);
      setFilteredTransactions(userTransactions);
    } catch (error) {
      console.error("Get transaction error:", error.response?.data || error.message);
      alert("Failed to fetch transactions");
    }
  };

  const handleEdit = (transaction) => {
    setIsEditMode(true);
    setEditId(transaction._id);
    setShowForm(true);

    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date.split("T")[0],
    });
  };

  const updateTransaction = async () => {
    try {
      const { type, category, amount, description, date } = formData;
      const updatedTrans = { type, category, amount, description, date };

      await axios.put(`http://localhost:3000/updateTransaction/${editId}`, updatedTrans);

      alert("Transaction updated successfully!");
      setIsEditMode(false);
      setEditId(null);
      setFormData({
        type: "",
        category: "",
        amount: "",
        description: "",
        date: "",
      });
      setShowForm(false);
      getAllTransaction();
    } catch (error) {
      alert("Update transaction error:", error.response?.data || error.message);
      alert("Update failed");
    }
  };

  const deleteTransaction = async (index) => {
    try {
      const transactionId = allTransaction[index]?._id;
      if (!transactionId) {
        alert("Transaction ID not found");
        return;
      }

      await axios.delete(`http://localhost:3000/deleteTransaction/${transactionId}`);
      alert("Transaction deleted successfully!");
      const updated = allTransaction.filter((t) => t._id !== transactionId);
      setAllTransaction(updated);
      setFilteredTransactions(updated);

      const newtotalPages = Math.max(1, Math.ceil(updated.length / transactionPerPage));
      if (currentPage > newtotalPages) setCurrentPage(newtotalPages);
    } catch (error) {
      console.error("Delete transaction error:", error.response?.data || error.message);
      alert("Delete failed");
    }
  };

  const getAllCategory = async () => {
    try {
      const rawUser = Cookies.get("userInfo");
      if (!rawUser) {
        return alert("login first");
      }
      const user = JSON.parse(rawUser);
      const response = await axios.get("http://localhost:3000/getAllCategory");
      const allCat = Array.isArray(response.data.data) ? response.data.data : [];
      let filteredCategory = [];
      if (user.data.role === "admin") {
        filteredCategory = allCat;
      } else {
        filteredCategory = allCat.filter(
          (cat) => cat.createdBy === "admin" || cat.createdBy === user.data._id
        );
      }
      setAllCategory(filteredCategory);
    } catch (error) {
      console.error(error.message);
      alert("error to getting data");
    }
  };

  useEffect(() => {
    getAllTransaction();
    getAllCategory();
  }, []);

  const filterTransactions = () => {
    let filtered = [...allTransaction];

    if (filters.category) {
      filtered = filtered.filter((t) => t.category === filters.category);
    }
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      if (startDate > endDate) {
        return alert("invalid date");
      }
    }

    if (filters.startDate) {
      filtered = filtered.filter((t) => new Date(t.date) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter((t) => new Date(t.date) <= new Date(filters.endDate));
    }

    setFilteredTransactions(filtered);
  };

  const resetFiltered = () => {
    setFilters({
      category: "",
      startDate: "",
      endDate: "",
    });
    setFilteredTransactions(allTransaction);
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

  
  return (
    <div className="transactions-page">
      <div className="head">
        <h1>Transactions</h1>
        <button className="toggle-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close Form" : "Add Transaction"}
        </button>
      </div>

      {showForm && (
        <div className="transaction-container slide-down">
          <h2>{isEditMode ? "Edit Transaction" : "Add Transaction"}</h2>

          <div className="form-row">
            <div>
              <label>Type:</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="">Select Type</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label>Category:</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {category.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Amount:</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Description:</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="button"
            className="submit-btn"
            onClick={isEditMode ? updateTransaction : addTransaction}
          >
            {isEditMode ? "Update Transaction" : "Add Transaction"}
          </button>
        </div>
      )}

      <div className="filter-container fil-con">
        {/* <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Category</option>
          {category.map((cat) => (
            <option key={cat._id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select> */}
        <input type="text" list="categories" name="categories" value={filters.category}   onChange={(e) => setFilters({ ...filters, category: e.target.value })} placeholder="Search Category"/>
        <datalist id='categories'>
           {category.map((cat) => (
            <option key={cat._id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </datalist>


        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
        <button onClick={filterTransactions}>Filter</button>
        <button onClick={resetFiltered}>Reset</button>
      </div>

      <table className="transactions-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Category</th>
            <th>Amount (₹)</th>
            <th>Description</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentTransactions.length > 0 ? (
            currentTransactions.map((transaction, index) => (
              <tr key={transaction._id}>
                <td
                  className={
                    transaction.type === "income" ? "income" : "expense"
                  }
                >
                  {transaction.type}
                </td>
                <td>{transaction.category}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.description}</td>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleEdit(transaction)}>Edit</button>
                  <button
                    className="delete"
                    onClick={() => deleteTransaction(index)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No transactions found.</td>
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
  );
};

export default Transactions;
