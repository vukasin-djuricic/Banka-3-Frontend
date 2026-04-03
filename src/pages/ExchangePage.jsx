import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExchangeRates, performExchange } from "../services/ExchangeService";
import { getAccounts } from "../services/AccountService";
import Sidebar from "../components/Sidebar.jsx";
import "./ExchangePage.css";

function fmt(amount, currency = "RSD") {
    if (amount == null) return "—";
    return (
        new Intl.NumberFormat("sr-RS", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount) +
        " " +
        currency
    );
}

export default function ExchangePage() {
    const navigate = useNavigate();

    const [rates, setRates] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [fromCurrency, setFromCurrency] = useState("EUR");
    const [toCurrency, setToCurrency] = useState("RSD");
    const [fromAccount, setFromAccount] = useState("");
    const [toAccount, setToAccount] = useState("");
    const [amount, setAmount] = useState("");
    const [, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exchanging, setExchanging] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const [ratesData, accountsData] = await Promise.all([
                    getExchangeRates(),
                    getAccounts(),
                ]);
                if (!cancelled) {
                    setRates(ratesData);
                    setAccounts(accountsData || []);
                }
            } catch {
                if (!cancelled) setError("Greška pri učitavanju podataka.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const currencies = rates ? Object.keys(rates) : [];

    const fromAccounts = accounts.filter((a) => a.currency === fromCurrency);
    const toAccounts = accounts.filter((a) => a.currency === toCurrency);

    const fromAccountObj =
        accounts.find((a) => a.account_number === fromAccount) || null;
    const toAccountObj =
        accounts.find((a) => a.account_number === toAccount) || null;

    const currentRate =
        rates && fromCurrency && toCurrency
            ? rates[fromCurrency] / rates[toCurrency]
            : null;

    const parsedAmount = parseFloat(amount) || 0;

    const convertedAmount =
        currentRate && parsedAmount > 0 ? parsedAmount * currentRate : null;

    const insufficientFunds =
        fromAccountObj != null &&
        parsedAmount > 0 &&
        parsedAmount > fromAccountObj.balance;

    const showPreview =
        fromAccountObj != null && toAccountObj != null && parsedAmount > 0;

    const projectedFromBalance =
        fromAccountObj != null ? fromAccountObj.balance - parsedAmount : null;

    const projectedToBalance =
        toAccountObj != null && convertedAmount != null
            ? toAccountObj.balance + convertedAmount
            : null;

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
        setFromAccount("");
        setToAccount("");
        setResult(null);
        setSuccess("");
        setError("");
    };

    const handleFromCurrencyChange = (e) => {
        setFromCurrency(e.target.value);
        setFromAccount("");
        setResult(null);
        setSuccess("");
        setError("");
    };

    const handleToCurrencyChange = (e) => {
        setToCurrency(e.target.value);
        setToAccount("");
        setResult(null);
        setSuccess("");
        setError("");
    };

    const handleExchange = async () => {
        const parsed = parseFloat(amount);

        if (!parsed || parsed <= 0) {
            setError("Unesite validan iznos.");
            return;
        }
        if (fromCurrency === toCurrency) {
            setError("Izaberite različite valute.");
            return;
        }
        if (!fromAccount) {
            setError("Izaberite račun sa kog vršite konverziju.");
            return;
        }
        if (!toAccount) {
            setError("Izaberite račun na koji vršite konverziju.");
            return;
        }
        if (insufficientFunds) {
            setError("Nedovoljno sredstava na izvornom računu.");
            return;
        }

        setExchanging(true);
        setError("");
        setSuccess("");
        setResult(null);

        try {
            const res = await performExchange(fromCurrency, toCurrency, parsed);
            setResult(res);
            setSuccess(
                `Uspešno konvertovano ${fmt(parsed, fromCurrency)} u ${fmt(
                    res.convertedAmount,
                    toCurrency
                )}`
            );
        } catch {
            setError("Greška pri izvršavanju konverzije.");
        } finally {
            setExchanging(false);
        }
    };

    if (loading) {
        return (
            <div className="ex-page">
                <p className="ex-state-msg">Učitavanje...</p>
            </div>
        );
    }

    if (error && !rates) {
        return (
            <div className="ex-page">
                <p className="ex-state-msg ex-state-msg--error">{error}</p>
            </div>
        );
    }

    return (
        <div className="ex-page">
            <div className="ex-content">
                <Sidebar />

                <div className="ex-header">
                    <button
                        className="ex-back-btn"
                        onClick={() => navigate("/dashboard")}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <h1 className="ex-title">Menjačnica</h1>
                </div>

                <div className="ex-card">
                    <div className="ex-field-group">
                        <label className="ex-label">Iz valute</label>
                        <select
                            className="ex-select"
                            value={fromCurrency}
                            onChange={handleFromCurrencyChange}
                        >
                            {currencies.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="ex-field-group">
                        <label className="ex-label">Sa računa</label>
                        <select
                            className="ex-select"
                            value={fromAccount}
                            onChange={(e) => {
                                setFromAccount(e.target.value);
                                setResult(null);
                                setSuccess("");
                                setError("");
                            }}
                        >
                            <option value="">-- Izaberite račun --</option>
                            {fromAccounts.map((a) => (
                                <option
                                    key={a.account_number}
                                    value={a.account_number}
                                >
                                    {a.account_number} ({fmt(a.balance, a.currency)})
                                </option>
                            ))}
                        </select>
                        {fromAccounts.length === 0 && (
                            <p className="ex-msg ex-msg--error">
                                Nemate račun u valuti {fromCurrency}.
                            </p>
                        )}
                    </div>

                    <div className="ex-field-group">
                        <label className="ex-label">Iznos</label>
                        <input
                            className="ex-input"
                            type="number"
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setResult(null);
                                setSuccess("");
                                setError("");
                            }}
                            placeholder="Unesite iznos"
                        />
                    </div>

                    <button className="ex-swap-btn" onClick={handleSwap}>
                        ⇄
                    </button>

                    <div className="ex-field-group">
                        <label className="ex-label">U valutu</label>
                        <select
                            className="ex-select"
                            value={toCurrency}
                            onChange={handleToCurrencyChange}
                        >
                            {currencies.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="ex-field-group">
                        <label className="ex-label">Na račun</label>
                        <select
                            className="ex-select"
                            value={toAccount}
                            onChange={(e) => {
                                setToAccount(e.target.value);
                                setResult(null);
                                setSuccess("");
                                setError("");
                            }}
                        >
                            <option value="">-- Izaberite račun --</option>
                            {toAccounts.map((a) => (
                                <option
                                    key={a.account_number}
                                    value={a.account_number}
                                >
                                    {a.account_number} ({fmt(a.balance, a.currency)})
                                </option>
                            ))}
                        </select>
                        {toAccounts.length === 0 && (
                            <p className="ex-msg ex-msg--error">
                                Nemate račun u valuti {toCurrency}.
                            </p>
                        )}
                    </div>

                    <div className="ex-field-group">
                        <label className="ex-label">Konvertovani iznos</label>
                        <input
                            className="ex-input"
                            value={
                                convertedAmount != null
                                    ? fmt(convertedAmount, toCurrency)
                                    : ""
                            }
                            readOnly
                            placeholder="Biće automatski izračunato"
                        />
                    </div>

                    {currentRate != null && (
                        <div className="ex-rate-info">
                            1 {fromCurrency} ={" "}
                            {new Intl.NumberFormat("sr-RS", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 4,
                            }).format(currentRate)}{" "}
                            {toCurrency}
                        </div>
                    )}

                    {showPreview && (
                        <div className="ex-preview">
                            <div className="ex-preview-title">
                                Pregled nakon konverzije
                            </div>
                            <div className="ex-preview-row">
                                <span>Sa računa ({fromCurrency})</span>
                                <span>
                                    {fmt(fromAccountObj.balance, fromCurrency)} →{" "}
                                    {fmt(projectedFromBalance, fromCurrency)}
                                </span>
                            </div>
                            <div className="ex-preview-row">
                                <span>Na računu ({toCurrency})</span>
                                <span>
                                    {fmt(toAccountObj.balance, toCurrency)} →{" "}
                                    {fmt(projectedToBalance, toCurrency)}
                                </span>
                            </div>
                        </div>
                    )}

                    {insufficientFunds && (
                        <p className="ex-msg ex-msg--error">
                            Nemate dovoljno sredstava na izvornom računu.
                        </p>
                    )}

                    {error && <p className="ex-msg ex-msg--error">{error}</p>}
                    {success && <p className="ex-msg ex-msg--success">{success}</p>}

                    <button
                        className="ex-submit-btn"
                        onClick={handleExchange}
                        disabled={
                            exchanging ||
                            !fromAccount ||
                            !toAccount ||
                            !amount ||
                            insufficientFunds
                        }
                    >
                        {exchanging ? "Izvršavanje..." : "Izvrši konverziju"}
                    </button>
                </div>
            </div>
        </div>
    );
}