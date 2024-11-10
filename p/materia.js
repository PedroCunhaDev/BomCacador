const loader = document.getElementById("loader-wrapper");

async function loadQuestions() {
  try {
    const response = await fetch("../assets/minified.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("There was a problem with your fetch operation:", error);
    return [];
  }
}

// PROPERTIES

let currentQuestions = [];
let searchedQuestions = [];
let allQuestions = [];
const navHeight = document.getElementById("nav").clientHeight;
const wrapper = document.getElementById("wrapper");

const themesContainer = document.getElementById("themes-container");
const themesHeader = document.getElementById("themes-header");
let themesHeight = themesContainer.clientHeight;
const filterIcon = document.getElementById("filter-icon");

const windowHeight = document.documentElement.clientHeight;

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("submit-search");
searchButton.style.right = searchInput.clientWidth + 50 + "px";
let previousSearch = "";

themesContainer.style.top = navHeight + "px";
wrapper.style.marginTop = themesContainer.clientHeight - 15 + "px";

let filtersExpanded = false;
let isFiltered = false;

const themes = [
  "DOCUMENTOS DE CAÇADOR",
  "CONCEITOS BÁSICOS",
  "BIOLOGIA",
  "ESPÉCIES NÃO CINEGÉTICAS",
  "CONDICIONAMENTOS VENATÓRIOS GERAIS",
  "TERRENOS CINEGÉTICOS",
  "PERÍODOS, PROCESSOS E CONDICIONAMENTOS VENATÓRIOS",
  "CAÇA COM ARCO E BESTA",
  "CAMPOS DE TREINO",
  "CÃES DE CAÇA",
  "CAÇA DE CETRARIA",
];

function setCookie(name, value, daysToExpire) {
  let expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + daysToExpire);

  let cookieValue =
    encodeURIComponent(name) +
    "=" +
    encodeURIComponent(value) +
    "; expires=" +
    expirationDate.toUTCString() +
    "; path=/";
  document.cookie = cookieValue;
}

function getCookie(name) {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.startsWith(name + "=")) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

let c_CorrectAnswers = getCookie("correctAnswers")?.split(",").map(Number);
let c_answeredQuestions = getCookie("answeredQuestions")
  ?.split(",")
  .map(Number);

// CSS

themesContainer.id = "themes-container";

// LOGIC
const themesBody = document.createElement("div");
themesBody.id = "themes-body";
themes.forEach((x, index) => {
  const theme = document.createElement("span");
  theme.className = "theme";
  theme.onclick = function () {
    searchInput.value = "";
    previousSearch = "";
    if (theme.classList.contains("selected")) {
      theme.classList.remove("selected");
      listQuestions(allQuestions);
      document.getElementById("filter").textContent = "";
      filterIcon.src = "../assets/icons/filter.svg";
      currentQuestions = allQuestions;
      isFiltered = false;
    } else {
      const otherThemes = document.getElementsByClassName("theme");
      [...otherThemes].forEach((o) => o.classList.remove("selected"));
      theme.classList.add("selected");
      currentQuestions = allQuestions.filter((q) => q.area == index);
      document.getElementById("filter").textContent =
        x + " - (" + currentQuestions.length + ")";
      filterIcon.src = "../assets/icons/filter-fill.svg";
      isFiltered = true;
      listQuestions(currentQuestions);
    }
    themesContainer.style.height = themesContainer.clientHeight - 30 + "px";
    wrapper.style.marginTop = themesHeader.clientHeight + 30 + "px";
  };
  theme.textContent = x;

  themesBody.appendChild(theme);
});

function openCloseThemes() {
  filtersExpanded = !filtersExpanded;
  if (filtersExpanded) {
    themesContainer.style.height = themesContainerHeight + "px";
    themesContainer.style.overflowY = "scroll";
  } else {
    themesContainer.style.height = themesHeader.clientHeight + "px";
    themesContainer.style.overflowY = "hidden";
  }
}

themesContainer.appendChild(themesBody);
const themesContainerHeight = themesContainer.clientHeight;
themesContainer.style.height = themesHeader.clientHeight + "px";
themesHeader.onclick = openCloseThemes;

function submitSearch() {
  let search = searchInput.value.trim().toLowerCase();
  let searchIndexOnly = false;
  if (search.charAt(0) === "#") {
    search = search.substring(1);
    searchIndexOnly = true;
  }
  const searchNumber = parseInt(search);

  if (search.length > 0) {
    const _searchedQuestions = searchIndexOnly
      ? currentQuestions.find(
          (q) => q.id == searchNumber && searchNumber != NaN
        )
      : currentQuestions.filter(
          (q) =>
            q.q.toLowerCase().includes(search) ||
            q.a1.toLowerCase().includes(search) ||
            q.a2.toLowerCase().includes(search) ||
            q.a3.toLowerCase().includes(search) ||
            (q.id == searchNumber && searchNumber != NaN)
        );
    const list = searchIndexOnly ? [] : _searchedQuestions;
    if (searchIndexOnly && _searchedQuestions) {
      list.push(_searchedQuestions);
    }
    listQuestions(list);
    searchedQuestions = list;
    previousSearch = search;
  } else if (isFiltered && search.length == 0) {
    listQuestions(currentQuestions);
  } else if (!isFiltered) {
    listQuestions(allQuestions);
    previousSearch = "";
  }
}

document.body.addEventListener("click", function (event) {
  if (!themesContainer.contains(event.target) && filtersExpanded) {
    openCloseThemes();
  }
});
document.body.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && document.activeElement === searchInput) {
    submitSearch();
  }
});

function getAreaTagBackground(area) {
  let rgb = "rgba(";
  switch (area) {
    case 0:
      rgb += "0, 102, 204";
      break;
    case 1:
      rgb += "204, 0, 0";
      break;
    case 2:
      rgb += "51, 153, 51";
      break;
    case 3:
      rgb += "255, 153, 51";
      break;
    case 4:
      rgb += "153, 51, 255";
      break;
    case 5:
      rgb += "255, 102, 0";
      break;
    case 5:
      rgb += "0, 153, 153";
      break;
    case 7:
      rgb += "204, 0, 204";
      break;
    case 8:
      rgb += "255, 204, 51";
      break;
    case 9:
      rgb += "0, 204, 204";
      break;
    case 10:
      rgb += "0, 169, 240";
      break;
    default:
      rgb += "0, 0, 0";
      break;
  }
  rgb += ",.8)";
  return rgb;
}

function listQuestions(questions) {
  document.getElementById("questions-container")?.remove();
  const questionsContainer = document.createElement("div");
  questionsContainer.id = "questions-container";
  questions.forEach((q) => {
    const box = document.createElement("div");
    const tagsContainer = document.createElement("div");
    const title = document.createElement("div");
    const questionStatus = document.createElement("div");
    const area = document.createElement("span");
    const id = document.createElement("span");
    const question = document.createElement("h2");

    const list = document.createElement("ul");
    const a1 = document.createElement("li");
    const a2 = document.createElement("li");
    const a3 = document.createElement("li");

    box.className = "box";
    tagsContainer.id = "tags-container";
    id.className = "id";
    title.className = "title";
    questionStatus.className = "status";
    area.className = "area";
    question.className = "q";

    area.style.backgroundColor = getAreaTagBackground(q.area);

    id.textContent = `Pergunta #${q.id}`;
    title.appendChild(questionStatus);
    title.appendChild(id);

    if (c_CorrectAnswers?.includes(q.id)) {
      questionStatus.className = "acertou";
    } else if (c_answeredQuestions?.includes(q.id)) {
      questionStatus.className = "errou";
    } else {
      questionStatus.className = "dunno";
    }

    area.textContent = themes[q.area];
    question.textContent = q.q;
    a1.textContent = q.a1;
    a2.textContent = q.a2;
    a3.textContent = q.a3;
    switch (q.c) {
      case 1:
        a1.classList.add("c");
        break;
      case 2:
        a2.classList.add("c");
        break;
      case 3:
        a3.classList.add("c");
        break;
    }
    tagsContainer.appendChild(title);
    tagsContainer.appendChild(area);
    box.appendChild(tagsContainer);
    box.appendChild(question);
    if (q.img) {
      const img = document.createElement("div");
      img.className = "img";
      img.style.backgroundImage = `url(../assets/images/${q.img}.jpg)`;
      box.appendChild(img);
    }

    list.appendChild(a1);
    list.appendChild(a2);
    list.appendChild(a3);
    box.appendChild(list);

    questionsContainer.appendChild(box);
  });
  questionsContainer.style.height =
    windowHeight - navHeight - themesHeight - 20 + "px";
  wrapper.appendChild(questionsContainer);
}

loadQuestions().then((questions) => {
  currentQuestions = questions;
  allQuestions = questions;
  listQuestions(questions);
  loader.style.display = "none";
});
