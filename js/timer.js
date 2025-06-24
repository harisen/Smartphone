let timerInterval = null;
let totalSeconds = 0;
let isRunning = false;

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

const savePresetBtn = document.getElementById('savePresetBtn');
const customPresetsList = document.getElementById('customPresetsList');
const themeToggle = document.getElementById('themeToggle');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const sounds = {
    beep: function(duration = 200) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        gainNode.gain.value = volumeSlider.value / 100;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration / 1000);
    },
    bell: function(duration = 300) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(volumeSlider.value / 100, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration / 1000);
    },
    chime: function(duration = 500) {
        const frequencies = [523.25, 659.25, 783.99];
        frequencies.forEach((freq, i) => {
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

function updateDisplay() {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    display.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timerInterval = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds--;
                updateDisplay();
                
                if (totalSeconds === 0) {
                    pauseTimer();
                    playAlarmSound();
                    setTimeout(() => {
                        alert('Timer finished!');
                    }, 100);
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
}

function resetTimer() {
    pauseTimer();
    totalSeconds = 0;
    updateDisplay();
}

function setTimer() {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
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

themeToggle.addEventListener('click', toggleTheme);

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

initTheme();
loadCustomPresets();
updateDisplay();