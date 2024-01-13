var confettiSettings = { target: 'my-canvas', start_from_edge: 'true', max: '100', clock: '33' };
var confetti = new ConfettiGenerator(confettiSettings);

let lastAnswer = 0; // Variable to store the last answer
let problemsSolved = 0; // Variable to keep track of the number of problems solved

function generateProblem() {
    let num1 = lastAnswer; // Start with the last answer
    let num2 = Math.floor(Math.random() * 100);
    let operation;

    let rampDown = 0.5;
    const absSize = Math.abs(lastAnswer);
    if (absSize >= 100) {
        rampDown = 0.5 - (absSize / 400)

        if (num2 < 50) {
            num2 += absSize / 10
        }
    }
    
    num2 = Math.round(num2);

    // Adjust the probability of choosing addition or subtraction based on lastAnswer
    if (lastAnswer < -100) {
        // Increase probability of addition
        operation = Math.random() > rampDown ? '+' : '-'; // (1.0 - rampDown) chance of addition
    } else if (lastAnswer > 100) {
        // Increase probability of subtraction
        operation = Math.random() > rampDown ? '-' : '+'; // (1.0 - rampDown) chance of subtraction
    } else {
        // If lastAnswer is between -100 and 100, choose randomly
        operation = Math.random() > 0.5 ? '+' : '-';
    }

    let answer;

    if (operation === '+') {
        answer = num1 + num2;
    } else {
        answer = num1 - num2;
    }

    return { question: `${num1} ${operation} ${num2}`, answer: answer };
}


function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('userAnswer').value);
    const problem = document.currentProblem;

    if (userAnswer === problem.answer) {
        lastAnswer = problem.answer; // Update the last answer
        problemsSolved++; // Increment the problems solved counter
        updateCounter(); // Update the display of the counter
        setTimeout(loadNewProblem, 150); // Delay
    }
}


function updateCounter() {
    document.getElementById('counter').textContent = `${problemsSolved}`;
}

function loadNewProblem() {
    const problem = generateProblem();
    document.currentProblem = problem;
    document.getElementById('problem').innerHTML = `<span class="num1-color">${problem.question.split(' ')[0]}</span> ${problem.question.substring(problem.question.indexOf(' '))} =`;
    document.getElementById('userAnswer').value = '';
    updateCounter(); // Ensure the counter is updated when the new problem is loaded
}

// Set up the event listener for the input field 
window.onload = function () {
    setAllFontSize();
    keyboardShowCheck();
    loadNewProblem();
    document.getElementById('userAnswer').focus(); // Focus the invisible input box for user input
    document.getElementById('userAnswer').addEventListener('input', checkAnswer);
    startTimer(); // Start the timer when the window loads
};

window.onresize = function () {
    setAllFontSize();

};

let timeLeft = 60000; // 1 minute = 60,000 hundredths of a second

let timerWorker;

function startTimer() {
    if (window.Worker) {
        timerWorker = new Worker('timerWorker.js');
        timerWorker.postMessage('start'); // Start the timer in the worker

        timerWorker.onmessage = function (e) {
            let timeLeft = e.data;

            // Convert milliseconds to seconds (1 second = 1000 milliseconds)
            let seconds = Math.floor(timeLeft / 1000);

            // Calculate hundredths of a second
            // (e.g., 1250 milliseconds is 1 second and 250 milliseconds or 25 hundredths)
            let hundredths = Math.floor((timeLeft % 1000) / 10);
            hundredths = hundredths < 10 ? '0' + hundredths : hundredths;

            document.getElementById('timer').textContent = seconds + '.' + hundredths;

            if (timeLeft <= 0) {
                timerWorker.terminate(); // Stop the worker when the timer ends
                showResultsPopup();
            }
        };
    }
}


function resetAll() {
    problemsSolved = 0;
    lastAnswer = 0;
    timeLeft = 6000;
    loadNewProblem();
}

function updateScore() {
    var scoreElement = document.getElementById("score");
    scoreElement.innerHTML = "Score: " + problemsSolved;
}

function showResultsPopup() {
    document.getElementById('resultsPopup').style.display = 'block';
    document.getElementById('problemContainer').style.display = 'none'; // Hide the problem container
    document.getElementById('keyboard').style.display = 'none';
    document.getElementById('counter').style.display = 'none';
    document.getElementById('timer').style.display = 'none';
    updateScore();
    startConfetti();
}

function playAgain() {
    document.getElementById('resultsPopup').style.display = 'none';
    document.getElementById('problemContainer').style.display = 'flex'; // Show the problem container again
    document.getElementById('counter').style.display = 'flex';
    document.getElementById('timer').style.display = 'flex';
    keyboardShowCheck();
    resetAll();
    startTimer();
    document.getElementById('userAnswer').focus(); // Set focus to the input box
    stopConfetti();
}

function startConfetti() {
    confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();
}

function stopConfetti() {
    confetti.clear();
}

function enterNumber(number) {
    document.getElementById('userAnswer').value += number;
    checkAnswer(); // Call your checkAnswer function
}

function backspace() {
    var userAnswer = document.getElementById('userAnswer');
    userAnswer.value = userAnswer.value.slice(0, -1); // Remove last character
}

function negative() {
    var userAnswerElement = document.getElementById('userAnswer');
    var userAnswer = userAnswerElement.value;

    if (userAnswer === '' || userAnswer === '-') {
        // Toggle between empty and '-'
        userAnswerElement.value = userAnswer === '' ? '-' : '';
    } else {
        // If userAnswer contains a number, toggle its sign
        var numericValue = parseFloat(userAnswer);
        if (!isNaN(numericValue)) {
            userAnswerElement.value = -numericValue;
        }
    }
}



function keyboardShowCheck() {
    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
        document.getElementById('keyboard').style.display = 'none';
    }
    else {
        document.getElementById('keyboard').style.display = 'grid';
    }
}

function getSmallerVWVH(percent) {
    // Get viewport width and height
    let vw = window.innerWidth;
    let vh = window.innerHeight;

    // Calculate 10% of viewport width and height
    let usedVW = vw * percent / 100;
    let usedVH = vh * percent / 100;

    // Return the smaller of the two values
    return Math.round(Math.min(usedVW, usedVH));
}

// Modular function to set font size
function setFontSize(selector, percent) {
    let elements;

    // Determine the type of the selector and get the elements
    if (selector.startsWith('#')) {
        // ID selector
        elements = [document.getElementById(selector.substring(1))];
    } else if (selector.startsWith('.')) {
        // Class selector
        elements = document.getElementsByClassName(selector.substring(1));
    } else {
        // Tag selector
        elements = document.getElementsByTagName(selector);
    }

    // Set font size for the selected elements
    for (let element of elements) {
        if (element) {
            element.style.fontSize = getSmallerVWVH(percent) + 'px';
        }
    }
}

function setAllFontSize() {
    setFontSize('#userAnswer', 10);
    setFontSize('#problem', 10);
    setFontSize('h1', 20);
    setFontSize('.popup-content', 10);
}