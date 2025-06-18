<!-- BadgeModal.vue -->
<template>
    <Teleport to="body">
        <div class="modal-overlay" @click="$emit('close')">
            <div class="badge-modal" @click.stop>
                <header class="modal-header" :class="{ 'earned': badge.earned }">
                    <div class="badge-info">
                        <div class="badge-icon">{{ badge.icon }}</div>
                        <div class="badge-details">
                            <h2 class="badge-name">{{ badge.name }}</h2>
                            <p class="badge-status">
                                {{ badge.earned ? '🎉 獲得済み' : '🔒 未獲得' }}
                            </p>
                        </div>
                    </div>
                    <button class="close-button" @click="$emit('close')">✕</button>
                </header>

                <main class="modal-content">
                    <div class="badge-description">
                        <h3>📋 バッジの説明</h3>
                        <p>{{ badge.description || 'このバッジを獲得して特別な称号を手に入れよう！' }}</p>
                    </div>

                    <div class="achievement-details" v-if="badge.requirements">
                        <h3>🎯 獲得条件</h3>
                        <div class="requirements-list">
                            <div v-for="(req, index) in badge.requirements" :key="index" class="requirement-item"
                                :class="{ 'completed': req.completed }">
                                <div class="req-icon">
                                    {{ req.completed ? '✅' : '⭕' }}
                                </div>
                                <div class="req-text">{{ req.text }}</div>
                                <div class="req-progress" v-if="req.progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill"
                                            :style="{ width: `${(req.progress.current / req.progress.total) * 100}%` }">
                                        </div>
                                    </div>
                                    <span class="progress-text">
                                        {{ req.progress.current }} / {{ req.progress.total }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="badge-rewards" v-if="badge.rewards">
                        <h3>🎁 報酬</h3>
                        <div class="rewards-list">
                            <div v-for="(reward, index) in badge.rewards" :key="index" class="reward-item">
                                <div class="reward-icon">{{ reward.icon }}</div>
                                <div class="reward-text">{{ reward.text }}</div>
                                <div class="reward-value">{{ reward.value }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="badge-stats" v-if="badge.earnedDate">
                        <h3>📊 獲得情報</h3>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-label">獲得日</div>
                                <div class="stat-value">{{ formatDate(badge.earnedDate) }}</div>
                            </div>
                            <div class="stat-item" v-if="badge.rarity">
                                <div class="stat-label">レア度</div>
                                <div class="stat-value">{{ badge.rarity }}</div>
                            </div>
                            <div class="stat-item" v-if="badge.earnedBy">
                                <div class="stat-label">獲得者数</div>
                                <div class="stat-value">{{ badge.earnedBy }}人</div>
                            </div>
                        </div>
                    </div>

                    <div class="tips-section" v-if="!badge.earned && badge.tips">
                        <h3>💡 攻略のコツ</h3>
                        <div class="tips-list">
                            <div v-for="(tip, index) in badge.tips" :key="index" class="tip-item">
                                <div class="tip-icon">💡</div>
                                <div class="tip-text">{{ tip }}</div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer class="modal-footer">
                    <button class="close-action-button" @click="$emit('close')">
                        <span class="button-icon">👍</span>
                        <span class="button-text">了解</span>
                    </button>
                </footer>
            </div>
        </div>
    </Teleport>
</template>

<script>
    import { defineComponent } from 'vue'

    export default defineComponent({
        name: 'BadgeModal',
        props: {
            badge: {
                type: Object,
                required: true
            }
        },
        emits: ['close'],
        setup() {
            const formatDate = (timestamp) => {
                if (!timestamp) return '--'
                const date = new Date(timestamp)
                return date.toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            }

            return {
                formatDate
            }
        }
    })
</script>

<style scoped>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        animation: fadeIn 0.3s ease;
    }

    .badge-modal {
        background: white;
        border-radius: 25px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 30px;
        background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
        color: white;
        border-radius: 25px 25px 0 0;
    }

    .modal-header.earned {
        background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
        color: #333;
    }

    .badge-info {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .badge-icon {
        font-size: 3rem;
        filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
        animation: float 3s ease-in-out infinite;
    }

    .badge-details {
        flex: 1;
    }

    .badge-name {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 5px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }

    .badge-status {
        font-size: 1rem;
        opacity: 0.9;
        margin: 0;
    }

    .close-button {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 50%;
        color: inherit;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1.2rem;
        font-weight: bold;
    }

    .close-button:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
    }

    .modal-content {
        padding: 30px;
    }

    .modal-content h3 {
        font-size: 1.2rem;
        color: #333;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .badge-description {
        margin-bottom: 30px;
    }

    .badge-description p {
        font-size: 1rem;
        color: #666;
        line-height: 1.6;
    }

    .achievement-details {
        margin-bottom: 30px;
    }

    .requirements-list {
        display: grid;
        gap: 15px;
    }

    .requirement-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 12px;
        border-left: 4px solid #dee2e6;
    }

    .requirement-item.completed {
        background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
        border-left-color: #28a745;
    }

    .req-icon {
        font-size: 1.2rem;
    }

    .req-text {
        flex: 1;
        font-size: 0.95rem;
        color: #333;
    }

    .req-progress {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .progress-bar {
        width: 60px;
        height: 6px;
        background: #e9ecef;
        border-radius: 3px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4ecdc4, #44a08d);
        border-radius: 3px;
        transition: width 0.5s ease;
    }

    .progress-text {
        font-size: 0.8rem;
        color: #666;
        font-weight: bold;
    }

    .badge-rewards {
        margin-bottom: 30px;
    }

    .rewards-list {
        display: grid;
        gap: 12px;
    }

    .reward-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
        border-radius: 10px;
        border-left: 4px solid #f39c12;
    }

    .reward-icon {
        font-size: 1.5rem;
    }

    .reward-text {
        flex: 1;
        font-size: 0.9rem;
        color: #856404;
    }

    .reward-value {
        font-size: 0.9rem;
        font-weight: bold;
        color: #856404;
    }

    .badge-stats {
        margin-bottom: 30px;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 15px;
    }

    .stat-item {
        text-align: center;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 10px;
    }

    .stat-label {
        font-size: 0.8rem;
        color: #666;
        margin-bottom: 5px;
    }

    .stat-value {
        font-size: 1.1rem;
        font-weight: bold;
        color: #333;
    }

    .tips-section {
        margin-bottom: 20px;
    }

    .tips-list {
        display: grid;
        gap: 10px;
    }

    .tip-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px;
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        border-radius: 10px;
        border-left: 4px solid #2196f3;
    }

    .tip-icon {
        font-size: 1rem;
        margin-top: 2px;
    }

    .tip-text {
        font-size: 0.9rem;
        color: #1565c0;
        line-height: 1.4;
    }

    .modal-footer {
        display: flex;
        justify-content: center;
        padding: 30px;
        background: #f8f9fa;
        border-radius: 0 0 25px 25px;
    }

    .close-action-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        border: none;
        border-radius: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .close-action-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .button-icon {
        font-size: 1.1rem;
    }

    .button-text {
        font-size: 0.95rem;
    }

    @keyframes float {

        0%,
        100% {
            transform: translateY(0px);
        }

        50% {
            transform: translateY(-5px);
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }

        to {
            opacity: 1;
        }
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
        }

        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @media (max-width: 768px) {
        .badge-modal {
            margin: 10px;
            max-height: 95vh;
        }

        .modal-header {
            padding: 20px;
        }

        .modal-content {
            padding: 20px;
        }

        .badge-info {
            gap: 15px;
        }

        .badge-icon {
            font-size: 2.5rem;
        }

        .badge-name {
            font-size: 1.3rem;
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }
    }
</style>