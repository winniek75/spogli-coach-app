<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="viewBox"
    :fill="fill"
    :stroke="stroke"
    :stroke-width="strokeWidth"
    :stroke-linecap="strokeLinecap"
    :stroke-linejoin="strokeLinejoin"
    :class="classes"
    v-bind="$attrs"
  >
    <g v-if="name === 'arrow-left'">
      <polyline points="15,18 9,12 15,6"></polyline>
      <path d="m9,12 10,0"></path>
    </g>
    
    <g v-else-if="name === 'check'">
      <polyline points="20,6 9,17 4,12"></polyline>
    </g>
    
    <g v-else-if="name === 'x'">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </g>
    
    <g v-else-if="name === 'alert-triangle'">
      <path d="m21.73,18c0.13,0.29 0,0.49 -0.3,0.49l-18.86,0c-0.3,0 -0.43,-0.2 -0.3,-0.49l9.43,-16.38c0.13,-0.29 0.35,-0.29 0.48,0l9.55,16.38z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </g>
    
    <g v-else-if="name === 'refresh-cw'">
      <polyline points="23,4 23,10 17,10"></polyline>
      <polyline points="1,20 1,14 7,14"></polyline>
      <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15"></path>
    </g>
    
    <g v-else-if="name === 'home'">
      <path d="m3,9 9,-7 9,7 0,11a2,2 0,0 1,-2,2l-14,0a2,2 0,0 1,-2,-2l0,-11z"></path>
      <polyline points="9,22 9,12 15,12 15,22"></polyline>
    </g>
    
    <g v-else-if="name === 'share-2'">
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </g>
    
    <g v-else-if="name === 'mouse-pointer'">
      <path d="m13,13.5 6,6 -3,3 -6,-6 3,-3z"></path>
      <path d="m3,3 7.07,16.97 2.51,-7.39 7.39,-2.51 -16.97,-7.07z"></path>
    </g>
    
    <g v-else-if="name === 'hand'">
      <path d="M18,11V6a2,2,0,0,0-4,0v5"></path>
      <path d="M14,10V4a2,2,0,0,0-4,0v6"></path>
      <path d="M10,10.5V6a2,2,0,0,0-4,0v4.5"></path>
      <path d="m6,10.5 0,5a4,4 0,0 0,4,4 12,12 0,0 0,8,-3.5l2,-1.5"></path>
    </g>
    
    <g v-else-if="name === 'volume-2'">
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"></polygon>
      <path d="m19.07,4.93a10,10 0,0 1,0 14.14M15.54,8.46a5,5 0,0 1,0 7.07"></path>
    </g>
    
    <g v-else-if="name === 'volume-x'">
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    </g>
    
    <g v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4,15a1.65,1.65,0,0,0,.33,1.82l.06.06a2,2,0,0,1,0,2.83,2,2,0,0,1-2.83,0l-.06-.06a1.65,1.65,0,0,0-1.82-.33,1.65,1.65,0,0,0-1,1.51V21a2,2,0,0,1-2,2,2,2,0,0,1-2-2v-.09A1.65,1.65,0,0,0,9,19.4a1.65,1.65,0,0,0-1.82.33l-.06.06a2,2,0,0,1-2.83,0,2,2,0,0,1,0-2.83l.06-.06a1.65,1.65,0,0,0,.33-1.82,1.65,1.65,0,0,0-1.51-1H3a2,2,0,0,1-2-2,2,2,0,0,1,2-2h.09A1.65,1.65,0,0,0,4.6,9a1.65,1.65,0,0,0-.33-1.82L4.21,7.11a2,2,0,0,1,0-2.83,2,2,0,0,1,2.83,0L7.11,4.34A1.65,1.65,0,0,0,9,4.6a1.65,1.65,0,0,0,1-1.51V3a2,2,0,0,1,2-2,2,2,0,0,1,2,2v.09A1.65,1.65,0,0,0,15,4.6a1.65,1.65,0,0,0,1.82-.33l.06-.06a2,2,0,0,1,2.83,0,2,2,0,0,1,0,2.83l-.06.06a1.65,1.65,0,0,0-.33,1.82,1.65,1.65,0,0,0,1.51,1H21a2,2,0,0,1,2,2,2,2,0,0,1-2,2h-.09A1.65,1.65,0,0,0,19.4,15Z"></path>
    </g>
    
    <g v-else-if="name === 'play'">
      <polygon points="5,3 19,12 5,21 5,3"></polygon>
    </g>
    
    <g v-else-if="name === 'pause'">
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    </g>
    
    <g v-else-if="name === 'star'">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"></polygon>
    </g>
    
    <g v-else-if="name === 'heart'">
      <path d="M20.84,4.61a5.5,5.5,0,0,0-7.78,0L12,5.67,10.94,4.61a5.5,5.5,0,0,0-7.78,7.78l1.06,1.06L12,21.23l7.78-7.78,1.06-1.06a5.5,5.5,0,0,0,0-7.78Z"></path>
    </g>
    
    <g v-else-if="name === 'trophy'">
      <path d="M6,9H4.5a2.5,2.5,0,0,1,0-5H6"></path>
      <path d="M18,9h1.5a2.5,2.5,0,0,0,0-5H18"></path>
      <path d="M6,20a6,6,0,0,0,12,0"></path>
      <rect x="8" y="14" width="8" height="6"></rect>
      <rect x="9" y="9" width="6" height="5"></rect>
    </g>
    
    <g v-else-if="name === 'zap'">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"></polygon>
    </g>
    
    <g v-else-if="name === 'target'">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6"></circle>
      <circle cx="12" cy="12" r="2"></circle>
    </g>
    
    <g v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12,6 12,12 16,14"></polyline>
    </g>
    
    <g v-else-if="name === 'trending-up'">
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"></polyline>
      <polyline points="17,6 23,6 23,12"></polyline>
    </g>
    
    <g v-else-if="name === 'award'">
      <circle cx="12" cy="8" r="7"></circle>
      <polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"></polyline>
    </g>
    
    <g v-else-if="name === 'fire'">
      <path d="M8.5,21c0,0 -2.5,-3.5 -2.5,-8.5a8.5,8.5 0,0 1,17 0c0,5 -2.5,8.5 -2.5,8.5"></path>
      <path d="M16,13c0,0 -1.5,-2 -1.5,-4a4,4 0,0 1,8 0c0,2 -1.5,4 -1.5,4"></path>
    </g>
    
    <g v-else-if="name === 'info'">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </g>
    
    <g v-else-if="name === 'eye'">
      <path d="M1,12s4-8,11-8,11,8,11,8-4,8-11,8S1,12,1,12Z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </g>
    
    <g v-else-if="name === 'eye-off'">
      <path d="m17.94,17.94A10.07,10.07 0,0 1,12 20c-7,0 -11,-8 -11,-8a18.45,18.45 0,0 1,5.06 -5.94M9.9,4.24A9.12,9.12 0,0 1,12 4c7,0 11,8 11,8a18.5,18.5 0,0 1,-2.16 3.19m-6.72,-1.07a3,3 0,1 1,-4.24 -4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </g>
    
    <!-- デフォルトアイコン（不明なnameの場合） -->
    <g v-else>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="16"></line>
      <line x1="8" y1="12" x2="16" y2="12"></line>
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: 24
  },
  strokeWidth: {
    type: [String, Number],
    default: 2
  },
  fill: {
    type: String,
    default: 'none'
  },
  stroke: {
    type: String,
    default: 'currentColor'
  },
  strokeLinecap: {
    type: String,
    default: 'round'
  },
  strokeLinejoin: {
    type: String,
    default: 'round'
  },
  class: {
    type: [String, Array, Object],
    default: ''
  }
})

const viewBox = computed(() => '0 0 24 24')

const classes = computed(() => {
  const baseClasses = ['icon']
  
  if (props.class) {
    if (Array.isArray(props.class)) {
      baseClasses.push(...props.class)
    } else if (typeof props.class === 'object') {
      Object.entries(props.class).forEach(([className, condition]) => {
        if (condition) baseClasses.push(className)
      })
    } else {
      baseClasses.push(props.class)
    }
  }
  
  return baseClasses
})
</script>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>