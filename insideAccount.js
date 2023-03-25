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
let myInterval;

function greetUser(firstName, lastName) {
  document.querySelector(
    ".name-of-user"
  ).textContent = `${firstName} ${lastName}`;
}

function calculateDisplayCurrentBalance(account) {
  const allMovements = account.movements.map((movement) => movement.amount);
  account.balance = allMovements.reduce(
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
  const allMovements = account.movements.map((movement) => movement.amount);
  const totalIncome = allMovements
    .filter((movement) => Math.sign(movement) === 1)
    .reduce((income, deposit) => income + deposit, 0);

  const totalOutcome = allMovements
    .filter((movement) => Math.sign(movement) === -1)
    .reduce((outcome, withdrawal) => outcome + withdrawal, 0);

  const totalInterest = allMovements
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
  const logoutTimerSpot = document.querySelector(".logout-timer");
  const logoutTime = 300; // 5 minutes in MS
  logoutTimerSpot.textContent = "5:00";
  let timeLeft = logoutTime;
  myInterval = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    logoutTimerSpot.textContent = `${minutes
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
    <div class="movement-value">${movementAmount}</div>
  </div>
 `;
  movementsSpot.insertAdjacentHTML("afterbegin", movementElement);
  movementsCounter++;
}

function checkMovement(movementType, movementObject, movementForm) {
  const { amount, sendTo, userName, password } = movementObject;
  const { locale, currency } = targetAccount;
  const { movements } = targetAccount;

  switch (movementType) {
    case "deposit":
      createMovementElement({
        movementType,
        movementDate: getRelativeTime(new Date(), locale),
        movementAmount: getFormattedAmount({ currency, locale, amount }),
      });
      movements.push({
        type: movementType,
        date: getRelativeTime(new Date(), locale),
        amount: +amount,
      });
      break;

    case "withdrawal":
      if (amount > targetAccount.balance || amount === 0) {
        return;
      }
      createMovementElement({
        movementType,
        movementDate: getRelativeTime(new Date(), locale),
        movementAmount: getFormattedAmount({ currency, locale, amount }),
      });
      movements.push({
        type: movementType,
        date: getRelativeTime(new Date(), locale),
        amount: -amount,
      });
      break;

    case "loan":
      if (targetAccount.balance <= amount * 0.1) {
        return;
      }
      setTimeout(() => {
        createMovementElement({
          movementType,
          movementDate: getRelativeTime(new Date(), locale),
          movementAmount: getFormattedAmount({ currency, locale, amount }),
        });
        movements.push({
          type: movementType,
          date: getRelativeTime(new Date(), locale),
          amount: +amount,
        });
      }, 2000);
      break;

    case "transfer":
      const receiverAccount = allAccounts.find(
        (account) => account.userName === sendTo
      );
      if (!receiverAccount) {
        return;
      }
      createMovementElement({
        movementType,
        movementDate: getRelativeTime(new Date(), locale),
        movementAmount: getFormattedAmount({ currency, locale, amount }),
      });
      receiverAccount.movements.push({
        type: movementType,
        date: getRelativeTime(new Date(), locale),
        amount: +amount,
      });
      receiverAccount.balance += +amount;
      movements.push({
        type: movementType,
        date: getRelativeTime(new Date(), locale),
        amount: -amount,
      });
      break;

    case "close":
      if (
        targetAccount.userName !== userName ||
        targetAccount.password !== password
      ) {
        return;
      }
      const accountIndexToDelete = allAccounts.findIndex(
        (account) =>
          account.userName === userName && account.password === password
      );
      if (accountIndexToDelete === -1) {
        return;
      }
      allAccounts.splice(accountIndexToDelete, 1);
      localStorage.setItem("allAccounts", JSON.stringify(allAccounts));
      localStorage.removeItem("requestedAccount");
      window.location.href = "index.html";
      break;

    default:
      return;
  }

  calculateDisplayCurrentBalance(targetAccount);
  calculateDisplaySummary(targetAccount);
  localStorage.setItem("allAccounts", JSON.stringify(allAccounts));
  movementForm.reset();
  clearInterval(myInterval);
  startLogoutTimer();
}

allOperationForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const movementObject = Object.fromEntries([...new FormData(form)]);
    if (Object.values(movementObject).some((value) => value === "")) return;
    checkMovement(form.dataset.operation, movementObject, form);
  });
});

function init() {
  targetAccount.movements.forEach((movement) =>
    createMovementElement({
      movementType: movement.type,
      movementDate: movement.date,
      movementAmount: getFormattedAmount({
        currency: targetAccount.currency,
        locale: targetAccount.locale,
        amount: Math.abs(movement.amount),
      }),
    })
  );
  greetUser(targetAccount.firstName, targetAccount.lastName);
  calculateDisplayCurrentBalance(targetAccount);
  DisplayCurrentDate(targetAccount);
  calculateDisplaySummary(targetAccount);
  startLogoutTimer();
}

init();
