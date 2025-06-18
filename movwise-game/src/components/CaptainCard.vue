<template>
  <div 
    :class="[
      'captain-card transition-all duration-300',
      {
        'main-captain-card': size === 'large',
        'standard-captain-card': size === 'standard',
        'compact-captain-card': size === 'compact',
        'expedition-card': captain.status === 'expedition',
        'scheduled-card': captain.status === 'scheduled',
        'active-card': captain.status === 'active'
      }
    ]"
    @click="handleCardClick"
  >
    <!-- Captain Avatar & Status -->
    <div class="captain-header">
      <div class="avatar-container">
        <div 
          :class="[
            'captain-avatar',
            size === 'large' ? 'avatar-large' : 'avatar-standard'
          ]"
        >
          {{ captain.avatar }}
          <div 
            v-if="captain.status !== 'active'" 
            class="status-overlay"
          >
            <span v-if="captain.status === 'expedition'">🚀</span>
            <span v-if="captain.status === 'scheduled'">⏰</span>
          </div>
        </div>
        
        <!-- Status Indicator -->
        <div 
          :class="[
            'status-indicator',
            `status-${captain.status}`
          ]"
        >
          <div class="status-pulse"></div>
        </div>
      </div>

      <!-- Captain Info -->
      <div class="captain-info">
        <h3 class="captain-name text-yellow-400">
          {{ captain.name }}
        </h3>
        <p class="captain-rank text-slate-400">
          {{ captain.rank }}
        </p>
        
        <!-- Status Message -->
        <div v-if="captain.status !== 'active'" class="status-message">
          <span v-if="captain.status === 'expedition'" class="text-blue-400">
            🌌 {{ captain.currentMission || '深宇宙探査中' }}
          </span>
          <span v-if="captain.status === 'scheduled'" class="text-yellow-400">
            📅 着任予定: {{ formatDate(captain.joinDate) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Detailed Information (Large cards only) -->
    <div v-if="size === 'large' && captain.status === 'active'" class="captain-details">
      <!-- Specialties -->
      <div class="specialties-section">
        <h4 class="section-title">🎯 専門分野</h4>
        <div class="specialties-grid">
          <span 
            v-for="specialty in captain.specialties" 
            :key="specialty"
            class="specialty-tag"
          >
            {{ specialty }}
          </span>
        </div>
      </div>

      <!-- Experience Stats -->
      <div v-if="captain.experience" class="experience-section">
        <h4 class="section-title">📊 指導実績</h4>
        <div class="experience-grid">
          <div class="stat-item">
            <div class="stat-value text-yellow-400">{{ captain.experience.years }}年</div>
            <div class="stat-label">指導経験</div>
          </div>
          <div class="stat-item">
            <div class="stat-value text-yellow-400">{{ captain.experience.totalStudents }}名</div>
            <div class="stat-label">総指導人数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value text-yellow-400">{{ captain.experience.successRate }}%</div>
            <div class="stat-label">成功率</div>
          </div>
        </div>
      </div>

      <!-- Current Missions -->
      <div v-if="captain.currentMissions" class="missions-section">
        <h4 class="section-title">🎮 現在の指導コース</h4>
        <div class="missions-list">
          <div 
            v-for="mission in captain.currentMissions" 
            :key="mission.type"
            class="mission-item"
          >
            <div class="mission-header">
              <span class="mission-icon">
                {{ getMissionIcon(mission.type) }}
              </span>
              <span class="mission-title">{{ mission.title }}</span>
            </div>
            <div class="mission-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: mission.progress + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ mission.progress }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievements -->
      <div v-if="captain.achievements" class="achievements-section">
        <h4 class="section-title">🏆 近年の実績</h4>
        <div class="achievements-list">
          <div 
            v-for="achievement in captain.achievements" 
            :key="achievement.title"
            class="achievement-item"
          >
            <span class="achievement-icon">{{ achievement.icon }}</span>
            <div class="achievement-info">
              <div class="achievement-title">{{ achievement.title }}</div>
              <div class="achievement-year">{{ achievement.year }}年</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Compact Information (Standard cards) -->
    <div v-else-if="size === 'standard'" class="captain-summary">
      <div class="specialties-compact">
        <span 
          v-for="specialty in captain.specialties?.slice(0, 2)" 
          :key="specialty"
          class="specialty-badge"
        >
          {{ specialty }}
        </span>
      </div>
      
      <div v-if="captain.experience" class="stats-compact">
        <div class="stat-compact">
          <span class="stat-icon">📅</span>
          <span>{{ captain.experience.years }}年経験</span>
        </div>
        <div class="stat-compact">
          <span class="stat-icon">🎯</span>
          <span>成功率{{ captain.experience.successRate }}%</span>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="captain-actions">
      <button 
        v-if="captain.status === 'active'"
        @click="$emit('selectCaptain', captain)"
        class="action-button primary-action"
      >
        <span class="button-icon">🚀</span>
        <span>協力訓練開始</span>
      </button>
      
      <button 
        v-else-if="captain.status === 'expedition'"
        @click="$emit('viewDetails', captain)"
        class="action-button secondary-action"
      >
        <span class="button-icon">📡</span>
        <span>帰還予定確認</span>
      </button>
      
      <button 
        v-else-if="captain.status === 'scheduled'"
        @click="$emit('viewSchedule', captain)"
        class="action-button secondary-action"
      >
        <span class="button-icon">📋</span>
        <span>着任スケジュール</span>
      </button>
    </div>

    <!-- Hover Effects -->
    <div class="card-overlay"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  captain: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'standard', // 'large', 'standard', 'compact'
    validator: (value) => ['large', 'standard', 'compact'].includes(value)
  },
  clickable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['selectCaptain', 'viewDetails', 'viewSchedule', 'cardClick'])

const handleCardClick = () => {
  if (props.clickable) {
    emit('cardClick', props.captain)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const getMissionIcon = (type) => {
  const icons = {
    sound: '🎵',
    grammar: '🌌',
    conversation: '💬',
    reading: '📚',
    writing: '✍️',
    listening: '👂'
  }
  return icons[type] || '🎯'
}
</script>

<style scoped>
/* Base Captain Card Styles */
.captain-card {
  @apply relative rounded-3xl overflow-hidden cursor-pointer;
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
}

.captain-card:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.6);
  box-shadow: 
    0 10px 30px rgba(99, 102, 241, 0.3),
    0 0 20px rgba(251, 191, 36, 0.2);
}

/* Size Variants */
.main-captain-card {
  @apply col-span-2 p-8;
  min-height: 600px;
}

.standard-captain-card {
  @apply p-6;
  min-height: 320px;
}

.compact-captain-card {
  @apply p-4;
  min-height: 200px;
}

/* Status Variants */
.expedition-card {
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(59, 130, 246, 0.4);
}

.scheduled-card {
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(251, 191, 36, 0.4);
}

.active-card {
  border-color: rgba(34, 197, 94, 0.4);
}

/* Captain Header */
.captain-header {
  @apply flex items-start gap-6 mb-6;
}

.avatar-container {
  @apply relative flex-shrink-0;
}

.captain-avatar {
  @apply flex items-center justify-center rounded-full;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
  border: 2px solid rgba(251, 191, 36, 0.5);
  position: relative;
}

.avatar-large {
  @apply text-6xl w-24 h-24;
}

.avatar-standard {
  @apply text-4xl w-16 h-16;
}

.status-overlay {
  @apply absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg;
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.5);
}

.status-indicator {
  @apply absolute -bottom-1 -right-1 w-4 h-4 rounded-full;
}

.status-active {
  @apply bg-green-500;
}

.status-expedition {
  @apply bg-blue-500;
}

.status-scheduled {
  @apply bg-yellow-500;
}

.status-pulse {
  @apply w-full h-full rounded-full animate-pulse;
  background: inherit;
}

/* Captain Info */
.captain-info {
  @apply flex-1;
}

.captain-name {
  @apply text-2xl font-bold mb-2;
  filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.3));
}

.captain-rank {
  @apply text-lg mb-3;
}

.status-message {
  @apply text-sm;
}

/* Detail Sections */
.captain-details {
  @apply space-y-6;
}

.section-title {
  @apply text-lg font-bold text-yellow-400 mb-3;
  filter: drop-shadow(0 0 3px rgba(251, 191, 36, 0.3));
}

/* Specialties */
.specialties-section {
  @apply mb-6;
}

.specialties-grid {
  @apply flex flex-wrap gap-2;
}

.specialty-tag {
  @apply px-3 py-1 rounded-full text-sm font-medium;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: #a5b4fc;
}

.specialty-badge {
  @apply px-2 py-1 rounded-lg text-xs;
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
}

/* Experience Stats */
.experience-section {
  @apply mb-6;
}

.experience-grid {
  @apply grid grid-cols-3 gap-4;
}

.stat-item {
  @apply text-center;
}

.stat-value {
  @apply text-2xl font-bold mb-1;
  filter: drop-shadow(0 0 3px rgba(251, 191, 36, 0.3));
}

.stat-label {
  @apply text-sm text-slate-400;
}

/* Compact Stats */
.captain-summary {
  @apply space-y-4 mb-4;
}

.specialties-compact {
  @apply flex flex-wrap gap-1;
}

.stats-compact {
  @apply space-y-2;
}

.stat-compact {
  @apply flex items-center gap-2 text-sm;
}

.stat-icon {
  @apply text-lg;
}

/* Missions */
.missions-section {
  @apply mb-6;
}

.missions-list {
  @apply space-y-3;
}

.mission-item {
  @apply space-y-2;
}

.mission-header {
  @apply flex items-center gap-2;
}

.mission-icon {
  @apply text-lg;
}

.mission-title {
  @apply font-medium;
}

.mission-progress {
  @apply flex items-center gap-3;
}

.progress-bar {
  @apply flex-1 h-2 rounded-full overflow-hidden;
  background: rgba(55, 65, 81, 0.8);
}

.progress-fill {
  @apply h-full rounded-full transition-all duration-300;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
}

.progress-text {
  @apply text-sm font-medium;
}

/* Achievements */
.achievements-section {
  @apply mb-6;
}

.achievements-list {
  @apply space-y-2;
}

.achievement-item {
  @apply flex items-center gap-3;
}

.achievement-icon {
  @apply text-lg;
}

.achievement-info {
  @apply flex-1;
}

.achievement-title {
  @apply font-medium;
}

.achievement-year {
  @apply text-sm text-slate-400;
}

/* Action Buttons */
.captain-actions {
  @apply mt-6 flex gap-3;
}

.action-button {
  @apply px-4 py-3 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 flex-1;
}

.primary-action {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  @apply text-white hover:shadow-lg hover:scale-105;
}

.secondary-action {
  @apply bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 border border-slate-600;
}

.button-icon {
  @apply text-lg;
}

/* Card Overlay */
.card-overlay {
  @apply absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
}

.captain-card:hover .card-overlay {
  @apply opacity-100;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-captain-card {
    @apply col-span-1 p-6;
    min-height: auto;
  }
  
  .captain-header {
    @apply gap-4;
  }
  
  .experience-grid {
    @apply grid-cols-1 gap-2;
  }
  
  .captain-actions {
    @apply flex-col;
  }
}

@media (max-width: 640px) {
  .specialties-grid {
    @apply gap-1;
  }
  
  .specialty-tag {
    @apply px-2 py-1 text-xs;
  }
  
  .missions-list {
    @apply space-y-2;
  }
  
  .achievements-list {
    @apply space-y-1;
  }
}

/* Animation Enhancements */
@keyframes cosmic-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(99, 102, 241, 0.8);
  }
}

.captain-card.active-card:hover {
  animation: cosmic-pulse 2s ease-in-out infinite;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .captain-card,
  .action-button,
  .progress-fill {
    transition: none;
  }
  
  .captain-card:hover {
    transform: none;
    animation: none;
  }
}
</style>