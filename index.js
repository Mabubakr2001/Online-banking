const header = document.querySelector(".app-header");
const goToOtherSectionsSpot = document.querySelector(".other");
const nav = document.querySelector(".nav");
const manipulateNavBtn = document.querySelector(".manipulate-nav");
const topSpot = document.querySelector(".top");
const middleSpot = document.querySelector(".middle");
const bottomSpot = document.querySelector(".bottom");
const allSections = document.querySelectorAll("section");
const allLazyImgs = document.querySelectorAll(".feature-img");
const allOperationsTabsSpot = document.querySelector(".operations-tabs");
const allTestimonials = document.querySelectorAll(".testimonial");
const changeTestimonialBtns = document.querySelectorAll(".testimonials-btn");
const changeTestimonialDotsSpot = document.querySelector(".dots");
const allDots = document.querySelectorAll(".dot");
const newAccountForm = document.querySelector(".new-account-form");
const openAccountForm = document.querySelector(".open-account-form");
const overlay = document.querySelector(".overlay");
const createNewAccountBtns = document.querySelectorAll(".create-account-btn");
const openAccountBtn = document.querySelector(".open-account-btn");

let testimonialNum = 0;
const testimonialsNum = allTestimonials.length;
let allAccounts = [];

function changeOpacity({ hoveredElement, opacityState }) {
  if (!hoveredElement.classList.contains("different")) return;
  const elements = nav.querySelectorAll(".different");
  const appLogo = document.querySelector(".app-logo");
  elements.forEach((element) => {
    if (opacityState === "hide" && element === hoveredElement) return;
    if (opacityState === "hide") {
      element.dataset.opacity = "blurred";
      appLogo.dataset.opacity = "blurred";
    }
    if (opacityState === "show") {
      element.dataset.opacity = "visible";
      appLogo.dataset.opacity = "visible";
    }
  });
}

function scrollToSection(section) {
  if (section === "#" && section == null) return;
  const targetSectionCoordinates = document
    .querySelector(`.${section}-section`)
    .getBoundingClientRect();
  window.scrollTo({
    top:
      targetSectionCoordinates.top +
      window.pageYOffset -
      header.getBoundingClientRect().height,
  });
}

function manipulateWindow(manipulateMethod, windowType) {
  if (manipulateMethod === "hide") {
    windowType.dataset.state = "hidden";
    overlay.dataset.state = "hidden";
  }
  if (manipulateMethod === "show") {
    windowType.dataset.state = "visible";
    overlay.dataset.state = "visible";
  }
}

function manipulateNav(navState) {
  if (navState === "hidden") {
    nav.dataset.state = "visible";
    topSpot.dataset.state = "rotated";
    middleSpot.dataset.state = "hidden";
    bottomSpot.dataset.state = "rotated";
  }
  if (navState === "visible") {
    nav.dataset.state = "hidden";
    topSpot.dataset.state = "";
    middleSpot.dataset.state = "";
    bottomSpot.dataset.state = "";
  }
}

function makeHeaderFixed(entriesArr) {
  const entry = entriesArr.at(0);
  entry.isIntersecting
    ? (header.dataset.state = "static")
    : (header.dataset.state = "fixed");
}

function createIntersectionObserverForIntroSection() {
  // boundingClientRect => everything related to the shape of the object
  // intersectionRadio => what percentage of the object is on the screen?
  // isIntersecting => is it visible to the user, is it on the screen?
  // intersectionRect => the amount of space that is visible on the screen of the object
  const headerHeight = header.getBoundingClientRect().height;
  const observer = new IntersectionObserver(makeHeaderFixed, {
    root: null, // The screen by default
    rootMargin: `-${headerHeight}px`, // Before the root by 68px, before the element disappears from the root (screen) by 68px
    threshold: 0, // 0 percent of the element must be on the screen before the animation plays
  });
  observer.observe(document.querySelector(".intro"));
}

function revealSection(entriesArr, observer) {
  const entry = entriesArr.at(0);
  if (!entry.isIntersecting) return;
  const targetSection = entry.target;
  targetSection.dataset.state = "visible";
  observer.unobserve(targetSection); // Remove the section from the observer
}

function createObserverForAnySectionExceptIntroSection(section) {
  const observer = new IntersectionObserver(revealSection, {
    threshold: 0,
  });
  observer.observe(section);
}

function showImg(entriesArr, observer) {
  const entry = entriesArr.at(0);
  if (!entry.isIntersecting) return;
  const targetImg = entry.target;
  targetImg.src = targetImg.dataset.src;
  targetImg.addEventListener("load", () => {
    observer.unobserve(targetImg);
    setTimeout(() => {
      targetImg.dataset.state = "normal";
    }, 100);
  });
}

function createObserverForImgs(img) {
  const observer = new IntersectionObserver(showImg, {
    threshold: 0,
    rootMargin: "200px",
  });

  observer.observe(img);
}

function showOperation(clickedTab) {
  const allOperationsTabs = document.querySelectorAll(".tab");
  const allOperations = document.querySelectorAll(".operation");
  allOperationsTabs.forEach((tab, index) => {
    if (tab === clickedTab) {
      tab.dataset.state = "active";
      document.querySelector(
        `[data-operation=${tab.dataset.tabOperation}]`
      ).dataset.state = "active";
      return;
    }
    tab.dataset.state = "disabled";
    allOperations[index].dataset.state = "hidden";
  });
}

function initTheTestimonials() {
  allTestimonials.forEach((testimonial, index) => {
    testimonial.style.transform = `translateX(${100 * index}%)`;
  });
}

function goToTestimonial(testimonialNum) {
  allTestimonials.forEach((testimonial, index) => {
    testimonial.style.transform = `translateX(${
      (index - testimonialNum) * 100
    }%)`;
  });
}

function changeTestimonial(prevOrNext) {
  if (prevOrNext === "previous") {
    testimonialNum === 0
      ? (testimonialNum = testimonialsNum - 1)
      : testimonialNum--;
  }
  if (prevOrNext === "next") {
    testimonialNum === testimonialsNum - 1
      ? (testimonialNum = 0)
      : testimonialNum++;
  }

  allDots.forEach((dot, index) => {
    if (index === testimonialNum) return (dot.dataset.state = "active");
    dot.dataset.state = "disabled";
  });

  goToTestimonial(testimonialNum);
}

function createErrorMessageElement(errorMessage, elementToInsertAboveIt) {
  const element = document.createElement("p");
  element.classList.add("error-message");
  element.textContent = errorMessage;
  elementToInsertAboveIt.insertAdjacentElement("beforebegin", element);
  setTimeout(() => {
    element.remove();
  }, 1500);
}

function createNewAccount(form) {
  const inputsObject = Object.fromEntries([...new FormData(form)]);
  const submitBtn = document.querySelector(".submit-createAccount-btn");
  if (Object.values(inputsObject).some((value) => value === "")) {
    return createErrorMessageElement("Please fill out all fields!", submitBtn);
  }
  const newAccount = { ...inputsObject, movements: [], interestRate: 1.5 };
  if (isDuplicateAccount(newAccount))
    return createErrorMessageElement(
      "Sorry, this account is already exist!",
      submitBtn
    );
  form.reset();
  allAccounts.push(newAccount);
  localStorage.setItem("allAccounts", JSON.stringify(allAccounts));
  localStorage.setItem("neededAccount", JSON.stringify(newAccount));
  sessionStorage.setItem("formSubmitted", "true");
  createSpinnerAndRedirect();
}

function isDuplicateAccount(newAccount) {
  return allAccounts.find((account) => {
    return (
      account.firstName === newAccount.firstName &&
      account.lastName === newAccount.lastName &&
      account.userName === newAccount.userName &&
      account.password === newAccount.password &&
      account.currency === newAccount.currency &&
      account.locale === newAccount.locale
    );
  });
}

function createSpinnerAndRedirect() {
  document.querySelector("body").innerHTML = "";
  createSpinner();
  setTimeout(() => {
    window.location.href = "insideAccount.html";
  }, 4000);
}

function createSpinner() {
  const spinner = document.createElement("div");
  spinner.classList.add("loading");
  Array.from({ length: 3 }, () => {
    const loadingDot = document.createElement("span");
    spinner.appendChild(loadingDot);
  });
  document.body.appendChild(spinner);
}

function openAccount(form) {
  const { userName, password } = Object.fromEntries(new FormData(form));
  const submitBtn = document.querySelector(".submit-openAccount-btn");

  if (!userName || !password) {
    return createErrorMessageElement("Please fill out all fields!", submitBtn);
  }

  const targetAccount = allAccounts?.find(
    ({ userName: existingUserName, password: existingPassword }) =>
      existingUserName === userName && existingPassword === password
  );

  if (!targetAccount) {
    return createErrorMessageElement(
      "Sorry, this account doesn't exist!",
      submitBtn
    );
  }

  localStorage.setItem("neededAccount", JSON.stringify(targetAccount));
  sessionStorage.setItem("formSubmitted", "true");
  createSpinnerAndRedirect();
}

function makeTheWebsiteRunning() {
  createIntersectionObserverForIntroSection();
  initTheTestimonials();
  window.addEventListener("load", () => {
    allAccounts = JSON.parse(localStorage.getItem("allAccounts"));
  });

  allSections.forEach((section) => {
    if (section.classList.contains("intro")) return;
    createObserverForAnySectionExceptIntroSection(section);
  });

  allLazyImgs.forEach((img) => createObserverForImgs(img));

  manipulateNavBtn.addEventListener("click", () =>
    manipulateNav(nav.dataset.state)
  );

  nav.addEventListener("mouseover", ({ target }) =>
    changeOpacity({ hoveredElement: target, opacityState: "hide" })
  );

  nav.addEventListener("mouseout", ({ target }) =>
    changeOpacity({ hoveredElement: target, opacityState: "show" })
  );

  createNewAccountBtns.forEach((btn) =>
    btn.addEventListener("click", () =>
      manipulateWindow("show", newAccountForm)
    )
  );

  openAccountBtn.addEventListener("click", () =>
    manipulateWindow("show", openAccountForm)
  );

  overlay.addEventListener("click", () => {
    const visibleForm = document.querySelector(".form[data-state=visible]");
    visibleForm.reset();
    manipulateWindow("hide", visibleForm);
  });

  window.addEventListener("keydown", ({ key }) => {
    const visibleForm = document.querySelector(".form[data-state=visible]");
    if (key === "Escape" && visibleForm) {
      visibleForm.reset();
      manipulateWindow("hide", visibleForm);
    }
  });

  goToOtherSectionsSpot.addEventListener("click", ({ target }) => {
    if (!target.closest("a")) return;
    const targetSection = target.getAttribute("href").slice(1);
    scrollToSection(targetSection);
  });

  allOperationsTabsSpot.addEventListener("click", ({ target }) => {
    if (!target.classList.contains("tab")) return;
    showOperation(target);
  });

  changeTestimonialBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("previous-testimonial-btn"))
        changeTestimonial("previous");
      if (btn.classList.contains("next-testimonial-btn"))
        changeTestimonial("next");
    });
  });

  newAccountForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const allAccountsInLocalStorage =
      JSON.parse(localStorage.getItem("allAccounts")) ?? [];

    allAccounts = allAccountsInLocalStorage;

    createNewAccount(newAccountForm);
  });

  openAccountForm.addEventListener("submit", (event) => {
    event.preventDefault();
    openAccount(openAccountForm);
  });

  changeTestimonialDotsSpot.addEventListener("click", ({ target }) => {
    if (!target.classList.contains("dot")) return;
    const testimonialIndex = Array.from(allDots).indexOf(target);
    goToTestimonial(testimonialIndex);
    testimonialNum = testimonialIndex;
    allDots.forEach((dot, index) => {
      dot.dataset.state = index === testimonialIndex ? "active" : "disabled";
    });
  });
}

makeTheWebsiteRunning();
