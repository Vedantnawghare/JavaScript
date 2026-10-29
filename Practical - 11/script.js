/**
 * ==============================================================================
 * PRACTICAL 11: DYNAMIC COUNTDOWN & LIVE CLASS SCHEDULER
 * ==============================================================================
 * Key Lab Concepts Implemented:
 * 1. JavaScript Timers:
 *    - setInterval() : Repeated execution every second for clocks & countdowns.
 *    - clearInterval(): Stops the interval to prevent memory leaks and multiple ticks.
 *    - setTimeout()   : Delayed single-shot execution for notifications & snooze.
 *    - clearTimeout() : Cancels pending timeouts if an action is reset.
 * 2. ES6 Modules:
 *    - export : Exposes helper functions, calculations, and classes to external code.
 *    - import : Imports configuration settings and date utilities from an ES6 module.
 * 3. Real-Time Dynamic Updates & Local Storage Persistence.
 * ==============================================================================
 */

// ==============================================================================
// 1. ES6 MODULE IMPORT
// Here we demonstrate ES6 'import' syntax by importing configuration constants
// and date formatting utilities from an inline module string.
// ==============================================================================
import { APP_CONFIG, formatDisplayDate } from 'data:text/javascript;charset=utf-8,export const APP_CONFIG = { defaultFocusMinutes: 25, tickInterval: 1000, notificationDuration: 4000 }; export function formatDisplayDate(date) { const options = { weekday: "long", year: "numeric", month: "short", day: "numeric" }; return date.toLocaleDateString(undefined, options); }';

// ==============================================================================
// 2. ES6 MODULE EXPORTS
// These pure calculation and formatting functions are exported according to
// the ES6 module standard so they can be reused across any project.
// ==============================================================================

/**
 * Formats a single number into a two-digit string (e.g., 5 -> "05").
 * @param {number} num 
 * @returns {string}
 */
export function formatTwoDigits(num) {
  return String(num).padStart(2, '0');
}

/**
 * Calculates remaining days, hours, minutes, and seconds until a target date.
 * @param {Date|string|number} targetDate 
 * @returns {Object} object containing days, hours, minutes, seconds, and isFinished
 */
export function calculateTimeRemaining(targetDate) {
  const targetTime = new Date(targetDate).getTime();
  const currentTime = new Date().getTime();
  const difference = targetTime - currentTime;

  // If the target date has already passed
  if (difference <= 0) {
    return {
      total: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isFinished: true
    };
  }

  // Calculate mathematical units of time
  const seconds = Math.floor((difference / 1000) % 60);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));

  return {
    total: difference,
    days,
    hours,
    minutes,
    seconds,
    isFinished: false
  };
}

/**
 * Converts a "HH:MM" string (e.g. "09:30") into total minutes from midnight.
 * @param {string} timeString 
 * @returns {number} minutes from midnight
 */
export function timeStringToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return (hours * 60) + minutes;
}

/**
 * Converts total minutes from midnight into a 12-hour formatted time string.
 * @param {number} totalMinutes 
 * @returns {string} formatted time (e.g. "09:30 AM")
 */
export function minutesToTimeString(totalMinutes) {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour is 12 AM
  return `${formatTwoDigits(hours)}:${formatTwoDigits(minutes)} ${ampm}`;
}

/**
 * Evaluates the class timetable to find the current ongoing class and the next upcoming class.
 * @param {Array} classList 
 * @param {number} currentMinutesNow 
 * @returns {Object} { currentClass, nextClass, classProgress }
 */
export function evaluateActiveSchedule(classList, currentMinutesNow) {
  let currentClass = null;
  let nextClass = null;
  let classProgress = 0;

  // Sort classes chronologically by start time
  const sorted = [...classList].sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));

  for (let i = 0; i < sorted.length; i++) {
    const lecture = sorted[i];
    const start = timeStringToMinutes(lecture.startTime);
    const end = timeStringToMinutes(lecture.endTime);

    // Check if the current time falls inside this class window
    if (currentMinutesNow >= start && currentMinutesNow < end) {
      currentClass = lecture;
      const totalDuration = end - start;
      const elapsed = currentMinutesNow - start;
      classProgress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
    } 
    // If this class starts in the future and we haven't found the next class yet
    else if (start > currentMinutesNow && !nextClass) {
      nextClass = lecture;
    }
  }

  return { currentClass, nextClass, classProgress };
}

// ==============================================================================
// 3. DEFAULT TIMETABLE DATA
// Preloaded college schedule for Monday through Friday.
// ==============================================================================
const DEFAULT_TIMETABLE = [
  // Monday (Day 1)
  { id: 'mon-1', day: 1, startTime: '09:00', endTime: '10:00', subject: 'Data Structures & Algorithms', faculty: 'Dr. R. Sharma', room: 'Lab 301' },
  { id: 'mon-2', day: 1, startTime: '10:00', endTime: '11:00', subject: 'Advanced Web Technology (JS)', faculty: 'Prof. A. Patil', room: 'Lab 204' },
  { id: 'mon-3', day: 1, startTime: '11:00', endTime: '11:15', subject: 'Short Tea Break ☕', faculty: 'Campus', room: 'Cafeteria' },
  { id: 'mon-4', day: 1, startTime: '11:15', endTime: '12:15', subject: 'Database Management Systems', faculty: 'Dr. V. Mehta', room: 'LH 102' },
  { id: 'mon-5', day: 1, startTime: '12:15', endTime: '13:00', subject: 'Lunch Break 🍱', faculty: 'Campus', room: 'Student Hall' },
  { id: 'mon-6', day: 1, startTime: '13:00', endTime: '14:30', subject: 'Fullstack JS Project Lab', faculty: 'Prof. A. Patil', room: 'Comp Lab 5' },
  { id: 'mon-7', day: 1, startTime: '14:30', endTime: '15:30', subject: 'Computer Networks & Security', faculty: 'Dr. S. Kulkarni', room: 'LH 201' },

  // Tuesday (Day 2)
  { id: 'tue-1', day: 2, startTime: '09:00', endTime: '10:30', subject: 'Operating Systems & Linux Shell', faculty: 'Prof. H. Deshmukh', room: 'Lab 102' },
  { id: 'tue-2', day: 2, startTime: '10:30', endTime: '11:00', subject: 'Technical Seminar & Viva', faculty: 'Dr. R. Sharma', room: 'LH 303' },
  { id: 'tue-3', day: 2, startTime: '11:00', endTime: '11:15', subject: 'Short Break ☕', faculty: 'Campus', room: 'Cafeteria' },
  { id: 'tue-4', day: 2, startTime: '11:15', endTime: '12:45', subject: 'Cloud Computing & DevOps', faculty: 'Dr. V. Mehta', room: 'LH 104' },
  { id: 'tue-5', day: 2, startTime: '12:45', endTime: '13:30', subject: 'Lunch Break 🍱', faculty: 'Campus', room: 'Student Hall' },
  { id: 'tue-6', day: 2, startTime: '13:30', endTime: '15:30', subject: 'AI & Machine Learning Practical', faculty: 'Prof. N. Joshi', room: 'AI Lab 02' },

  // Wednesday (Day 3)
  { id: 'wed-1', day: 3, startTime: '09:00', endTime: '10:00', subject: 'Software Engineering Principles', faculty: 'Dr. S. Kulkarni', room: 'LH 201' },
  { id: 'wed-2', day: 3, startTime: '10:00', endTime: '11:00', subject: 'Web Technology (DOM & Events)', faculty: 'Prof. A. Patil', room: 'Lab 204' },
  { id: 'wed-3', day: 3, startTime: '11:00', endTime: '11:15', subject: 'Short Break ☕', faculty: 'Campus', room: 'Cafeteria' },
  { id: 'wed-4', day: 3, startTime: '11:15', endTime: '12:15', subject: 'Object Oriented Design (Java)', faculty: 'Dr. R. Sharma', room: 'LH 101' },
  { id: 'wed-5', day: 3, startTime: '12:15', endTime: '13:00', subject: 'Lunch Break 🍱', faculty: 'Campus', room: 'Student Hall' },
  { id: 'wed-6', day: 3, startTime: '13:00', endTime: '15:00', subject: 'JavaScript Timers & Async Lab', faculty: 'Prof. A. Patil', room: 'Lab 301' },

  // Thursday (Day 4)
  { id: 'thu-1', day: 4, startTime: '09:00', endTime: '10:30', subject: 'Computer Architecture', faculty: 'Prof. H. Deshmukh', room: 'LH 105' },
  { id: 'thu-2', day: 4, startTime: '10:30', endTime: '11:00', subject: 'Algorithms Problem Solving', faculty: 'Dr. R. Sharma', room: 'LH 303' },
  { id: 'thu-3', day: 4, startTime: '11:00', endTime: '11:15', subject: 'Short Break ☕', faculty: 'Campus', room: 'Cafeteria' },
  { id: 'thu-4', day: 4, startTime: '11:15', endTime: '12:45', subject: 'Database Management Systems Lab', faculty: 'Dr. V. Mehta', room: 'Lab 202' },
  { id: 'thu-5', day: 4, startTime: '12:45', endTime: '13:30', subject: 'Lunch Break 🍱', faculty: 'Campus', room: 'Student Hall' },
  { id: 'thu-6', day: 4, startTime: '13:30', endTime: '15:00', subject: 'Cyber Security Essentials', faculty: 'Dr. S. Kulkarni', room: 'LH 201' },

  // Friday (Day 5)
  { id: 'fri-1', day: 5, startTime: '09:00', endTime: '10:30', subject: 'Mobile Application Development', faculty: 'Prof. N. Joshi', room: 'App Lab 01' },
  { id: 'fri-2', day: 5, startTime: '10:30', endTime: '11:00', subject: 'Industry Case Studies & QA', faculty: 'Dr. R. Sharma', room: 'Auditorium' },
  { id: 'fri-3', day: 5, startTime: '11:00', endTime: '11:15', subject: 'Short Break ☕', faculty: 'Campus', room: 'Cafeteria' },
  { id: 'fri-4', day: 5, startTime: '11:15', endTime: '12:45', subject: 'Cloud & API Integration Workshop', faculty: 'Prof. A. Patil', room: 'Comp Lab 5' },
  { id: 'fri-5', day: 5, startTime: '12:45', endTime: '13:30', subject: 'Lunch Break 🍱', faculty: 'Campus', room: 'Student Hall' },
  { id: 'fri-6', day: 5, startTime: '13:30', endTime: '15:30', subject: 'Mini-Project Mentorship Session', faculty: 'Faculty Panel', room: 'Project Hall' }
];

// ==============================================================================
// 4. MAIN SCHEDULER & TIMER MANAGER CLASS
// Implements all timer handling, UI rendering, and user interactions.
// ==============================================================================
export class SchedulerTimerManager {
  constructor() {
    // --------------------------------------------------------------------------
    // JAVASCRIPT TIMER REFERENCES (Stored so they can be monitored and cleared)
    // --------------------------------------------------------------------------
    this.clockIntervalId = null;       // Tracks setInterval for system clock
    this.countdownIntervalId = null;   // Tracks setInterval for milestone countdown
    this.scheduleIntervalId = null;    // Tracks setInterval for class timetable sync
    this.focusIntervalId = null;       // Tracks setInterval for Pomodoro study timer
    this.snoozeTimeoutId = null;       // Tracks setTimeout for snooze reminder

    // State Variables
    this.selectedDay = new Date().getDay();
    // Default to Monday (1) if today is weekend
    if (this.selectedDay === 0 || this.selectedDay === 6) this.selectedDay = 1;

    // Load timetable from localStorage (or fallback to default)
    this.timetable = this.loadTimetable();

    // Default Countdown Target: 10 days from right now at 10:00 AM
    this.countdownTarget = this.loadCountdownTarget();

    // Focus Timer State (Pomodoro)
    this.focusTotalSeconds = APP_CONFIG.defaultFocusMinutes * 60;
    this.focusRemainingSeconds = this.focusTotalSeconds;
    this.isFocusRunning = false;

    // DOM Element References
    this.dom = {
      // Clock elements
      liveClockDisplay: document.getElementById('liveClockDisplay'),
      liveDateDisplay: document.getElementById('liveDateDisplay'),
      
      // Class scheduler elements
      currentClassName: document.getElementById('currentClassName'),
      currentClassDetails: document.getElementById('currentClassDetails'),
      currentClassTimeRange: document.getElementById('currentClassTimeRange'),
      currentClassRemaining: document.getElementById('currentClassRemaining'),
      classProgressFill: document.getElementById('classProgressFill'),
      nextClassName: document.getElementById('nextClassName'),
      nextClassDetails: document.getElementById('nextClassDetails'),
      nextClassCountdown: document.getElementById('nextClassCountdown'),
      daySelectorContainer: document.getElementById('daySelectorContainer'),
      timetableBody: document.getElementById('timetableBody'),
      
      // Milestone countdown elements
      displayTargetTitle: document.getElementById('displayTargetTitle'),
      displayTargetDate: document.getElementById('displayTargetDate'),
      countdownDays: document.getElementById('countdownDays'),
      countdownHours: document.getElementById('countdownHours'),
      countdownMinutes: document.getElementById('countdownMinutes'),
      countdownSeconds: document.getElementById('countdownSeconds'),
      eventTitleInput: document.getElementById('eventTitleInput'),
      eventDateInput: document.getElementById('eventDateInput'),
      setCountdownBtn: document.getElementById('setCountdownBtn'),
      snoozeAlertBtn: document.getElementById('snoozeAlertBtn'),
      resetCountdownBtn: document.getElementById('resetCountdownBtn'),
      
      // Pomodoro focus elements
      focusTimeDisplay: document.getElementById('focusTimeDisplay'),
      focusTimerStatus: document.getElementById('focusTimerStatus'),
      startFocusBtn: document.getElementById('startFocusBtn'),
      pauseFocusBtn: document.getElementById('pauseFocusBtn'),
      resetFocusBtn: document.getElementById('resetFocusBtn'),
      
      // Diagnostic monitor elements
      diagIntervalStatus: document.getElementById('diagIntervalStatus'),
      diagTimeoutStatus: document.getElementById('diagTimeoutStatus'),
      timerLogStream: document.getElementById('timerLogStream'),
      alertContainer: document.getElementById('alertContainer'),

      // Modal elements
      openAddClassModalBtn: document.getElementById('openAddClassModalBtn'),
      addClassModal: document.getElementById('addClassModal'),
      closeModalBtn: document.getElementById('closeModalBtn'),
      cancelModalBtn: document.getElementById('cancelModalBtn'),
      addClassForm: document.getElementById('addClassForm')
    };
  }

  /**
   * Initializes all timers, events, and renders the initial UI state.
   */
  init() {
    this.logDiagnostic('ES6 Module imported and initialized successfully.', 'module');

    // 1. Start JavaScript Timers (setInterval)
    this.startLiveClock();
    this.startMilestoneCountdown();
    this.startScheduleTracker();

    // 2. Setup User Event Listeners
    this.setupEventListeners();

    // 3. Render Timetable for Current Day
    this.renderTimetable(this.selectedDay);
    this.updateActiveDayButton();

    // 4. Populate default inputs
    this.populateDefaultCountdownInputs();

    // 5. Demonstrate setTimeout on initial load (Welcome Banner)
    setTimeout(() => {
      this.showToast('Schedule & Timers Synchronized', 'Real-time clock and timetable tracking are active.', 'info');
      this.logDiagnostic('setTimeout() executed initial greeting after 600ms delay.', 'timeout');
    }, 600);
  }

  // ============================================================================
  // TIMER 1: LIVE CLOCK (Demonstrating setInterval)
  // ============================================================================
  /**
   * Starts the 1-second interval for the live system clock.
   */
  startLiveClock() {
    // Clear any previous interval to prevent duplicate timers
    if (this.clockIntervalId) clearInterval(this.clockIntervalId);

    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = formatTwoDigits(now.getMinutes());
      const seconds = formatTwoDigits(now.getSeconds());
      const ampm = hours >= 12 ? 'PM' : 'AM';

      // 12-hour format calculation
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = formatTwoDigits(hours);

      // Update DOM
      this.dom.liveClockDisplay.innerHTML = `${formattedHours}:${minutes}:${seconds} <span class="clock-period">${ampm}</span>`;
      this.dom.liveDateDisplay.textContent = formatDisplayDate(now);
    };

    // Run immediately once so user doesn't wait 1 second
    updateClock();

    // setInterval() repeatedly executes updateClock every 1000ms (1 second)
    this.clockIntervalId = setInterval(updateClock, APP_CONFIG.tickInterval);
    this.logDiagnostic(`setInterval() started for Live Clock [ID: #${this.clockIntervalId}]`, 'interval');
  }

  // ============================================================================
  // TIMER 2: MILESTONE COUNTDOWN (Demonstrating setInterval)
  // ============================================================================
  /**
   * Starts the 1-second interval to compute countdown time until milestone.
   */
  startMilestoneCountdown() {
    if (this.countdownIntervalId) clearInterval(this.countdownIntervalId);

    const updateCountdown = () => {
      const remaining = calculateTimeRemaining(this.countdownTarget.date);

      // Render numbers
      this.dom.countdownDays.textContent = formatTwoDigits(remaining.days);
      this.dom.countdownHours.textContent = formatTwoDigits(remaining.hours);
      this.dom.countdownMinutes.textContent = formatTwoDigits(remaining.minutes);
      this.dom.countdownSeconds.textContent = formatTwoDigits(remaining.seconds);

      // When the milestone is reached
      if (remaining.isFinished) {
        clearInterval(this.countdownIntervalId);
        this.dom.countdownDays.textContent = '00';
        this.dom.countdownHours.textContent = '00';
        this.dom.countdownMinutes.textContent = '00';
        this.dom.countdownSeconds.textContent = '00';
        this.showToast('Milestone Reached! 🎉', `${this.countdownTarget.title} has arrived!`, 'success');
        this.playBeepSound();
      }
    };

    updateCountdown();

    // setInterval() ticks every 1000ms to calculate countdown remaining
    this.countdownIntervalId = setInterval(updateCountdown, APP_CONFIG.tickInterval);
    this.logDiagnostic(`setInterval() started for Event Countdown [ID: #${this.countdownIntervalId}]`, 'interval');
  }

  // ============================================================================
  // TIMER 3: LIVE CLASS SCHEDULER TRACKER (Demonstrating setInterval)
  // ============================================================================
  /**
   * Checks the schedule every second against the current time.
   */
  startScheduleTracker() {
    if (this.scheduleIntervalId) clearInterval(this.scheduleIntervalId);

    const checkSchedule = () => {
      const now = new Date();
      const todayDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
      const currentMinutes = (now.getHours() * 60) + now.getMinutes();

      // Filter classes for today's real day of the week (if weekday), otherwise selected day
      const dayClasses = this.timetable.filter(item => item.day === this.selectedDay);
      const { currentClass, nextClass, classProgress } = evaluateActiveSchedule(dayClasses, currentMinutes);

      // Render Current Class Box
      if (currentClass) {
        this.dom.currentClassName.textContent = currentClass.subject;
        this.dom.currentClassDetails.textContent = `Faculty: ${currentClass.faculty} | Location: ${currentClass.room}`;
        this.dom.currentClassTimeRange.textContent = `${currentClass.startTime} - ${currentClass.endTime}`;
        
        const remainingMins = timeStringToMinutes(currentClass.endTime) - currentMinutes;
        this.dom.currentClassRemaining.textContent = `${remainingMins} min${remainingMins === 1 ? '' : 's'} remaining`;
        this.dom.classProgressFill.style.width = `${classProgress}%`;
      } else {
        this.dom.currentClassName.textContent = 'No Ongoing Lecture (Free Time)';
        this.dom.currentClassDetails.textContent = 'Relax, review notes, or work on practical projects.';
        this.dom.currentClassTimeRange.textContent = '--:-- - --:--';
        this.dom.currentClassRemaining.textContent = 'Free Period';
        this.dom.classProgressFill.style.width = '0%';
      }

      // Render Next Class Box
      if (nextClass) {
        this.dom.nextClassName.textContent = nextClass.subject;
        this.dom.nextClassDetails.textContent = `${nextClass.startTime} in ${nextClass.room} with ${nextClass.faculty}`;
        const diffMinutes = timeStringToMinutes(nextClass.startTime) - currentMinutes;
        if (diffMinutes > 60) {
          const hrs = Math.floor(diffMinutes / 60);
          const mins = diffMinutes % 60;
          this.dom.nextClassCountdown.textContent = `starts in ${hrs}h ${mins}m`;
        } else {
          this.dom.nextClassCountdown.textContent = `starts in ${diffMinutes} min${diffMinutes === 1 ? '' : 's'}`;
        }
      } else {
        this.dom.nextClassName.textContent = 'No more classes scheduled for today';
        this.dom.nextClassDetails.textContent = 'All lectures for this timetable day are completed.';
        this.dom.nextClassCountdown.textContent = 'Day Complete';
      }

      // Highlight active row in the table
      this.updateTableHighlights(currentClass ? currentClass.id : null, nextClass ? nextClass.id : null);
    };

    checkSchedule();
    this.scheduleIntervalId = setInterval(checkSchedule, APP_CONFIG.tickInterval);
    this.logDiagnostic(`setInterval() started for Class Schedule Tracker [ID: #${this.scheduleIntervalId}]`, 'interval');
  }

  // ============================================================================
  // TIMER 4: POMODORO FOCUS TIMER (setInterval + clearInterval)
  // ============================================================================
  /**
   * Starts or resumes the Pomodoro study timer.
   */
  startFocusTimer() {
    if (this.isFocusRunning) return;

    this.isFocusRunning = true;
    this.dom.focusTimerStatus.textContent = 'RUNNING';
    this.dom.focusTimerStatus.style.background = 'rgba(16, 185, 129, 0.2)';
    this.dom.focusTimerStatus.style.color = '#34d399';
    this.dom.startFocusBtn.disabled = true;
    this.dom.pauseFocusBtn.disabled = false;

    this.focusIntervalId = setInterval(() => {
      this.focusRemainingSeconds--;

      const mins = Math.floor(this.focusRemainingSeconds / 60);
      const secs = this.focusRemainingSeconds % 60;
      this.dom.focusTimeDisplay.textContent = `${formatTwoDigits(mins)}:${formatTwoDigits(secs)}`;

      // When Pomodoro reaches zero
      if (this.focusRemainingSeconds <= 0) {
        clearInterval(this.focusIntervalId);
        this.isFocusRunning = false;
        this.dom.focusTimerStatus.textContent = 'COMPLETED';
        this.dom.startFocusBtn.disabled = false;
        this.dom.pauseFocusBtn.disabled = true;
        this.showToast('Study Session Done! ☕', 'Great focus! Take a 5-minute break.', 'success');
        this.playBeepSound();
        this.logDiagnostic('Focus Timer completed and interval cleared via clearInterval().', 'interval');
      }
    }, 1000);

    this.logDiagnostic(`setInterval() started for Focus Study Timer [ID: #${this.focusIntervalId}]`, 'interval');
  }

  /**
   * Pauses the Pomodoro study timer using clearInterval().
   */
  pauseFocusTimer() {
    if (!this.isFocusRunning) return;

    clearInterval(this.focusIntervalId);
    this.isFocusRunning = false;
    this.dom.focusTimerStatus.textContent = 'PAUSED';
    this.dom.focusTimerStatus.style.background = 'rgba(245, 158, 11, 0.2)';
    this.dom.focusTimerStatus.style.color = '#fbbf24';
    this.dom.startFocusBtn.disabled = false;
    this.dom.pauseFocusBtn.disabled = true;

    this.logDiagnostic('Focus Timer paused using clearInterval().', 'interval');
  }

  /**
   * Resets the Pomodoro study timer.
   * @param {number} minutes 
   */
  resetFocusTimer(minutes = null) {
    clearInterval(this.focusIntervalId);
    this.isFocusRunning = false;
    if (minutes !== null) {
      this.focusTotalSeconds = minutes * 60;
    }
    this.focusRemainingSeconds = this.focusTotalSeconds;

    const mins = Math.floor(this.focusRemainingSeconds / 60);
    const secs = this.focusRemainingSeconds % 60;
    this.dom.focusTimeDisplay.textContent = `${formatTwoDigits(mins)}:${formatTwoDigits(secs)}`;
    this.dom.focusTimerStatus.textContent = 'READY';
    this.dom.focusTimerStatus.style.background = 'rgba(255, 255, 255, 0.1)';
    this.dom.focusTimerStatus.style.color = 'var(--text-secondary)';
    this.dom.startFocusBtn.disabled = false;
    this.dom.pauseFocusBtn.disabled = true;

    this.logDiagnostic('Focus Timer reset.', 'interval');
  }

  // ============================================================================
  // TIMER 5: SNOOZE / DELAYED ACTIONS (Demonstrating setTimeout & clearTimeout)
  // ============================================================================
  /**
   * Demonstrates setTimeout: Schedules an alert reminder after a 5-second delay.
   */
  triggerSnoozeDemo() {
    // Clear any previous pending snooze timeout
    if (this.snoozeTimeoutId) {
      clearTimeout(this.snoozeTimeoutId);
      this.logDiagnostic('Previous setTimeout cancelled using clearTimeout().', 'timeout');
    }

    this.showToast('Reminder Snoozed ⏱️', 'A reminder popup will trigger in exactly 5 seconds via setTimeout().', 'warning');
    this.dom.diagTimeoutStatus.textContent = 'Active (1 pending: 5000ms)';
    this.dom.diagTimeoutStatus.className = 'tech-val active';

    // setTimeout() executes the callback ONCE after 5000 milliseconds
    this.snoozeTimeoutId = setTimeout(() => {
      this.showToast('🔔 Snooze Alert Fired!', 'Your 5-second delayed reminder just finished execution!', 'success');
      this.playBeepSound();
      this.dom.diagTimeoutStatus.textContent = 'Standby (0 pending)';
      this.dom.diagTimeoutStatus.className = 'tech-val';
      this.logDiagnostic('setTimeout() callback executed successfully after 5000ms delay.', 'timeout');
      this.snoozeTimeoutId = null;
    }, 5000);

    this.logDiagnostic(`setTimeout() scheduled for 5000ms [Timeout ID: #${this.snoozeTimeoutId}]`, 'timeout');
  }

  // ============================================================================
  // UI RENDERING & TIMETABLE TABLE
  // ============================================================================
  /**
   * Renders timetable table for the selected day of the week.
   * @param {number} day 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
   */
  renderTimetable(day) {
    const dayClasses = this.timetable
      .filter(item => item.day === day)
      .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));

    this.dom.timetableBody.innerHTML = '';

    if (dayClasses.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="5" style="text-align:center; padding: 20px; color: var(--text-secondary);">No classes scheduled for this day.</td>`;
      this.dom.timetableBody.appendChild(row);
      return;
    }

    dayClasses.forEach(lecture => {
      const row = document.createElement('tr');
      row.id = `row-${lecture.id}`;

      row.innerHTML = `
        <td><strong style="color: var(--accent-cyan);">${lecture.startTime} - ${lecture.endTime}</strong></td>
        <td><strong>${lecture.subject}</strong></td>
        <td style="color: var(--text-secondary);">${lecture.faculty}</td>
        <td><span class="badge" style="margin:0; font-size:0.7rem;">${lecture.room}</span></td>
        <td><span class="table-status-pill later" id="status-pill-${lecture.id}">Scheduled</span></td>
      `;

      this.dom.timetableBody.appendChild(row);
    });
  }

  /**
   * Updates CSS highlights on table rows based on active lecture status.
   */
  updateTableHighlights(currentId, nextId) {
    const rows = this.dom.timetableBody.querySelectorAll('tr');
    rows.forEach(r => r.classList.remove('active-row'));

    if (currentId) {
      const currentRow = document.getElementById(`row-${currentId}`);
      const currentPill = document.getElementById(`status-pill-${currentId}`);
      if (currentRow) currentRow.classList.add('active-row');
      if (currentPill) {
        currentPill.className = 'table-status-pill now';
        currentPill.textContent = 'ONGOING NOW';
      }
    }

    if (nextId) {
      const nextPill = document.getElementById(`status-pill-${nextId}`);
      if (nextPill) {
        nextPill.className = 'table-status-pill next';
        nextPill.textContent = 'UP NEXT';
      }
    }
  }

  updateActiveDayButton() {
    const pills = this.dom.daySelectorContainer.querySelectorAll('.day-pill');
    pills.forEach(btn => {
      if (Number(btn.dataset.day) === this.selectedDay) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // ============================================================================
  // EVENT LISTENERS & USER CONTROLS
  // ============================================================================
  setupEventListeners() {
    // Day Selector Buttons
    this.dom.daySelectorContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.day-pill');
      if (!pill) return;
      this.selectedDay = Number(pill.dataset.day);
      this.updateActiveDayButton();
      this.renderTimetable(this.selectedDay);
    });

    // Set Custom Countdown Button
    this.dom.setCountdownBtn.addEventListener('click', () => {
      const title = this.dom.eventTitleInput.value.trim();
      const dateVal = this.dom.eventDateInput.value;

      if (!title || !dateVal) {
        this.showToast('Input Required', 'Please enter both an event title and a target date.', 'warning');
        return;
      }

      const targetTimestamp = new Date(dateVal).getTime();
      if (isNaN(targetTimestamp) || targetTimestamp <= new Date().getTime()) {
        this.showToast('Invalid Date', 'Target date and time must be in the future.', 'danger');
        return;
      }

      this.countdownTarget = { title, date: dateVal };
      localStorage.setItem('jslab_countdown_target', JSON.stringify(this.countdownTarget));

      this.dom.displayTargetTitle.textContent = title;
      this.dom.displayTargetDate.textContent = new Date(dateVal).toLocaleString();

      this.startMilestoneCountdown();
      this.showToast('Countdown Started', `Tracking time until: ${title}`, 'success');
      this.logDiagnostic(`New countdown milestone set: ${title}`, 'interval');
    });

    // Reset Countdown Button
    this.dom.resetCountdownBtn.addEventListener('click', () => {
      localStorage.removeItem('jslab_countdown_target');
      this.countdownTarget = this.getDefaultMilestone();
      this.populateDefaultCountdownInputs();
      this.startMilestoneCountdown();
      this.showToast('Countdown Reset', 'Restored default semester exam milestone.', 'info');
    });

    // Snooze Button (demonstrates setTimeout)
    this.dom.snoozeAlertBtn.addEventListener('click', () => {
      this.triggerSnoozeDemo();
    });

    // Focus Study Timer Buttons
    this.dom.startFocusBtn.addEventListener('click', () => this.startFocusTimer());
    this.dom.pauseFocusBtn.addEventListener('click', () => this.pauseFocusTimer());
    this.dom.resetFocusBtn.addEventListener('click', () => this.resetFocusTimer());

    // Preset Focus Duration Buttons (25m, 15m, 5m, 1m)
    document.querySelectorAll('.pomodoro-preset-buttons button').forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = Number(btn.dataset.minutes);
        this.resetFocusTimer(mins);
      });
    });

    // Modal Controls for Adding Custom Class
    this.dom.openAddClassModalBtn.addEventListener('click', () => {
      this.dom.addClassModal.classList.remove('hidden');
    });

    const closeModal = () => this.dom.addClassModal.classList.add('hidden');
    this.dom.closeModalBtn.addEventListener('click', closeModal);
    this.dom.cancelModalBtn.addEventListener('click', closeModal);

    // Save New Class Form Submit
    this.dom.addClassForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const subject = document.getElementById('newSubject').value.trim();
      const faculty = document.getElementById('newFaculty').value.trim();
      const room = document.getElementById('newRoom').value.trim();
      const day = Number(document.getElementById('newDay').value);
      const startTime = document.getElementById('newStartTime').value;
      const endTime = document.getElementById('newEndTime').value;

      if (timeStringToMinutes(startTime) >= timeStringToMinutes(endTime)) {
        this.showToast('Invalid Times', 'Class start time must be before end time.', 'danger');
        return;
      }

      const newLecture = {
        id: `custom-${Date.now()}`,
        day,
        startTime,
        endTime,
        subject,
        faculty,
        room
      };

      this.timetable.push(newLecture);
      localStorage.setItem('jslab_timetable', JSON.stringify(this.timetable));

      this.selectedDay = day;
      this.updateActiveDayButton();
      this.renderTimetable(day);
      closeModal();
      this.dom.addClassForm.reset();

      this.showToast('Lecture Added', `${subject} added to schedule!`, 'success');
      this.logDiagnostic(`Custom lecture added: ${subject} (${startTime}-${endTime})`, 'system');
    });
  }

  // ============================================================================
  // LOCAL STORAGE & DATA INITIALIZATION
  // ============================================================================
  loadTimetable() {
    try {
      const saved = localStorage.getItem('jslab_timetable');
      return saved ? JSON.parse(saved) : DEFAULT_TIMETABLE;
    } catch (err) {
      return DEFAULT_TIMETABLE;
    }
  }

  getDefaultMilestone() {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    futureDate.setHours(10, 0, 0, 0);

    return {
      title: 'Final Semester Practical Examination',
      date: futureDate.toISOString().slice(0, 16)
    };
  }

  loadCountdownTarget() {
    try {
      const saved = localStorage.getItem('jslab_countdown_target');
      if (saved) return JSON.parse(saved);
    } catch (err) {}
    return this.getDefaultMilestone();
  }

  populateDefaultCountdownInputs() {
    this.dom.eventTitleInput.value = this.countdownTarget.title;
    this.dom.eventDateInput.value = this.countdownTarget.date;
    this.dom.displayTargetTitle.textContent = this.countdownTarget.title;
    this.dom.displayTargetDate.textContent = new Date(this.countdownTarget.date).toLocaleString();
  }

  // ============================================================================
  // NOTIFICATIONS, AUDIO & LOGGING UTILITIES
  // ============================================================================
  /**
   * Displays an animated toast message and auto-dismisses it with setTimeout().
   */
  showToast(title, message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-alert ${type}`;

    const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', danger: '⛔' };
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <div>
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    this.dom.alertContainer.appendChild(toast);

    // Use setTimeout() to remove toast after 4000ms
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 350);
    }, APP_CONFIG.notificationDuration);
  }

  /**
   * Web Audio API synthesized alert beep (no external audio files needed).
   */
  playBeepSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // AudioContext might be muted until user interaction
    }
  }

  /**
   * Appends an entry into the diagnostic monitor log stream.
   */
  logDiagnostic(message, category = 'system') {
    const now = new Date();
    const timeStr = `${formatTwoDigits(now.getHours())}:${formatTwoDigits(now.getMinutes())}:${formatTwoDigits(now.getSeconds())}`;
    
    const entry = document.createElement('div');
    entry.className = `log-entry ${category}`;
    entry.textContent = `[${timeStr}] ${message}`;

    this.dom.timerLogStream.appendChild(entry);
    this.dom.timerLogStream.scrollTop = this.dom.timerLogStream.scrollHeight;
  }
}

// ==============================================================================
// 5. APPLICATION BOOTSTRAPPER
// Instantiates and boots the class when DOM content is ready.
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  const app = new SchedulerTimerManager();
  app.init();
});
