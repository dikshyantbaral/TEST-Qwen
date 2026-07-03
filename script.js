// DOM Elements
const currentDateEl = document.getElementById('currentDate');
const streakCountEl = document.getElementById('streakCount');
const completedTasksEl = document.getElementById('completedTasks');
const totalTasksEl = document.getElementById('totalTasks');
const taskPercentageEl = document.getElementById('taskPercentage');
const taskProgressEl = document.getElementById('taskProgress');
const studyTimeEl = document.getElementById('studyTime');
const weeklyProgressEl = document.getElementById('weeklyProgress');

// Modal Elements
const studyModal = document.getElementById('studyModal');
const startStudyBtn = document.getElementById('startStudyBtn');
const closeModalBtn = document.getElementById('closeModal');
const timerDisplay = document.getElementById('timerDisplay');
const startTimerBtn = document.getElementById('startTimer');
const pauseTimerBtn = document.getElementById('pauseTimer');
const resetTimerBtn = document.getElementById('resetTimer');
const modeBtns = document.querySelectorAll('.mode-btn');

// Task List Elements
const taskList = document.getElementById('taskList');
const checkboxes = taskList.querySelectorAll('input[type="checkbox"]');

// Display Current Date
function displayDate() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const today = new Date();
    currentDateEl.textContent = today.toLocaleDateString('en-US', options);
}

// Update Progress Ring
function updateProgressRing(completed, total) {
    const percentage = Math.round((completed / total) * 100);
    const circumference = 2 * Math.PI * 26; // r = 26
    const offset = circumference - (percentage / 100) * circumference;
    
    taskProgressEl.style.strokeDashoffset = offset;
    taskPercentageEl.textContent = `${percentage}%`;
}

// Initialize Stats from LocalStorage or Defaults
function initializeStats() {
    // Load or set default streak
    let streak = localStorage.getItem('studyStreak') || 12;
    streakCountEl.textContent = streak;
    
    // Load or set default tasks
    let completedTasks = localStorage.getItem('completedTasks') || 5;
    let totalTasks = localStorage.getItem('totalTasks') || 8;
    
    completedTasksEl.textContent = completedTasks;
    totalTasksEl.textContent = totalTasks;
    updateProgressRing(parseInt(completedTasks), parseInt(totalTasks));
    
    // Load or set study time
    let studyTime = localStorage.getItem('studyTime') || '4h 30m';
    studyTimeEl.textContent = studyTime;
    
    // Load or set weekly progress
    let weeklyProgress = localStorage.getItem('weeklyProgress') || 78;
    weeklyProgressEl.textContent = `${weeklyProgress}%`;
}

// Timer Variables
let timerInterval = null;
let timeLeft = 25 * 60; // 25 minutes in seconds
let isRunning = false;
let currentMode = 'Focus';

// Format Time for Display
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Update Timer Display
function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(timeLeft);
    document.title = `${formatTime(timeLeft)} - Pragati`;
}

// Start Timer
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startTimerBtn.disabled = true;
        pauseTimerBtn.disabled = false;
        
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                // Timer completed
                clearInterval(timerInterval);
                isRunning = false;
                startTimerBtn.disabled = false;
                pauseTimerBtn.disabled = true;
                
                // Play notification sound (optional)
                alert(`${currentMode} session completed!`);
                
                // Update study time
                updateStudyTime();
            }
        }, 1000);
    }
}

// Pause Timer
function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        clearInterval(timerInterval);
        startTimerBtn.disabled = false;
        pauseTimerBtn.disabled = true;
    }
}

// Reset Timer
function resetTimer() {
    pauseTimer();
    const activeMode = document.querySelector('.mode-btn.active');
    timeLeft = parseInt(activeMode.dataset.time) * 60;
    updateTimerDisplay();
}

// Change Timer Mode
function changeMode(e) {
    if (e.target.classList.contains('mode-btn')) {
        modeBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        currentMode = e.target.textContent;
        timeLeft = parseInt(e.target.dataset.time) * 60;
        updateTimerDisplay();
        
        // Reset timer state
        pauseTimer();
        startTimerBtn.disabled = false;
    }
}

// Update Study Time in LocalStorage
function updateStudyTime() {
    // Parse current study time and add 25 minutes (default focus session)
    let currentTime = studyTimeEl.textContent;
    let hours = 0;
    let minutes = 0;
    
    if (currentTime.includes('h')) {
        const parts = currentTime.split(' ');
        hours = parseInt(parts[0]);
        minutes = parseInt(parts[1]);
    } else {
        minutes = parseInt(currentTime);
    }
    
    minutes += 25;
    if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
        minutes = minutes % 60;
    }
    
    const newTime = `${hours}h ${minutes}m`;
    studyTimeEl.textContent = newTime;
    localStorage.setItem('studyTime', newTime);
}

// Handle Task Checkbox Changes
function handleTaskChange(e) {
    const taskItem = e.target.closest('.task-item');
    const completedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    const totalCount = checkboxes.length;
    
    // Update task item styling
    if (e.target.checked) {
        taskItem.classList.add('completed');
        taskItem.classList.remove('active');
    } else {
        taskItem.classList.remove('completed');
    }
    
    // Update stats
    completedTasksEl.textContent = completedCount;
    totalTasksEl.textContent = totalCount;
    updateProgressRing(completedCount, totalCount);
    
    // Save to localStorage
    localStorage.setItem('completedTasks', completedCount);
    localStorage.setItem('totalTasks', totalCount);
    
    // Check if all tasks completed - increase streak
    if (completedCount === totalCount && totalCount > 0) {
        let streak = parseInt(streakCountEl.textContent);
        streak++;
        streakCountEl.textContent = streak;
        localStorage.setItem('studyStreak', streak);
    }
}

// Open Modal
function openModal() {
    studyModal.classList.add('active');
}

// Close Modal
function closeModal() {
    studyModal.classList.remove('active');
    pauseTimer();
    document.title = 'Pragati - Study Planner';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    displayDate();
    initializeStats();
    updateTimerDisplay();
    
    // Modal events
    startStudyBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal on outside click
    studyModal.addEventListener('click', (e) => {
        if (e.target === studyModal) {
            closeModal();
        }
    });
    
    // Timer events
    startTimerBtn.addEventListener('click', startTimer);
    pauseTimerBtn.addEventListener('click', pauseTimer);
    resetTimerBtn.addEventListener('click', resetTimer);
    
    // Mode buttons
    modeBtns.forEach(btn => {
        btn.addEventListener('click', changeMode);
    });
    
    // Task checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleTaskChange);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && studyModal.classList.contains('active')) {
            closeModal();
        }
    });
});

// Animate Stats on Load
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const finalValue = stat.textContent;
        const numericValue = parseInt(finalValue.replace(/\D/g, ''));
        
        if (numericValue) {
            let currentValue = 0;
            const increment = numericValue / 50;
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= numericValue) {
                    currentValue = numericValue;
                    clearInterval(timer);
                }
                
                if (finalValue.includes('%')) {
                    stat.textContent = `${Math.round(currentValue)}%`;
                } else if (finalValue.includes('h')) {
                    stat.textContent = finalValue;
                } else {
                    stat.textContent = Math.round(currentValue);
                }
            }, 30);
        }
    });
}

// Run animation after page load
setTimeout(animateStats, 500);

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        if (navLinks.style.display === 'flex') {
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.background = 'var(--bg-secondary)';
            navLinks.style.padding = '1rem';
            navLinks.style.gap = '1rem';
        }
    });
}

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add hover effect to stat cards
const statCards = document.querySelectorAll('.stat-card');
statCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        statCards.forEach(c => {
            if (c !== card) {
                c.style.opacity = '0.7';
            }
        });
    });
    
    card.addEventListener('mouseleave', () => {
        statCards.forEach(c => {
            c.style.opacity = '1';
        });
    });
});

console.log('🎓 Pragati Study Planner initialized successfully!');
