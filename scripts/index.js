export const APIEndPoints = {
  questions: "https://quizapi.io/api/v1/questions",
  categories: "https://quizapi.io//api/v1/categories",
  tags: "https://quizapi.io//api/v1/tags",
  apiKey: "k5tj3FRfAipGkIHiAAf7xFQojwOOJsdmajmxu0g6",
};
let QUIZ = null;
class Quiz {
  scoreShown = false;
  constructor(questions, questionCategory, questionDiff) {
    if (questions && questionCategory && questionDiff) {
      this.questions = [];
      for (const element of questions) {
        let { question, answers, correct_answers } = element;
        answers = Object.values(answers).filter((ele) => {
          return ele;
        });
        correct_answers = Object.values(correct_answers);
        this.questions.push({
          question,
          answers,
          correct_answers: [...correct_answers],
          answer: null,
        });
      }
      this.questionCategory = questionCategory;
      this.questionCount = this.questions.length;
      this.questionDiff = questionDiff;
      this.score = 0;
      this.currentQ = 0;
      this.time = this.questionCount * 30;
      this.questionElement = this.createQuestion(this.questions[this.currentQ]);
    }
  }
  saveCurrent() {
    let selected = document.querySelector(".quiz input:checked");
    if (selected) {
      this.questions[this.currentQ].answer = +selected.id;
    }
  }
  next() {
    if (this.currentQ < this.questionCount - 1) {
      this.questionElement = this.createQuestion(
        this.questions[++this.currentQ]
      );
      if (this.questions[this.currentQ].answer != null) {
        this.questionElement.querySelector(
          `.answers div:nth-child(${
            this.questions[this.currentQ].answer + 1
          }) input`
        ).checked = true;
      }
    } else {
      return this.showScore();
    }
  }
  previous() {
    if (this.currentQ > 0) {
      this.questionElement = this.createQuestion(
        this.questions[--this.currentQ]
      );
    }
  }
  startTimer() {
    let timerInterval = setInterval(() => {
      let timer = this.questionElement.querySelector(".question :last-child");
      timer.textContent = this.time-- + "s";
      if (this.time < 0) {
        clearInterval(timerInterval);
        let selected = document.querySelector(".quiz input:checked");
        if (selected) {
          this.questions[this.currentQ].answer = selected.id;
        }
        this.questionElement.remove();
        this.showScore();
      }
    }, 1000);
  }
  showScore() {
    this.scoreShown = true;
    if (this.questionElement) {
      this.questionElement.remove();
    }
    for (const element of this.questions) {
      if (element.answer != null) {
        this.score += element.correct_answers[+element.answer] === "true";
      }
    }
    let scoreCont = document.createElement("div");
    scoreCont.className = "quiz";
    let scoreHead = document.createElement("h3");
    scoreHead.className = "question";
    scoreHead.textContent = `Your Score is ${this.score} from ${this.questionCount}`;
    scoreCont.appendChild(scoreHead);
    document.body.appendChild(scoreCont);
    return this.score;
  }
  createQuestion(question) {
    if (this.questionElement) {
      this.questionElement.remove();
    }
    let quiz = document.createElement("div");
    quiz.className = "quiz";
    let questionHead = document.createElement("div");
    questionHead.className = "question";
    questionHead.innerHTML =
      `<span>${+this.currentQ + 1}/${this.questionCount}</span>` +
      `<span>${question.question}</span>` +
      `<span>${this.time}s</span>`;
    quiz.appendChild(questionHead);
    let answers = document.createElement("div");
    answers.className = "answers";
    for (const element of Object.entries(question.answers)) {
      if (element[1]) {
        let ansContainer = document.createElement("div");
        let ans = document.createElement("input");
        ans.type = "radio";
        ans.name = "answer";
        ans.id = element[0];
        let ansLabel = document.createElement("label");
        ansLabel.setAttribute("for", element[0]);
        ansLabel.textContent = element[1];
        ansContainer.appendChild(ans);
        ansContainer.appendChild(ansLabel);
        answers.appendChild(ansContainer);
      }
    }
    let buttons = document.createElement("div");
    buttons.className = "move";
    let prev = document.createElement("button");
    prev.type = "button";
    prev.addEventListener("click", () => {
      let selected = answers.querySelector("input:checked");
      if (selected) {
        this.questions[this.currentQ].answer = +selected.id;
      }
      this.previous();
      if (this.questions[this.currentQ].answer != null) {
        this.questionElement.querySelector(
          `.answers div:nth-child(${
            this.questions[this.currentQ].answer + 1
          }) input`
        ).checked = true;
      }
    });
    prev.textContent = "Previous";
    let next = document.createElement("button");
    next.type = "button";
    if (this.currentQ === this.questionCount - 1) {
      next.textContent = "Submit";
    } else {
      next.textContent = "Next";
    }
    next.addEventListener("click", () => {
      let checked = false;
      let inputs = answers.querySelectorAll("input");
      inputs.forEach((ele) => {
        checked |= ele.checked;
      });
      if (checked) {
        let selected = answers.querySelector("input:checked").id;
        this.questions[this.currentQ].answer = +selected;
        this.next();
      }
    });
    buttons.appendChild(prev);
    buttons.appendChild(next);
    quiz.appendChild(answers);
    quiz.appendChild(buttons);
    document.body.appendChild(quiz);
    return quiz;
  }
}
export async function startQuiz(category, questionsLimit, diff) {
  try {
    let url = new URL(APIEndPoints.questions);
    url.searchParams.append("apiKey", APIEndPoints.apiKey);
    url.searchParams.append("limit", questionsLimit);
    url.searchParams.append("category", category);
    url.searchParams.append("difficulty", diff);
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    let data = await response.json();
    QUIZ = new Quiz(data, category, diff);
    QUIZ.startTimer();
  } catch (error) {
    console.log("Error:", error);
  }
}

window.onbeforeunload = () => {
  if (QUIZ && QUIZ.time > 0 && !QUIZ.scoreShown) {
    QUIZ.saveCurrent();
    window.sessionStorage.setItem("userData", JSON.stringify(QUIZ));
  }
};
window.onload = () => {
  const data = window.sessionStorage.getItem("userData");
  if (data) {
    const parsedData = JSON.parse(data);
    if (parsedData.time < 0) {
      window.sessionStorage.clear();
      return;
    }
    document.querySelector(".login").style.display = "none";
    QUIZ = new Quiz(
      parsedData.questions,
      parsedData.questionCategory,
      parsedData.questionDiff
    );
    QUIZ.score = parsedData.score;
    QUIZ.currentQ = parsedData.currentQ;
    QUIZ.time = parsedData.time;
    QUIZ.questions = parsedData.questions;
    QUIZ.questionElement = QUIZ.createQuestion(QUIZ.questions[QUIZ.currentQ]);
    QUIZ.startTimer();
    console.log("Successed");
  }
};
