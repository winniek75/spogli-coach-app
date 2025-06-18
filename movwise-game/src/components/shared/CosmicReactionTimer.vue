<template>
  <div class="cosmic-reaction-timer">
    <div :class="['timer-hologram', { 
      'danger-mode': timeLeft <= 1000, 
      'critical-mode': timeLeft <= 500,
      'overtime-mode': timeLeft <= 0
    }]">
      
      <!-- 宇宙エネルギーリング -->
      <div class="energy-ring-container">
        <svg class="energy-ring-svg" viewBox="0 0 120 120">
          <!-- 背景リング -->
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="rgba(71, 85, 105, 0.3)"
            stroke-width="8"
            class="background-ring"
          />
          
          <!-- エネルギープログレスリング -->
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            :stroke="ringColor"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
            class="progress-ring"
          />
          
          <!-- 内側エネルギーフィールド -->
          <circle
            cx="60"
            cy="60"
            r="35"
            fill="none"
            :stroke="innerRingColor"
            stroke-width="2"
            opacity="0.6"
            :stroke-dasharray="innerCircumference"
            :stroke-dashoffset="innerStrokeDashoffset"
            class="inner-energy-ring"
          />
        </svg>
        
        <!-- 中央の時間表示 -->
        <div class="timer-core">
          <div class="time-crystal">
            <div class="time-value">{{ displayTime }}</div>
            <div class="time-unit">SEC</div>
          </div>
          <div v-if="timeLeft <= 500" class="critical-warning">⚠️</div>
        </div>
        
        <!-- エネルギーパルス効果 -->
        <div v-if="timeLeft <= 1000" class="energy-pulse-rings">
          <div class="pulse-ring ring-1"></div>
          <div class="pulse-ring ring-2"></div>
          <div class="pulse-ring ring-3"></div>
        </div>
      </div>
      
      <!-- ワープフィールドエフェクト -->
      <div v-if="timeLeft <= 500" class="warp-field">
        <div class="warp-line" v-for="i in 6" :key="i" 
             :style="{ '--delay': i * 0.1 + 's' }"></div>
      </div>
      
      <!-- 宇宙塵パーティクル -->
      <div class="cosmic-dust">
        <div v-for="i in 8" :key="i" 
             class="dust-particle"
             :style="{ 
               '--delay': i * 0.3 + 's',
               '--duration': (2 + Math.random() * 3) + 's'
             }">
          ✦
        </div>
      </div>
    </div>
    
    <!-- 警告メッセージ -->
    <Transition name="warning-fade">
      <div v-if="timeLeft <= 1000 && timeLeft > 0" class="cosmic-warning">
        <div class="warning-hologram">
          <div class="warning-icon">⚡</div>
          <div class="warning-text">{{ getWarningMessage() }}</div>
        </div>
      </div>
    </Transition>
    
    <!-- タイムアップメッセージ -->
    <Transition name="timeout-boom">
      <div v-if="timeLeft <= 0" class="timeout-explosion">
        <div class="explosion-icon">💥</div>
        <div class="timeout-message">TIME'S UP!</div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

// Props
const props = defineProps({
  timeLimit: {
    type: Number,
    default: 2000 // milliseconds
  },
  startTime: {
    type: Number,
    default: null
  },
  paused: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    default: 'cadet' // cadet, ranger, commander, master
  }
})

// Emits
const emit = defineEmits(['timeout', 'warning', 'critical', 'tick'])

// Reactive state
const timeLeft = ref(props.timeLimit)
const isRunning = ref(false)
let timerInterval = null

// Computed
const displayTime = computed(() => {
  if (timeLeft.value <= 0) return '0.0'
  return (timeLeft.value / 1000).toFixed(1)
})

const circumference = computed(() => {
  return 2 * Math.PI * 50 // radius = 50
})

const innerCircumference = computed(() => {
  return 2 * Math.PI * 35 // radius = 35
})

const strokeDashoffset = computed(() => {
  const progress = Math.max(0, timeLeft.value) / props.timeLimit
  return circumference.value * (1 - progress)
})

const innerStrokeDashoffset = computed(() => {
  const progress = Math.max(0, timeLeft.value) / props.timeLimit
  return innerCircumference.value * (1 - progress)
})

const ringColor = computed(() => {
  if (timeLeft.value <= 0) return '#7c3aed' // Overtime - purple
  if (timeLeft.value <= 500) return '#ef4444' // Critical - red
  if (timeLeft.value <= 1000) return '#f59e0b' // Warning - orange
  
  // Difficulty-based colors for normal state
  switch(props.difficulty) {
    case 'master': return '#8b5cf6' // Purple
    case 'commander': return '#3b82f6' // Blue
    case 'ranger': return '#10b981' // Green
    default: return '#22c55e' // Light green
  }
})

const innerRingColor = computed(() => {
  if (timeLeft.value <= 500) return '#fbbf24'
  return ringColor.value
})

// Methods
const startTimer = () => {
  if (isRunning.value) return
  
  isRunning.value = true
  timeLeft.value = props.timeLimit
  
  timerInterval = setInterval(() => {
    if (props.paused) return
    
    timeLeft.value -= 50 // Update every 50ms for smooth animation
    
    // Emit events
    emit('tick', timeLeft.value)
    
    // Warning events
    if (timeLeft.value <= 1000 && timeLeft.value > 950) {
      emit('warning')
    }
    
    if (timeLeft.value <= 500 && timeLeft.value > 450) {
      emit('critical')
    }
    
    // Timeout
    if (timeLeft.value <= 0) {
      timeLeft.value = 0
      stopTimer()
      emit('timeout')
    }
  }, 50)
}

const stopTimer = () => {
  isRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const resetTimer = () => {
  stopTimer()
  timeLeft.value = props.timeLimit
}

const getRemainingTime = () => {
  return timeLeft.value
}

const getWarningMessage = () => {
  if (timeLeft.value <= 500) {
    return 'CRITICAL ENERGY!'
  } else if (timeLeft.value <= 1000) {
    return 'ENERGY DEPLETING!'
  }
  return 'TIME RUNNING OUT!'
}

// Watch for startTime changes to auto-start
watch(() => props.startTime, (newStartTime) => {
  if (newStartTime !== null) {
    startTimer()
  }
})

// Cleanup
onUnmounted(() => {
  stopTimer()
})

// Expose methods to parent
defineExpose({
  startTimer,
  stopTimer,
  resetTimer,
  getRemainingTime
})
</script>

<style scoped>
.cosmic-reaction-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.timer-hologram {
  position: relative;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.timer-hologram.danger-mode {
  animation: dangerShake 0.15s infinite;
}

.timer-hologram.critical-mode {
  animation: criticalShake 0.08s infinite;
}

.timer-hologram.overtime-mode {
  animation: overtimePulse 0.5s infinite alternate;
}

@keyframes dangerShake {
  0%, 100% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(-2px) translateY(-1px); }
  75% { transform: translateX(2px) translateY(1px); }
}

@keyframes criticalShake {
  0%, 100% { transform: translateX(0) translateY(0) scale(1); }
  25% { transform: translateX(-3px) translateY(-2px) scale(1.05); }
  75% { transform: translateX(3px) translateY(2px) scale(1.05); }
}

@keyframes overtimePulse {
  0% { 
    transform: scale(1);
    filter: hue-rotate(0deg);
  }
  100% { 
    transform: scale(1.1);
    filter: hue-rotate(180deg);
  }
}

/* エネルギーリングコンテナ */
.energy-ring-container {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.energy-ring-svg {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg); /* Start from top */
  filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.4));
}

.background-ring {
  opacity: 0.3;
}

.progress-ring {
  transition: stroke-dashoffset 0.05s linear, stroke 0.3s ease;
  filter: drop-shadow(0 0 8px currentColor);
}

.inner-energy-ring {
  transition: stroke-dashoffset 0.05s linear, stroke 0.3s ease;
  animation: innerRingPulse 2s infinite;
}

@keyframes innerRingPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

/* タイマーコア */
.timer-core {
  position: relative;
  z-index: 2;
  text-align: center;
  background: radial-gradient(circle, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9));
  backdrop-filter: blur(10px);
  border: 2px solid rgba(99, 102, 241, 0.4);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 0 20px rgba(0, 0, 0, 0.3),
    inset 0 0 20px rgba(99, 102, 241, 0.1);
}

.time-crystal {
  position: relative;
}

.time-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: #f1f5f9;
  line-height: 1;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  font-family: 'Orbitron', monospace;
}

.time-unit {
  font-size: 0.6rem;
  color: #94a3b8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 2px;
}

.critical-warning {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1rem;
  animation: warningBlink 0.3s infinite alternate;
}

@keyframes warningBlink {
  0% { opacity: 1; transform: translateX(-50%) scale(1); }
  100% { opacity: 0.5; transform: translateX(-50%) scale(1.2); }
}

/* エネルギーパルス効果 */
.energy-pulse-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(239, 68, 68, 0.6);
  border-radius: 50%;
  animation: energyPulse 1.5s infinite;
}

.pulse-ring.ring-1 {
  width: 100px;
  height: 100px;
  animation-delay: 0s;
}

.pulse-ring.ring-2 {
  width: 120px;
  height: 120px;
  animation-delay: 0.5s;
}

.pulse-ring.ring-3 {
  width: 140px;
  height: 140px;
  animation-delay: 1s;
}

@keyframes energyPulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

/* ワープフィールドエフェクト */
.warp-field {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  border-radius: 50%;
}

.warp-line {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(239, 68, 68, 0.8), 
    transparent
  );
  animation: warpSpeed 0.3s linear infinite;
  animation-delay: var(--delay);
  transform-origin: center;
}

.warp-line:nth-child(odd) {
  transform: translateY(-50%) rotate(30deg);
}

.warp-line:nth-child(even) {
  transform: translateY(-50%) rotate(-30deg);
}

@keyframes warpSpeed {
  0% {
    transform: translateY(-50%) rotate(var(--rotation, 0deg)) translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(-50%) rotate(var(--rotation, 0deg)) translateX(100%);
    opacity: 0;
  }
}

/* 宇宙塵パーティクル */
.cosmic-dust {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.dust-particle {
  position: absolute;
  color: rgba(99, 102, 241, 0.6);
  font-size: 0.8rem;
  animation: dustFloat var(--duration, 3s) linear infinite;
  animation-delay: var(--delay);
  left: var(--x, 50%);
  top: var(--y, 50%);
}

.dust-particle:nth-child(1) { --x: 20%; --y: 30%; }
.dust-particle:nth-child(2) { --x: 80%; --y: 20%; }
.dust-particle:nth-child(3) { --x: 10%; --y: 70%; }
.dust-particle:nth-child(4) { --x: 90%; --y: 80%; }
.dust-particle:nth-child(5) { --x: 40%; --y: 10%; }
.dust-particle:nth-child(6) { --x: 60%; --y: 90%; }
.dust-particle:nth-child(7) { --x: 15%; --y: 50%; }
.dust-particle:nth-child(8) { --x: 85%; --y: 45%; }

@keyframes dustFloat {
  0% {
    transform: rotate(0deg) translateX(20px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: rotate(360deg) translateX(20px) rotate(-360deg);
    opacity: 0.3;
  }
}

/* 警告メッセージ */
.cosmic-warning {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.warning-hologram {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(251, 191, 36, 0.9));
  backdrop-filter: blur(15px);
  border: 2px solid #fbbf24;
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  color: #1f2937;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(245, 158, 11, 0.4);
  animation: warningPulse 0.5s infinite alternate;
}

.warning-icon {
  font-size: 1.2rem;
  animation: warningIconSpin 1s linear infinite;
}

@keyframes warningIconSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.warning-text {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

@keyframes warningPulse {
  0% { 
    transform: translateX(-50%) scale(1);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.3),
      0 0 30px rgba(245, 158, 11, 0.4);
  }
  100% { 
    transform: translateX(-50%) scale(1.05);
    box-shadow: 
      0 12px 35px rgba(0, 0, 0, 0.4),
      0 0 40px rgba(245, 158, 11, 0.6);
  }
}

/* タイムアップメッセージ */
.timeout-explosion {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 20;
}

.explosion-icon {
  font-size: 3rem;
  animation: explosionBoom 0.6s ease-out;
  margin-bottom: 0.5rem;
}

.timeout-message {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ef4444;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 0 0 15px rgba(239, 68, 68, 0.8);
  animation: timeoutShake 0.5s ease-out;
}

@keyframes explosionBoom {
  0% { 
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% { 
    transform: scale(1.5) rotate(180deg);
    opacity: 1;
  }
  100% { 
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

@keyframes timeoutShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
  20%, 40%, 60%, 80% { transform: translateX(3px); }
}

/* トランジション */
.warning-fade-enter-active,
.warning-fade-leave-active {
  transition: all 0.3s ease;
}

.warning-fade-enter-from,
.warning-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px) scale(0.8);
}

.timeout-boom-enter-active {
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.timeout-boom-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0);
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .timer-hologram {
    width: 120px;
    height: 120px;
  }
  
  .energy-ring-container {
    width: 100px;
    height: 100px;
  }
  
  .timer-core {
    width: 70px;
    height: 70px;
  }
  
  .time-value {
    font-size: 1.2rem;
  }
  
  .time-unit {
    font-size: 0.5rem;
  }
  
  .cosmic-warning {
    top: -50px;
  }
  
  .warning-hologram {
    padding: 0.5rem 0.75rem;
  }
  
  .warning-text {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .timer-hologram {
    width: 100px;
    height: 100px;
  }
  
  .energy-ring-container {
    width: 80px;
    height: 80px;
  }
  
  .timer-core {
    width: 60px;
    height: 60px;
  }
  
  .time-value {
    font-size: 1rem;
  }
  
  .dust-particle {
    font-size: 0.6rem;
  }
  
  .explosion-icon {
    font-size: 2rem;
  }
  
  .timeout-message {
    font-size: 1rem;
  }
}

/* アクセシビリティ */
@media (prefers-reduced-motion: reduce) {
  .timer-hologram.danger-mode,
  .timer-hologram.critical-mode,
  .timer-hologram.overtime-mode {
    animation: none;
  }
  
  .pulse-ring {
    animation: none;
    opacity: 0.5;
  }
  
  .dust-particle {
    animation: none;
    opacity: 0.3;
  }
  
  .warp-line {
    animation: none;
    opacity: 0;
  }
  
  .warning-hologram {
    animation: none;
  }
  
  .warning-icon {
    animation: none;
  }
  
  .inner-energy-ring {
    animation: none;
    opacity: 0.6;
  }
  
  .explosion-icon {
    animation: none;
  }
  
  .timeout-message {
    animation: none;
  }
}

/* ハイコントラストモード */
@media (prefers-contrast: high) {
  .timer-core {
    background: #000;
    border-width: 3px;
    color: #fff;
  }
  
  .warning-hologram {
    background: #000;
    border-width: 3px;
    color: #fff;
  }
  
  .progress-ring {
    stroke-width: 10;
  }
  
  .background-ring {
    stroke: #333;
    opacity: 1;
  }
}

/* カスタムフォント対応 */
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

.time-value {
  font-family: 'Orbitron', 'Monaco', 'Consolas', monospace;
}

/* 追加のパフォーマンス最適化 */
.energy-ring-svg,
.timer-core,
.dust-particle {
  will-change: transform, opacity;
}

.progress-ring {
  will-change: stroke-dashoffset, stroke;
}
</style>