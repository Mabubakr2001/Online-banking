const allAccounts = JSON.parse(localStorage.getItem("allAccounts"));
const neededAccount = JSON.parse(localStorage.getItem("neededAccount"));
const formSubmitted = sessionStorage.getItem("formSubmitted");
if (!formSubmitted) window.location.href = "index.html";
document.querySelector(".user-name").textContent = neededAccount.firstName;
sessionStorage.removeItem("formSubmitted");
