import { useEffect, useState, useMemo } from "react";
import { getTaxData } from "../services/TaxService";
import MenuDropdown from "../components/MenuDropdown";
import "./TaxDashboardPage.css";

function TaxDashboardPage() {
  const [taxData, setTaxData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadTaxData() {
      try {
        const data = await getTaxData();
        if (!controller.signal.aborted) {
          setTaxData(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError("Greška pri učitavanju podataka o porezu.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTaxData();
    return () => controller.abort();
  }, []);

  const filteredData = useMemo(() => {
    return taxData.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (item.firstName || "").toLowerCase().includes(searchLower) ||
        (item.lastName || "").toLowerCase().includes(searchLower) ||
        (item.email || "").toLowerCase().includes(searchLower);

      const matchesRole = !filterRole || item.role === filterRole;

      return matchesSearch && matchesRole;
    });
  }, [taxData, searchTerm, filterRole]);

  function handleResetFilters() {
    setSearchTerm("");
    setFilterRole("");
  }

  function formatRSD(amount) {
    return new Intl.NumberFormat("sr-RS", {
      style: "currency",
      currency: "RSD",
      minimumFractionDigits: 2,
    }).format(amount);
  }

  const roleLabel = { client: "Klijent", actuary: "Aktuar" };

  if (loading) {
    return (
      <div className="page-bg">
        <img src="/bank-logo.png" alt="logo" className="bank-logo" />
        <MenuDropdown />
        <div className="content-wrapper">
          <p style={{ color: "#94a3b8" }}>Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-bg">
        <img src="/bank-logo.png" alt="logo" className="bank-logo" />
        <MenuDropdown />
        <div className="content-wrapper">
          <p style={{ color: "#e74c3c" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg">
      <img src="/bank-logo.png" alt="logo" className="bank-logo" />
      <MenuDropdown />

      <div className="content-wrapper">
        <div className="tax-card">
          <div className="tax-topbar">
            <div className="tax-title-block">
              <p className="tax-eyebrow">PRAĆENJE POREZA</p>
              <h1>Porez na kapitalnu dobit</h1>
              <p className="tax-subtitle">
                Pregled korisnika i obračunatog poreza na kapitalnu dobit.
              </p>
            </div>
          </div>

          <div className="tax-toolbar">
            <div className="toolbar-row">
              <div className="search-wrapper">
                <span className="search-icon">⌕</span>
                <input
                  className="search"
                  placeholder="Pretraga po imenu, prezimenu ili email-u"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="toolbar-actions">
              <select
                className="role-filter"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">Svi korisnici</option>
                <option value="client">Klijenti</option>
                <option value="actuary">Aktuari</option>
              </select>

              <button className="reset-btn" onClick={handleResetFilters}>
                Reset filtera
              </button>
            </div>
          </div>

          <div className="filter-info">
            Pronađeno: <strong>{filteredData.length}</strong> / {taxData.length}{" "}
            korisnika
          </div>

          <div className="table-container">
            {filteredData.length === 0 ? (
              <div className="no-results">
                <p>Nema korisnika koji odgovaraju vašoj pretrazi</p>
              </div>
            ) : (
              <div className="table-scroll">
                <table className="tax-table">
                  <thead>
                    <tr>
                      <th>Ime</th>
                      <th>Prezime</th>
                      <th>Email</th>
                      <th>Tip</th>
                      <th className="amount-header">Iznos poreza (RSD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item.id}>
                        <td>{item.firstName}</td>
                        <td>{item.lastName}</td>
                        <td className="email-cell">{item.email}</td>
                        <td>
                          <span className={`role-badge role-${item.role}`}>
                            {roleLabel[item.role] || item.role}
                          </span>
                        </td>
                        <td className="amount-cell">{formatRSD(item.taxAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaxDashboardPage;
