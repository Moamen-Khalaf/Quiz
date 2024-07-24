import { APIEndPoints, startQuiz } from "./index.js";
const UI = {
  loginCont: document.querySelector(".login"),
  usn: document.querySelector(`[name="usn"]`),
  categories: document.querySelector(`[name="category"]`),
  questionsLimit: document.querySelector(`[name="limit"]`),
  diff: null,
};
UI.questionsLimit.onchange = () => {
  if (+UI.questionsLimit.value < 0) {
    UI.questionsLimit.value = 0;
  } else if (+UI.questionsLimit.value > 20) {
    UI.questionsLimit.value = 20;
  }
};
let loadCategories = (categoryName) => {
  let categ = document.createElement("option");
  categ.textContent = categoryName.name;
  UI.categories.appendChild(categ);
};
(async function getCategories() {
  let url = new URL(APIEndPoints.categories);
  url.searchParams.append("apiKey", APIEndPoints.apiKey);
  let request = await fetch(url);
  if (!request.ok) {
    throw new Error(`HTTP Error : ${request.status}`);
  }
  let data = await request.json();
  for (const element of data) {
    loadCategories(element);
  }
})();
UI.loginCont.querySelector("button").onclick = () => {
  UI.diff = document.querySelector(`input[type="radio"]:checked`);
  if (UI.categories.value === "Categories") {
    UI.categories.style.border = "1px solid red";
    return false;
  }
  UI.loginCont.style.display = "none";
  startQuiz(UI.categories.value, UI.questionsLimit.value, UI.diff.value);
};
