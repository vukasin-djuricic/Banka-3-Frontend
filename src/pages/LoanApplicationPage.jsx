import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { createLoanRequest } from "../services/LoanService.js";
import { getAccounts } from "../services/AccountService.js";
import { getValidRepaymentPeriods } from "../utils/loanCalculations.js";
import "./LoanApplicationPage.css";

export default function CreateLoanRequestPage() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("");
  const [salary, setSalary] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("full_time");
  const [employmentPeriod, setEmploymentPeriod] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [purpose, setPurpose] = useState("");
  const [monthlyRate, setMonthlyRate] = useState(null);

  const [loanType, setLoanType] = useState("GOTOVINSKI");
  const [interestRateType, setInterestRateType] = useState("fixed");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validPeriods = getValidRepaymentPeriods(loanType);

  // 1. Učitaj račune čim se stranica otvori
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const data = await getAccounts();
        setAccounts(data || []);
        if (data && data.length > 0) {
          setSelectedAccount(data[0].account_number); // Selektuj prvi po defaultu
        }
      } catch (err) {
        console.error("Greška pri učitavanju računa:", err);
      }
    }
    fetchAccounts();
  }, []);

  const calculateRate = (a, p) => {
    if (a > 0 && p > 0) {
      setMonthlyRate((a / p).toFixed(2));
    } else {
      setMonthlyRate(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!amount || !period || !selectedAccount || !loanType) {
      setError("Sva polja su obavezna.");
      return;
    }

    if (Number(period) === 0) {
      setError("Molimo izaberite rok otplate.");
      return;
    }

    try {
      setLoading(true);
      
      const accObj = accounts.find(a => a.account_number === selectedAccount);

      const employmentStatusMap = {
        "full_time": "full_time",
        "part_time": "temporary",
        "self_employed": "temporary",
        "unemployed": "unemployed"
      };

      const interestRateTypeMap = {
        "fixed": "FIKSNA",
        "variable": "VARIJABILNA"
      };

      await createLoanRequest({
        account_number: selectedAccount,
        amount: Number(amount),
        repayment_period: Number(period),
        currency: accObj ? accObj.currency : "RSD",
        loan_type: loanType,
        salary: Number(salary),
        employment_status: employmentStatusMap[employmentStatus],
        employment_period: Number(employmentPeriod),
        phone_number: phoneNumber,
        purpose: purpose,
        interest_rate_type: interestRateTypeMap[interestRateType],
      });

      setSuccess("Zahtev za kredit je uspešno podnet.");
      setAmount("");
      setPeriod("");
      setMonthlyRate(null);
      setLoanType("GOTOVINSKI");
      setInterestRateType("fixed");
    } catch (err) {
      const msg = err.response?.data?.details || err.response?.data?.message || "Greška 400: Proverite podatke.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loan-app-page">
      <Sidebar />
      <h1 className="loan-app-title">Podnošenje zahteva za kredit</h1>

      <div className="loan-app-card">
        <form className="loan-app-form" onSubmit={handleSubmit}>
        <label style={{color: '#94a3b8', fontSize: '12px'}}>VRSTA KREDITA</label>
          <select 
            value={loanType} 
            onChange={(e) => {
              setLoanType(e.target.value);
              setPeriod("");
            }}
            style={{
              height: '52px', borderRadius: '12px', background: '#1e293b', 
              color: 'white', border: '1px solid #334155', padding: '0 10px', marginBottom: '10px'
            }}
          >
            <option value="GOTOVINSKI">Gotovinski (keš)</option>
            <option value="STAMBENI">Stambeni</option>
            <option value="AUTO">Auto</option>
            <option value="REFINANSIRAJUCI">Refinansirajući</option>
            <option value="STUDENTSKI">Studentski</option>
          </select>

          <label style={{color: '#94a3b8', fontSize: '12px'}}>TIP KAMATNE STOPE</label>
          <select 
            value={interestRateType} 
            onChange={(e) => setInterestRateType(e.target.value)}
            style={{
              height: '52px', borderRadius: '12px', background: '#1e293b', 
              color: 'white', border: '1px solid #334155', padding: '0 10px', marginBottom: '10px'
            }}
          >
            <option value="fixed">Fiksna kamatna stopa</option>
            <option value="variable">Varijabilna kamatna stopa</option>
          </select>
          
          <label style={{color: '#94a3b8', fontSize: '12px'}}>IZABERITE RAČUN</label>
          <select 
            value={selectedAccount} 
            onChange={(e) => setSelectedAccount(e.target.value)}
            style={{
                height: '52px', borderRadius: '12px', background: '#1e293b', 
                color: 'white', border: '1px solid #334155', padding: '0 10px', marginBottom: '10px'
            }}
          >
            {accounts.map(acc => (
              <option key={acc.account_number} value={acc.account_number}>
                {acc.account_name} ({acc.account_number})
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Iznos kredita"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              calculateRate(e.target.value, period);
            }}
          />

          <label style={{color: '#94a3b8', fontSize: '12px'}}>ROK OTPLATE (MESECI)</label>
          <select 
            value={period} 
            onChange={(e) => {
              setPeriod(e.target.value);
              calculateRate(amount, e.target.value);
            }}
            style={{
              height: '52px', borderRadius: '12px', background: '#1e293b', 
              color: 'white', border: '1px solid #334155', padding: '0 10px', marginBottom: '10px'
            }}
          >
            <option value="">Odaberite rok otplate</option>
            {validPeriods.map(p => (
              <option key={p} value={p}>{p} meseci</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Svrha kredita"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />

          <input
            type="number"
            placeholder="Mesečna primanja (plata)"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />

          <input
            type="text"
            placeholder="Broj telefona"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          <select
            value={employmentStatus}
            onChange={(e) => setEmploymentStatus(e.target.value)}
            style={{
              height: '52px', borderRadius: '12px', background: '#1e293b',
              color: 'white', border: '1px solid #334155', padding: '0 10px', marginBottom: '10px'
            }}
          >
            <option value="full_time">Stalni radni odnos</option>
            <option value="part_time">Honorarni rad</option>
            <option value="self_employed">Samostalna delatnost</option>
            <option value="unemployed">Nezaposlen</option>
          </select>

          <input
            type="number"
            placeholder="Staž (meseci zaposlenja)"
            value={employmentPeriod}
            onChange={(e) => setEmploymentPeriod(e.target.value)}
          />

          {monthlyRate && (
            <div className="loan-app-rate">
              Procena mesečne rate: <strong>{monthlyRate}</strong>
            </div>
          )}

          <button className="loan-app-submit" disabled={loading}>
            {loading ? "Slanje..." : "Podnesi zahtev"}
          </button>
        </form>

        {error && <div className="loan-app-error">{error}</div>}
        {success && <div className="loan-app-success">{success}</div>}
      </div>
    </div>
  );
}