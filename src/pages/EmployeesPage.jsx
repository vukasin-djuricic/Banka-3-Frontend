import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeTable from "../components/employees/EmployeeTable";
import { getEmployees } from "../services/EmployeeService";
import "./EmployeesPage.css";

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadEmployees() {
      try {
        const data = await getEmployees();
        if (!cancelled) setEmployees(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Greška pri učitavanju zaposlenih.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEmployees();
    return () => { cancelled = true; };
  }, []);

  const uniquePositions = useMemo(() => {
    return [...new Set(employees.map(emp => emp.position))].sort();
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        employee.first_name.toLowerCase().includes(searchLower) ||
        employee.last_name.toLowerCase().includes(searchLower) ||
        employee.email.toLowerCase().includes(searchLower);

      const matchesPosition = !filterPosition || employee.position === filterPosition;

      return matchesSearch && matchesPosition;
    });
  }, [employees, searchTerm, filterPosition]);

  function openCreateEmployee() {
    navigate("/employees/create");
  }

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterPosition("");
  };

  if (loading) {
    return (
      <div className="page-bg">
        <div className="content-wrapper">
          <div className="employee-card">
            <p style={{ textAlign: "center", color: "#666" }}>Učitavanje...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-bg">
        <div className="content-wrapper">
          <div className="employee-card">
            <p style={{ textAlign: "center", color: "#c00" }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg">

      <img src="/bank-logo.png" alt="logo" className="bank-logo" />
      <img src="/menu-icon.png" alt="menu" className="menu-icon" />

      <div className="content-wrapper">
        <div className="employee-card">

          <div className="employee-header">
            <h3>Zaposleni</h3>

            <div className="header-controls">
              <div className="search-wrapper">
                <input 
                  className="search" 
                  placeholder="Pretraga"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="search-icon">🔍</span>
              </div>

              <select 
                className="position-filter"
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
              >
                <option value="">Sve pozicije</option>
                {uniquePositions.map(position => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>

              <button className="reset-btn" onClick={handleResetFilters}>
                Reset
              </button>

              <button className="add-btn" onClick={openCreateEmployee}>
                Dodaj zaposlenog +
              </button>
            </div>
          </div>

          <div className="filter-info">
            Pronađeno: <strong>{filteredEmployees.length}</strong> / {employees.length} zaposlenih
          </div>

          <div className="table-container">
            <EmployeeTable employees={filteredEmployees} />
          </div>

        </div>
      </div>

    </div>
  );
}

export default EmployeesPage;