export function getInterestRateByAmount(amountInRSD) {
  if (amountInRSD <= 500000) return 6.25;
  if (amountInRSD <= 1000000) return 6.00;
  if (amountInRSD <= 2000000) return 5.75;
  if (amountInRSD <= 5000000) return 5.50;
  if (amountInRSD <= 10000000) return 5.25;
  if (amountInRSD <= 20000000) return 5.00;
  return 4.75;
}

export function getBankMarginByType(loanType) {
  const margins = {
    GOTOVINSKI: 1.75,
    STAMBENI: 1.50,
    AUTO: 1.25,
    REFINANSIRAJUCI: 1.00,
    STUDENTSKI: 0.75,
  };
  return margins[loanType?.toUpperCase()] || 1.75;
}

export function calculateMonthlyInstallment(
  principalAmount,
  annualInterestRate,
  numberOfMonths
) {
  const r = annualInterestRate / 100 / 12;
  const numerator = r * Math.pow(1 + r, numberOfMonths);
  const denominator = Math.pow(1 + r, numberOfMonths) - 1;

  return (principalAmount * numerator) / denominator;
}

export function calculateEffectiveVariableRate(
  baseRate,
  shift,
  bankMargin
) {
  const annualRate = baseRate + shift + bankMargin;
  return annualRate / 12;
}

export function calculateRemainingDebt(
  principalAmount,
  monthlyRate,
  totalMonths,
  monthsPaid
) {
  if (monthsPaid >= totalMonths) return 0;

  const monthlyPayment = calculateMonthlyInstallment(
    principalAmount,
    monthlyRate * 12 * 100,
    totalMonths
  );

  const remainingMonths = totalMonths - monthsPaid;

  const remainingDebt =
    monthlyPayment *
    (Math.pow(1 + monthlyRate, remainingMonths) - 1) /
    (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths));

  return Math.max(0, remainingDebt);
}

export function getValidRepaymentPeriods(loanType) {
  const periods = {
    GOTOVINSKI: [12, 24, 36, 48, 60, 72, 84],
    AUTO: [12, 24, 36, 48, 60, 72, 84],
    STUDENTSKI: [12, 24, 36, 48, 60, 72, 84],
    REFINANSIRAJUCI: [12, 24, 36, 48, 60, 72, 84],
    STAMBENI: [60, 120, 180, 240, 300, 360],
  };
  return periods[loanType?.toUpperCase()] || [12, 24, 36, 48, 60];
}


export function getNextInstallmentDate(agreementDate, monthsPaid) {
  const date = new Date(agreementDate);
  date.setMonth(date.getMonth() + monthsPaid + 1);
  date.setDate(1); // Prvi dan meseca
  return date.toISOString().split('T')[0];
}


export function formatCurrency(amount, currency = "RSD") {
  return new Intl.NumberFormat("sr-RS", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + " " + currency;
}