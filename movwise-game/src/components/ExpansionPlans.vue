<template>
  <div class="expansion-plans-container">
    <!-- Header Section -->
    <div class="expansion-header">
      <h2 class="expansion-title">
        <span class="title-icon">🚀</span>
        <span class="title-text">訓練ドック拡張計画</span>
      </h2>
      <p class="expansion-subtitle">
        より多くの宇宙飛行士候補を育成するための段階的拡張プロジェクト
      </p>
    </div>

    <!-- Current Status Overview -->
    <div class="status-overview">
      <div class="status-grid">
        <div class="status-item">
          <div class="status-icon">🏗️</div>
          <div class="status-content">
            <div class="status-value">{{ activePhases }}</div>
            <div class="status-label">進行中プロジェクト</div>
          </div>
        </div>
        <div class="status-item">
          <div class="status-icon">⏰</div>
          <div class="status-content">
            <div class="status-value">{{ nextMilestone?.title || '計画中' }}</div>
            <div class="status-label">次のマイルストーン</div>
          </div>
        </div>
        <div class="status-item">
          <div class="status-icon">🎯</div>
          <div class="status-content">
            <div class="status-value">{{ estimatedCompletion }}</div>
            <div class="status-label">完成予定</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Expansion Phases -->
    <div class="phases-container">
      <div 
        v-for="(phase, phaseKey) in expansionPlans" 
        :key="phaseKey"
        :class="[
          'phase-card',
          `phase-${phase.status}`,
          { 'phase-active': isActivePhase(phase) }
        ]"
      >
        <!-- Phase Header -->
        <div class="phase-header">
          <div class="phase-status-indicator">
            <div :class="['status-dot', `status-${phase.status}`]">
              <div class="status-pulse"></div>
            </div>
          </div>
          
          <div class="phase-info">
            <h3 class="phase-title">{{ phase.title }}</h3>
            <div class="phase-meta">
              <span class="phase-target-date">
                📅 目標日: {{ formatDate(phase.targetDate) }}
              </span>
              <span class="phase-status-text">
                {{ getStatusText(phase.status) }}
              </span>
            </div>
          </div>

          <div class="phase-actions">
            <button 
              v-if="phase.status === 'planning'"
              @click="startPhase(phaseKey)"
              class="action-btn start-btn"
            >
              開始
            </button>
            <button 
              @click="togglePhaseDetails(phaseKey)"
              :class="[
                'action-btn details-btn',
                { 'active': expandedPhase === phaseKey }
              ]"
            >
              {{ expandedPhase === phaseKey ? '閉じる' : '詳細' }}
            </button>
          </div>
        </div>

        <!-- Phase Content -->
        <Transition name="phase-details">
          <div v-if="expandedPhase === phaseKey" class="phase-details">
            <!-- Requirements -->
            <div v-if="phase.requirements" class="detail-section">
              <h4 class="detail-title">📋 必要条件</h4>
              <ul class="requirements-list">
                <li 
                  v-for="requirement in phase.requirements" 
                  :key="requirement"
                  class="requirement-item"
                >
                  <span class="requirement-icon">✓</span>
                  <span>{{ requirement }}</span>
                </li>
              </ul>
            </div>

            <!-- Benefits -->
            <div v-if="phase.benefits" class="detail-section">
              <h4 class="detail-title">🌟 期待効果</h4>
              <ul class="benefits-list">
                <li 
                  v-for="benefit in phase.benefits" 
                  :key="benefit"
                  class="benefit-item"
                >
                  <span class="benefit-icon">🚀</span>
                  <span>{{ benefit }}</span>
                </li>
              </ul>
            </div>

            <!-- Upgrades -->
            <div v-if="phase.upgrades" class="detail-section">
              <h4 class="detail-title">⚡ アップグレード内容</h4>
              <ul class="upgrades-list">
                <li 
                  v-for="upgrade in phase.upgrades" 
                  :key="upgrade"
                  class="upgrade-item"
                >
                  <span class="upgrade-icon">🔧</span>
                  <span>{{ upgrade }}</span>
                </li>
              </ul>
            </div>

            <!-- Specializations -->
            <div v-if="phase.specializations" class="detail-section">
              <h4 class="detail-title">🎓 専門分野</h4>
              <div class="specializations-grid">
                <div 
                  v-for="specialization in phase.specializations" 
                  :key="specialization"
                  class="specialization-tag"
                >
                  {{ specialization }}
                </div>
              </div>
            </div>

            <!-- Capacity & Impact -->
            <div v-if="phase.capacity || phase.expectedImpact" class="detail-section">
              <h4 class="detail-title">📊 予想される変化</h4>
              <div class="impact-grid">
                <div v-if="phase.capacity" class="impact-item">
                  <span class="impact-label">収容能力</span>
                  <span class="impact-value">{{ phase.capacity }}</span>
                </div>
                <div v-if="phase.expectedImpact" class="impact-item">
                  <span class="impact-label">教育効果</span>
                  <span class="impact-value">{{ phase.expectedImpact }}</span>
                </div>
              </div>
            </div>

            <!-- Progress Tracking -->
            <div v-if="isActivePhase(phase)" class="detail-section">
              <h4 class="detail-title">📈 進捗状況</h4>
              <div class="progress-container">
                <div class="progress-bar">
                  <div 
                    class="progress-fill"
                    :style="{ width: getPhaseProgress(phaseKey) + '%' }"
                  ></div>
                </div>
                <div class="progress-text">
                  {{ getPhaseProgress(phaseKey) }}% 完了
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Expansion Actions -->
    <div class="expansion-actions">
      <button 
        v-if="canStartExpansion"
        @click="initiateExpansion"
        class="expansion-btn primary-expansion"
      >
        <span class="btn-icon">🚀</span>
        <span>拡張プロセス開始</span>
      </button>
      
      <button 
        @click="showExpansionSettings"
        class="expansion-btn secondary-expansion"
      >
        <span class="btn-icon">⚙️</span>
        <span>拡張設定</span>
      </button>
      
      <button 
        @click="simulateExpansion"
        class="expansion-btn secondary-expansion"
      >
        <span class="btn-icon">🎮</span>
        <span>シミュレーション</span>
      </button>
    </div>

    <!-- Floating Status -->
    <div v-if="showFloatingStatus" class="floating-status">
      <div class="floating-content">
        <span class="floating-icon">⚡</span>
        <span class="floating-text">{{ floatingMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDockStore } from '@/stores/dockStore'
import { storeToRefs } from 'pinia'

const dockStore = useDockStore()
const { expansionPlans, nextExpansionMilestone, isIndividualMode } = storeToRefs(dockStore)

// Local state
const expandedPhase = ref(null)
const showFloatingStatus = ref(false)
const floatingMessage = ref('')

// Computed properties
const activePhases = computed(() => {
  return Object.values(expansionPlans.value).filter(
    phase => phase.status === 'recruiting' || phase.status === 'in_progress'
  ).length
})

const nextMilestone = computed(() => {
  return nextExpansionMilestone.value
})

const estimatedCompletion = computed(() => {
  const phases = Object.values(expansionPlans.value)
  const lastPhase = phases[phases.length - 1]
  return formatDate(lastPhase?.targetDate)
})

const canStartExpansion = computed(() => {
  return isIndividualMode.value && 
         Object.values(expansionPlans.value).every(phase => phase.status === 'planning')
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    planning: '計画中',
    recruiting: '募集中',
    in_progress: '進行中',
    completed: '完了',
    on_hold: '一時停止',
    conceptual: '構想段階'
  }
  return statusMap[status] || status
}

const isActivePhase = (phase) => {
  return phase.status === 'recruiting' || phase.status === 'in_progress'
}

const togglePhaseDetails = (phaseKey) => {
  expandedPhase.value = expandedPhase.value === phaseKey ? null : phaseKey
}

const startPhase = (phaseKey) => {
  const phase = expansionPlans.value[phaseKey]
  if (phase && phase.status === 'planning') {
    dockStore.updateExpansionPlan(phaseKey, { status: 'recruiting' })
    showTemporaryMessage(`${phase.title}を開始しました！`)
  }
}

const getPhaseProgress = (phaseKey) => {
  // シミュレーション用の進捗計算
  const phase = expansionPlans.value[phaseKey]
  if (!phase || !isActivePhase(phase)) return 0
  
  const startDate = new Date('2024-08-01')
  const targetDate = new Date(phase.targetDate)
  const currentDate = new Date()
  
  const totalDuration = targetDate.getTime() - startDate.getTime()
  const elapsed = currentDate.getTime() - startDate.getTime()
  
  return Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 100)
}

const initiateExpansion = () => {
  const result = dockStore.startExpansionProcess()
  if (result.success) {
    showTemporaryMessage(result.message)
  } else {
    showTemporaryMessage(result.message, 'warning')
  }
}

const showExpansionSettings = () => {
  showTemporaryMessage('拡張設定画面は開発中です！')
}

const simulateExpansion = () => {
  showTemporaryMessage('拡張シミュレーションを開始します...')
  // デモ用のシミュレーション
  setTimeout(() => {
    showTemporaryMessage('シミュレーション完了！成功確率: 95%')
  }, 2000)
}

const showTemporaryMessage = (message, type = 'info') => {
  floatingMessage.value = message
  showFloatingStatus.value = true
  
  setTimeout(() => {
    showFloatingStatus.value = false
  }, 3000)
}

// Watchers
watch(nextMilestone, (newMilestone) => {
  if (newMilestone && newMilestone.status === 'recruiting') {
    showTemporaryMessage(`新しいマイルストーン: ${newMilestone.title}`)
  }
})
</script>

<style scoped>
/* Container Styles */
.expansion-plans-container {
  @apply space-y-8;
}

/* Header */
.expansion-header {
  @apply text-center mb-8;
}

.expansion-title {
  @apply flex items-center justify-center gap-3 text-3xl font-bold text-yellow-400 mb-4;
  filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.3));
}

.title-icon {
  @apply text-4xl;
}

.expansion-subtitle {
  @apply text-lg text-slate-400 max-w-3xl mx-auto;
}

/* Status Overview */
.status-overview {
  @apply mb-8;
}

.status-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}

.status-item {
  @apply p-6 flex items-center gap-4 rounded-2xl transition-all duration-300;
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(20px);
}

.status-icon {
  @apply text-3xl;
  filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.3));
}

.status-content {
  @apply flex-1;
}

.status-value {
  @apply text-xl font-bold text-yellow-400;
  filter: drop-shadow(0 0 3px rgba(251, 191, 36, 0.3));
}

.status-label {
  @apply text-sm text-slate-400;
}

/* Phase Cards */
.phases-container {
  @apply space-y-6;
}

.phase-card {
  @apply rounded-3xl overflow-hidden transition-all duration-300;
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(20px);
}

.phase-planning {
  border-color: rgba(156, 163, 175, 0.4);
}

.phase-recruiting {
  border-color: rgba(251, 191, 36, 0.6);
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.2);
}

.phase-in_progress {
  border-color: rgba(34, 197, 94, 0.6);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
}

.phase-completed {
  border-color: rgba(99, 102, 241, 0.6);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
}

.phase-conceptual {
  border-color: rgba(139, 92, 246, 0.4);
}

/* Phase Header */
.phase-header {
  @apply flex items-center gap-6 p-6;
}

.phase-status-indicator {
  @apply flex-shrink-0;
}

.status-dot {
  @apply w-4 h-4 rounded-full relative;
}

.status-planning {
  @apply bg-gray-400;
}

.status-recruiting {
  @apply bg-yellow-400;
}

.status-in_progress {
  @apply bg-green-400;
}

.status-completed {
  @apply bg-blue-400;
}

.status-conceptual {
  @apply bg-purple-400;
}

.status-pulse {
  @apply absolute inset-0 rounded-full animate-pulse;
  background: inherit;
}

.phase-info {
  @apply flex-1;
}

.phase-title {
  @apply text-xl font-bold text-yellow-400 mb-2;
}

.phase-meta {
  @apply flex flex-wrap gap-4 text-sm text-slate-400;
}

.phase-target-date {
  @apply flex items-center gap-1;
}

.phase-status-text {
  @apply font-medium;
}

/* Phase Actions */
.phase-actions {
  @apply flex gap-3;
}

.action-btn {
  @apply px-4 py-2 rounded-xl font-bold transition-all duration-200;
}

.start-btn {
  background: linear-gradient(135deg, #34d399, #10b981);
  @apply text-white hover:shadow-lg hover:scale-105;
}

.details-btn {
  @apply bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 border border-slate-600;
}

.details-btn.active {
  @apply bg-slate-600/70 text-white;
}

/* Phase Details */
.phase-details {
  @apply px-6 pb-6 space-y-6;
  border-top: 1px solid rgba(99, 102, 241, 0.2);
}

.detail-section {
  @apply space-y-3;
}

.detail-title {
  @apply text-lg font-bold text-yellow-400;
  filter: drop-shadow(0 0 3px rgba(251, 191, 36, 0.3));
}

/* Lists */
.requirements-list,
.benefits-list,
.upgrades-list {
  @apply space-y-2;
}

.requirement-item,
.benefit-item,
.upgrade-item {
  @apply flex items-start gap-3 text-slate-400;
}

.requirement-icon {
  @apply text-green-400 font-bold;
}

.benefit-icon {
  @apply text-yellow-400;
}

.upgrade-icon {
  @apply text-blue-400;
}

/* Specializations */
.specializations-grid {
  @apply grid grid-cols-2 md:grid-cols-3 gap-3;
}

.specialization-tag {
  @apply px-3 py-2 rounded-lg text-center text-sm font-medium;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: #a5b4fc;
}

/* Impact */
.impact-grid {
  @apply space-y-3;
}

.impact-item {
  @apply flex justify-between items-center p-3 rounded-lg;
  background: rgba(55, 65, 81, 0.5);
}

.impact-label {
  @apply font-medium;
}

.impact-value {
  @apply text-yellow-400 font-bold;
}

/* Progress */
.progress-container {
  @apply space-y-2;
}

.progress-bar {
  @apply h-3 rounded-full overflow-hidden;
  background: rgba(55, 65, 81, 0.8);
}

.progress-fill {
  @apply h-full rounded-full transition-all duration-500;
  background: linear-gradient(90deg, #34d399, #10b981);
}

.progress-text {
  @apply text-sm font-medium text-center;
}

/* Expansion Actions */
.expansion-actions {
  @apply flex flex-wrap gap-4 justify-center pt-8;
}

.expansion-btn {
  @apply px-6 py-3 rounded-xl font-bold transition-all duration-200 flex items-center gap-2;
}

.primary-expansion {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  @apply text-white hover:shadow-lg hover:scale-105;
}

.secondary-expansion {
  @apply bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 border border-slate-600;
}

.btn-icon {
  @apply text-lg;
}

/* Floating Status */
.floating-status {
  @apply fixed bottom-6 right-6 z-50;
}

.floating-content {
  @apply flex items-center gap-3 px-4 py-3 rounded-2xl;
  background: rgba(15, 23, 42, 0.95);
  border: 2px solid rgba(99, 102, 241, 0.5);
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
}

.floating-icon {
  @apply text-xl;
}

.floating-text {
  @apply font-medium;
}

/* Animations */
.phase-details-enter-active,
.phase-details-leave-active {
  transition: all 0.3s ease;
}

.phase-details-enter-from,
.phase-details-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.phase-details-enter-to,
.phase-details-leave-from {
  opacity: 1;
  max-height: 1000px;
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .phase-header {
    @apply flex-col gap-4 items-start;
  }
  
  .phase-actions {
    @apply w-full justify-center;
  }
  
  .status-grid {
    @apply grid-cols-1 gap-4;
  }
  
  .expansion-actions {
    @apply flex-col;
  }
  
  .floating-status {
    @apply bottom-4 right-4 left-4;
  }
}

@media (max-width: 640px) {
  .expansion-title {
    @apply text-2xl;
  }
  
  .specializations-grid {
    @apply grid-cols-1;
  }
  
  .phase-meta {
    @apply flex-col gap-1;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .phase-card,
  .action-btn,
  .expansion-btn {
    transition: none;
  }
  
  .status-pulse {
    animation: none;
  }
}
</style>