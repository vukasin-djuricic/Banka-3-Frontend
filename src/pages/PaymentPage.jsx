import { useEffect, useState } from "react";
import { getAccounts } from "../services/AccountService";
import { transferFunds } from "../services/TransactionService";
import { getRecipients } from "../services/PaymentService";
import { useNavigate } from "react-router-dom";
import TotpModal from "../components/TotpModal";
import Sidebar from "../components/Sidebar";
import "./PaymentPage.css";

const EMPTY_FORM = {
    sender_account: "",
    recipient_account: "",
    recipient_name: "",
    amount: "",
    payment_code: "",
    reference_number: "",
    purpose: "",
};

export default function PaymentPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [showTotp, setShowTotp] = useState(false);

    // Inicijalizujemo kao prazne nizove da .map ne bi pukao
    const [accounts, setAccounts] = useState([]);
    const [recipients, setRecipients] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const accsResponse = await getAccounts();
                const recsResponse = await getRecipients();

                // Provera da li su podaci nizovi (zavisi kako tvoj api.js vraća podatke)
                setAccounts(Array.isArray(accsResponse) ? accsResponse : []);
                setRecipients(Array.isArray(recsResponse) ? recsResponse : []);
            } catch (e) {
                console.error("Greška pri učitavanju:", e);
                setAccounts([]);
                setRecipients([]);
            }
        }
        fetchData();
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Brisanje greške kada korisnik krene da kuca
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    function validate() {
        const errs = {};
        if (!form.sender_account) errs.sender_account = "Izaberite vaš račun.";
        if (!form.recipient_account) errs.recipient_account = "Izaberite primaoca.";
        if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) errs.amount = "Unesite ispravan iznos.";
        if (!form.payment_code) errs.payment_code = "Unesite šifru plaćanja.";
        if (!form.purpose) errs.purpose = "Unesite svrhu.";
        return errs;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setShowTotp(true);
    }

    async function handleTotpConfirm(totpCode) {
        setSubmitting(true);
        try {
            await transferFunds({
                ...form,
                amount: Number(form.amount)
            }, totpCode);

            setShowTotp(false);
            setSuccessMsg("Plaćanje je uspešno izvršeno!");
            setForm(EMPTY_FORM);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Došlo je do greške pri plaćanju.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="pay-shell">
            <Sidebar />
            <div className="pay-content">
                <div className="pay-header">
                    <button className="pay-back-btn" onClick={() => navigate(-1)}>&larr;</button>
                    <div>
                        <p className="pay-subtitle">Novo plaćanje</p>
                        <h1 className="pay-title">Prenos sredstava</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    {/* 1. VAŠI RAČUNI (Pošiljalac) */}
                    <div className="pay-section">
                        <label className="pay-section-label">Pošiljalac (Vaš račun)</label>
                        <select
                            className={`pay-input ${errors.sender_account ? "pay-input--error" : ""}`}
                            name="sender_account"
                            value={form.sender_account}
                            onChange={handleChange}
                        >
                            <option value="">Izaberite račun sa kog šaljete</option>
                            {accounts.map(acc => (
                                <option key={acc.account_number} value={acc.account_number}>
                                    {acc.account_number} ({acc.account_type || "Dinarski"}) - {acc.balance} RSD
                                </option>
                            ))}
                        </select>
                        {errors.sender_account && <p className="pay-error">{errors.sender_account}</p>}
                    </div>

                    {/* 2. PRIMAOCI IZ IMENIKA */}
                    <div className="pay-section">
                        <label className="pay-section-label">Primalac (Iz imenika)</label>
                        <select
                            className={`pay-input ${errors.recipient_account ? "pay-input--error" : ""}`}
                            value={form.recipient_account}
                            onChange={(e) => {
                                const selected = recipients.find(r => r.account_number === e.target.value);
                                setForm(prev => ({
                                    ...prev,
                                    recipient_account: selected?.account_number || "",
                                    recipient_name: selected?.name || ""
                                }));
                            }}
                        >
                            <option value="">Izaberite primaoca iz vašeg imenika</option>
                            {recipients.map(rec => (
                                <option key={rec.id || rec.account_number} value={rec.account_number}>
                                    {rec.name} - {rec.account_number}
                                </option>
                            ))}
                        </select>
                        {errors.recipient_account && <p className="pay-error">{errors.recipient_account}</p>}
                    </div>

                    {/* 3. DETALJI (Iznos, Šifra, Svrha) */}
                    <div className="pay-section">
                        <div className="pay-field">
                            <label className="pay-field-label">Iznos (RSD)</label>
                            <input
                                className={`pay-input ${errors.amount ? "pay-input--error" : ""}`}
                                name="amount"
                                type="number"
                                value={form.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                            />
                            {errors.amount && <p className="pay-error">{errors.amount}</p>}
                        </div>

                        <div className="pay-field-row">
                            <div className="pay-field" style={{flex: 1}}>
                                <label className="pay-field-label">Šifra plaćanja</label>
                                <input
                                    className="pay-input"
                                    name="payment_code"
                                    value={form.payment_code}
                                    onChange={handleChange}
                                    placeholder="289"
                                />
                            </div>
                            <div className="pay-field" style={{flex: 2}}>
                                <label className="pay-field-label">Svrha uplate</label>
                                <input
                                    className="pay-input"
                                    name="purpose"
                                    value={form.purpose}
                                    onChange={handleChange}
                                    placeholder="Uplata po računu"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pay-actions">
                        <button type="button" className="pay-btn-back" onClick={() => navigate(-1)}>Otkaži</button>
                        <button type="submit" className="pay-btn-submit" disabled={submitting}>
                            {submitting ? "Slanje..." : "Pošalji plaćanje"}
                        </button>
                    </div>
                </form>

                {successMsg && <p className="pay-success">{successMsg}</p>}
            </div>

            {showTotp && (
                <TotpModal
                    onConfirm={handleTotpConfirm}
                    onCancel={() => setShowTotp(false)}
                    loading={submitting}
                />
            )}
        </div>
    );
}
