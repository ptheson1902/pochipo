const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const choice = Array.from(document.getElementsByClassName("choice-container"));
const images = Array.from(document.getElementsByClassName("choice-image"));
const progressText = document.getElementById("progressText");
const progressBarFull = document.getElementById("progressBarFull");
const audioSrc = document.getElementById("audioSrc");
const autoplay = document.getElementById("autoplay");

const game = document.getElementById("game");

const city = localStorage.getItem("city");
let currentQuestion = {};
let acceptingAnswers = false;
let questionCounter = 0;
let availableQuesions = [];
let questions = [];

fetch(`https://learn---it.herokuapp.com/api/test/${city}`)
  .then((res) => {
    return res.json();
  })
  .then((loadedQuestions) => {
    questions = loadedQuestions.data.data.map((loadedQuestion) => {
      let incorrect_answers = [];
      let incorrect_images = [];
      const formattedQuestion = {
        question: loadedQuestion.question,
        audio: loadedQuestion.audio,
      };
      loadedQuestion.incorrect.forEach((answers) => {
        const incorrect_as = answers.text;
        const incorrect_img = answers.image;
        incorrect_answers.push(incorrect_as);
        incorrect_images.push(incorrect_img);
      });
      const answerChoices = [...incorrect_answers];
      const imageChoices = [...incorrect_images];
      formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;
      answerChoices.splice(
        formattedQuestion.answer - 1,
        0,
        loadedQuestion.correct
      );
      imageChoices.splice(
        formattedQuestion.answer - 1,
        0,
        loadedQuestion.image
      );
      answerChoices.forEach((choice, index) => {
        formattedQuestion["choice" + (index + 1)] = choice;
      });
      imageChoices.forEach((image, index) => {
        formattedQuestion["image" + (index + 1)] = image;
      });
      return formattedQuestion;
    });

    startGame();
  })
  .catch((err) => {
    console.error(err);
  });
const MAX_QUESTIONS = 5;

startGame = () => {
  questionCounter = 0;
  availableQuesions = [...questions];
  getNewQuestion();
  game.classList.remove("hidden");
};

getNewQuestion = () => {
  if (availableQuesions.length === 0 || questionCounter >= MAX_QUESTIONS) {
    var names = localStorage.getItem("list")
      ? JSON.parse(localStorage.getItem("list"))
      : [];
    names.push(city);
    localStorage.setItem("list", JSON.stringify(names));
    //go to the end page
    return window.location.assign("./end.html");
  }
  questionCounter++;
  progressText.innerText = `問題 ${questionCounter}/${MAX_QUESTIONS}`;
  //Update the progress bar
  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

  const questionIndex = Math.floor(Math.random() * availableQuesions.length);
  currentQuestion = availableQuesions[questionIndex];
  question.innerHTML = currentQuestion.question;

  choices.forEach((choice) => {
    const number = choice.dataset["number"];
    choice.innerHTML = currentQuestion["choice" + number];
  });
  images.forEach((image) => {
    const number = image.dataset["number"];
    image.src = currentQuestion["image" + number];
  });

  availableQuesions.splice(questionIndex, 1);
  acceptingAnswers = true;
  audioSrc.src = currentQuestion.audio;
  autoplay.autoplay = true;
};

$(".choice-container").click(function () {
  const classToApply =
    $(this).attr("data-number") == currentQuestion.answer
      ? "correct"
      : "incorrect";
  if (classToApply === "incorrect") {
    alert("ブー。。。！");
    return false;
  }
  $(this).addClass(classToApply);
  setTimeout(() => {
    $(this).removeClass(classToApply);
    getNewQuestion();
  }, 1500);
});
