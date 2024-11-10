let questionsAnswered = 0;
let wrongAnswers = 0;
let selectedQuestions;
let finishedTest = false;
let previousQuestionPage = 1;
let questionPage = 1;
let isDragging = false;

let touchstartX = 0;
let touchendX = 0;

let currentUrl = window.location.href;
let url = new URL(currentUrl);
const testType = url.searchParams.get("perguntas");

const navigation = document.getElementById("navigation");

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

let c_CorrectAnswers = getCookie("correctAnswers")?.split(",");
let c_answeredQuestions = getCookie("answeredQuestions")?.split(",");

const finishLabel = document.getElementById("finish-test-label");
if (screen.width > 767) {
  finishLabel.innerHTML = "&nbsp;Terminar";
} else {
  finishLabel.innerHTML = "";
  document.getElementById("finish-test").style.aspectRatio = "1 / 1";
}

window.onbeforeunload = function () {
  if (questionsAnswered == 0 || questionsAnswered == 20 || finishedTest) {
    return;
  } else {
    return "Sair do teste? As suas respostas não serão registadas.";
  }
};

async function loadQuestions() {
  try {
    const response = await fetch("../assets/minified.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    let q = await response.json();
    q = shuffle([...q]);

    const questionsByAction = q.reduce(
      (acc, x) => {
        if (c_answeredQuestions?.includes(x.id.toString())) {
          acc.answered.push(x.id.toString());
        } else {
          acc.notAnswered.push(x.id.toString());
        }
        return acc;
      },
      { answered: [], notAnswered: [] }
    );

    function selectQuestions(selected) {
      q = q.filter((x) => selected.includes(x.id.toString()));
    }

    if (testType) {
      if (testType === "erradas") {
        const erradas = questionsByAction.answered.filter(
          (x) => !c_CorrectAnswers?.includes(x)
        );
        if (erradas.length >= 20) {
          selectQuestions(erradas);
        }
      } else if (testType === "novas") {
        if (questionsByAction.notAnswered.length >= 20) {
          selectQuestions(questionsByAction.notAnswered);
        } else {
          let newQuestionsWithFiller = [];
          answeredLength = 20 - questionsByAction.notAnswered.length;

          for (let i = 0; i < 20; i++) {
            if (i >= answeredLength) {
              newQuestionsWithFiller.push(
                questionsByAction.notAnswered[i - answeredLength]
              );
            } else {
              newQuestionsWithFiller.push(questionsByAction.answered[i]);
            }
          }

          selectQuestions(newQuestionsWithFiller);
        }
      }
    }

    const _selectedQuestions = q.length !== 20 ? q.slice(0, 20) : q;
    selectedQuestions = _selectedQuestions;

    return _selectedQuestions;
  } catch (error) {
    console.error("There was a problem with your fetch operation:", error);
    return [];
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
function navigateQuestions(questionNumber) {
  navigation.children[previousQuestionPage - 1].classList.remove(
    "selected"
    );
    navigation.children[questionNumber - 1].classList.add("selected");
  const previousQuestionContainer = document.getElementById(
    `p${previousQuestionPage}`
  );
  previousQuestionContainer.style.display = "none";
  questionPage = questionNumber;
  const nextQuestionContainer = document.getElementById(`p${questionNumber}`);
  nextQuestionContainer.style.display = "block";
  previousQuestionPage = questionNumber;
}

document.addEventListener("keydown", function (event) {
  const key = event.key;
  switch (key) {
    case "ArrowLeft":
    case "a":
      if (questionPage > 1) {
        questionPage--;
        navigateQuestions(questionPage);
      }
      break;
    case "ArrowRight":
    case "d":
      if (questionPage < 20) {
        questionPage++;
        navigateQuestions(questionPage);
      }
      break;
    case "ArrowUp":
    case "w":
      if (finishedTest) {
        break;
      }
      navigateOptions(-1);
      break;
    case "ArrowDown":
    case "s":
      if (finishedTest) {
        break;
      }
      navigateOptions(1);
      break;
    case "Enter":
      finishTest();
      break;
  }
});

function navigateOptions(direction) {
  const currentQuestionContainer = document.getElementById(`p${questionPage}`);
  if (currentQuestionContainer) {
    const currentQuestionOptions =
      currentQuestionContainer.getElementsByClassName("answer");
    const currentIndex = Array.from(currentQuestionOptions).findIndex(
      (option) => option.classList.contains("selected")
    );
    const nextIndex =
      (currentIndex + direction + currentQuestionOptions.length) %
      currentQuestionOptions.length;
    currentQuestionOptions[currentIndex]?.classList.remove("selected");
    currentQuestionOptions[nextIndex]?.classList.add("selected");

    if (currentIndex === -1) {
      questionsAnswered++;
      updateProgressBar();
    }

    const currentQuestionId = selectedQuestions[questionPage - 1].id;
    const currentQuestion = selectedQuestions.find(
      (question) => question.id === currentQuestionId
    );
    currentQuestion.selected = nextIndex + 1;
  }
}

function checkDirection() {
  if (touchendX + 10 < touchstartX && !isDragging && questionPage < 20) {
    questionPage++;
    navigateQuestions(questionPage);
  } // next
  if (touchendX - 10 > touchstartX && !isDragging && questionPage > 1) {
    questionPage--;
    navigateQuestions(questionPage);
  } // previous
}

document.addEventListener("touchstart", (e) => {
  touchstartX = Math.floor(e.changedTouches[0].screenX / 10);
});

document.addEventListener("touchend", (e) => {
  touchendX = Math.floor(e.changedTouches[0].screenX / 10);
  checkDirection();
});

function updateProgressBar() {
  const progress = (questionsAnswered / 20) * 100;
  document.getElementById("progress").style.width = `${progress}%`;
}

function generateAnswers(question) {
  const options = document.createElement("div");
  options.className = "answers";

  const letters = ["A", "B", "C"];

  ["a1", "a2", "a3"].forEach((key, index) => {
    const answerTable = document.createElement("table");
    const tbody = document.createElement("tbody");
    const tr = document.createElement("tr");
    const tdLetter = document.createElement("td");
    const tdText = document.createElement("td");

    answerTable.className = "answer";
    tdLetter.className = "letter";
    tdText.className = "text";

    tdLetter.textContent = letters[index];
    tdText.textContent = question[key];

    tr.appendChild(tdLetter);
    tr.appendChild(tdText);
    tbody.appendChild(tr);
    answerTable.appendChild(tbody);

    answerTable.onclick = function () {
      if (finishedTest) {
        return;
      }
      options.childNodes.forEach((childTable) => {
        if (childTable.classList.contains("selected")) {
          childTable.classList.remove("selected");
          questionsAnswered--;
          updateProgressBar();
        }
      });
      if (question.selected !== index + 1) {
        questionsAnswered++;
        updateProgressBar();
        answerTable.classList.add("selected");
        question.selected = index + 1;
      } else {
        updateProgressBar();
        question.selected = null;
      }
      currentQuestion = selectedQuestions.find((x) => x.id == question.id);
      if (currentQuestion) {
        currentQuestion.selected = question.selected;
      }
    };

    options.appendChild(answerTable);
  });

  return options;
}
const container = document.getElementById("form-container");

loadQuestions().then((_selectedQuestions) => {
  _selectedQuestions.forEach((question, index) => {
    const questionContainer = document.createElement("div");
    const questionElement = document.createElement("div");
    const table = document.createElement("table");
    const tbody = document.createElement("tbody");
    const tr = document.createElement("tr");
    const questionNumberTd = document.createElement("td");

    const questionTextTd = document.createElement("td");
    const previousQuestionBtn = document.createElement("a");

    const nextQuestionTd = document.createElement("td");
    const nextQuestionBtn = document.createElement("a");

    const imageElement = document.createElement("div");
    imageElement.style.backgroundImage = `url(../assets/images/${question.img}.jpg)`;

    questionTextTd.textContent = question.q;
    questionContainer.id = `p${index + 1}`;
    previousQuestionBtn.textContent = index + 1;
    nextQuestionBtn.textContent = ">";

    function buttonActions(direction, btn) {
      btn.href = "#";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        let number = direction ? +1 : -1;
        questionPage += number;
        navigateQuestions(questionPage);
      });
    }

    if (index < 19) buttonActions(true, nextQuestionBtn);
    if (index > 0) buttonActions(false, previousQuestionBtn);

    previousQuestionBtn.addEventListener("mouseenter", function () {
      if (this.textContent !== "1") this.textContent = "<";
    });

    previousQuestionBtn.addEventListener("mouseleave", function () {
      this.textContent = index + 1;
    });

    questionElement.className = "question";
    imageElement.className = "question-image";
    table.className = "question-header-table";
    questionNumberTd.className = "question-number";
    questionTextTd.className = "question-text";
    nextQuestionTd.className = "next-question";
    questionContainer.className = "question-container";
    if (index > 19) {
      questionContainer.classList.add("last-question");
    }

    tr.appendChild(questionNumberTd);
    tr.appendChild(questionTextTd);
    if (index < 19) nextQuestionTd.appendChild(nextQuestionBtn);
    questionNumberTd.appendChild(previousQuestionBtn);
    if (index < 19) tr.appendChild(nextQuestionTd);
    tbody.appendChild(tr);
    table.appendChild(tbody);
    if (question.img) {
      questionElement.appendChild(imageElement);
    }
    questionElement.appendChild(table);
    questionElement.appendChild(generateAnswers(question));
    questionContainer.appendChild(questionElement);
    container.appendChild(questionContainer);
    container.style.height =
      window.innerHeight -
      document.getElementById("nav").clientHeight -
      25 +
      "px";
    if (question.img) {
      imageElement.style.height =
        container.clientHeight - questionContainer.clientHeight + "px";
    }
    if (index > 0) questionContainer.style.display = "none";
  });

  const p1 = document.getElementById("p1");
  document.body.style.overflowY = "hidden";
  p1.classList.add("faded");
  setTimeout(function () {
    document.body.style.overflowY = "auto";
    p1.classList.remove("faded");
  }, 1000);
});

function finishTest() {
  const plural = questionsAnswered !== 19;
  if (
    finishedTest ||
    (questionsAnswered < 20 &&
      !confirm(
        `Falta${plural ? "m" : ""} ${20 - questionsAnswered} pergunta${
          plural ? "s" : ""
        }.\nTerminar teste?`
      ))
  ) {
    return;
  }
  finishedTest = true;
  navigateQuestions(1);
  document.getElementById("finish-test").style.display = "none";
  function parseCookie(c, id) {
    id = id.toString();
    if (c) {
      if (!Array.isArray(c)) {
        c = [c];
      }
      c.push(id);
      return c;
    }
    return [id];
  }
  selectedQuestions.map((x, index) => {
    const num = index + 1;
    const questionDiv = document.getElementById(`p${num}`).children[0];

    const questionHash = document.createElement("div");
    questionHash.textContent = "Pergunta #" + x.id;
    questionHash.className = "question-hash";
    let answers;

    for (let i = 0; i < questionDiv.children.length; i++) {
      const child = questionDiv.children[i];
      if (child.classList.contains("answers")) {
        answers = child.children;
        break;
      }
    }
    answers[x.c - 1]?.classList.add("correct");

    if (x.c != x.selected) {
      wrongAnswers++;
      questionHash.classList.add("wrong-hash");
      navigation.children[index].classList.add("red-num");

      if (x.selected) {
        answers[x.selected - 1]?.classList.add("incorrect");
      }
    }

    if (
      !c_answeredQuestions ||
      !c_answeredQuestions?.some((a) => parseInt(a) == x.id)
    ) {
      c_answeredQuestions = parseCookie(c_answeredQuestions, x.id);
    }
    if (x.c == x.selected && !c_CorrectAnswers?.includes(x.id)) {
      c_CorrectAnswers = parseCookie(c_CorrectAnswers, x.id);
    }

    questionDiv.insertBefore(questionHash, questionDiv.firstChild);
  });
  const progressBar = document.getElementById("progress-bar");
  progressBar.className = "flex-center";
  const failedExam = wrongAnswers > 5;
  progressBar.classList.add(failedExam ? "failed-message" : "passed-message");
  document.getElementById("progress-bar").textContent = failedExam
    ? `REPROVADO (${20 - wrongAnswers}/20)`
    : `APROVADO (${20 - wrongAnswers}/20)`;
  setCookie("answeredQuestions", c_answeredQuestions, 365);
  setCookie("correctAnswers", c_CorrectAnswers, 365);
}
