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
const allAccounts = [];

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
    }, 300);
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

function createErrorMessageElement(errorMessage) {
  const element = document.createElement("p");
  element.classList.add("error-message");
  element.textContent = errorMessage;
  document
    .querySelector(".submit-form-btn")
    .insertAdjacentElement("beforebegin", element);
  setTimeout(() => {
    element.remove();
  }, 1500);
}

function createNewAccount(form) {
  const inputsObject = Object.fromEntries([...new FormData(form)]);
  const newAccountValues = Object.values(inputsObject);
  let emptyValue;
  newAccountValues.forEach((value) => {
    if (value === "") return (emptyValue = true);
  });
  if (emptyValue)
    return createErrorMessageElement("Please fill out all fields!");
  const newAccount = { ...inputsObject, movements: [], interestRate: 1.5 };
  allAccounts.push(newAccount);
  form.querySelectorAll(".input-field").forEach((input) => (input.value = ""));
  // document.querySelector("body").innerHTML = "";
  console.log(allAccounts);
  // createSpinner();
  // setTimeout(() => {
  //   window.location.href = "http://127.0.0.1:8080/insideAccount.html";
  // }, 3000);
}

function createSpinner() {
  const spinner = document.createElement("div");
  spinner.classList.add("loading");
  for (let i = 0; i < 3; i++) {
    const loadingDot = document.createElement("span");
    spinner.appendChild(loadingDot);
  }
  document.querySelector("body").appendChild(spinner);
}

function makeTheWebsiteRunning() {
  createIntersectionObserverForIntroSection();
  initTheTestimonials();

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
    const visibleForm = Array.from(document.querySelectorAll(".form")).find(
      (form) => form.dataset.state === "visible"
    );
    manipulateWindow("hide", visibleForm);
  });

  window.addEventListener("keydown", ({ key }) => {
    const visibleForm = Array.from(document.querySelectorAll(".form")).find(
      (form) => form.dataset.state === "visible"
    );
    if (key !== "Escape" || visibleForm == null) return;
    manipulateWindow("hide", visibleForm);
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
    createNewAccount(newAccountForm);
  });

  changeTestimonialDotsSpot.addEventListener("click", ({ target }) => {
    if (!target.classList.contains("dot")) return;
    allDots.forEach((dot, index) => {
      if (dot === target) {
        goToTestimonial(index);
        testimonialNum = index;
        dot.dataset.state = "active";
        return;
      }
      dot.dataset.state = "disabled";
    });
  });
}

makeTheWebsiteRunning();
