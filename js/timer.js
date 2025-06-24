let timerInterval = null;
let totalSeconds = 0;
let initialSeconds = 0;
let isRunning = false;

let pomodoroMode = false;
let pomodoroPhase = 'work';
let pomodoroSession = 1;
const POMODORO_WORK = 25 * 60;
const POMODORO_SHORT_BREAK = 5 * 60;
const POMODORO_LONG_BREAK = 15 * 60;

let warningPlayed60 = false;
let warningPlayed30 = false;

const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const setBtn = document.getElementById('setBtn');
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');

const soundEnabled = document.getElementById('soundEnabled');
const volumeSlider = document.getElementById('volumeSlider');
const volumeDisplay = document.getElementById('volumeDisplay');
const soundSelect = document.getElementById('soundSelect');
const testSoundBtn = document.getElementById('testSoundBtn');
const soundTheme = document.getElementById('soundTheme');

const savePresetBtn = document.getElementById('savePresetBtn');
const customPresetsList = document.getElementById('customPresetsList');
const themeToggle = document.getElementById('themeToggle');
const pomodoroBtn = document.getElementById('pomodoroBtn');
const pomodoroStatus = document.getElementById('pomodoroStatus');
const pomodoroPhaseEl = document.getElementById('pomodoroPhase');
const pomodoroSessionEl = document.getElementById('pomodoroSession');
const fullscreenBtn = document.getElementById('fullscreenBtn');

const progressBar = document.getElementById('progressBar');
const progressRing = document.querySelector('.progress-ring__progress');
const radius = progressRing.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
progressRing.style.strokeDashoffset = circumference;

const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

const customMessageInput = document.getElementById('customMessage');
const saveMessageBtn = document.getElementById('saveMessageBtn');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const soundThemes = {
    default: {
        beep: { freq: 800, duration: 200 },
        bell: { freq: [1200, 600], duration: 300 },
        chime: { freq: [523.25, 659.25, 783.99], duration: 500 }
    },
    nature: {
        beep: { freq: 440, duration: 300 },
        bell: { freq: [660, 440], duration: 400 },
        chime: { freq: [440, 554.37, 659.25], duration: 600 }
    },
    digital: {
        beep: { freq: 1000, duration: 150 },
        bell: { freq: [1500, 1000], duration: 200 },
        chime: { freq: [1046.50, 1318.51, 1567.98], duration: 400 }
    },
    classic: {
        beep: { freq: 600, duration: 250 },
        bell: { freq: [800, 400], duration: 350 },
        chime: { freq: [392, 523.25, 659.25], duration: 550 }
    }
};

const sounds = {
    beep: function() {
        const theme = soundThemes[soundTheme.value].beep;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = theme.freq;
        gainNode.gain.value = volumeSlider.value / 100;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + theme.duration / 1000);
    },
    warning: function(duration = 100) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 600;
        gainNode.gain.value = (volumeSlider.value / 100) * 0.5;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration / 1000);
    },
    bell: function() {
        const theme = soundThemes[soundTheme.value].bell;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(theme.freq[0], audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(theme.freq[1], audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(volumeSlider.value / 100, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + theme.duration / 1000);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + theme.duration / 1000);
    },
    chime: function() {
        const theme = soundThemes[soundTheme.value].chime;
        theme.freq.forEach((freq, i) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                gainNode.gain.value = volumeSlider.value / 100;
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.5);
            }, i * 150);
        });
    }
};

function playAlarmSound() {
    if (soundEnabled.checked) {
        const selectedSound = soundSelect.value;
        sounds[selectedSound]();
    }
}

function playWarningSound() {
    if (soundEnabled.checked) {
        sounds.warning();
    }
}

function updateDisplay() {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    display.textContent = timeString;
    
    updateProgress();
    updateTabTitle(timeString);
}

function updateTabTitle(timeString) {
    if (isRunning && totalSeconds > 0) {
        if (pomodoroMode) {
            const phase = pomodoroPhaseEl.textContent;
            document.title = `${timeString} - ${phase} | Timer`;
        } else {
            document.title = `${timeString} | Timer`;
        }
    } else {
        document.title = 'Simple Timer';
    }
}

function updateProgress() {
    if (initialSeconds > 0) {
        const progress = (initialSeconds - totalSeconds) / initialSeconds;
        const progressPercent = progress * 100;
        
        progressBar.style.width = `${progressPercent}%`;
        
        const offset = circumference - (progress * circumference);
        progressRing.style.strokeDashoffset = offset;
    } else {
        progressBar.style.width = '0%';
        progressRing.style.strokeDashoffset = circumference;
    }
}

function startTimer() {
    if (!isRunning && totalSeconds > 0) {
        isRunning = true;
        if (initialSeconds === 0) {
            initialSeconds = totalSeconds;
        }
        warningPlayed60 = false;
        warningPlayed30 = false;
        
        timerInterval = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds--;
                updateDisplay();
                
                if (totalSeconds === 60 && !warningPlayed60) {
                    playWarningSound();
                    warningPlayed60 = true;
                    showNotification('Timer Warning', '1 minute remaining!');
                } else if (totalSeconds === 30 && !warningPlayed30) {
                    playWarningSound();
                    warningPlayed30 = true;
                    showNotification('Timer Warning', '30 seconds remaining!');
                }
                
                if (totalSeconds === 0) {
                    pauseTimer();
                    playAlarmSound();
                    showNotification();
                    saveToHistory(initialSeconds);
                    
                    if (pomodoroMode) {
                        handlePomodoroPhaseEnd();
                    } else {
                        const customMessage = localStorage.getItem('customTimerMessage') || 'Timer finished!';
                        setTimeout(() => {
                            alert(customMessage);
                        }, 100);
                    }
                }
            }
        }, 1000);
    }
}

function pauseTimer() {
    isRunning = false;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    document.title = 'Simple Timer';
}

function resetTimer() {
    pauseTimer();
    totalSeconds = 0;
    initialSeconds = 0;
    updateDisplay();
}

function setTimer() {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
    initialSeconds = 0;
    updateDisplay();
    
    hoursInput.value = '';
    minutesInput.value = '';
    secondsInput.value = '';
}

function loadCustomPresets() {
    const presets = JSON.parse(localStorage.getItem('customPresets') || '[]');
    customPresetsList.innerHTML = '';
    
    presets.forEach((preset, index) => {
        const presetItem = document.createElement('div');
        presetItem.className = 'custom-preset-item';
        
        const timeText = formatTime(preset);
        
        presetItem.innerHTML = `
            <span>${timeText}</span>
            <button onclick="setPresetTime(${preset})">Use</button>
            <button onclick="deletePreset(${index})">×</button>
        `;
        
        customPresetsList.appendChild(presetItem);
    });
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let timeStr = '';
    if (hours > 0) timeStr += `${hours}h `;
    if (minutes > 0) timeStr += `${minutes}m `;
    if (secs > 0) timeStr += `${secs}s`;
    
    return timeStr.trim() || '0s';
}

function saveCustomPreset() {
    if (totalSeconds === 0) {
        alert('Please set a timer first!');
        return;
    }
    
    const presets = JSON.parse(localStorage.getItem('customPresets') || '[]');
    
    if (!presets.includes(totalSeconds)) {
        presets.push(totalSeconds);
        localStorage.setItem('customPresets', JSON.stringify(presets));
        loadCustomPresets();
    }
}

window.setPresetTime = function(seconds) {
    totalSeconds = seconds;
    initialSeconds = 0;
    updateDisplay();
};

window.deletePreset = function(index) {
    const presets = JSON.parse(localStorage.getItem('customPresets') || '[]');
    presets.splice(index, 1);
    localStorage.setItem('customPresets', JSON.stringify(presets));
    loadCustomPresets();
};

document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        totalSeconds = parseInt(btn.dataset.time);
        initialSeconds = 0;
        updateDisplay();
    });
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            document.body.classList.add('fullscreen');
            fullscreenBtn.textContent = '⛶';
        });
    } else {
        document.exitFullscreen().then(() => {
            document.body.classList.remove('fullscreen');
            fullscreenBtn.textContent = '⛶';
        });
    }
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function showNotification(title = 'Timer Finished!', body = null) {
    if ('Notification' in window && Notification.permission === 'granted') {
        if (!body && title === 'Timer Finished!') {
            body = localStorage.getItem('customTimerMessage') || 'Your timer has completed.';
        } else if (!body) {
            body = 'Your timer has completed.';
        }
        
        const notification = new Notification(title, {
            body: body,
            icon: '/icon-192.svg',
            badge: '/icon-192.svg',
            vibrate: [200, 100, 200]
        });
        
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
    }
}

function saveToHistory(duration) {
    const history = JSON.parse(localStorage.getItem('timerHistory') || '[]');
    const now = new Date();
    
    history.unshift({
        duration: duration,
        timestamp: now.getTime(),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString()
    });
    
    if (history.length > 20) {
        history.pop();
    }
    
    localStorage.setItem('timerHistory', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('timerHistory') || '[]');
    historyList.innerHTML = '';
    
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const timeText = formatTime(item.duration);
        
        historyItem.innerHTML = `
            <div>
                <span class="time">${timeText}</span>
            </div>
            <div class="date">${item.date} ${item.time}</div>
        `;
        
        historyList.appendChild(historyItem);
    });
}

function clearHistory() {
    if (confirm('Clear all timer history?')) {
        localStorage.removeItem('timerHistory');
        loadHistory();
    }
}

function togglePomodoroMode() {
    pomodoroMode = !pomodoroMode;
    pomodoroBtn.classList.toggle('active');
    
    if (pomodoroMode) {
        pomodoroStatus.style.display = 'block';
        startPomodoroSession();
    } else {
        pomodoroStatus.style.display = 'none';
        resetTimer();
    }
}

function startPomodoroSession() {
    if (pomodoroPhase === 'work') {
        totalSeconds = POMODORO_WORK;
        pomodoroPhaseEl.textContent = 'Work';
    } else if (pomodoroPhase === 'shortBreak') {
        totalSeconds = POMODORO_SHORT_BREAK;
        pomodoroPhaseEl.textContent = 'Short Break';
    } else {
        totalSeconds = POMODORO_LONG_BREAK;
        pomodoroPhaseEl.textContent = 'Long Break';
    }
    
    initialSeconds = 0;
    updateDisplay();
}

function handlePomodoroPhaseEnd() {
    if (pomodoroPhase === 'work') {
        if (pomodoroSession % 4 === 0) {
            pomodoroPhase = 'longBreak';
            alert('Great job! Time for a long break!');
        } else {
            pomodoroPhase = 'shortBreak';
            alert('Work session complete! Time for a short break.');
        }
    } else {
        pomodoroPhase = 'work';
        if (pomodoroPhase === 'longBreak') {
            pomodoroSession = 1;
        } else {
            pomodoroSession++;
        }
        pomodoroSessionEl.textContent = pomodoroSession;
        alert('Break time over! Ready for the next work session?');
    }
    
    startPomodoroSession();
}

themeToggle.addEventListener('click', toggleTheme);
pomodoroBtn.addEventListener('click', togglePomodoroMode);
fullscreenBtn.addEventListener('click', toggleFullscreen);

savePresetBtn.addEventListener('click', saveCustomPreset);

volumeSlider.addEventListener('input', () => {
    volumeDisplay.textContent = volumeSlider.value + '%';
});

testSoundBtn.addEventListener('click', () => {
    playAlarmSound();
});

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
setBtn.addEventListener('click', setTimer);
clearHistoryBtn.addEventListener('click', clearHistory);

document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (isRunning) {
            pauseTimer();
        } else if (totalSeconds > 0) {
            startTimer();
        }
    } else if (e.key === 'r' || e.key === 'R') {
        resetTimer();
    } else if (e.key === 's' || e.key === 'S') {
        setTimer();
    } else if (e.key === '1') {
        totalSeconds = 60;
        initialSeconds = 0;
        updateDisplay();
    } else if (e.key === '2') {
        totalSeconds = 300;
        initialSeconds = 0;
        updateDisplay();
    } else if (e.key === '3') {
        totalSeconds = 600;
        initialSeconds = 0;
        updateDisplay();
    } else if (e.key === 'd' || e.key === 'D') {
        toggleTheme();
    } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
    }
});

function loadCustomMessage() {
    const savedMessage = localStorage.getItem('customTimerMessage');
    if (savedMessage) {
        customMessageInput.value = savedMessage;
    }
}

function saveCustomMessage() {
    const message = customMessageInput.value.trim();
    if (message) {
        localStorage.setItem('customTimerMessage', message);
        alert('Custom message saved!');
    } else {
        localStorage.removeItem('customTimerMessage');
        alert('Custom message cleared!');
    }
}

saveMessageBtn.addEventListener('click', saveCustomMessage);

initTheme();
loadCustomPresets();
loadHistory();
loadCustomMessage();
updateDisplay();
requestNotificationPermission();