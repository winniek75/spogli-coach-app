<template>
  <div class="wave-visualization" :class="`pattern-${pattern}`">
    <svg
      width="120"
      height="60"
      viewBox="0 0 120 60"
      class="wave-svg"
      :class="{ animated: isAnimated }"
    >
      <!-- 基準線 -->
      <line
        x1="10"
        y1="30"
        x2="110"
        y2="30"
        stroke="#E0E0E0"
        stroke-width="1"
        stroke-dasharray="2,2"
      />
      
      <!-- 波形パス -->
      <path
        :d="wavePath"
        :stroke="waveColor"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
        class="wave-path"
      />
      
      <!-- 動的な波紋エフェクト -->
      <circle
        v-if="isAnimated"
        cx="60"
        cy="30"
        r="5"
        :fill="waveColor"
        opacity="0.3"
        class="wave-pulse"
      />
    </svg>
    
    <!-- 音調の方向を示す矢印 -->
    <div v-if="showArrow" class="direction-arrow" :class="arrowDirection">
      {{ arrowSymbol }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  pattern: {
    type: String,
    required: true,
    validator: (value) => ['falling', 'rising', 'flat', 'wave', 'complex'].includes(value)
  },
  type: {
    type: String,
    default: 'statement'
  },
  isAnimated: {
    type: Boolean,
    default: false
  }
})

// 波形パスの生成
const wavePath = computed(() => {
  const startX = 10
  const endX = 110
  const centerY = 30
  const amplitude = 15

  switch (props.pattern) {
    case 'falling':
      // 下降調：左上から右下へ
      return `M ${startX} ${centerY - amplitude} Q ${(startX + endX) / 2} ${centerY} ${endX} ${centerY + amplitude}`
    
    case 'rising':
      // 上昇調：左下から右上へ
      return `M ${startX} ${centerY + amplitude} Q ${(startX + endX) / 2} ${centerY} ${endX} ${centerY - amplitude}`
    
    case 'flat':
      // 水平調：まっすぐ
      return `M ${startX} ${centerY} L ${endX} ${centerY}`
    
    case 'wave':
      // 波型調：山型の波
      return `M ${startX} ${centerY} Q ${startX + 25} ${centerY - amplitude} ${startX + 50} ${centerY} Q ${startX + 75} ${centerY + amplitude} ${endX} ${centerY}`
    
    case 'complex':
      // 複合調：複雑な波形
      return `M ${startX} ${centerY} Q ${startX + 20} ${centerY - amplitude} ${startX + 40} ${centerY + 5} Q ${startX + 60} ${centerY - 10} ${startX + 80} ${centerY + amplitude} Q ${startX + 90} ${centerY} ${endX} ${centerY - amplitude}`
    
    default:
      return `M ${startX} ${centerY} L ${endX} ${centerY}`
  }
})

// 波の色
const waveColor = computed(() => {
  const colors = {
    falling: '#FF6B6B',      // 下降調：レッド
    rising: '#4ECDC4',       // 上昇調：ティール
    flat: '#95A5A6',         // 水平調：グレー
    wave: '#3498DB',         // 波型調：ブルー
    complex: '#9B59B6'       // 複合調：パープル
  }
  return colors[props.pattern] || '#95A5A6'
})

// 矢印の表示
const showArrow = computed(() => {
  return ['falling', 'rising'].includes(props.pattern)
})

// 矢印の方向
const arrowDirection = computed(() => {
  return props.pattern === 'rising' ? 'up' : 'down'
})

// 矢印のシンボル
const arrowSymbol = computed(() => {
  return props.pattern === 'rising' ? '↗' : '↘'
})
</script>