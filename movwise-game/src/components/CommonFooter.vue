<template>
  <footer class="common-footer">
    <button 
      v-for="nav in navigation" 
      :key="nav.name"
      @click="$emit('navigate', nav.name)" 
      class="footer-nav-item" 
      :class="{ active: active === nav.name }"
      :title="nav.description"
    >
      <component :is="nav.icon" class="h-6 w-6" />
      <span>{{ nav.label }}</span>
    </button>
  </footer>
</template>

<script setup>
import { Music, Globe, Building2, UserIcon } from 'lucide-vue-next'

defineProps({
  active: String
})

// 宇宙統合テーマのナビゲーション配列
const navigation = [
  { 
    name: 'sound', 
    label: '🎵 サウンド星雲', 
    icon: Music, 
    description: '音韻宇宙探索' 
  },
  { 
    name: 'grammar', 
    label: '🌌 文法銀河', 
    icon: Globe, 
    description: '言語構造征服' 
  },
  { 
    name: 'academy', 
    label: '🏫 バーチャル基地', 
    icon: Building2, 
    description: '実践訓練施設' 
  },
  { 
    name: 'profile', 
    label: '👨‍🚀 船長コックピット', 
    icon: UserIcon, 
    description: '個人管制室' 
  }
]
</script>

<style scoped>
.common-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(15, 23, 42, 0.95);
  border-top: 2px solid rgba(99, 102, 241, 0.4);
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: space-around;
  padding: 0.75rem 0;
  z-index: 50;
  box-shadow: 0 -4px 20px rgba(99, 102, 241, 0.2);
}

.footer-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #94a3b8;
  border-radius: 0.75rem;
  position: relative;
  overflow: hidden;
}

.footer-nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.footer-nav-item:hover {
  color: #fbbf24;
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.4);
  transform: translateY(-2px);
}

.footer-nav-item:hover::before {
  opacity: 1;
}

.footer-nav-item.active {
  color: #fbbf24;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
  box-shadow: 
    0 0 20px rgba(99, 102, 241, 0.6),
    inset 0 0 10px rgba(251, 191, 36, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.5);
}

.footer-nav-item.active::before {
  opacity: 1;
}

.footer-nav-item span {
  font-size: 0.75rem;
  font-weight: 500;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 0 3px rgba(251, 191, 36, 0.3));
}

.footer-nav-item svg {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.3));
}

/* 宇宙パルス効果 */
.footer-nav-item.active {
  animation: cosmic-pulse 2s ease-in-out infinite;
}

@keyframes cosmic-pulse {
  0%, 100% {
    box-shadow: 
      0 0 20px rgba(99, 102, 241, 0.6),
      inset 0 0 10px rgba(251, 191, 36, 0.2);
  }
  50% {
    box-shadow: 
      0 0 30px rgba(99, 102, 241, 0.8),
      inset 0 0 15px rgba(251, 191, 36, 0.4);
  }
}

/* レスポンシブ対応 */
@media (max-width: 640px) {
  .footer-nav-item span {
    font-size: 0.625rem;
  }
  
  .footer-nav-item {
    padding: 0.375rem;
  }
}

/* アクセシビリティ対応 */
@media (prefers-reduced-motion: reduce) {
  .footer-nav-item.active {
    animation: none;
  }
  
  .footer-nav-item:hover {
    transform: none;
  }
}
</style> 