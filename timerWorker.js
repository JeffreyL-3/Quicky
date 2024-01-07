let timeLeft = 10000; // example time in milliseconds

function startTimer() {
  setInterval(() => {
    timeLeft -= 10;
    postMessage(timeLeft);
    if (timeLeft <= 0) {
      close(); // Terminates the worker.
    }
  }, 10);
}

onmessage = function(e) {
  if (e.data === 'start') {
    startTimer();
  }
};
