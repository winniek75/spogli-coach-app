<template>
  <div class="pattern-grid-wrapper">
    <div 
      class="pattern-grid"
      :class="gridClasses"
      :style="gridStyles"
    >
      <div
        v-for="(cell, index) in gridCells"
        :key="`cell-${index}`"
        class="grid-cell"
        :class="getCellClasses(cell, index)"
        :style="getCellStyles(cell, index)"
        @click="handleCellClick(cell, index)"
        @mouseenter="handleCellHover(cell, index, true)"
        @mouseleave="handleCellHover(cell, index, false)"
      >
        <!-- セル内容表示 -->
        <div class="cell-content">
          <GrammarElement
            v-if="cell.element"
            :element="cell.element"
            :is-selected="cell.isSelected"
            :is-found="cell.isFound"
            :size="cellSize"
            class="w-full h-full"
          />
          
          <!-- セル番号表示（デバッグ用） -->
          <div v-if="showCellNumbers" class="cell-number">
            {{ index }}
          </div>
        </div>
        
        <!-- セル状態インジケーター -->
        <div class="cell-indicators">
          <div v-if="cell.isSelected" class="indicator selected-indicator">
            <Icon name="check" class="w-3 h-3" />
          </div>
          <div v-if="cell.isFound" class="indicator found-indicator">
            <Icon name="check-circle" class="w-3 h-3" />
          </div>
          <div v-if="cell.isCorrect" class="indicator correct-indicator">
            <Icon name="star" class="w-3 h-3" />
          </div>
        </div>
        
        <!-- セルエフェクト -->
        <div class="cell-effects">
          <div v-if="cell.showRipple" class="ripple-effect"></div>
          <div v-if="cell.showGlow" class="glow-effect"></div>
        </div>
      </div>
    </div>
    
    <!-- グリッド情報表示 -->
    <div v-if="showGridInfo" class="grid-info">
      <div class="grid-stats">
        <div class="stat-item">
          <span class="stat-label">Total Cells:</span>
          <span class="stat-value">{{ totalCells }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Selected:</span>
          <span class="stat-value">{{ selectedCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Found:</span>
          <span class="stat-value">{{ foundCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import GrammarElement from './GrammarElement.vue'
import Icon from '@/components/shared/Icon.vue'

// Props
const props = defineProps({
  // グリッドデータ
  gridData: {
    type: Array,
    required: true,
    default: () => []
  },
  
  // グリッド設定
  rows: {
    type: Number,
    default: 4
  },
  columns: {
    type: Number,
    default: 6
  },
  
  // 見た目設定
  cellSize: {
    type: String,
    default: 'medium' // 'small', 'medium', 'large'
  },
  gap: {
    type: String,
    default: '0.75rem'
  },
  
  // 機能設定
  selectable: {
    type: Boolean,
    default: true
  },
  multiSelect: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  
  // 表示設定
  showCellNumbers: {
    type: Boolean,
    default: false
  },
  showGridInfo: {
    type: Boolean,
    default: false
  },
  
  // アニメーション設定
  animationSpeed: {
    type: String,
    default: 'normal' // 'slow', 'normal', 'fast'
  },
  enableHoverEffects: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits([
  'cell-click',
  'cell-hover',
  'selection-change',
  'pattern-complete'
])

// リアクティブデータ
const hoveredCell = ref(null)
const animatingCells = ref(new Set())

// 計算されたプロパティ
const gridCells = computed(() => {
  const totalSize = props.rows * props.columns
  const cells = []
  
  for (let i = 0; i < totalSize; i++) {
    const cellData = props.gridData[i] || {
      element: null,
      isSelected: false,
      isFound: false,
      isCorrect: false,
      isWrong: false,
      isHighlighted: false,
      isDisabled: false
    }
    
    cells.push({
      ...cellData,
      index: i,
      row: Math.floor(i / props.columns),
      column: i % props.columns,
      showRipple: false,
      showGlow: false
    })
  }
  
  return cells
})

const gridClasses = computed(() => ({
  'grid-disabled': props.disabled,
  'grid-selectable': props.selectable,
  'grid-multi-select': props.multiSelect,
  [`grid-${props.cellSize}`]: true,
  [`animation-${props.animationSpeed}`]: true
}))

const gridStyles = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
  gridTemplateRows: `repeat(${props.rows}, 1fr)`,
  gap: props.gap
}))

const totalCells = computed(() => gridCells.value.length)
const selectedCount = computed(() => gridCells.value.filter(cell => cell.isSelected).length)
const foundCount = computed(() => gridCells.value.filter(cell => cell.isFound).length)

// セルクラス計算
const getCellClasses = (cell, index) => ({
  'cell-empty': !cell.element,
  'cell-selected': cell.isSelected,
  'cell-found': cell.isFound,
  'cell-correct': cell.isCorrect,
  'cell-wrong': cell.isWrong,
  'cell-highlighted': cell.isHighlighted,
  'cell-disabled': cell.isDisabled || props.disabled,
  'cell-hovered': hoveredCell.value === index && props.enableHoverEffects,
  'cell-animating': animatingCells.value.has(index)
})

const getCellStyles = (cell, index) => {
  const styles = {}
  
  // アニメーション遅延
  if (cell.isCorrect || cell.isWrong) {
    styles['--animation-delay'] = `${(index % 6) * 0.1}s`
  }
  
  // カスタムカラー
  if (cell.customColor) {
    styles['--cell-custom-color'] = cell.customColor
  }
  
  return styles
}

// イベントハンドラー
const handleCellClick = (cell, index) => {
  if (props.disabled || cell.isDisabled || !props.selectable) return
  if (!cell.element) return
  
  // リップルエフェクト
  triggerRippleEffect(index)
  
  // 単一選択モードの場合、他のセルの選択を解除
  if (!props.multiSelect && !cell.isSelected) {
    clearAllSelections()
  }
  
  // 選択状態をトグル
  cell.isSelected = !cell.isSelected
  
  // イベント発火
  emit('cell-click', {
    cell: { ...cell },
    index,
    element: cell.element
  })
  
  emit('selection-change', {
    selectedCells: gridCells.value.filter(c => c.isSelected),
    selectedElements: gridCells.value.filter(c => c.isSelected).map(c => c.element),
    totalSelected: selectedCount.value
  })
}

const handleCellHover = (cell, index, isEntering) => {
  if (!props.enableHoverEffects) return
  
  if (isEntering) {
    hoveredCell.value = index
  } else {
    hoveredCell.value = null
  }
  
  emit('cell-hover', {
    cell: { ...cell },
    index,
    isEntering,
    element: cell.element
  })
}

// ユーティリティ関数
const clearAllSelections = () => {
  gridCells.value.forEach(cell => {
    cell.isSelected = false
  })
}

const selectCells = (indices) => {
  indices.forEach(index => {
    if (gridCells.value[index]) {
      gridCells.value[index].isSelected = true
    }
  })
}

const markCellsAsFound = (indices) => {
  indices.forEach(index => {
    if (gridCells.value[index]) {
      gridCells.value[index].isFound = true
      gridCells.value[index].isSelected = false
      triggerCorrectAnimation(index)
    }
  })
}

const markCellsAsWrong = (indices) => {
  indices.forEach(index => {
    if (gridCells.value[index]) {
      gridCells.value[index].isWrong = true
      triggerWrongAnimation(index)
      
      // 一定時間後に間違い状態をクリア
      setTimeout(() => {
        if (gridCells.value[index]) {
          gridCells.value[index].isWrong = false
          gridCells.value[index].isSelected = false
        }
      }, 1000)
    }
  })
}

const highlightCells = (indices, highlight = true) => {
  indices.forEach(index => {
    if (gridCells.value[index]) {
      gridCells.value[index].isHighlighted = highlight
    }
  })
}

// アニメーション関数
const triggerRippleEffect = (index) => {
  const cell = gridCells.value[index]
  if (!cell) return
  
  cell.showRipple = true
  setTimeout(() => {
    cell.showRipple = false
  }, 600)
}

const triggerCorrectAnimation = (index) => {
  animatingCells.value.add(index)
  const cell = gridCells.value[index]
  if (cell) {
    cell.isCorrect = true
    cell.showGlow = true
  }
  
  setTimeout(() => {
    animatingCells.value.delete(index)
    if (cell) {
      cell.showGlow = false
    }
  }, 1000)
}

const triggerWrongAnimation = (index) => {
  animatingCells.value.add(index)
  
  setTimeout(() => {
    animatingCells.value.delete(index)
  }, 500)
}

// 公開メソッド
defineExpose({
  clearAllSelections,
  selectCells,
  markCellsAsFound,
  markCellsAsWrong,
  highlightCells,
  triggerRippleEffect,
  triggerCorrectAnimation,
  triggerWrongAnimation,
  gridCells
})

// ウォッチャー
watch(() => props.gridData, (newData) => {
  // グリッドデータが変更された時の処理
  hoveredCell.value = null
  animatingCells.value.clear()
}, { deep: true })
</script>

<style scoped>
.pattern-grid-wrapper {
  width: 100%;
  position: relative;
}

.pattern-grid {
  display: grid;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

/* グリッドサイズバリエーション */
.grid-small {
  max-width: 600px;
}

.grid-medium {
  max-width: 800px;
}

.grid-large {
  max-width: 1000px;
}

/* アニメーション速度 */
.animation-slow .grid-cell {
  transition: all 0.5s ease;
}

.animation-normal .grid-cell {
  transition: all 0.3s ease;
}

.animation-fast .grid-cell {
  transition: all 0.2s ease;
}

/* セルスタイル */
.grid-cell {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 0.75rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-cell:hover:not(.cell-disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(147, 51, 234, 0.5);
}

/* セル状態 */
.cell-empty {
  opacity: 0.3;
  cursor: not-allowed;
}

.cell-selected {
  background: rgba(147, 51, 234, 0.3) !important;
  border-color: #9333ea !important;
  box-shadow: 0 0 20px rgba(147, 51, 234, 0.5);
  transform: scale(1.05);
}

.cell-found {
  background: rgba(34, 197, 94, 0.3) !important;
  border-color: #22c55e !important;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
  cursor: not-allowed;
}

.cell-correct {
  animation: correctPulse 0.6s ease-in-out var(--animation-delay, 0s);
}

.cell-wrong {
  background: rgba(239, 68, 68, 0.3) !important;
  border-color: #ef4444 !important;
  animation: wrongShake 0.5s ease-in-out;
}

.cell-highlighted {
  background: rgba(251, 191, 36, 0.3) !important;
  border-color: #fbbf24 !important;
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.4);
}

.cell-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.cell-hovered {
  transform: scale(1.08);
  z-index: 10;
}

.cell-animating {
  z-index: 20;
}

/* セル内容 */
.cell-content {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell-number {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* インジケーター */
.cell-indicators {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 2px;
}

.indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.selected-indicator {
  background: rgba(147, 51, 234, 0.8);
  color: white;
}

.found-indicator {
  background: rgba(34, 197, 94, 0.8);
  color: white;
}

.correct-indicator {
  background: rgba(251, 191, 36, 0.8);
  color: white;
}

/* エフェクト */
.cell-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  border-radius: inherit;
}

.ripple-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background: rgba(147, 51, 234, 0.6);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ripple 0.6s ease-out forwards;
}

.glow-effect {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%);
  border-radius: inherit;
  animation: glow 1s ease-in-out;
}

/* グリッド状態 */
.grid-disabled {
  pointer-events: none;
  opacity: 0.6;
}

.grid-selectable .grid-cell:not(.cell-empty):not(.cell-disabled):not(.cell-found) {
  cursor: pointer;
}

/* グリッド情報 */
.grid-info {
  margin-top: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.grid-stats {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
}

/* アニメーション */
@keyframes correctPulse {
  0% { 
    transform: scale(1); 
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
  }
  50% { 
    transform: scale(1.15); 
    box-shadow: 0 0 40px rgba(34, 197, 94, 0.8);
  }
  100% { 
    transform: scale(1.05); 
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
  }
}

@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
  20%, 40%, 60%, 80% { transform: translateX(8px); }
}

@keyframes ripple {
  0% {
    width: 20px;
    height: 20px;
    opacity: 0.8;
  }
  100% {
    width: 100px;
    height: 100px;
    opacity: 0;
  }
}

@keyframes glow {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .pattern-grid {
    max-width: 100%;
  }
  
  .grid-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .stat-label {
    margin-bottom: 0;
  }
}

@media (max-width: 480px) {
  .grid-cell {
    border-radius: 0.5rem;
  }
  
  .cell-indicators {
    top: 2px;
    right: 2px;
  }
  
  .indicator {
    width: 16px;
    height: 16px;
    font-size: 10px;
  }
}
</style>