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

function deleteData() {
  const warning = "Tem a certeza que quer apagar TODOS os seus dados?";
  if (!confirm(warning)) return;
  const cookies = document.cookie.split(";");
  for (var i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
  window.location.href = window.location.href;
}
window.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const header = document.getElementById("header");
  const editableName = document.createElement("span");
  editableName.id = "editable-name";
  editableName.contentEditable = true;


  if (!username) {
    header.innerText = "O seu nome: ";
    editableName.innerHTML = '';
  } else {
    editableName.innerHTML = username.substring(0, 10);
    header.textContent = "Perfil de ";
    header.contentEditable = false;
  }
  
  header.appendChild(editableName);
  
  editableName.addEventListener('input', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      return;
    }
    let text = editableName.innerText.trim();
    const key = event.key;
    const isNotSpecialKey = !event.ctrlKey && !event.altKey && !event.metaKey &&
        key !== "ArrowLeft" && key !== "ArrowRight" && key !== "ArrowUp" &&
        key !== "ArrowDown" && key !== "Backspace";
    if (text.length > 10 && isNotSpecialKey) {
      event.preventDefault();
  }
    setCookie("username", text, 365);
  });
});

const totalQuestions = 506;
const wrapper = document.getElementById("wrapper");
const c_correctAnswers = getCookie("correctAnswers");
const c_answeredQuestions = getCookie("answeredQuestions");
const username = getCookie("username");

let percentageOfWrongAnswers = 0;

let percentageOfQuestionsAnswered = 0;

function countCommas(str) {
  if (str) {
    var commaCount = str.match(/,/g);
    if (commaCount === null) {
      return 0;
    } else {
      return commaCount.length;
    }
  }
}
let commasCorrect = countCommas(c_correctAnswers);
let commasAnswered = countCommas(c_answeredQuestions);
const amountAnsweredQuestions = commasAnswered > 0 ? commasAnswered + 1 : 0;
const amountCorrectAnswers = commasCorrect > 0 ? commasCorrect + 1 : 0;
const amountWrongAnswers = amountAnsweredQuestions - amountCorrectAnswers;
if (amountAnsweredQuestions > 0) {
  percentageOfQuestionsAnswered =
    ((amountAnsweredQuestions + 1) / totalQuestions) * 100;
}
if (amountWrongAnswers > 0) {
  percentageOfWrongAnswers =
    (amountWrongAnswers / amountAnsweredQuestions) * 100;
}

const wrongAnswersCircle = document.getElementById("correctAnswersCircle");
const answeredQuestionsCircle = document.getElementById(
  "answeredQuestionsCircle"
);

wrongAnswersCircle.style.setProperty(
  "--percentage",
  Math.round(percentageOfWrongAnswers)
);
answeredQuestionsCircle.style.setProperty(
  "--percentage",
  Math.round(percentageOfQuestionsAnswered)
);

answeredQuestionsCircle.setAttribute(
  "data-pie",
  `{ "fill": "#EFEBE9", "percent": ${percentageOfQuestionsAnswered}}`
);
wrongAnswersCircle.setAttribute(
  "data-pie",
  `{ "fill": "#EFEBE9", "colorSlice": "#e04343", "percent": ${percentageOfWrongAnswers}}`
);

const logWrong = document.getElementById("log-correct");
const logAnswered = document.getElementById("log-answered");
const titleWrong = logWrong.querySelector(".title");
const titleAnswered = logAnswered.querySelector(".title");
const numbersAnswered = logAnswered.querySelector(".numbers");
const numberWrong = logWrong.querySelector(".numbers");

titleWrong.textContent = "Erradas";
titleAnswered.textContent = "Respondidas";

numbersAnswered.textContent = `${
  amountAnsweredQuestions ?? 0
} / ${totalQuestions}`;
numberWrong.textContent = `${
  amountAnsweredQuestions - amountCorrectAnswers ?? 0
} / ${amountAnsweredQuestions ?? 0}`;

function specificTest(type) {
  const url = "../p/test.html?perguntas=";

  if (type == "erradas") {
    const answeredQuestions = c_answeredQuestions
      ? c_answeredQuestions.split(",")
      : [];
    const correctAnswers = c_correctAnswers ? c_correctAnswers.split(",") : [];

    const checkWrongLength = answeredQuestions.length - correctAnswers.length;
    if (!checkWrongLength || checkWrongLength < 19) {
      const message = "Não há perguntas erradas suficientes.";
      alert(message);
      return;
    }
  }

  window.location.href = url + type;
}

const circle = new CircularProgressBar("pie");
circle.initial();
