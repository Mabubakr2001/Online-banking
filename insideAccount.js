import { currencies } from "./currencies.js";

const movementsSpot = document.querySelector(".movements");
const allOperationForms = document.querySelectorAll(".operation-form");
const allAccounts = JSON.parse(localStorage.getItem("allAccounts"));
const targetAccount = allAccounts?.find((account) => {
  const requestedAccountFromLocal = JSON.parse(
    localStorage.getItem("requestedAccount")
  );
  return (
    account.userName === requestedAccountFromLocal.userName &&
    account.password === requestedAccountFromLocal.password
  );
});
const formSubmitted = sessionStorage.getItem("formSubmitted");
if (!formSubmitted) window.location.href = "index.html";
sessionStorage.removeItem("formSubmitted");

let movementsCounter = 0;

function greetUser(firstName, lastName) {
  document.querySelector(
    ".name-of-user"
  ).textContent = `${firstName} ${lastName}`;
}

function calculateDisplayCurrentBalance(account) {
  account.balance = account.movements.reduce(
    (balance, movement) => balance + movement,
    0
  );
  document.querySelector(".current-balance").textContent = getFormattedAmount({
    currency: account.currency,
    locale: account.locale,
    amount: account.balance,
  });
}

function DisplayCurrentDate(account) {
  document.querySelector(".date").textContent = new Intl.DateTimeFormat(
    account.locale,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
    }
  ).format(new Date());
}

function calculateDisplaySummary(account) {
  const totalIncome = account.movements
    .filter((movement) => Math.sign(movement) === 1)
    .reduce((income, deposit) => income + deposit, 0);

  const totalOutcome = account.movements
    .filter((movement) => Math.sign(movement) === -1)
    .reduce((outcome, withdrawal) => outcome + withdrawal, 0);

  const totalInterest = account.movements
    .filter((movement) => Math.sign(movement) === 1)
    .map((income) => (income * account.interestRate) / 100)
    .reduce((benifit, interest) => benifit + interest, 0);

  document.querySelector(`[data-summary="in"]`).textContent =
    getFormattedAmount({
      currency: account.currency,
      locale: account.locale,
      amount: totalIncome,
    });
  document.querySelector(`[data-summary="out"]`).textContent =
    getFormattedAmount({
      currency: account.currency,
      locale: account.locale,
      amount: Math.abs(totalOutcome),
    });
  document.querySelector(`[data-summary="interest"]`).textContent =
    getFormattedAmount({
      currency: account.currency,
      locale: account.locale,
      amount: totalInterest,
    });
}

function startLogoutTimer() {
  const logoutTime = 300; // 5 minutes in MS
  let timeLeft = logoutTime;
  const myInterval = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.querySelector(".logout-timer").textContent = `${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    if (timeLeft === 0) {
      clearInterval(myInterval);
      window.location.href = "index.html";
    }
  }, 1000);
}

function calculatePassedDays(dateOne, dateTwo) {
  const dateOneMS = dateOne.getTime();
  const dateTwoMS = dateTwo.getTime();
  const MSBetweenTwoDates = Math.abs(dateTwoMS - dateOneMS);
  return Math.floor(MSBetweenTwoDates / (1000 * 60 * 60 * 24));
}

function getRelativeTime(movementDate, locale) {
  const passedDays = calculatePassedDays(movementDate, new Date());
  return passedDays === 0
    ? "Today"
    : passedDays === 1
    ? "Yesterday"
    : passedDays <= 7
    ? `${passedDays} days ago`
    : new Intl.DateTimeFormat(locale).format(movementDate); // Here I can give him an options objects
}

function getCurrencyCode(currency) {
  const upperCurrency = currency.toUpperCase();
  if (currencies.hasOwnProperty(upperCurrency)) {
    return upperCurrency;
  } else {
    return (
      Object.keys(currencies).find((key) => currencies[key] === currency) ||
      currency
    );
  }
}

function getFormattedAmount({ currency, locale, amount }) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: getCurrencyCode(currency),
  }).format(amount);
}

function createMovementElement({ movementType, movementDate, movementAmount }) {
  const movementElement = `
  <div class="movement">
    <div class="movement-type" data-operation="${movementType}">${
    movementsCounter + 1
  } ${movementType[0].toUpperCase()}${movementType.slice(1)}</div>
    <div class="movement-date">${movementDate}</div>
    <div class="movement-value">${
      movementType === "withdrawal"
        ? `-${movementAmount}`
        : movementType === "transfer"
        ? `-${movementAmount}`
        : movementAmount
    }</div>
  </div>
 `;
  movementsSpot.insertAdjacentHTML("afterbegin", movementElement);
  movementsCounter++;
}

function checkMovement(movementType, movementObject) {
  if (movementType === "deposit") {
    createMovementElement({
      movementType,
      movementDate: getRelativeTime(new Date(), targetAccount.locale),
      movementAmount: getFormattedAmount({
        currency: targetAccount.currency,
        locale: targetAccount.locale,
        amount: movementObject.amount,
      }),
    });
    targetAccount.movements.push(+movementObject.amount);
    console.log(targetAccount);
    calculateDisplayCurrentBalance(targetAccount);
    calculateDisplaySummary(targetAccount);
    localStorage.setItem("allAccounts", JSON.stringify(allAccounts));
  }
  if (movementType === "withdrawal") {
    if (
      movementObject.amount > targetAccount.balance ||
      movementObject.amount == 0
    )
      return;
    createMovementElement({
      movementType,
      movementDate: getRelativeTime(new Date(), targetAccount.locale),
      movementAmount: getFormattedAmount({
        currency: targetAccount.currency,
        locale: targetAccount.locale,
        amount: movementObject.amount,
      }),
    });
    targetAccount.movements.push(-movementObject.amount);
    calculateDisplayCurrentBalance(targetAccount);
    calculateDisplaySummary(targetAccount);
    localStorage.setItem("allAccounts", JSON.stringify(allAccounts));

    console.log(targetAccount);
  }
}

allOperationForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const movementObject = Object.fromEntries([...new FormData(form)]);
    if (Object.values(movementObject).some((value) => value === "")) return;
    form.reset();
    checkMovement(form.dataset.operation, movementObject);
  });
});

function init() {
  greetUser(targetAccount.firstName, targetAccount.lastName);
  calculateDisplayCurrentBalance(targetAccount);
  DisplayCurrentDate(targetAccount);
  calculateDisplaySummary(targetAccount);
  // startLogoutTimer();
}

init();
