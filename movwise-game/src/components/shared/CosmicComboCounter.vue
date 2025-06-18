<template>
  <div class="cosmic-combo-counter">
    <!-- メインコンボ表示 -->
    <Transition
      name="combo-cosmic-appear"
      @enter="onEnter"
      @leave="onLeave"
    >
      <div 
        v-if="combo > 1" 
        :class="['cosmic-combo-display', comboRankClass, { 'legendary-combo': combo >= 15 }]"
        :key="combo"
      >
        <!-- エネルギーフィールド背景 -->
        <div class="energy-field-bg">
          <div class="energy-wave wave-1"></div>
          <div class="energy-wave wave-2"></div>
          <div class="energy-wave wave-3"></div>
        </div>
        
        <!-- 宇宙の稲妻エフェクト -->
        <div v-if="combo >= 5" class="cosmic-lightning">
          <span class="lightning-bolt primary">⚡</span>
          <span class="lightning-bolt secondary">⚡</span>
          <span class="lightning-bolt tertiary">✦</span>
        </div>
        
        <!-- メインコンボコンテンツ -->
        <div class="combo-core-content">
          <div class="combo-rank-label">{{ getRankLabel() }}</div>
          <div class="combo-multiplier">×{{ combo }}</div>
          <div v-if="combo >= 10" class="power-level-text">{{ getPowerLevel() }}</div>
        </div>
        
        <!-- 軌道パーティクル -->
        <div class="orbital-particles">
          <span 
            v-for="i in Math.min(combo, 12)" 
            :key="i"
            class="orbital-particle"
            :style="{ 
              '--delay': i * 0.1 + 's',
              '--orbit-radius': (40 + (combo * 2)) + 'px',
              '--angle': (360 / Math.min(combo, 12)) * i + 'deg'
            }"
          >
            {{ getParticleIcon(i) }}
          </span>
        </div>
        
        <!-- スコアブースト表示 */
        <div class="score-boost-indicator">
          <div class="boost-icon">🚀</div>
          <div class="boost-text">+{{ (combo - 1) * 50 }} Boost</div>
        </div>
      </div>
    </Transition>
    
    <!-- 宇宙ストリークカウンター -->
    <Transition name="streak-cosmic-fade">
      <div v-if="streak > 0" class="cosmic-streak-counter">
        <div class="streak-flame-icon">🔥</div>
        <div class="streak-info-panel">
          <div class="streak-number">{{ streak }}</div>
          <div class="streak-label">Battle Streak</div>
          <div v-if="streak >= nextMilestone" class="milestone-glow"></div>
        </div>
        <div class="streak-energy-bar">
          <div 
            class="energy-fill" 
            :style="{ width: (streak % 5) * 20 + '%' }"
          ></div>
        </div>
      </div>
    </Transition>
    
    <!-- 宇宙アチーブメント通知 -->
    <Transition name="achievement-cosmic-slide">
      <div v-if="showAchievement" class="cosmic-achievement-notification">
        <div class="achievement-hologram">
          <div class="achievement-icon-container">
            <div class="achievement-icon">🏆</div>
            <div class="achievement-energy-ring"></div>
          </div>
          <div class="achievement-content">
            <div class="achievement-title">ACHIEVEMENT UNLOCKED</div>
            <div class="achievement-text">{{ achievementText }}</div>
          </div>
        </div>
        <div class="hologram-scan-line"></div>
      </div>
    </Transition>
    
    <!-- レベル進捗インジケーター -->
    <div v-if="playerLevel" class="cosmic-level-indicator">
      <div class="level-crystal">
        <div class="crystal-core">{{ playerLevel }}</div>
        <div class="crystal-glow"></div>
      </div>
      <div class="level-label">Galaxy Rank</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

// Props
const props = defineProps({
  combo: {
    type: Number,
    default: 1
  },
  streak: {
    type: Number,
    default: 0
  },
  maxStreak: {
    type: Number,
    default: 0
  },
  playerLevel: {
    type: String,
    default: null
  },
  gameMode: {
    type: String,
    default: 'cadet' // cadet, ranger, commander, master
  }
})

// Emits
const emit = defineEmits(['comboBreak', 'achievement', 'milestone'])

// Reactive state
const showAchievement = ref(false)
const achievementText = ref('')
const lastCombo = ref(1)

// Computed
const comboRankClass = computed(() => {
  if (props.combo >= 20) return 'combo-cosmic-master'
  if (props.combo >= 15) return 'combo-galaxy-commander'
  if (props.combo >= 10) return 'combo-star-captain'
  if (props.combo >= 5) return 'combo-space-ranger'
  return 'combo-cadet'
})

const nextMilestone = computed(() => {
  return Math.ceil(props.streak / 5) * 5
})

// Methods
const getRankLabel = () => {
  if (props.combo >= 20) return 'COSMIC MASTER'
  if (props.combo >= 15) return 'GALAXY COMMANDER'
  if (props.combo >= 10) return 'STAR CAPTAIN'
  if (props.combo >= 5) return 'SPACE RANGER'
  return 'COMBO'
}

const getPowerLevel = () => {
  if (props.combo >= 20) return 'MAXIMUM POWER!'
  if (props.combo >= 15) return 'LEGENDARY!'
  if (props.combo >= 10) return 'MEGA POWER!'
  return 'POWER UP!'
}

const getParticleIcon = (index) => {
  const icons = ['⭐', '✦', '💫', '🌟', '⚡', '💎']
  return icons[index % icons.length]
}

// Watch for combo changes
watch(() => props.combo, (newCombo, oldCombo) => {
  if (newCombo > oldCombo) {
    checkCosmicAchievements(newCombo)
  }
  
  if (newCombo < oldCombo && oldCombo > 1) {
    emit('comboBreak', oldCombo)
  }
  
  lastCombo.value = oldCombo
})

// Watch for streak milestones
watch(() => props.streak, (newStreak, oldStreak) => {
  if (newStreak > 0 && newStreak % 5 === 0 && newStreak > oldStreak) {
    checkStreakMilestones(newStreak)
    emit('milestone', newStreak)
  }
})

// Methods
const checkCosmicAchievements = (combo) => {
  let achievement = null
  
  switch(combo) {
    case 5:
      achievement = 'Space Ranger Combo!'
      break
    case 10:
      achievement = 'Star Captain Mastery!'
      break
    case 15:
      achievement = 'Galaxy Commander Elite!'
      break
    case 20:
      achievement = 'Cosmic Master Achieved!'
      break
    case 25:
      achievement = 'Beyond the Stars!'
      break
  }
  
  if (achievement) {
    showCosmicAchievement(achievement, 'combo', combo)
  }
}

const checkStreakMilestones = (streak) => {
  let achievement = null
  
  if (streak === 10) {
    achievement = 'Stellar Warrior! 🌟'
  } else if (streak === 25) {
    achievement = 'Galactic Legend! ⚡'
  } else if (streak === 50) {
    achievement = 'Universe Champion! 👑'
  } else if (streak === 100) {
    achievement = 'Cosmic Deity! 🌌'
  }
  
  if (achievement) {
    showCosmicAchievement(achievement, 'streak', streak)
  }
}

const showCosmicAchievement = (text, type, value) => {
  showAchievement.value = true
  achievementText.value = text
  emit('achievement', { type, value, text })
  
  // Hide achievement after 4 seconds
  setTimeout(() => {
    showAchievement.value = false
  }, 4000)
}

// Animation hooks
const onEnter = (el) => {
  el.style.transform = 'scale(0) rotate(-360deg)'
  el.style.opacity = '0'
  
  nextTick(() => {
    el.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    el.style.transform = 'scale(1) rotate(0deg)'
    el.style.opacity = '1'
  })
}

const onLeave = (el) => {
  el.style.transition = 'all 0.4s ease-out'
  el.style.transform = 'scale(0) rotate(360deg)'
  el.style.opacity = '0'
}
</script>

<style scoped>
.cosmic-combo-counter {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  z-index: 100;
}

/* メインコンボ表示 */
.cosmic-combo-display {
  position: relative;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95));
  backdrop-filter: blur(20px);
  border: 2px solid rgba(99, 102, 241, 0.6);
  border-radius: 1.5rem;
  padding: 1.5rem 2rem;
  text-align: center;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(99, 102, 241, 0.3);
  transform-origin: center;
  overflow: hidden;
}

/* コンボランク別スタイル */
.cosmic-combo-display.combo-space-ranger {
  border-color: rgba(34, 197, 94, 0.8);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(34, 197, 94, 0.4);
}

.cosmic-combo-display.combo-star-captain {
  border-color: rgba(245, 158, 11, 0.8);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(245, 158, 11, 0.4);
  animation: captainPulse 1s infinite alternate;
}

.cosmic-combo-display.combo-galaxy-commander {
  border-color: rgba(139, 92, 246, 0.8);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 50px rgba(139, 92, 246, 0.5);
  animation: commanderGlow 1.5s infinite alternate;
}

.cosmic-combo-display.combo-cosmic-master {
  border-color: rgba(251, 191, 36, 0.9);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(251, 191, 36, 0.6);
  animation: masterRadiance 2s infinite;
}

@keyframes captainPulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
}

@keyframes commanderGlow {
  0% { 
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 0 50px rgba(139, 92, 246, 0.5);
  }
  100% { 
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.5),
      0 0 70px rgba(139, 92, 246, 0.8);
  }
}

@keyframes masterRadiance {
  0%, 100% { 
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.5),
      0 0 60px rgba(251, 191, 36, 0.6);
  }
  50% { 
    box-shadow: 
      0 16px 50px rgba(0, 0, 0, 0.6),
      0 0 80px rgba(251, 191, 36, 0.9);
  }
}

/* エネルギーフィールド背景 */
.energy-field-bg {
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  pointer-events: none;
  overflow: hidden;
  border-radius: 1.5rem;
}

.energy-wave {
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(99, 102, 241, 0.1), 
    transparent
  );
  animation: energyFlow 3s linear infinite;
}

.energy-wave.wave-1 { animation-delay: 0s; }
.energy-wave.wave-2 { animation-delay: 1s; }
.energy-wave.wave-3 { animation-delay: 2s; }

@keyframes energyFlow {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* 宇宙の稲妻エフェクト */
.cosmic-lightning {
  position: absolute;
  top: -15px;
  left: -15px;
  right: -15px;
  bottom: -15px;
  pointer-events: none;
}

.lightning-bolt {
  position: absolute;
  font-size: 1.8rem;
  animation: cosmicLightning 0.8s infinite;
}

.lightning-bolt.primary {
  top: -10px;
  left: -10px;
  color: #fbbf24;
  animation-delay: 0s;
}

.lightning-bolt.secondary {
  top: -10px;
  right: -10px;
  color: #8b5cf6;
  animation-delay: 0.3s;
}

.lightning-bolt.tertiary {
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  color: #22c55e;
  animation-delay: 0.6s;
}

@keyframes cosmicLightning {
  0%, 70%, 100% { 
    opacity: 0; 
    transform: scale(0.8) rotate(0deg); 
  }
  10%, 60% { 
    opacity: 1; 
    transform: scale(1.3) rotate(15deg); 
  }
}

/* メインコンボコンテンツ */
.combo-core-content {
  position: relative;
  z-index: 2;
}

.combo-rank-label {
  font-size: 0.9rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 0 0 10px rgba(99, 102, 241, 0.6);
}

.combo-multiplier {
  font-size: 2.5rem;
  font-weight: bold;
  color: #f1f5f9;
  line-height: 1;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

.power-level-text {
  font-size: 0.8rem;
  font-weight: bold;
  color: #fbbf24;
  animation: powerTextGlow 1s infinite alternate;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@keyframes powerTextGlow {
  0% { 
    text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
    color: #fbbf24;
  }
  100% { 
    text-shadow: 0 0 20px rgba(251, 191, 36, 1);
    color: #fde047;
  }
}

/* 軌道パーティクル */
.orbital-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.orbital-particle {
  position: absolute;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  animation: orbitalMotion 4s linear infinite;
  animation-delay: var(--delay);
  transform-origin: 0 0;
}

@keyframes orbitalMotion {
  0% {
    transform: rotate(var(--angle)) translateX(var(--orbit-radius)) rotate(calc(-1 * var(--angle)));
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: rotate(calc(var(--angle) + 360deg)) translateX(var(--orbit-radius)) rotate(calc(-1 * (var(--angle) + 360deg)));
    opacity: 0.4;
  }
}

/* スコアブースト表示 */
.score-boost-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #fbbf24;
  font-weight: bold;
}

.boost-icon {
  font-size: 1rem;
  animation: boostPulse 1s infinite;
}

@keyframes boostPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* 宇宙ストリークカウンター */
.cosmic-streak-counter {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(239, 68, 68, 0.3);
  position: relative;
  overflow: hidden;
}

.streak-flame-icon {
  font-size: 1.8rem;
  animation: flameFlicker 1.5s infinite alternate;
}

@keyframes flameFlicker {
  0% { 
    transform: scale(1) rotate(-3deg);
    filter: hue-rotate(0deg);
  }
  100% { 
    transform: scale(1.15) rotate(3deg);
    filter: hue-rotate(20deg);
  }
}

.streak-info-panel {
  text-align: center;
  position: relative;
}

.streak-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #f97316;
  line-height: 1;
  text-shadow: 0 0 15px rgba(249, 115, 22, 0.6);
}

.streak-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.milestone-glow {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: milestoneGlow 2s infinite;
}

@keyframes milestoneGlow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.streak-energy-bar {
  width: 60px;
  height: 6px;
  background: rgba(71, 85, 105, 0.5);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.energy-fill {
  height: 100%;
  background: linear-gradient(90deg, #f97316, #fbbf24);
  border-radius: 3px;
  transition: width 0.5s ease;
  position: relative;
}

.energy-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  animation: energyShine 1.5s infinite;
}

@keyframes energyShine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* 宇宙アチーブメント通知 */
.cosmic-achievement-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  pointer-events: none;
}

.achievement-hologram {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(52, 211, 153, 0.95));
  backdrop-filter: blur(20px);
  border: 2px solid #6ee7b7;
  border-radius: 1.5rem;
  padding: 1.5rem 2rem;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 50px rgba(16, 185, 129, 0.4);
  position: relative;
  overflow: hidden;
}

.achievement-icon-container {
  position: relative;
}

.achievement-icon {
  font-size: 2.5rem;
  animation: achievementFloat 1s ease-out;
  position: relative;
  z-index: 2;
}

.achievement-energy-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 2px solid rgba(251, 191, 36, 0.6);
  border-radius: 50%;
  animation: energyRingPulse 2s infinite;
}

@keyframes achievementFloat {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0) rotate(0deg); }
  40% { transform: translateY(-15px) rotate(-10deg); }
  60% { transform: translateY(-8px) rotate(5deg); }
}

@keyframes energyRingPulse {
  0%, 100% { 
    transform: scale(1); 
    opacity: 0.6; 
    border-color: rgba(251, 191, 36, 0.6);
  }
  50% { 
    transform: scale(1.3); 
    opacity: 1; 
    border-color: rgba(251, 191, 36, 1);
  }
}

.achievement-content {
  text-align: left;
}

.achievement-title {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.achievement-text {
  font-size: 1.1rem;
  color: white;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.hologram-scan-line {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: hologramScan 2s infinite;
}

@keyframes hologramScan {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* レベル進捗インジケーター */
.cosmic-level-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.level-crystal {
  position: relative;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.crystal-core {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: 2px solid #a78bfa;
  border-radius: 12px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 1rem;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  position: relative;
  z-index: 2;
}

.crystal-glow {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%);
  border-radius: 15px;
  animation: crystalGlow 3s infinite alternate;
}

@keyframes crystalGlow {
  0% { opacity: 0.5; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.1); }
}

.level-label {
  font-size: 0.8rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
}

/* トランジション */
.combo-cosmic-appear-enter-active {
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.combo-cosmic-appear-leave-active {
  transition: all 0.4s ease-out;
}

.combo-cosmic-appear-enter-from {
  transform: scale(0) rotate(-360deg);
  opacity: 0;
}

.combo-cosmic-appear-leave-to {
  transform: scale(0) rotate(360deg);
  opacity: 0;
}

.streak-cosmic-fade-enter-active,
.streak-cosmic-fade-leave-active {
  transition: all 0.4s ease;
}

.streak-cosmic-fade-enter-from,
.streak-cosmic-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.8);
}

.achievement-cosmic-slide-enter-active {
  transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.achievement-cosmic-slide-leave-active {
  transition: all 0.5s ease-in;
}

.achievement-cosmic-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-30px) scale(0.8);
}

.achievement-cosmic-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-30px) scale(0.8);
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .cosmic-combo-display {
    padding: 1rem 1.5rem;
  }
  
  .combo-multiplier {
    font-size: 2rem;
  }
  
  .combo-rank-label {
    font-size: 0.8rem;
  }
  
  .cosmic-streak-counter {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }
  
  .streak-flame-icon {
    font-size: 1.5rem;
  }
  
  .streak-number {
    font-size: 1.3rem;
  }
  
  .achievement-hologram {
    padding: 1rem 1.5rem;
    margin: 0 1rem;
  }
  
  .achievement-icon {
    font-size: 2rem;
  }
  
  .achievement-text {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .cosmic-combo-display {
    padding: 0.75rem 1rem;
  }
  
  .combo-multiplier {
    font-size: 1.8rem;
  }
  
  .orbital-particle {
    font-size: 0.8rem;
  }
  
  .cosmic-lightning .lightning-bolt {
    font-size: 1.5rem;
  }
  
  .cosmic-streak-counter {
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
  }
  
  .streak-energy-bar {
    width: 40px;
    height: 4px;
  }
  
  .achievement-hologram {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .level-crystal {
    width: 40px;
    height: 40px;
  }
  
  .crystal-core {
    font-size: 0.9rem;
  }
}

/* アクセシビリティ */
@media (prefers-reduced-motion: reduce) {
  .cosmic-combo-display.combo-star-captain,
  .cosmic-combo-display.combo-galaxy-commander,
  .cosmic-combo-display.combo-cosmic-master {
    animation: none;
  }
  
  .cosmic-lightning .lightning-bolt {
    animation: none;
    opacity: 1;
  }
  
  .orbital-particle {
    animation: none;
    opacity: 0;
  }
  
  .streak-flame-icon {
    animation: none;
  }
  
  .achievement-icon {
    animation: none;
  }
  
  .crystal-glow {
    animation: none;
    opacity: 0.7;
  }
  
  .energy-wave {
    animation: none;
  }
}

/* ハイコントラストモード */
@media (prefers-contrast: high) {
  .cosmic-combo-display {
    background: #000;
    border-width: 3px;
    color: #fff;
  }
  
  .cosmic-streak-counter {
    background: #000;
    border-width: 2px;
  }
  
  .achievement-hologram {
    background: #000;
    border-width: 3px;
  }
  
  .level-crystal .crystal-core {
    background: #000;
    border-width: 3px;
    color: #fff;
  }
}
  