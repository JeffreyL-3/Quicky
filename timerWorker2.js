let timeLeft; // example time in milliseconds

function startTimer(startTime) {
  timeLeft=startTime;
  
  setInterval(() => {
    timeLeft -= 10;
    postMessage(timeLeft);
    if (timeLeft <= 0) {
      close(); // Terminates the worker.
    }
  }, 10);
}

onmessage = function(e) {
  const start = e.data[0];
  const startTime = e.data[1]
  if (start == 1) {
    startTimer(startTime);
  }
};
