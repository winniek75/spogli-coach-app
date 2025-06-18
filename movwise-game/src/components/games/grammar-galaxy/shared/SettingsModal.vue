<template>
  <teleport to="body">
    <div
      v-if="show"
      class="settings-modal-overlay"
      @click="handleOverlayClick"
    >
      <div 
        class="settings-modal"
        :class="modalClasses"
        @click.stop
      >
        <!-- モーダルヘッダー -->
        <div class="modal-header">
          <div class="header-content">
            <div class="modal-title">
              <Icon name="cog-6-tooth" class="w-6 h-6 text-purple-400" />
              <h2>Game Settings</h2>
            </div>
            <p class="modal-subtitle">Customize your learning experience</p>
          </div>
          <button
            @click="closeModal"
            class="close-button"
            :disabled="saving"
          >
            <Icon name="x-mark" class="w-6 h-6" />
          </button>
        </div>

        <!-- 設定タブ -->
        <div class="settings-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="tab-button"
            :class="{ 'tab-active': activeTab === tab.id }"
          >
            <Icon :name="tab.icon" class="w-5 h-5" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- 設定内容 -->
        <div class="modal-body">
          <!-- 基本設定タブ -->
          <div v-if="activeTab === 'general'" class="settings-section">
            <h3 class="section-title">General Settings</h3>
            
            <!-- 言語設定 -->
            <div class="setting-group">
              <div class="setting-header">
                <Icon name="language" class="w-5 h-5 text-blue-400" />
                <h4>Language & Region</h4>
              </div>
              <div class="setting-items">
                <div class="setting-item">
                  <label class="setting-label">Interface Language</label>
                  <select v-model="tempSettings.language" class="setting-select">
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                    <option value="zh">中文</option>
                  </select>
                  <p class="setting-description">Choose your preferred interface language</p>
                </div>
                
                <div class="setting-item">
                  <label class="setting-label">Learning Target</label>
                  <select v-model="tempSettings.learningTarget" class="setting-select">
                    <option value="american">American English</option>
                    <option value="british">British English</option>
                    <option value="canadian">Canadian English</option>
                    <option value="australian">Australian English</option>
                  </select>
                  <p class="setting-description">Select your target English variant</p>
                </div>
              </div>
            </div>

            <!-- 難易度設定 -->
            <div class="setting-group">
              <div class="setting-header">
                <Icon name="academic-cap" class="w-5 h-5 text-green-400" />
                <h4>Learning Difficulty</h4>
              </div>
              <div class="setting-items">
                <div class="setting-item">
                  <label class="setting-label">Default Game Difficulty</label>
                  <div class="difficulty-selector">
                    <button
                      v-for="level in difficultyLevels"
                      :key="level.value"
                      @click="tempSettings.defaultDifficulty = level.value"
                      class="difficulty-button"
                      :class="{ 'selected': tempSettings.defaultDifficulty === level.value }"
                    >
                      <div class="difficulty-stars">
                        <Icon
                          v-for="i in 3"
                          :key="i"
                          name="star"
                          class="w-3 h-3"
                          :class="i <= level.stars ? 'text-yellow-400' : 'text-gray-400'"
                        />
                      </div>
                      <span class="difficulty-name">{{ level.name }}</span>
                    </button>
                  </div>
                  <p class="setting-description">Choose your preferred starting difficulty</p>
                </div>

                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.adaptiveDifficulty"
                        type="checkbox"
                        class="toggle-input"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">Adaptive Difficulty</span>
                    </label>
                  </div>
                  <p class="setting-description">Automatically adjust difficulty based on your performance</p>
                </div>
              </div>
            </div>
          </div>

          <!-- ゲームプレイ設定タブ -->
          <div v-if="activeTab === 'gameplay'" class="settings-section">
            <h3 class="section-title">Gameplay Settings</h3>
            
            <!-- タイマー設定 -->
            <div class="setting-group">
              <div class="setting-header">
                <Icon name="clock" class="w-5 h-5 text-orange-400" />
                <h4>Timer & Time Limits</h4>
              </div>
              <div class="setting-items">
                <div class="setting-item">
                  <label class="setting-label">Default Time Limit</label>
                  <div class="time-selector">
                    <button
                      v-for="time in timeLimits"
                      :key="time.value"
                      @click="tempSettings.defaultTimeLimit = time.value"
                      class="time-button"
                      :class="{ 'selected': tempSettings.defaultTimeLimit === time.value }"
                    >
                      {{ time.label }}
                    </button>
                  </div>
                  <p class="setting-description">Set your preferred time limit for games</p>
                </div>

                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.showTimer"
                        type="checkbox"
                        class="toggle-input"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">Show Timer During Games</span>
                    </label>
                  </div>
                  <p class="setting-description">Display countdown timer while playing</p>
                </div>

                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.timeWarning"
                        type="checkbox"
                        class="toggle-input"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">Time Warning</span>
                    </label>
                  </div>
                  <p class="setting-description">Alert when time is running low</p>
                </div>
              </div>
            </div>

            <!-- ヒント設定 -->
            <div class="setting-group">
              <div class="setting-header">
                <Icon name="light-bulb" class="w-5 h-5 text-yellow-400" />
                <h4>Hints & Assistance</h4>
              </div>
              <div class="setting-items">
                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.enableHints"
                        type="checkbox"
                        class="toggle-input"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">Enable Hints</span>
                    </label>
                  </div>
                  <p class="setting-description">Allow hints during gameplay</p>
                </div>

                <div class="setting-item">
                  <label class="setting-label">Hint Frequency</label>
                  <select v-model="tempSettings.hintFrequency" class="setting-select" :disabled="!tempSettings.enableHints">
                    <option value="unlimited">Unlimited</option>
                    <option value="once">Once per game</option>
                    <option value="limited">Limited (3 per game)</option>
                  </select>
                  <p class="setting-description">How often hints can be used</p>
                </div>

                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.autoHint"
                        type="checkbox"
                        class="toggle-input"
                        :disabled="!tempSettings.enableHints"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">Auto Hint</span>
                    </label>
                  </div>
                  <p class="setting-description">Automatically show hints when struggling</p>
                </div>
              </div>
            </div>

            <!-- フィードバック設定 -->
            <div class="setting-group">
              <div class="setting-header">
                <Icon name="chat-bubble-left-right" class="w-5 h-5 text-pink-400" />
                <h4>Feedback & Encouragement</h4>
              </div>
              <div class="setting-items">
                <div class="setting-item">
                  <label class="setting-label">Feedback Style</label>
                  <select v-model="tempSettings.feedbackStyle" class="setting-select">
                    <option value="detailed">Detailed explanations</option>
                    <option value="simple">Simple correct/incorrect</option>
                    <option value="encouraging">Encouraging messages</option>
                    <option value="minimal">Minimal feedback</option>
                  </select>
                  <p class="setting-description">Choose how feedback is presented</p>
                </div>

                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.celebrateAchievements"
                        type="checkbox"
                        class="toggle-input"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">Celebrate Achievements</span>
                    </label>
                  </div>
                  <p class="setting-description">Show special animations for milestones</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 音声・視覚設定タブ -->
          <div v-if="activeTab === 'audiovisual'" class="settings-section">
            <h3 class="section-title">Audio & Visual Settings</h3>
            
            <!-- 音声設定 -->
            <div class="setting-group">
              <div class="setting-header">
                <Icon name="speaker-wave" class="w-5 h-5 text-blue-400" />
                <h4>Audio Settings</h4>
              </div>
              <div class="setting-items">
                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.soundEffects"
                        type="checkbox"
                        class="toggle-input"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">Sound Effects</span>
                    </label>
                  </div>
                  <p class="setting-description">Play sound effects during games</p>
                </div>

                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.backgroundMusic"
                        type="checkbox"
                        class="toggle-input"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">Background Music</span>
                    </label>
                  </div>
                  <p class="setting-description">Play ambient background music</p>
                </div>

                <div class="setting-item">
                  <label class="setting-label">Master Volume</label>
                  <div class="volume-control">
                    <Icon name="speaker-wave" class="w-4 h-4 text-gray-400" />
                    <input
                      v-model="tempSettings.masterVolume"
                      type="range"
                      min="0"
                      max="100"
                      class="volume-slider"
                    />
                    <span class="volume-value">{{ tempSettings.masterVolume }}%</span>
                  </div>
                  <p class="setting-description">Adjust overall audio volume</p>
                </div>

                <div class="setting-item">
                  <label class="setting-label">Voice Settings</label>
                  <select v-model="tempSettings.voiceType" class="setting-select">
                    <option value="female">Female voice</option>
                    <option value="male">Male voice</option>
                    <option value="child">Child voice</option>
                  </select>
                  <p class="setting-description">Choose pronunciation voice type</p>
                </div>
              </div>
            </div>

            <!-- 視覚設定 -->
            <div class="setting-group">
              <div class="setting-header">
                <Icon name="eye" class="w-5 h-5 text-purple-400" />
                <h4>Visual Settings</h4>
              </div>
              <div class="setting-items">
                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.animations"
                        type="checkbox"
                        class="toggle-input"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">Animations</span>
                    </label>
                  </div>
                  <p class="setting-description">Enable visual animations and effects</p>
                </div>

                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.particles"
                        type="checkbox"
                        class="toggle-input"
                        :disabled="!tempSettings.animations"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">Particle Effects</span>
                    </label>
                  </div>
                  <p class="setting-description">Show particle effects for achievements</p>
                </div>

                <div class="setting-item">
                  <label class="setting-label">Animation Speed</label>
                  <select v-model="tempSettings.animationSpeed" class="setting-select" :disabled="!tempSettings.animations">
                    <option value="slow">Slow</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Fast</option>
                  </select>
                  <p class="setting-description">Control animation playback speed</p>
                </div>

                <div class="setting-item">
                  <label class="setting-label">Color Theme</label>
                  <div class="theme-selector">
                    <button
                      v-for="theme in colorThemes"
                      :key="theme.value"
                      @click="tempSettings.colorTheme = theme.value"
                      class="theme-button"
                      :class="{ 'selected': tempSettings.colorTheme === theme.value }"
                      :style="{ background: theme.gradient }"
                    >
                      <span>{{ theme.name }}</span>
                    </button>
                  </div>
                  <p class="setting-description">Choose your preferred color scheme</p>
                </div>
              </div>
            </div>
          </div>

          <!-- アクセシビリティ設定タブ -->
          <div v-if="activeTab === 'accessibility'" class="settings-section">
            <h3 class="section-title">Accessibility Settings</h3>
            
            <!-- 視覚的アクセシビリティ -->
            <div class="setting-group">
              <div class="setting-header">
                <Icon name="eye" class="w-5 h-5 text-green-400" />
                <h4>Visual Accessibility</h4>
              </div>
              <div class="setting-items">
                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.highContrast"
                        type="checkbox"
                        class="toggle-input"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">High Contrast Mode</span>
                    </label>
                  </div>
                  <p class="setting-description">Increase contrast for better visibility</p>
                </div>

                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.colorBlindSupport"
                        type="checkbox"
                        class="toggle-input"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">Color Blind Support</span>
                    </label>
                  </div>
                  <p class="setting-description">Use patterns in addition to colors</p>
                </div>

                <div class="setting-item">
                  <label class="setting-label">Font Size</label>
                  <select v-model="tempSettings.fontSize" class="setting-select">
                    <option value="small">Small</option>
                    <option value="normal">Normal</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                  </select>
                  <p class="setting-description">Adjust text size for better readability</p>
                </div>

                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.reduceMotion"
                        type="checkbox"
                        class="toggle-input"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">Reduce Motion</span>
                    </label>
                  </div>
                  <p class="setting-description">Minimize animations and motion effects</p>
                </div>
              </div>
            </div>

            <!-- 聴覚的アクセシビリティ -->
            <div class="setting-group">
              <div class="setting-header">
                <Icon name="ear" class="w-5 h-5 text-orange-400" />
                <h4>Hearing Accessibility</h4>
              </div>
              <div class="setting-items">
                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.visualCues"
                        type="checkbox"
                        class="toggle-input"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">Visual Audio Cues</span>
                    </label>
                  </div>
                  <p class="setting-description">Show visual indicators for audio events</p>
                </div>

                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.subtitles"
                        type="checkbox"
                        class="toggle-input"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">Subtitles</span>
                    </label>
                  </div>
                  <p class="setting-description">Display text for all spoken content</p>
                </div>
              </div>
            </div>

            <!-- 操作アクセシビリティ -->
            <div class="setting-group">
              <div class="setting-header">
                <Icon name="hand-raised" class="w-5 h-5 text-blue-400" />
                <h4>Input Accessibility</h4>
              </div>
              <div class="setting-items">
                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.keyboardNavigation"
                        type="checkbox"
                        class="toggle-input"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">Keyboard Navigation</span>
                    </label>
                  </div>
                  <p class="setting-description">Enable full keyboard control</p>
                </div>

                <div class="setting-item">
                  <label class="setting-label">Click Delay</label>
                  <select v-model="tempSettings.clickDelay" class="setting-select">
                    <option value="none">No delay</option>
                    <option value="short">Short (200ms)</option>
                    <option value="medium">Medium (500ms)</option>
                    <option value="long">Long (1000ms)</option>
                  </select>
                  <p class="setting-description">Prevent accidental clicks</p>
                </div>
              </div>
            </div>
          </div>

          <!-- データ設定タブ -->
          <div v-if="activeTab === 'data'" class="settings-section">
            <h3 class="section-title">Data & Privacy Settings</h3>
            
            <!-- 進捗データ -->
            <div class="setting-group">
              <div class="setting-header">
                <Icon name="chart-bar" class="w-5 h-5 text-green-400" />
                <h4>Progress Data</h4>
              </div>
              <div class="setting-items">
                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.saveProgress"
                        type="checkbox"
                        class="toggle-input"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">Save Progress Locally</span>
                    </label>
                  </div>
                  <p class="setting-description">Store your progress on this device</p>
                </div>

                <div class="setting-item">
                  <div class="setting-toggle">
                    <label class="toggle-label">
                      <input
                        v-model="tempSettings.detailedAnalytics"
                        type="checkbox"
                        class="toggle-input"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">Detailed Learning Analytics</span>
                    </label>
                  </div>
                  <p class="setting-description">Track detailed learning statistics</p>
                </div>

                <div class="setting-actions">
                  <button @click="exportData" class="action-button export-button">
                    <Icon name="arrow-down-tray" class="w-4 h-4" />
                    Export Progress Data
                  </button>
                  <button @click="importData" class="action-button import-button">
                    <Icon name="arrow-up-tray" class="w-4 h-4" />
                    Import Progress Data
                  </button>
                </div>
              </div>
            </div>

            <!-- リセット・削除 -->
            <div class="setting-group danger-zone">
              <div class="setting-header">
                <Icon name="exclamation-triangle" class="w-5 h-5 text-red-400" />
                <h4>Reset & Delete</h4>
              </div>
              <div class="setting-items">
                <div class="setting-item">
                  <button @click="resetProgress" class="action-button danger-button">
                    <Icon name="arrow-path" class="w-4 h-4" />
                    Reset All Progress
                  </button>
                  <p class="setting-description">Clear all learning progress and start over</p>
                </div>

                <div class="setting-item">
                  <button @click="resetSettings" class="action-button danger-button">
                    <Icon name="cog-6-tooth" class="w-4 h-4" />
                    Reset Settings
                  </button>
                  <p class="setting-description">Restore all settings to default values</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- モーダルフッター -->
        <div class="modal-footer">
          <div class="footer-info">
            <div v-if="hasUnsavedChanges" class="unsaved-indicator">
              <Icon name="exclamation-circle" class="w-4 h-4 text-yellow-400" />
              <span>You have unsaved changes</span>
            </div>
          </div>
          
          <div class="footer-actions">
            <button
              @click="resetTempSettings"
              :disabled="!hasUnsavedChanges || saving"
              class="reset-button"
            >
              <Icon name="arrow-uturn-left" class="w-4 h-4" />
              Reset
            </button>
            <button
              @click="closeModal"
              :disabled="saving"
              class="cancel-button"
            >
              Cancel
            </button>
            <button
              @click="saveSettings"
              :disabled="saving"
              class="save-button"
            >
              <Icon v-if="saving" name="arrow-path" class="w-4 h-4 animate-spin" />
              <Icon v-else name="check" class="w-4 h-4" />
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
  </template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useGrammarGalaxyStore } from '@/stores/grammarGalaxyStore'
import Icon from '@/components/shared/Icon.vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'settings-changed'])

// Store
const store = useGrammarGalaxyStore()

// リアクティブデータ
const activeTab = ref('general')
const saving = ref(false)
const tempSettings = ref({})

// タブ設定
const tabs = ref([
  { id: 'general', label: 'General', icon: 'cog-6-tooth' },
  { id: 'gameplay', label: 'Gameplay', icon: 'game-pad' },
  { id: 'audiovisual', label: 'Audio & Visual', icon: 'speaker-wave' },
  { id: 'accessibility', label: 'Accessibility', icon: 'universal-access' },
  { id: 'data', label: 'Data & Privacy', icon: 'shield-check' }
])

// 難易度レベル
const difficultyLevels = ref([
  { value: 'easy', name: 'Easy', stars: 1 },
  { value: 'basic', name: 'Basic', stars: 2 },
  { value: 'intermediate', name: 'Intermediate', stars: 3 },
  { value: 'advanced', name: 'Advanced', stars: 3 }
])

// 時間制限オプション
const timeLimits = ref([
  { value: 30, label: '30s' },
  { value: 60, label: '1m' },
  { value: 90, label: '1m 30s' },
  { value: 120, label: '2m' },
  { value: 0, label: 'No limit' }
])

// カラーテーマ
const colorThemes = ref([
  { value: 'galaxy', name: 'Galaxy', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { value: 'ocean', name: 'Ocean', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { value: 'sunset', name: 'Sunset', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { value: 'forest', name: 'Forest', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
])

// デフォルト設定
const defaultSettings = {
  // 基本設定
  language: 'en',
  learningTarget: 'american',
  defaultDifficulty: 'basic',
  adaptiveDifficulty: true,
  
  // ゲームプレイ設定
  defaultTimeLimit: 60,
  showTimer: true,
  timeWarning: true,
  enableHints: true,
  hintFrequency: 'limited',
  autoHint: false,
  feedbackStyle: 'encouraging',
  celebrateAchievements: true,
  
  // 音声・視覚設定
  soundEffects: true,
  backgroundMusic: false,
  masterVolume: 80,
  voiceType: 'female',
  animations: true,
  particles: true,
  animationSpeed: 'normal',
  colorTheme: 'galaxy',
  
  // アクセシビリティ設定
  highContrast: false,
  colorBlindSupport: false,
  fontSize: 'normal',
  reduceMotion: false,
  visualCues: false,
  subtitles: false,
  keyboardNavigation: false,
  clickDelay: 'none',
  
  // データ設定
  saveProgress: true,
  detailedAnalytics: true
}

// 計算されたプロパティ
const modalClasses = computed(() => ({
  'modal-saving': saving.value
}))

const hasUnsavedChanges = computed(() => {
  return JSON.stringify(tempSettings.value) !== JSON.stringify(store.settings || defaultSettings)
})

// メソッド
const loadSettings = () => {
  tempSettings.value = { 
    ...defaultSettings, 
    ...(store.settings || {}) 
  }
}

const saveSettings = async () => {
  saving.value = true
  
  try {
    // 設定を保存
    await store.updateSettings(tempSettings.value)
    
    // 変更イベントを発火
    emit('settings-changed', tempSettings.value)
    
    // 短い遅延の後にモーダルを閉じる
    setTimeout(() => {
      closeModal()
    }, 500)
  } catch (error) {
    console.error('Failed to save settings:', error)
  } finally {
    saving.value = false
  }
}

const resetTempSettings = () => {
  loadSettings()
}

const resetSettings = () => {
  if (confirm('Are you sure you want to reset all settings to default values?')) {
    tempSettings.value = { ...defaultSettings }
  }
}

const resetProgress = () => {
  if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
    store.resetProgress()
  }
}

const exportData = () => {
  const data = {
    settings: tempSettings.value,
    progress: store.grammarProgress,
    exportDate: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `movwise-progress-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const importData = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          if (data.settings) {
            tempSettings.value = { ...defaultSettings, ...data.settings }
          }
          if (data.progress) {
            store.importProgress(data.progress)
          }
        } catch (error) {
          alert('Invalid file format')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const closeModal = () => {
  emit('close')
}

const handleOverlayClick = () => {
  if (!saving.value) {
    closeModal()
  }
}

// ライフサイクル
onMounted(() => {
  loadSettings()
})

// ウォッチャー
watch(() => props.show, (newShow) => {
  if (newShow) {
    loadSettings()
    activeTab.value = 'general'
  }
})
</script>

<style scoped>
.settings-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.settings-modal {
  background: linear-gradient(135deg, #1a1a3a 0%, #2a2a4a 50%, #3a3a5a 100%);
  border-radius: 1.5rem;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.modal-saving {
  pointer-events: none;
  opacity: 0.8;
}

/* ヘッダー */
.modal-header {
  background: rgba(0, 0, 0, 0.3);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  text-align: center;
  flex: 1;
}

.modal-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
}

.modal-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.close-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

/* タブ */
.settings-tabs {
  background: rgba(0, 0, 0, 0.2);
  padding: 0 2rem;
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
}

.tab-button {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  font-size: 0.9rem;
}

.tab-button:hover {
  color: rgba(255, 255, 255, 0.8);
}

.tab-active {
  color: white !important;
  border-bottom-color: #9333ea;
  background: rgba(147, 51, 234, 0.1);
}

/* ボディ */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.settings-section {
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  color: white;
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
}

/* 設定グループ */
.setting-group {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.setting-group.danger-zone {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.setting-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.setting-header h4 {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.setting-items {
  space-y: 1rem;
}

.setting-item {
  margin-bottom: 1.5rem;
}

.setting-label {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.setting-description {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  margin-top: 0.5rem;
  line-height: 1.4;
}

.setting-select {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.setting-select:focus {
  outline: none;
  border-color: #9333ea;
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
}

.setting-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* トグルスイッチ */
.setting-toggle {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: relative;
  width: 50px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toggle-input:checked + .toggle-slider {
  background: #9333ea;
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(26px);
}

.toggle-input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-weight: 500;
}

/* 難易度セレクター */
.difficulty-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.difficulty-button {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.difficulty-button:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(147, 51, 234, 0.5);
}

.difficulty-button.selected {
  background: rgba(147, 51, 234, 0.3);
  border-color: #9333ea;
  box-shadow: 0 0 15px rgba(147, 51, 234, 0.3);
}

.difficulty-stars {
  display: flex;
  justify-content: center;
  gap: 0.2rem;
  margin-bottom: 0.5rem;
}

.difficulty-name {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
}

/* 時間セレクター */
.time-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.time-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.time-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.time-button.selected {
  background: rgba(147, 51, 234, 0.3);
  border-color: #9333ea;
}

/* ボリュームコントロール */
.volume-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.volume-slider {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: #9333ea;
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #9333ea;
  border-radius: 50%;
  border: none;
  cursor: pointer;
}

.volume-value {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 40px;
  text-align: right;
}

/* テーマセレクター */
.theme-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.theme-button {
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  color: white;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.theme-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.theme-button:hover::before {
  background: rgba(0, 0, 0, 0.2);
}

.theme-button.selected {
  border-color: white;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
}

.theme-button.selected::before {
  background: rgba(0, 0, 0, 0.1);
}

.theme-button span {
  position: relative;
  z-index: 1;
}

/* アクションボタン */
.setting-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.export-button {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
}

.export-button:hover {
  background: rgba(34, 197, 94, 0.3);
}

.import-button {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.3);
}

.import-button:hover {
  background: rgba(59, 130, 246, 0.3);
}

.danger-button {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.danger-button:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* フッター */
.modal-footer {
  background: rgba(0, 0, 0, 0.3);
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-info {
  flex: 1;
}

.unsaved-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fbbf24;
  font-size: 0.9rem;
}

.footer-actions {
  display: flex;
  gap: 1rem;
}

.reset-button,
.cancel-button,
.save-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid transparent;
}

.reset-button {
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
  border-color: rgba(156, 163, 175, 0.3);
}

.reset-button:hover:not(:disabled) {
  background: rgba(156, 163, 175, 0.3);
}

.cancel-button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.2);
}

.cancel-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.save-button {
  background: linear-gradient(135deg, #9333ea, #7c3aed);
  color: white;
  border: none;
}

.save-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
}

.reset-button:disabled,
.cancel-button:disabled,
.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .settings-modal {
    max-width: 100%;
    margin: 0.5rem;
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-body {
    padding: 1rem;
  }
  
  .settings-tabs {
    padding: 0 1rem;
    justify-content: flex-start;
  }
  
  .tab-button {
    padding: 0.75rem 1rem;
    font-size: 0.8rem;
  }
  
  .difficulty-selector,
  .theme-selector {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
  
  .time-selector {
    justify-content: center;
  }
  
  .modal-footer {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .footer-actions {
    width: 100%;
  }
  
  .reset-button,
  .cancel-button,
  .save-button {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .modal-title {
    font-size: 1.2rem;
  }
  
  .settings-tabs {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  
  .setting-group {
    padding: 1rem;
  }
  
  .difficulty-selector,
  .theme-selector {
    grid-template-columns: 1fr 1fr;
  }
  
  .setting-actions {
    flex-direction: column;
  }
  
  .action-button {
    justify-content: center;
  }
}
</style>
