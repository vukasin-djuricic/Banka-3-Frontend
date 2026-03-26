import api from "./api.js";

const USE_MOCK = true;

// Kursevi prema RSD kao baznoj valuti
const MOCK_RATES = {
    RSD: 1,
    EUR: 117.15,
    USD: 107.80,
    CHF: 121.45,
    GBP: 136.90,
};

// Mock berza (stock exchange) data
const MOCK_EXCHANGES = [
    {
        id: 1,
        naziv: "Beogradska berza",
        valuta: "RSD",
        timezone: "Europe/Belgrade",
        isOpen: true,
    },
    {
        id: 2,
        naziv: "Zagrebačka berza",
        valuta: "HRK",
        timezone: "Europe/Zagreb",
        isOpen: true,
    },
    {
        id: 3,
        naziv: "Euronext Paris",
        valuta: "EUR",
        timezone: "Europe/Paris",
        isOpen: false,
    },
    {
        id: 4,
        naziv: "New York Stock Exchange",
        valuta: "USD",
        timezone: "America/New_York",
        isOpen: false,
    },
    {
        id: 5,
        naziv: "London Stock Exchange",
        valuta: "GBP",
        timezone: "Europe/London",
        isOpen: false,
    },
];

export async function getExchangeRates() {
    if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 300));
        return MOCK_RATES;
    }
    const response = await api.get("/exchange-rates");
    return response.data;
}

export async function performExchange(fromCurrency, toCurrency, amount) {
    if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 500));
        const fromRate = MOCK_RATES[fromCurrency];
        const toRate = MOCK_RATES[toCurrency];
        const amountInRSD = amount * fromRate;
        const convertedAmount = amountInRSD / toRate;
        return {
            fromCurrency,
            toCurrency,
            originalAmount: amount,
            convertedAmount,
            rate: fromRate / toRate,
        };
    }
    const response = await api.post("/transactions/transfer", {
        from_account: fromCurrency,
        to_account: toCurrency,
        amount,
    });
    return response.data;
}

export async function getExchanges() {
    if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 300));
        return MOCK_EXCHANGES;
    }
    const response = await api.get("/exchanges");
    return response.data;
}

export async function updateExchangeStatus(exchangeId, isOpen) {
    if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 200));
        const exchange = MOCK_EXCHANGES.find(ex => ex.id === exchangeId);
        if (exchange) {
            exchange.isOpen = isOpen;
        }
        return exchange;
    }
    const response = await api.put(`/exchanges/${exchangeId}`, { isOpen });
    return response.data;
}
