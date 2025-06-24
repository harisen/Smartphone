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
const langToggle = document.getElementById('langToggle');

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

const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

const statsChart = document.getElementById('statsChart');
const ctx = statsChart.getContext('2d');
let currentStatsPeriod = 'day';

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
                    display.classList.add('warning');
                    showNotification('Timer Warning', getText('warningMinute'));
                } else if (totalSeconds === 30 && !warningPlayed30) {
                    playWarningSound();
                    warningPlayed30 = true;
                    showNotification('Timer Warning', getText('warningSeconds'));
                }
                
                if (totalSeconds === 0) {
                    pauseTimer();
                    playAlarmSound();
                    showNotification();
                    saveToHistory(initialSeconds);
                    
                    if (pomodoroMode) {
                        handlePomodoroPhaseEnd();
                    } else {
                        const customMessage = localStorage.getItem('customTimerMessage') || getText('timerFinished');
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
    display.classList.remove('warning');
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
            <button onclick="setPresetTime(${preset})">${getText('use')}</button>
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
        alert(getText('setTimerFirst'));
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

function showNotification(title = null, body = null) {
    if ('Notification' in window && Notification.permission === 'granted') {
        if (!title) {
            title = getText('timerFinished');
        }
        if (!body && title === getText('timerFinished')) {
            body = localStorage.getItem('customTimerMessage') || getText('timerComplete');
        } else if (!body) {
            body = getText('timerComplete');
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
    updateStatistics();
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
    if (confirm(getText('clearHistoryConfirm'))) {
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
        pomodoroPhaseEl.textContent = getText('work');
    } else if (pomodoroPhase === 'shortBreak') {
        totalSeconds = POMODORO_SHORT_BREAK;
        pomodoroPhaseEl.textContent = getText('shortBreak');
    } else {
        totalSeconds = POMODORO_LONG_BREAK;
        pomodoroPhaseEl.textContent = getText('longBreak');
    }
    
    initialSeconds = 0;
    updateDisplay();
}

function handlePomodoroPhaseEnd() {
    if (pomodoroPhase === 'work') {
        if (pomodoroSession % 4 === 0) {
            pomodoroPhase = 'longBreak';
            alert(getText('longBreakTime'));
        } else {
            pomodoroPhase = 'shortBreak';
            alert(getText('workComplete'));
        }
    } else {
        pomodoroPhase = 'work';
        if (pomodoroPhase === 'longBreak') {
            pomodoroSession = 1;
        } else {
            pomodoroSession++;
        }
        pomodoroSessionEl.textContent = pomodoroSession;
        alert(getText('breakOver'));
    }
    
    startPomodoroSession();
}

themeToggle.addEventListener('click', toggleTheme);
pomodoroBtn.addEventListener('click', togglePomodoroMode);
fullscreenBtn.addEventListener('click', toggleFullscreen);
langToggle.addEventListener('click', toggleLanguage);

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
        alert(getText('messageSaved'));
    } else {
        localStorage.removeItem('customTimerMessage');
        alert(getText('messageCleared'));
    }
}

function toggleLanguage() {
    const newLang = currentLang === 'en' ? 'ja' : 'en';
    setLanguage(newLang);
    langToggle.textContent = newLang.toUpperCase();
    
    // Update Pomodoro phase text if in Pomodoro mode
    if (pomodoroMode) {
        if (pomodoroPhase === 'work') {
            pomodoroPhaseEl.textContent = getText('work');
        } else if (pomodoroPhase === 'shortBreak') {
            pomodoroPhaseEl.textContent = getText('shortBreak');
        } else {
            pomodoroPhaseEl.textContent = getText('longBreak');
        }
    }
    
    // Reload custom presets to update "Use" button text
    loadCustomPresets();
    
    // Update statistics to refresh the chart labels
    updateStatistics();
}

function exportData() {
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        settings: {
            theme: localStorage.getItem('theme') || 'light',
            language: localStorage.getItem('language') || 'en',
            customMessage: localStorage.getItem('customTimerMessage') || '',
            soundEnabled: soundEnabled.checked,
            volume: volumeSlider.value,
            soundTheme: soundTheme.value,
            soundSelect: soundSelect.value
        },
        customPresets: JSON.parse(localStorage.getItem('customPresets') || '[]'),
        timerHistory: JSON.parse(localStorage.getItem('timerHistory') || '[]')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timer-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.version !== '1.0') {
                alert('Incompatible file version');
                return;
            }
            
            if (confirm('This will replace all your current settings and data. Continue?')) {
                // Import settings
                if (data.settings) {
                    if (data.settings.theme) {
                        localStorage.setItem('theme', data.settings.theme);
                        document.body.classList.toggle('dark-mode', data.settings.theme === 'dark');
                        themeToggle.textContent = data.settings.theme === 'dark' ? '☀️' : '🌙';
                    }
                    
                    if (data.settings.language) {
                        localStorage.setItem('language', data.settings.language);
                        setLanguage(data.settings.language);
                        langToggle.textContent = data.settings.language.toUpperCase();
                    }
                    
                    if (data.settings.customMessage !== undefined) {
                        localStorage.setItem('customTimerMessage', data.settings.customMessage);
                        customMessageInput.value = data.settings.customMessage;
                    }
                    
                    if (data.settings.soundEnabled !== undefined) {
                        soundEnabled.checked = data.settings.soundEnabled;
                    }
                    
                    if (data.settings.volume !== undefined) {
                        volumeSlider.value = data.settings.volume;
                        volumeDisplay.textContent = data.settings.volume + '%';
                    }
                    
                    if (data.settings.soundTheme) {
                        soundTheme.value = data.settings.soundTheme;
                    }
                    
                    if (data.settings.soundSelect) {
                        soundSelect.value = data.settings.soundSelect;
                    }
                }
                
                // Import custom presets
                if (data.customPresets) {
                    localStorage.setItem('customPresets', JSON.stringify(data.customPresets));
                    loadCustomPresets();
                }
                
                // Import timer history
                if (data.timerHistory) {
                    localStorage.setItem('timerHistory', JSON.stringify(data.timerHistory));
                    loadHistory();
                }
                
                alert('Data imported successfully!');
                updateStatistics();
            }
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function getStatisticsData(period) {
    const history = JSON.parse(localStorage.getItem('timerHistory') || '[]');
    const now = new Date();
    const data = [];
    const labels = [];
    
    let startDate;
    if (period === 'day') {
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        
        // Create hourly buckets for the last 24 hours
        for (let i = 0; i < 24; i++) {
            labels.push(`${i}:00`);
            data.push(0);
        }
        
        // Aggregate data by hour
        history.forEach(item => {
            const itemDate = new Date(item.timestamp);
            if (itemDate >= startDate && itemDate <= now) {
                const hour = itemDate.getHours();
                data[hour] += item.duration;
            }
        });
    } else if (period === 'week') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        
        // Create daily buckets for the last 7 days
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            labels.push(days[date.getDay()]);
            data.push(0);
        }
        
        // Aggregate data by day
        history.forEach(item => {
            const itemDate = new Date(item.timestamp);
            if (itemDate >= startDate && itemDate <= now) {
                const daysDiff = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));
                const index = 6 - daysDiff;
                if (index >= 0 && index < 7) {
                    data[index] += item.duration;
                }
            }
        });
    } else if (period === 'month') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        
        // Create daily buckets for the last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
            data.push(0);
        }
        
        // Aggregate data by day
        history.forEach(item => {
            const itemDate = new Date(item.timestamp);
            if (itemDate >= startDate && itemDate <= now) {
                const daysDiff = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));
                const index = 29 - daysDiff;
                if (index >= 0 && index < 30) {
                    data[index] += item.duration;
                }
            }
        });
    }
    
    // Convert seconds to minutes for display
    const dataInMinutes = data.map(seconds => Math.round(seconds / 60));
    
    return { labels, data: dataInMinutes };
}

function drawChart(labels, data) {
    const canvas = statsChart;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set up chart dimensions
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Find max value for scaling
    const maxValue = Math.max(...data, 1); // Ensure at least 1 to avoid division by zero
    
    // Draw axes
    ctx.strokeStyle = document.body.classList.contains('dark-mode') ? '#666' : '#ccc';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw bars
    const barWidth = chartWidth / labels.length;
    const barPadding = barWidth * 0.2;
    
    ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#4a90e2' : '#3498db';
    
    data.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + index * barWidth + barPadding / 2;
        const y = height - padding - barHeight;
        
        ctx.fillRect(x, y, barWidth - barPadding, barHeight);
    });
    
    // Draw labels
    ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#f0f0f0' : '#333';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    // X-axis labels
    labels.forEach((label, index) => {
        if (currentStatsPeriod === 'day' && index % 4 !== 0) return; // Show every 4th hour
        if (currentStatsPeriod === 'month' && index % 5 !== 0) return; // Show every 5th day
        
        const x = padding + index * barWidth + barWidth / 2;
        const y = height - padding + 15;
        
        ctx.fillText(label, x, y);
    });
    
    // Y-axis labels
    ctx.textAlign = 'right';
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
        const value = Math.round((maxValue / ySteps) * i);
        const y = height - padding - (i / ySteps) * chartHeight;
        
        ctx.fillText(`${value}m`, padding - 5, y + 3);
    }
}

function updateStatistics() {
    const history = JSON.parse(localStorage.getItem('timerHistory') || '[]');
    const { labels, data } = getStatisticsData(currentStatsPeriod);
    
    // Draw chart
    drawChart(labels, data);
    
    // Calculate summary statistics
    let totalSessions = 0;
    let totalTime = 0;
    
    const now = new Date();
    let startDate;
    
    if (currentStatsPeriod === 'day') {
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
    } else if (currentStatsPeriod === 'week') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
    } else {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
    }
    
    history.forEach(item => {
        const itemDate = new Date(item.timestamp);
        if (itemDate >= startDate && itemDate <= now) {
            totalSessions++;
            totalTime += item.duration;
        }
    });
    
    // Update summary display
    document.getElementById('totalSessions').textContent = totalSessions;
    
    const totalHours = Math.floor(totalTime / 3600);
    const totalMinutes = Math.floor((totalTime % 3600) / 60);
    document.getElementById('totalTime').textContent = `${totalHours}h ${totalMinutes}m`;
    
    const avgTime = totalSessions > 0 ? Math.round(totalTime / totalSessions / 60) : 0;
    document.getElementById('avgSession').textContent = `${avgTime}m`;
}

saveMessageBtn.addEventListener('click', saveCustomMessage);

exportBtn.addEventListener('click', exportData);
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        importData(e.target.files[0]);
    }
});

document.querySelectorAll('.stats-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.stats-btn.active').classList.remove('active');
        btn.classList.add('active');
        currentStatsPeriod = btn.dataset.period;
        updateStatistics();
    });
});

initTheme();

// Initialize language
const savedLang = localStorage.getItem('language') || 'en';
currentLang = savedLang;
langToggle.textContent = savedLang.toUpperCase();

// Wait for DOM to be ready for language initialization
setTimeout(() => {
    updateUI();
    loadCustomPresets();
    loadHistory();
    loadCustomMessage();
    updateDisplay();
    requestNotificationPermission();
    updateStatistics();
}, 100);