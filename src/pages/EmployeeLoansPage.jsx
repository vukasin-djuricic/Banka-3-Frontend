// AdminLoansPage.jsx

import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar.jsx";
import { getLoanRequests, approveLoanRequest, rejectLoanRequest } from "../services/LoanService.js";
import "./EmployeeLoansPage.css"

export default function AdminLoansPage(){

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const data = await getLoanRequests();
      setLoans(data);
      setError("");
    } catch (err) {
      setError("Greška pri učitavanju zahteva.");
      console.error("Error loading loan requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLoans = loans.filter(l => {
    if (filter === "ALL") return true;
    return l.status?.toLowerCase() === filter.toLowerCase();
  });

  const updateStatus = async (id, newStatus) => {
    setUpdating(true);
    try {
      if (newStatus === "APPROVED") {
        await approveLoanRequest(id);
      } else if (newStatus === "REJECTED") {
        await rejectLoanRequest(id);
      }
      
      await loadLoans();
      
      setSelected(null);
      setError("");
    } catch (err) {
      setError("Greška pri ažuriranju zahteva.");
      console.error("Error updating loan:", err);
    } finally {
      setUpdating(false);
    }
  };

  return(
    <div className="loan-page">
      <Sidebar/>

      <h1 className="loan-title">
        Administracija kreditnih zahteva
      </h1>

      {error && <div style={{ color: "red", padding: "10px" }}>{error}</div>}
      {loading && <div style={{ padding: "10px" }}>Učitavanje zahteva...</div>}

      {!loading && (
        <>
          <div className="loan-filter">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">Svi zahtevi</option>
              <option value="PENDING">Na čekanju</option>
              <option value="APPROVED">Odobreni</option>
              <option value="REJECTED">Odbijeni</option>
            </select>
          </div>

          <div className="loan-grid">
            {filteredLoans.length > 0 ? (
              filteredLoans.map(loan => (
                <div
                  key={loan.id}
                  className="loan-card"
                  onClick={() => {
  console.log("🟦 SELECTED LOAN RAW:", loan);
  setSelected(loan);
}}
                  style={{ cursor: "pointer" }}
                >
                  <div className={`loan-status ${loan.status?.toLowerCase()}`}>
                    {loan.status}
                  </div>

                  <div className="loan-amount">
                    {loan.loan_amount} {loan.currency}
                  </div>

                  <div className="loan-info">
                    <div>
                      <span>Vrsta kredita</span>
                      <strong>{loan.loan_type}</strong>
                    </div>

                    <div>
                      <span>Račun</span>
                      <strong>{loan.account_number}</strong>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Nema dostupnih zahteva.</p>
            )}
          </div>

          {selected && (
            <div className="loan-details">
              <h2>Detalji zahteva</h2>

              <p><strong>Vrsta kredita:</strong> {selected.loan_type}</p>
              <p><strong>Iznos:</strong> {selected.loan_amount} {selected.currency}</p>
              <p><strong>Svrha:</strong> {selected.purpose}</p>
              <p><strong>Period otplate:</strong> {selected.repayment_period} meseci</p>
              <p><strong>Plata:</strong> {selected.salary}</p>
              <p><strong>Status zaposlenja:</strong> {selected.employment_status}</p>
              <p><strong>Staž:</strong> {selected.employment_period}</p>
              <p><strong>Telefon:</strong> {selected.phone_number}</p>
              <p><strong>Tip kamate:</strong> {selected.interest_rate_type}</p>
              <p><strong>Račun:</strong> {selected.account_number}</p>
              <p><strong>Datum podnošenja:</strong> {new Date(selected.submission_date).toLocaleDateString("sr-RS")}</p>
              <p><strong>Status:</strong> {selected.status}</p>

              {selected.status?.toLowerCase() === "pending" && (
                <div className="loan-actions">
                  <button
                    className="loan-approve"
                    onClick={() => updateStatus(selected.id, "APPROVED")}
                    disabled={updating}
                  >
                    {updating ? "Obrada..." : "Odobri"}
                  </button>

                  <button
                    className="loan-reject"
                    onClick={() => updateStatus(selected.id, "REJECTED")}
                    disabled={updating}
                  >
                    {updating ? "Obrada..." : "Odbij"}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}