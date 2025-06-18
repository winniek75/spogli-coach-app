<template>
  <div class="min-h-screen galaxy-background">
    <!-- Galaxy Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="stars-layer-1"></div>
      <div class="stars-layer-2"></div>
      <div class="stars-layer-3"></div>
    </div>

    <!-- Dynamic Header Based on Mode -->
    <header class="relative z-10 px-6 py-8">
      <div class="max-w-7xl mx-auto">
        <!-- Navigation & Mode Switcher -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
            <button 
              @click="$router.push('/')" 
              class="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/70 rounded-xl transition-all border border-slate-600/50"
            >
              <span class="text-xl">🏠</span>
              <span class="text-sm text-slate-300">ホーム</span>
            </button>
          </div>

          <!-- Mode Selector -->
          <div class="mode-selector">
            <button 
              v-for="mode in availableModes" 
              :key="mode.key"
              @click="switchMode(mode.key)"
              :class="[
                'mode-btn',
                { 'mode-active': currentMode === mode.key }
              ]"
            >
              <span class="mode-icon">{{ mode.icon }}</span>
              <span class="mode-label">{{ mode.label }}</span>
            </button>
          </div>
        </div>

        <!-- Dynamic Title Based on Mode -->
        <div class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold text-yellow-400 cosmic-title mb-4">
            {{ modeConfig.title }}
          </h1>
          <p class="text-xl mb-2 text-slate-400">
            {{ modeConfig.subtitle }}
          </p>
          <p class="text-base text-slate-400 max-w-3xl mx-auto">
            {{ modeConfig.description }}
          </p>
        </div>

        <!-- Dock Overview Stats -->
        <div class="dock-stats-overview">
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-icon cosmic-glow">🚀</span>
              <div class="stat-content">
                <div class="stat-value text-yellow-400">{{ dockOverview.activeCaptains }}</div>
                <div class="stat-label text-slate-400">アクティブ船長</div>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-icon cosmic-glow">🎯</span>
              <div class="stat-content">
                <div class="stat-value text-yellow-400">{{ dockOverview.totalSessions }}</div>
                <div class="stat-label">総訓練セッション</div>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-icon cosmic-glow">👥</span>
              <div class="stat-content">
                <div class="stat-value text-yellow-400">{{ dockOverview.activeStudents }}</div>
                <div class="stat-label">訓練中の生徒</div>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-icon cosmic-glow">📈</span>
              <div class="stat-content">
                <div class="stat-value text-yellow-400">{{ dockOverview.successRate }}%</div>
                <div class="stat-label">成功率</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="relative z-10 px-6 pb-20">
      <div class="max-w-7xl mx-auto">

        <!-- Individual Mode Layout -->
        <div v-if="isIndividualMode" class="individual-mode-layout">
          <!-- Main Captain Section -->
          <section class="main-captain-section mb-12">
            <div class="section-header mb-8">
              <h2 class="section-title">
                <span class="title-icon">👨‍🚀</span>
                <span>メイン船長（指導責任者）</span>
              </h2>
              <p class="section-subtitle">
                あなた専属の経験豊富な英語学習船長
              </p>
            </div>
            
            <div class="main-captain-container">
              <CaptainCard 
                :captain="mainCaptain"
                size="large"
                @selectCaptain="handleCaptainSelection"
                @cardClick="showCaptainDetails"
              />
            </div>
          </section>

          <!-- Expansion Plans Section -->
          <section v-if="showExpansionPlans" class="expansion-section mb-12">
            <ExpansionPlans />
          </section>

          <!-- Future Captains Preview -->
          <section class="future-captains-section mb-12">
            <div class="section-header mb-8">
              <h2 class="section-title">
                <span class="title-icon">🌟</span>
                <span>着任予定船長</span>
              </h2>
              <p class="section-subtitle">
                ドック拡張計画で参加予定の優秀な指導船長たち
              </p>
            </div>
            
            <div class="future-captains-grid">
              <CaptainCard 
                v-for="captain in futureCaptains" 
                :key="captain.id"
                :captain="captain"
                size="standard"
                @viewDetails="showCaptainDetails"
                @viewSchedule="showJoinSchedule"
              />
            </div>
          </section>
        </div>

        <!-- Multi Mode Layout -->
        <div v-else-if="isMultiMode" class="multi-mode-layout">
          <!-- All Captains Section -->
          <section class="all-captains-section mb-12">
            <div class="section-header mb-8">
              <h2 class="section-title">
                <span class="title-icon">👥</span>
                <span>指導船長チーム</span>
              </h2>
              <p class="section-subtitle">
                専門分野別の経験豊富な船長陣
              </p>
            </div>
            
            <div class="captains-grid">
              <CaptainCard 
                v-for="captain in allCaptains" 
                :key="captain.id"
                :captain="captain"
                size="standard"
                @selectCaptain="handleCaptainSelection"
                @viewDetails="showCaptainDetails"
              />
            </div>
          </section>

          <!-- Team Collaboration Features -->
          <section class="collaboration-section mb-12">
            <div class="section-header mb-8">
              <h2 class="section-title">
                <span class="title-icon">🤝</span>
                <span>チーム連携訓練</span>
              </h2>
            </div>
            
            <div class="collaboration-features">
              <div class="feature-card" @click="startTeamMission">
                <div class="feature-icon">🚀</div>
                <div class="feature-content">
                  <h3>合同ミッション</h3>
                  <p>複数船長による協力指導</p>
                </div>
              </div>
              <div class="feature-card" @click="scheduleGroupSession">
                <div class="feature-icon">📅</div>
                <div class="feature-content">
                  <h3>グループセッション</h3>
                  <p>生徒同士の切磋琢磨</p>
                </div>
              </div>
              <div class="feature-card" @click="viewTeamAnalytics">
                <div class="feature-icon">📊</div>
                <div class="feature-content">
                  <h3>チーム分析</h3>
                  <p>総合学習効果測定</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Expanding Mode Layout -->
        <div v-else-if="isExpandingMode" class="expanding-mode-layout">
          <!-- Current Setup -->
          <section class="current-setup-section mb-12">
            <div class="section-header mb-8">
              <h2 class="section-title">
                <span class="title-icon">🏗️</span>
                <span>現在の体制</span>
              </h2>
            </div>
            
            <div class="current-captain-container">
              <CaptainCard 
                :captain="mainCaptain"
                size="large"
                @selectCaptain="handleCaptainSelection"
              />
            </div>
          </section>

          <!-- Expansion Progress -->
          <section class="expansion-progress-section mb-12">
            <ExpansionPlans />
          </section>

          <!-- Preview of Coming Changes -->
          <section class="preview-section mb-12">
            <div class="section-header mb-8">
              <h2 class="section-title">
                <span class="title-icon">🔮</span>
                <span>拡張後の予想図</span>
              </h2>
            </div>
            
            <div class="preview-grid">
              <div class="preview-card current">
                <h3>現在</h3>
                <div class="preview-stats">
                  <div>船長: 1名</div>
                  <div>最大生徒: 30名</div>
                  <div>同時セッション: 5</div>
                </div>
              </div>
              <div class="preview-arrow">→</div>
              <div class="preview-card future">
                <h3>拡張後</h3>
                <div class="preview-stats">
                  <div>船長: {{ plannedCaptainCount }}名</div>
                  <div>最大生徒: {{ plannedStudentCapacity }}名</div>
                  <div>同時セッション: {{ plannedSessionCapacity }}</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Quick Actions (All Modes) -->
        <section class="quick-actions-section">
          <div class="section-header mb-8">
            <h2 class="section-title">
              <span class="title-icon">⚡</span>
              <span>クイックアクション</span>
            </h2>
          </div>
          
          <div class="quick-actions-grid">
            <button 
              @click="quickStartTraining"
              class="action-card primary-action"
            >
              <div class="action-icon">🚀</div>
              <div class="action-content">
                <h3>即時訓練開始</h3>
                <p>利用可能な船長で今すぐ開始</p>
              </div>
            </button>
            
            <button 
              @click="scheduleTraining"
              class="action-card secondary-action"
            >
              <div class="action-icon">📅</div>
              <div class="action-content">
                <h3>訓練予約</h3>
                <p>希望日時で訓練を予約</p>
              </div>
            </button>
            
            <button 
              @click="viewTrainingHistory"
              class="action-card secondary-action"
            >
              <div class="action-icon">📊</div>
              <div class="action-content">
                <h3>訓練履歴</h3>
                <p>過去の訓練記録を確認</p>
              </div>
            </button>
            
            <button 
              @click="customizeTraining"
              class="action-card secondary-action"
            >
              <div class="action-icon">⚙️</div>
              <div class="action-content">
                <h3>訓練カスタマイズ</h3>
                <p>学習内容・難易度調整</p>
              </div>
            </button>
          </div>
        </section>

      </div>
    </main>

    <!-- Mode Switch Confirmation Modal -->
    <Transition name="modal">
      <div v-if="showModeConfirmation" class="modal-overlay" @click="cancelModeSwitch">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>モード変更確認</h3>
            <button @click="cancelModeSwitch" class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <p>ドックモードを「{{ pendingModeChange?.label }}」に変更しますか？</p>
            <div class="mode-change-details">
              <div class="current-mode">
                <h4>現在</h4>
                <p>{{ modeConfig.title }}</p>
              </div>
              <div class="arrow">→</div>
              <div class="new-mode">
                <h4>変更後</h4>
                <p>{{ pendingModeChange?.title }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="cancelModeSwitch" class="btn-secondary">キャンセル</button>
            <button @click="confirmModeSwitch" class="btn-primary">変更する</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 統一フッターナビゲーション -->
    <CommonFooter 
      :active="'profile'"
      @navigate="handleFooterNavigation"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDockStore } from '@/stores/dockStore'
import { storeToRefs } from 'pinia'
import CaptainCard from '@/components/CaptainCard.vue'
import ExpansionPlans from '@/components/ExpansionPlans.vue'
import CommonFooter from '@/components/CommonFooter.vue'

export default {
  name: 'CoPilotDock',
  components: {
    CaptainCard,
    ExpansionPlans,
    CommonFooter
  },
  setup() {
    const router = useRouter()
    const dockStore = useDockStore()
    
    // Store state
    const { 
      dockSettings, 
      mainCaptain, 
      additionalCaptains, 
      dockStats,
      isIndividualMode,
      isMultiMode,
      isExpandingMode,
      availableCaptains,
      nextExpansionMilestone
    } = storeToRefs(dockStore)

    // Local reactive state
    const showModeConfirmation = ref(false)
    const pendingModeChange = ref(null)
    const currentMode = ref(dockSettings.value.mode)

    // Mode configurations
    const modeConfigurations = {
      individual: {
        title: '👨‍🚀 個人指導ドック',
        subtitle: '専属船長による個別指導',
        description: '経験豊富な専属船長があなたの学習進度に合わせてマンツーマン指導を行います'
      },
      multi: {
        title: '👥 チーム指導ドック',
        subtitle: '複数船長による専門指導',
        description: '各分野の専門船長チームが連携し、総合的な英語力向上をサポートします'
      },
      expanding: {
        title: '🏗️ 拡張中ドック',
        subtitle: '成長・発展中の指導体制',
        description: '現在は個人指導ですが、段階的に船長陣を拡充し、より充実したサービスを準備中です'
      }
    }

    const availableModes = [
      { key: 'individual', icon: '👨‍🚀', label: '個人指導', title: modeConfigurations.individual.title },
      { key: 'expanding', icon: '🏗️', label: '拡張中', title: modeConfigurations.expanding.title },
      { key: 'multi', icon: '👥', label: 'チーム', title: modeConfigurations.multi.title }
    ]

    // Computed properties
    const modeConfig = computed(() => {
      return modeConfigurations[currentMode.value] || modeConfigurations.individual
    })

    const dockOverview = computed(() => {
      const activeCaptains = availableCaptains.value.filter(c => c.status === 'active').length
      return {
        activeCaptains,
        totalSessions: dockStats.value.totalSessions || 0,
        activeStudents: dockStats.value.activeStudents || 0,
        successRate: dockStats.value.completionRate || 0
      }
    })

    const futureCaptains = computed(() => {
      return additionalCaptains.value.filter(c => c.status !== 'active')
    })

    const allCaptains = computed(() => {
      return availableCaptains.value
    })

    const showExpansionPlans = computed(() => {
      return isIndividualMode.value || isExpandingMode.value
    })

    const plannedCaptainCount = computed(() => {
      return isExpandingMode.value ? 3 : 5
    })

    const plannedStudentCapacity = computed(() => {
      return plannedCaptainCount.value * 30
    })

    const plannedSessionCapacity = computed(() => {
      return plannedCaptainCount.value * 10
    })

    // Methods
    const switchMode = (mode) => {
      if (mode === currentMode.value) return
      
      const modeData = availableModes.find(m => m.key === mode)
      pendingModeChange.value = modeData
      showModeConfirmation.value = true
    }

    const confirmModeSwitch = () => {
      if (pendingModeChange.value) {
        dockStore.setDockMode(pendingModeChange.value.key)
        currentMode.value = pendingModeChange.value.key
        showModeConfirmation.value = false
        pendingModeChange.value = null
        
        // Show success message
        showNotification(`ドックモードを「${pendingModeChange.value?.label}」に変更しました`)
      }
    }

    const cancelModeSwitch = () => {
      showModeConfirmation.value = false
      pendingModeChange.value = null
    }

    const handleCaptainSelection = (captain) => {
      console.log('Captain selected:', captain)
      // 開発中のため、現時点ではアラートで対応
      alert(`🚀 船長「${captain.name}」との協力訓練を開始します！\n\n※この機能は開発中のため、今後実装予定です。\n現在は以下のゲームで学習を続けてください：\n• サウンド星雲\n• 文法銀河`)
    }

    const showCaptainDetails = (captain) => {
      console.log('Show captain details:', captain)
      // Implementation for captain details modal/page
    }

    const showJoinSchedule = (captain) => {
      console.log('Show join schedule for:', captain)
      // Implementation for join schedule display
    }

    const quickStartTraining = () => {
      const activeCaptain = availableCaptains.value.find(c => c.status === 'active')
      if (activeCaptain) {
        handleCaptainSelection(activeCaptain)
      } else {
        showNotification('現在利用可能な船長がいません', 'warning')
      }
    }

    const scheduleTraining = () => {
      alert('📅 訓練予約機能は開発中です！\n\n将来的には以下の機能を提供予定：\n• 希望日時での予約\n• 船長の空き状況確認\n• リマインダー設定')
    }

    const viewTrainingHistory = () => {
      alert('📊 訓練履歴機能は開発中です！\n\n将来的には以下の情報を確認可能：\n• 過去の学習記録\n• スコア推移\n• 学習時間統計')
    }

    const customizeTraining = () => {
      alert('⚙️ 訓練カスタマイズ機能は開発中です！\n\n将来的には以下を設定可能：\n• 学習難易度\n• 専門分野の選択\n• 学習時間の調整')
    }

    const startTeamMission = () => {
      showNotification('チームミッション機能は開発中です！')
    }

    const scheduleGroupSession = () => {
      showNotification('グループセッション機能は開発中です！')
    }

    const viewTeamAnalytics = () => {
      showNotification('チーム分析機能は開発中です！')
    }

    const showNotification = (message, type = 'info') => {
      // Simple notification implementation
      console.log(`Notification (${type}):`, message)
      // In a real app, you'd use a proper notification system
    }

    // 統一フッターナビゲーションメソッド
    const handleFooterNavigation = (section) => {
      switch (section) {
        case 'sound':
          router.push('/sound-adventure-hub')
          break
        case 'grammar':
          router.push('/grammar-galaxy-hub')
          break
        case 'academy':
          alert('🏫 Virtual Academyは開発中です！')
          break
        case 'profile':
          // 現在のページ（Co-Pilot Dock）なので何もしない
          break
        default:
          console.warn('Unknown navigation section:', section)
      }
    }

    // Watchers
    watch(() => dockSettings.value.mode, (newMode) => {
      currentMode.value = newMode
    })

    // Lifecycle
    onMounted(() => {
      dockStore.initializeDock()
    })

    return {
      // State
      currentMode,
      showModeConfirmation,
      pendingModeChange,
      
      // Store state
      mainCaptain,
      additionalCaptains,
      dockStats,
      isIndividualMode,
      isMultiMode,
      isExpandingMode,
      
      // Computed
      modeConfig,
      dockOverview,
      futureCaptains,
      allCaptains,
      showExpansionPlans,
      plannedCaptainCount,
      plannedStudentCapacity,
      plannedSessionCapacity,
      availableModes,
      
      // Methods
      switchMode,
      confirmModeSwitch,
      cancelModeSwitch,
      handleCaptainSelection,
      showCaptainDetails,
      showJoinSchedule,
      quickStartTraining,
      scheduleTraining,
      viewTrainingHistory,
      customizeTraining,
      startTeamMission,
      scheduleGroupSession,
      viewTeamAnalytics,
      handleFooterNavigation
    }
  }
}
</script>

<style scoped>
/* Base Styles */
.galaxy-background {
  background: var(--space-void, linear-gradient(135deg, #0f172a 0%, #1e293b 100%));
  color: white;
}

.stars-layer-1,
.stars-layer-2,
.stars-layer-3 {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 20px 50px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 30px 100px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 40px 60px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 110px 90px, #fff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 190px 150px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 4s infinite;
  opacity: 0.3;
}

.stars-layer-2 {
  background-size: 300px 300px;
  animation-delay: 1s;
  opacity: 0.2;
}

.stars-layer-3 {
  background-size: 400px 400px;
  animation-delay: 2s;
  opacity: 0.1;
}

@keyframes twinkle {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}

/* Mode Selector */
.mode-selector {
  @apply flex gap-2 p-2 rounded-2xl;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.mode-btn {
  @apply px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2;
  background: transparent;
  color: #94a3b8;
}

.mode-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  color: #fbbf24;
}

.mode-btn.mode-active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
}

.mode-icon {
  @apply text-lg;
}

.mode-label {
  @apply text-sm font-medium;
}

/* Dock Stats Overview */
.dock-stats-overview {
  @apply mb-12;
}

.stats-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-6;
}

.stat-card {
  @apply p-6 rounded-2xl flex items-center gap-4 transition-all duration-300;
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(20px);
}

.stat-card:hover {
  border-color: rgba(99, 102, 241, 0.6);
  transform: translateY(-2px);
}

.stat-icon {
  @apply text-3xl;
}

.stat-content {
  @apply flex-1;
}

.stat-value {
  @apply text-2xl font-bold mb-1;
  filter: drop-shadow(0 0 3px rgba(251, 191, 36, 0.3));
}

.stat-label {
  @apply text-sm text-slate-400;
}

/* Section Styles */
.section-header {
  @apply text-center;
}

.section-title {
  @apply flex items-center justify-center gap-3 text-3xl font-bold text-yellow-400 mb-4;
  filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.3));
}

.title-icon {
  @apply text-4xl;
}

.section-subtitle {
  @apply text-lg text-slate-400;
}

/* Layout Grids */
.main-captain-container {
  @apply flex justify-center;
}

.future-captains-grid,
.captains-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.collaboration-features {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}

.feature-card {
  @apply p-6 rounded-2xl cursor-pointer transition-all duration-300;
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(20px);
}

.feature-card:hover {
  border-color: rgba(99, 102, 241, 0.6);
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
}

.feature-icon {
  @apply text-4xl mb-4;
}

.feature-content h3 {
  @apply text-xl font-bold text-yellow-400 mb-2;
}

.feature-content p {
  @apply text-slate-400;
}

/* Preview Section */
.preview-grid {
  @apply flex items-center justify-center gap-8;
}

.preview-card {
  @apply p-6 rounded-2xl text-center min-w-[200px];
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.3);
}

.preview-card.current {
  border-color: rgba(251, 191, 36, 0.4);
}

.preview-card.future {
  border-color: rgba(34, 197, 94, 0.4);
}

.preview-card h3 {
  @apply text-xl font-bold text-yellow-400 mb-4;
}

.preview-stats {
  @apply space-y-2 text-slate-400;
}

.preview-arrow {
  @apply text-3xl text-yellow-400;
}

/* Quick Actions */
.quick-actions-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6;
}

.action-card {
  @apply p-6 rounded-2xl transition-all duration-300 cursor-pointer text-left;
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(20px);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2);
}

.primary-action {
  border-color: rgba(34, 197, 94, 0.6);
}

.primary-action:hover {
  border-color: rgba(34, 197, 94, 0.8);
  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3);
}

.secondary-action:hover {
  border-color: rgba(99, 102, 241, 0.6);
}

.action-icon {
  @apply text-4xl mb-4;
}

.action-content h3 {
  @apply text-xl font-bold text-yellow-400 mb-2;
}

.action-content p {
  @apply text-slate-400;
}

/* Modal Styles */
.modal-overlay {
  @apply fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50;
}

.modal-content {
  @apply max-w-md mx-4 rounded-3xl overflow-hidden;
  background: rgba(15, 23, 42, 0.95);
  border: 2px solid rgba(99, 102, 241, 0.5);
  backdrop-filter: blur(20px);
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-slate-600/50;
}

.modal-header h3 {
  @apply text-xl font-bold text-yellow-400;
}

.modal-close {
  @apply w-8 h-8 rounded-full bg-slate-700/50 hover:bg-slate-600/50 flex items-center justify-center transition-colors;
}

.modal-body {
  @apply p-6;
}

.mode-change-details {
  @apply flex items-center justify-center gap-4 mt-4 p-4 rounded-xl bg-slate-800/50;
}

.current-mode,
.new-mode {
  @apply text-center;
}

.current-mode h4,
.new-mode h4 {
  @apply text-sm text-slate-400 mb-1;
}

.arrow {
  @apply text-xl text-yellow-400;
}

.modal-footer {
  @apply flex gap-3 p-6 border-t border-slate-600/50;
}

.btn-secondary {
  @apply flex-1 py-3 rounded-xl font-bold bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 transition-colors;
}

.btn-primary {
  @apply flex-1 py-3 rounded-xl font-bold text-white transition-all;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.btn-primary:hover {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Responsive Design */
@media (max-width: 768px) {
  .mode-selector {
    @apply flex-col gap-1 p-1;
  }
  
  .stats-grid {
    @apply grid-cols-2 gap-4;
  }
  
  .future-captains-grid,
  .captains-grid {
    @apply grid-cols-1;
  }
  
  .quick-actions-grid {
    @apply grid-cols-1 gap-4;
  }
  
  .preview-grid {
    @apply flex-col gap-4;
  }
  
  .preview-arrow {
    @apply rotate-90;
  }
}

@media (max-width: 640px) {
  .section-title {
    @apply text-2xl;
  }
  
  .title-icon {
    @apply text-3xl;
  }
  
  .collaboration-features {
    @apply grid-cols-1;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .stat-card,
  .feature-card,
  .action-card {
    transition: none;
  }
  
  .stat-card:hover,
  .feature-card:hover,
  .action-card:hover {
    transform: none;
  }
  
  .stars-layer-1,
  .stars-layer-2,
  .stars-layer-3 {
    animation: none;
  }
}
</style>