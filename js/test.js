const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const images = Array.from(document.getElementsByClassName("choice-image"));
const choice = Array.from(document.getElementsByClassName("choice-container"));
const progressText = document.getElementById("progressText");
const progressBarFull = document.getElementById("progressBarFull");

const game = document.getElementById("game");
let currentQuestion = {};
let acceptingAnswers = false;
let questionCounter = 0;
let availableQuesions = [];
let questions = [];

fetch("http://localhost:5000/api/test/hokkaido")
  .then((res) => {
    return res.json();
  })
  .then((loadedQuestions) => {
    questions = loadedQuestions.data.data.map((loadedQuestion) => {
      let incorrect_answers = [];
      let incorrect_images = [];
      const formattedQuestion = {
        question: loadedQuestion.question,
      };
      loadedQuestion.incorrect.forEach((answers) => {
        const incorrect_as = answers.text;
        const incorrect_img = answers.image;
        incorrect_answers.push(incorrect_as);
        incorrect_images.push(incorrect_img);
      });
      console.log(incorrect_images);
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

      console.log(formattedQuestion);
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
    //go to the end page
    return window.location.assign("/end.html");
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
};

choice.forEach((choices) => {
  choices.addEventListener("click", (e) => {
    if (!acceptingAnswers) return;

    acceptingAnswers = false;
    const selectedChoice = e.target;
    const selectedAnswer = selectedChoice.dataset["number"];

    const classToApply =
      selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";

    if (classToApply === "correct") {
      incrementScore(CORRECT_BONUS);
    }

    selectedChoice.parentElement.classList.add(classToApply);

    setTimeout(() => {
      selectedChoice.parentElement.classList.remove(classToApply);
      getNewQuestion();
    }, 1000);
  });
});
