const translations = {
    en: {
        title: 'Timer',
        start: 'Start',
        pause: 'Pause',
        reset: 'Reset',
        setTime: 'Set Time',
        presetTimers: 'Preset Timers',
        customPresets: 'Custom Presets',
        savePreset: 'Save Current Time as Preset',
        use: 'Use',
        customMessage: 'Custom Message',
        saveMessage: 'Save Message',
        enterMessage: 'Enter custom completion message',
        soundSettings: 'Sound Settings',
        enableSound: 'Enable Sound',
        volume: 'Volume',
        soundTheme: 'Sound Theme',
        alarmSound: 'Alarm Sound',
        testSound: 'Test Sound',
        timerHistory: 'Timer History',
        clearHistory: 'Clear History',
        keyboardShortcuts: 'Keyboard Shortcuts',
        work: 'Work',
        shortBreak: 'Short Break',
        longBreak: 'Long Break',
        session: 'Session',
        timerFinished: 'Timer finished!',
        timerComplete: 'Your timer has completed.',
        workComplete: 'Work session complete! Time for a short break.',
        longBreakTime: 'Great job! Time for a long break!',
        breakOver: 'Break time over! Ready for the next work session?',
        messageSaved: 'Custom message saved!',
        messageCleared: 'Custom message cleared!',
        setTimerFirst: 'Please set a timer first!',
        clearHistoryConfirm: 'Clear all timer history?',
        warningMinute: '1 minute remaining!',
        warningSeconds: '30 seconds remaining!',
        shortcuts: {
            space: 'Start/Pause timer',
            r: 'Reset timer',
            s: 'Set timer from inputs',
            '1': 'Set 1 minute',
            '2': 'Set 5 minutes',
            '3': 'Set 10 minutes',
            d: 'Toggle dark mode',
            f: 'Toggle fullscreen'
        },
        presetTimes: {
            '60': '1 min',
            '300': '5 min',
            '600': '10 min',
            '900': '15 min',
            '1800': '30 min',
            '3600': '1 hour'
        },
        dataManagement: 'Data Management',
        exportData: 'Export Data',
        importData: 'Import Data',
        usageStatistics: 'Usage Statistics',
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        totalSessions: 'Total Sessions:',
        totalTime: 'Total Time:',
        averageSession: 'Average Session:'
    },
    ja: {
        title: 'タイマー',
        start: 'スタート',
        pause: '一時停止',
        reset: 'リセット',
        setTime: '時間をセット',
        presetTimers: 'プリセットタイマー',
        customPresets: 'カスタムプリセット',
        savePreset: '現在の時間をプリセットとして保存',
        use: '使用',
        customMessage: 'カスタムメッセージ',
        saveMessage: 'メッセージを保存',
        enterMessage: '完了時のカスタムメッセージを入力',
        soundSettings: 'サウンド設定',
        enableSound: 'サウンドを有効にする',
        volume: '音量',
        soundTheme: 'サウンドテーマ',
        alarmSound: 'アラーム音',
        testSound: 'テスト音',
        timerHistory: 'タイマー履歴',
        clearHistory: '履歴をクリア',
        keyboardShortcuts: 'キーボードショートカット',
        work: '作業',
        shortBreak: '短い休憩',
        longBreak: '長い休憩',
        session: 'セッション',
        timerFinished: 'タイマーが終了しました！',
        timerComplete: 'タイマーが完了しました。',
        workComplete: '作業セッション完了！短い休憩の時間です。',
        longBreakTime: 'お疲れ様でした！長い休憩の時間です！',
        breakOver: '休憩時間終了！次の作業セッションの準備はできましたか？',
        messageSaved: 'カスタムメッセージを保存しました！',
        messageCleared: 'カスタムメッセージをクリアしました！',
        setTimerFirst: '最初にタイマーを設定してください！',
        clearHistoryConfirm: 'すべてのタイマー履歴をクリアしますか？',
        warningMinute: '残り1分！',
        warningSeconds: '残り30秒！',
        shortcuts: {
            space: 'タイマーの開始/一時停止',
            r: 'タイマーをリセット',
            s: '入力値からタイマーを設定',
            '1': '1分に設定',
            '2': '5分に設定',
            '3': '10分に設定',
            d: 'ダークモード切り替え',
            f: 'フルスクリーン切り替え'
        },
        presetTimes: {
            '60': '1分',
            '300': '5分',
            '600': '10分',
            '900': '15分',
            '1800': '30分',
            '3600': '1時間'
        },
        dataManagement: 'データ管理',
        exportData: 'エクスポート',
        importData: 'インポート',
        usageStatistics: '使用統計',
        daily: '日別',
        weekly: '週別',
        monthly: '月別',
        totalSessions: 'セッション数:',
        totalTime: '合計時間:',
        averageSession: '平均時間:'
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    updateUI();
}

function updateUI() {
    const t = translations[currentLang];
    
    // Update static text
    document.querySelector('h1').textContent = t.title;
    document.getElementById('startBtn').textContent = t.start;
    document.getElementById('pauseBtn').textContent = t.pause;
    document.getElementById('resetBtn').textContent = t.reset;
    document.getElementById('setBtn').textContent = t.setTime;
    
    // Update section headers
    document.querySelector('.preset-timers h3').textContent = t.presetTimers;
    document.querySelector('.custom-presets h4').textContent = t.customPresets;
    document.getElementById('savePresetBtn').textContent = t.savePreset;
    
    document.querySelector('.message-settings h3').textContent = t.customMessage;
    document.getElementById('saveMessageBtn').textContent = t.saveMessage;
    document.getElementById('customMessage').placeholder = t.enterMessage;
    
    document.querySelector('.sound-settings h3').textContent = t.soundSettings;
    document.getElementById('testSoundBtn').textContent = t.testSound;
    
    document.querySelector('.timer-history h3').textContent = t.timerHistory;
    document.getElementById('clearHistoryBtn').textContent = t.clearHistory;
    
    document.querySelector('.keyboard-shortcuts h3').textContent = t.keyboardShortcuts;
    
    // Update preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        const time = btn.dataset.time;
        if (t.presetTimes[time]) {
            btn.textContent = t.presetTimes[time];
        }
    });
    
    // Update labels
    const soundEnabledLabel = document.querySelector('label:has(#soundEnabled)');
    if (soundEnabledLabel) {
        soundEnabledLabel.childNodes[2].textContent = ' ' + t.enableSound;
    }
    
    const volumeLabel = document.querySelector('label:has(#volumeSlider)');
    if (volumeLabel) {
        volumeLabel.childNodes[0].textContent = t.volume + ':';
    }
    
    const soundThemeLabel = document.querySelector('label:has(#soundTheme)');
    if (soundThemeLabel) {
        soundThemeLabel.childNodes[0].textContent = t.soundTheme + ':';
    }
    
    const alarmSoundLabel = document.querySelector('label:has(#soundSelect)');
    if (alarmSoundLabel) {
        alarmSoundLabel.childNodes[0].textContent = t.alarmSound + ':';
    }
    
    // Update shortcuts
    const shortcutsList = document.querySelector('.keyboard-shortcuts ul');
    if (shortcutsList) {
        shortcutsList.innerHTML = `
            <li><kbd>Space</kbd> - ${t.shortcuts.space}</li>
            <li><kbd>R</kbd> - ${t.shortcuts.r}</li>
            <li><kbd>S</kbd> - ${t.shortcuts.s}</li>
            <li><kbd>1</kbd> - ${t.shortcuts['1']}</li>
            <li><kbd>2</kbd> - ${t.shortcuts['2']}</li>
            <li><kbd>3</kbd> - ${t.shortcuts['3']}</li>
            <li><kbd>D</kbd> - ${t.shortcuts.d}</li>
            <li><kbd>F</kbd> - ${t.shortcuts.f}</li>
        `;
    }
    
    // Update placeholders
    document.getElementById('hours').placeholder = currentLang === 'ja' ? '時' : 'H';
    document.getElementById('minutes').placeholder = currentLang === 'ja' ? '分' : 'M';
    document.getElementById('seconds').placeholder = currentLang === 'ja' ? '秒' : 'S';
    
    // Update data management section
    const dataManagementEl = document.querySelector('.data-management h3');
    if (dataManagementEl) {
        dataManagementEl.textContent = t.dataManagement;
    }
    
    const exportBtnEl = document.getElementById('exportBtn');
    if (exportBtnEl) {
        exportBtnEl.textContent = t.exportData;
    }
    
    const importBtnEl = document.getElementById('importBtn');
    if (importBtnEl) {
        importBtnEl.textContent = t.importData;
    }
    
    // Update statistics section
    const statsEl = document.querySelector('.statistics h3');
    if (statsEl) {
        statsEl.textContent = t.usageStatistics;
    }
    
    document.querySelectorAll('.stats-btn').forEach(btn => {
        const period = btn.dataset.period;
        if (period === 'day') btn.textContent = t.daily;
        else if (period === 'week') btn.textContent = t.weekly;
        else if (period === 'month') btn.textContent = t.monthly;
    });
    
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels.length >= 3) {
        statLabels[0].textContent = t.totalSessions;
        statLabels[1].textContent = t.totalTime;
        statLabels[2].textContent = t.averageSession;
    }
}

function getText(key) {
    const keys = key.split('.');
    let value = translations[currentLang];
    for (const k of keys) {
        value = value[k];
    }
    return value || key;
}

// Initialize language
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
});