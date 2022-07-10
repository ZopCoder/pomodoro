const timer = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  sessions: 0,
};

let interval;

const modeButtons = document.querySelector('#js-mode-buttons');
modeButtons.addEventListener('click', handleMode);

const mainButton = document.getElementById('js-btn');
const buttonSound = new Audio('sounds/button-sound.mp3');
mainButton.addEventListener('click', ()=>{
  buttonSound.play();
  const { action } = mainButton.dataset;
  if (action === 'start') {
    startTimer();
  }
  else {
    stopTimer();
  }
});

function handleMode(event){
    const {mode} = event.target.dataset;
    if (!mode) return;
    switchMode(mode);
    stopTimer();
}

function switchMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
      total: timer[mode] * 60,
      minutes: timer[mode],
      seconds: 0,
    };

    // Remove "avtive" class from all the buttons
    document.querySelectorAll('button[data-mode]')
        .forEach(e => e.classList.remove('active'));

    // Now add "active" class to the button which has been clicked
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    // Change the background color to the selected mode as configured in css
    document.body.style.backgroundColor = `var(--${mode})`;
    document
      .getElementById('js-progress')
      .setAttribute('max', timer.remainingTime.total);

    updateClock();
}

function updateClock(){
    const { remainingTime } = timer; // Object destructuring; so "remainingTime" is an object
    const minutes = `${remainingTime.minutes}`.padStart(2, '0');
    const seconds = `${remainingTime.seconds}`.padStart(2, '0');

    const min = document.getElementById('js-minutes');
    const sec = document.getElementById('js-seconds');
    min.textContent = minutes;
    sec.textContent = seconds;

    const progress = document.getElementById('js-progress');
    progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;

    const text = timer.mode === 'pomodoro' ? 'Focus and keep on working!' : 'Time for a break!';
    document.title = `${minutes}:${seconds} — ${text}`;
}

function startTimer(){
    let {total} = timer.remainingTime;
    const endTime = Date.parse(new Date()) + total * 1000;

    if(timer.mode === 'pomodoro') { timer.sessions++; }
    mainButton.dataset.action = 'stop';
    mainButton.textContent = 'stop';
    mainButton.classList.add('active');

    interval = setInterval(()=>{
      timer.remainingTime = getRemainingTime(endTime);
      updateClock();

      total = timer.remainingTime.total;
      if(total <= 0){
        clearInterval(interval);

        switch(timer.mode){
          case 'pomodoro':
            if(timer.sessions % timer.longBreakInterval === 0){
              switchMode('longBreak');
            }
            else { 
              switchMode('shortBreak'); 
            }
            break;
          default:
            switchMode('pomodoro');    
        }
        mainButton.dataset.action = 'start';
        mainButton.textContent = 'start';
        mainButton.classList.remove('active');
        document.querySelector(`[data-sound="${timer.mode}"]`).play();
        if (Notification.permission === 'granted') {
          const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
          new Notification(text);
        }

      }
    }, 1000)
}

function stopTimer() {
  clearInterval(interval);
  mainButton.dataset.action = 'start';
  mainButton.textContent = 'start';
  mainButton.classList.remove('active');
}

function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;

    const total = Number.parseInt(difference / 1000, 10);
    /*
    const minutes = Number.parseInt((total / 60) % 60, 10); 
      ## Not sure why the modulo operation is used, so commenting the above line
    */
    const minutes = Number.parseInt((total / 60), 10); // I'm using this to calculate minutes 
    const seconds = Number.parseInt(total % 60, 10);

    return {
      total,
      minutes,
      seconds,
    };
}

document.addEventListener('DOMContentLoaded', () => {
  // Let's check if the browser supports notifications
  if ('Notification' in window) {
    // If notification permissions have neither been granted or denied
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      // ask the user for permission
      Notification.requestPermission().then(function(permission) {
        // If permission is granted
        if (permission === 'granted') {
          // Create a new notification
          new Notification(
            'Awesome! You will be notified at the start of each session'
          );
        }
      });
    }
  }
  switchMode('pomodoro');
});
