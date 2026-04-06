import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { getLoans } from "../services/LoanService.js";
import { formatCurrency } from "../utils/loanCalculations.js";
import "./LoansPage.css";

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const data = await getLoans();
      
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => b.loan_amount - a.loan_amount
      );
      
      setLoans(sorted);
      setError("");
    } catch (err) {
      setError("Greška pri učitavanju kredita.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loans-page">
        <Sidebar />
        <div className="loans-loading">Učitavanje kredita...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loans-page">
        <Sidebar />
        <div className="loans-error">❌ {error}</div>
      </div>
    );
  }

  return (
    <div className="loans-page">
      <Sidebar />

      <h1 className="loans-title">Moji krediti</h1>

      {loans.length === 0 ? (
        <div className="loans-empty">
          <p>Nema aktivnih kredita.</p>
        </div>
      ) : (
        <div className="loans-list">
          {loans.map(loan => (
            <div key={loan.loan_number} className="loan-item">
              <div className="loan-item-header">
                <div className="loan-item-info">
                  <h3>{loan.loan_type}</h3>
                  <p className="loan-number">Broj kredita: {loan.loan_number}</p>
                  <p className="loan-amount">
                    {formatCurrency(loan.loan_amount, loan.currency)}
                  </p>
                </div>
                <button
                  className="loan-item-button"
                  onClick={() => setSelectedLoan(loan)}
                >
                  Detalji →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedLoan && (
        <LoanDetailModal
          loan={selectedLoan}
          onClose={() => setSelectedLoan(null)}
        />
      )}
    </div>
  );
}

function LoanDetailModal({ loan, onClose }) {
  // Mock rate data, trebalo bi da dolaze sa backenda
  const mockInstallments = [
    { id: 1, amount: 6177.99, interestRate: 10.24, expectedDate: "2024-04-30", actualDate: "2024-04-30", status: "Plaćeno" },
    { id: 2, amount: 6177.99, interestRate: 10.24, expectedDate: "2024-05-30", actualDate: "2024-05-30", status: "Plaćeno" },
    { id: 3, amount: 6177.99, interestRate: 10.24, expectedDate: "2024-06-30", actualDate: null, status: "Neplaćeno" },
    { id: 4, amount: 6177.99, interestRate: 10.24, expectedDate: "2024-07-30", actualDate: null, status: "Neplaćeno" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <h2>Detalji kredita</h2>

        {/* OSNOVNE INFORMACIJE */}
        <div className="detail-grid">
          <div className="detail-row">
            <span className="detail-label">Broj kredita:</span>
            <span className="detail-value">{loan.loan_number}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Vrsta kredita:</span>
            <span className="detail-value">{loan.loan_type}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Ukupan iznos:</span>
            <span className="detail-value">
              {formatCurrency(loan.loan_amount, loan.currency)}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Period otplate:</span>
            <span className="detail-value">{loan.repayment_period} meseci</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Nominalna kamatna stopa:</span>
            <span className="detail-value">{loan.nominal_rate}%</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Efektivna kamatna stopa:</span>
            <span className="detail-value">{loan.effective_rate || loan.nominal_rate}%</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Datum ugovaranja:</span>
            <span className="detail-value">{formatDate(loan.agreement_date)}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Datum dospeća:</span>
            <span className="detail-value">{formatDate(loan.maturity_date)}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Sledeća rata:</span>
            <span className="detail-value">
              {formatCurrency(loan.next_installment_amount, loan.currency)}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Datum sledeće rate:</span>
            <span className="detail-value">{formatDate(loan.next_installment_date)}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Preostalo dugovanje:</span>
            <span className="detail-value">
              {formatCurrency(loan.remaining_debt, loan.currency)}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Valuta:</span>
            <span className="detail-value">{loan.currency}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className={`detail-status ${loan.status?.toLowerCase().replace(' ', '_')}`}>
              {loan.status}
            </span>
          </div>
        </div>

        <div className="installments-section">
          <h3>Istorija rata</h3>
          
          <div className="installments-table-container">
            <table className="installments-table">
              <thead>
                <tr>
                  <th>Redni broj</th>
                  <th>Iznos rate</th>
                  <th>Kamatna stopa</th>
                  <th>Očekivani datum</th>
                  <th>Pravi datum</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockInstallments.map(installment => (
                  <tr key={installment.id}>
                    <td>{installment.id}</td>
                    <td className="amount">{formatCurrency(installment.amount, loan.currency)}</td>
                    <td>{installment.interestRate}%</td>
                    <td>{formatDate(installment.expectedDate)}</td>
                    <td>{installment.actualDate ? formatDate(installment.actualDate) : "-"}</td>
                    <td>
                      <span className={`status-badge ${installment.status.toLowerCase()}`}>
                        {installment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("sr-RS");
}