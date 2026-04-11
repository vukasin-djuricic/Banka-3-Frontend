import api from "./api.js";
import { stringifyAccountNumber } from "../utils/accountNumber.js";

function mapAccount(account) {
  if (!account || typeof account !== "object") return account;
  return {
    ...account,
    account_number: stringifyAccountNumber(account.account_number),
  };
}

function mapTransaction(tx) {
  if (!tx || typeof tx !== "object") return tx;
  return {
    ...tx,
    from_account: stringifyAccountNumber(tx.from_account),
    to_account: stringifyAccountNumber(tx.to_account),
    account_number: stringifyAccountNumber(tx.account_number),
  };
}

export async function getAccounts() {
  const response = await api.get("/accounts");
  return Array.isArray(response.data) ? response.data.map(mapAccount) : [];
}

export async function getAccountTransactions(accountNumber) {
  try {
    const response = await api.get("/transactions", {
      params: { account_number: accountNumber },
    });
    return Array.isArray(response.data) ? response.data.map(mapTransaction) : [];
  } catch {
    return [];
  }
}

export async function getAccountByNumber(accountNumber) {
  const response = await api.get(`/accounts/${accountNumber}`);
  return mapAccount(response.data);
}

export async function createAccount(data) {
  const response = await api.post("/accounts", data);
  return response.data;
}

export async function renameAccount(accountNumber, accountName) {
  const response = await api.patch(`/accounts/${accountNumber}/name`, {
    name: accountName,
  });
  return response.data;
}

export async function updateAccountLimits(accountNumber, dailyLimit, monthlyLimit) {
  const response = await api.patch(`/accounts/${accountNumber}/limit`, {
    daily_limit: dailyLimit,
    monthly_limit: monthlyLimit,
  });
  return response.data;
}
