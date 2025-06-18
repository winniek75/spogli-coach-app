<template>
  <div class="emergency-call-button relative">
    
    <!-- Main Emergency Button -->
    <button
      @click="showEmergencyModal"
      :disabled="disabled || isActive"
      class="relative group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
             disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-full
             transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg
             border-2 border-red-400 hover:border-red-300 disabled:border-gray-500"
      :class="{
        'animate-pulse-danger': !disabled && !isActive,
        'animate-emergency-active': isActive
      }"
    >
      <!-- Emergency Icon -->
      <div class="flex items-center space-x-2">
        <div class="relative">
          <i class="fas fa-exclamation-triangle text-lg"></i>
          
          <!-- Pulsing alert rings -->
          <div 
            v-if="!disabled && !isActive"
            class="absolute inset-0 rounded-full border-2 border-red-300 animate-ping opacity-75"
          ></div>
          <div 
            v-if="!disabled && !isActive"
            class="absolute inset-0 rounded-full border-2 border-red-300 animate-ping opacity-50"
            style="animation-delay: 0.5s;"
          ></div>
        </div>
        
        <span class="hidden sm:inline">
          {{ isActive ? '対応中...' : 'EMERGENCY' }}
        </span>
      </div>

      <!-- Hover effect overlay -->
      <div class="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
    </button>

    <!-- Emergency Modal -->
    <Teleport to="body">
      <div 
        v-if="modalVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-red-500/50 shadow-2xl">
          
          <!-- Modal Header -->
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <i class="fas fa-exclamation-triangle text-white text-2xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-red-300 mb-2">緊急コール</h2>
            <p class="text-sm text-red-200">Captain に助けを求めますか？</p>
          </div>

          <!-- Emergency Reasons -->
          <div class="space-y-3 mb-6">
            <h3 class="text-sm font-medium text-white mb-3">理由を選択してください:</h3>
            
            <div class="space-y-2">
              <label 
                v-for="reason in emergencyReasons" 
                :key="reason.id"
                class="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                :class="{ 'ring-2 ring-red-400': selectedReason === reason.id }"
              >
                <input
                  v-model="selectedReason"
                  :value="reason.id"
                  type="radio"
                  class="text-red-500 focus:ring-red-500"
                >
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <i :class="reason.icon + ' text-red-400'"></i>
                    <span class="text-white font-medium">{{ reason.title }}</span>
                  </div>
                  <p class="text-sm text-gray-300 mt-1">{{ reason.description }}</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Custom Message -->
          <div class="mb-6">
            <label class="text-sm font-medium text-white mb-2 block">追加メッセージ (任意)</label>
            <textarea
              v-model="customMessage"
              placeholder="具体的な問題や質問があれば記入してください..."
              class="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 
                     focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors resize-none"
              rows="3"
              maxlength="200"
            ></textarea>
            <div class="text-xs text-gray-400 mt-1 text-right">
              {{ customMessage.length }}/200
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-3">
            <button
              @click="closeModal"
              class="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg 
                     transition-colors duration-200"
            >
              キャンセル
            </button>
            
            <button
              @click="sendEmergencyCall"
              :disabled="!selectedReason || isSending"
              class="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                     disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg 
                     transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100
                     flex items-center justify-center space-x-2"
            >
              <i v-if="isSending" class="fas fa-spinner animate-spin"></i>
              <i v-else class="fas fa-paper-plane"></i>
              <span>{{ isSending ? '送信中...' : '緊急コール送信' }}</span>
            </button>
          </div>

          <!-- Warning Note -->
          <div class="mt-4 p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
            <div class="flex items-start space-x-2 text-yellow-200">
              <i class="fas fa-info-circle text-yellow-400 mt-0.5"></i>
              <div class="text-xs">
                <strong>注意:</strong> 緊急コールはCaptainに即座に通知されます。本当に助けが必要な場合のみ使用してください。
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Success Toast -->
    <Teleport to="body">
      <div 
        v-if="showSuccessToast"
        class="fixed top-4 right-4 z-60 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg
               transform transition-all duration-300 ease-out"
        :class="showSuccessToast ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'"
      >
        <div class="flex items-center space-x-2">
          <i class="fas fa-check-circle"></i>
          <span>緊急コールを送信しました</span>
        </div>
      </div>
    </Teleport>

    <!-- Active Call Indicator -->
    <div 
      v-if="isActive"
      class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse"
    >
      <div class="w-3 h-3 bg-white rounded-full"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['emergency'])

// Reactive data
const modalVisible = ref(false)
const selectedReason = ref('')
const customMessage = ref('')
const isSending = ref(false)
const showSuccessToast = ref(false)

// Emergency reasons
const emergencyReasons = ref([
  {
    id: 'pronunciation',
    icon: 'fas fa-microphone-slash',
    title: '発音が困難',
    description: '音素の発音方法がわからない、または正しく発音できない'
  },
  {
    id: 'technical',
    icon: 'fas fa-exclamation-circle',
    title: '技術的問題',
    description: 'マイクが動作しない、画面が見えないなどの技術的問題'
  },
  {
    id: 'understanding',
    icon: 'fas fa-question-circle',
    title: '理解困難',
    description: 'ゲームのルールや指示が理解できない'
  },
  {
    id: 'timeout',
    icon: 'fas fa-clock',
    title: '時間不足',
    description: '制限時間内に回答することが困難'
  },
  {
    id: 'other',
    icon: 'fas fa-ellipsis-h',
    title: 'その他',
    description: '上記以外の問題や質問'
  }
])

// Methods
const showEmergencyModal = () => {
  if (props.disabled || props.isActive) return
  modalVisible.value = true
  selectedReason.value = ''
  customMessage.value = ''
}

const closeModal = () => {
  modalVisible.value = false
  selectedReason.value = ''
  customMessage.value = ''
}

const sendEmergencyCall = async () => {
  if (!selectedReason.value || isSending.value) return

  isSending.value = true

  try {
    // Get selected reason details
    const reason = emergencyReasons.value.find(r => r.id === selectedReason.value)
    
    // Prepare emergency message
    const emergencyMessage = {
      type: selectedReason.value,
      title: reason?.title || '緊急コール',
      description: reason?.description || '',
      customMessage: customMessage.value,
      timestamp: new Date().toISOString(),
      urgent: true
    }

    // Emit emergency event
    emit('emergency', emergencyMessage)

    // Show success feedback
    showSuccessToast.value = true
    setTimeout(() => {
      showSuccessToast.value = false
    }, 3000)

    // Close modal
    closeModal()

  } catch (error) {
    console.error('Failed to send emergency call:', error)
  } finally {
    isSending.value = false
  }
}

// Computed
const emergencyButtonText = computed(() => {
  if (props.isActive) return '対応中...'
  if (props.disabled) return '利用不可'
  return 'EMERGENCY'
})
</script>

<style scoped>
/* Custom animations */
@keyframes pulse-danger {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
}

@keyframes emergency-active {
  0%, 100% {
    background: linear-gradient(to right, #dc2626, #ef4444);
    transform: scale(1);
  }
  50% {
    background: linear-gradient(to right, #991b1b, #dc2626);
    transform: scale(1.05);
  }
}

.animate-pulse-danger {
  animation: pulse-danger 2s infinite;
}

.animate-emergency-active {
  animation: emergency-active 1.5s ease-in-out infinite;
}

/* Custom radio button styling */
input[type="radio"] {
  appearance: none;
  width: 1rem;
  height: 1rem;
  border: 2px solid #ef4444;
  border-radius: 50%;
  background-color: transparent;
  cursor: pointer;
  position: relative;
}

input[type="radio"]:checked {
  background-color: #ef4444;
}

input[type="radio"]:checked::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: white;
}

input[type="radio"]:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
}

/* Textarea custom styling */
textarea:focus {
  outline: none;
}

textarea::placeholder {
  color: #9ca3af;
}

/* Toast animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Modal backdrop blur */
.modal-backdrop {
  backdrop-filter: blur(4px);
}

/* Custom scrollbar for modal */
.emergency-call-button *::-webkit-scrollbar {
  width: 6px;
}

.emergency-call-button *::-webkit-scrollbar-track {
  background: rgba(51, 65, 85, 0.3);
  border-radius: 3px;
}

.emergency-call-button *::-webkit-scrollbar-thumb {
  background: rgba(239, 68, 68, 0.5);
  border-radius: 3px;
}

.emergency-call-button *::-webkit-scrollbar-thumb:hover {
  background: rgba(239, 68, 68, 0.7);
}
</style>