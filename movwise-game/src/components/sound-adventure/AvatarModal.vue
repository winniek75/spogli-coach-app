<!-- AvatarModal.vue -->
<template>
    <Teleport to="body">
        <div class="modal-overlay" @click="$emit('close')">
            <div class="avatar-modal" @click.stop>
                <header class="modal-header">
                    <h2 class="modal-title">🎭 アバターを選択</h2>
                    <button class="close-button" @click="$emit('close')">✕</button>
                </header>

                <main class="modal-content">
                    <div class="current-avatar">
                        <div class="avatar-preview">{{ currentAvatar }}</div>
                        <p class="preview-text">現在のアバター</p>
                    </div>

                    <div class="avatars-grid">
                        <div v-for="avatar in availableAvatars" :key="avatar.emoji" class="avatar-option" :class="{ 
                'selected': avatar.emoji === selectedAvatar,
                'locked': avatar.locked,
                'current': avatar.emoji === currentAvatar
              }" @click="selectAvatar(avatar)">
                            <div class="avatar-emoji">{{ avatar.emoji }}</div>
                            <div class="avatar-name">{{ avatar.name }}</div>
                            <div class="avatar-requirement" v-if="avatar.locked">
                                {{ avatar.requirement }}
                            </div>
                            <div class="lock-icon" v-if="avatar.locked">🔒</div>
                        </div>
                    </div>

                    <div class="unlock-hint">
                        <p>💡 新しいアバターはゲームをプレイして実績を達成すると解放されます！</p>
                    </div>
                </main>

                <footer class="modal-footer">
                    <button class="cancel-button" @click="$emit('close')">
                        キャンセル
                    </button>
                    <button class="confirm-button" @click="confirmSelection"
                        :disabled="!selectedAvatar || selectedAvatar === currentAvatar">
                        決定
                    </button>
                </footer>
            </div>
        </div>
    </Teleport>
</template>

<script>
    import { defineComponent, ref } from 'vue'

    export default defineComponent({
        name: 'AvatarModal',
        props: {
            currentAvatar: {
                type: String,
                required: true
            }
        },
        emits: ['close', 'select'],
        setup(props, { emit }) {
            const selectedAvatar = ref(props.currentAvatar)

            const availableAvatars = ref([
                { emoji: '🦸‍♂️', name: 'サウンド・レンジャー', locked: false },
                { emoji: '🧙‍♂️', name: '音の魔法使い', locked: false },
                { emoji: '🥷', name: 'サイレント・ニンジャ', locked: false },
                { emoji: '👨‍🚀', name: 'スペース・エクスプローラー', locked: false },
                { emoji: '🦄', name: 'ミスティック・ユニコーン', locked: true, requirement: 'レベル20で解放' },
                { emoji: '🐉', name: 'ドラゴン・マスター', locked: true, requirement: '全ステージクリアで解放' },
                { emoji: '👑', name: 'サウンド・キング', locked: true, requirement: '100%スコア10回で解放' },
                { emoji: '🌟', name: 'スター・プレイヤー', locked: true, requirement: 'ランキング1位で解放' },
                { emoji: '🎭', name: 'パフォーマー', locked: true, requirement: '30日連続プレイで解放' },
                { emoji: '🔮', name: 'オラクル・マスター', locked: true, requirement: '全実績達成で解放' }
            ])

            const selectAvatar = (avatar) => {
                if (avatar.locked) {
                    playLockedSound()
                    return
                }
                selectedAvatar.value = avatar.emoji
                playSelectSound()
            }

            const confirmSelection = () => {
                if (selectedAvatar.value && selectedAvatar.value !== props.currentAvatar) {
                    emit('select', selectedAvatar.value)
                    playConfirmSound()
                }
            }

            const playSelectSound = () => {
                try {
                    const audio = new Audio('/sounds/select.mp3')
                    audio.volume = 0.3
                    audio.play()
                } catch (error) {
                    console.log('音声再生エラー:', error)
                }
            }

            const playConfirmSound = () => {
                try {
                    const audio = new Audio('/sounds/confirm.mp3')
                    audio.volume = 0.4
                    audio.play()
                } catch (error) {
                    console.log('音声再生エラー:', error)
                }
            }

            const playLockedSound = () => {
                try {
                    const audio = new Audio('/sounds/locked.mp3')
                    audio.volume = 0.3
                    audio.play()
                } catch (error) {
                    console.log('音声再生エラー:', error)
                }
            }

            return {
                selectedAvatar,
                availableAvatars,
                selectAvatar,
                confirmSelection
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

    .avatar-modal {
        background: white;
        border-radius: 25px;
        max-width: 600px;
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
        background: linear-gradient(135deg, #ff6b9d 0%, #c471ed 100%);
        color: white;
        border-radius: 25px 25px 0 0;
    }

    .modal-title {
        font-size: 1.8rem;
        font-weight: bold;
        margin: 0;
    }

    .close-button {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 50%;
        color: white;
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

    .current-avatar {
        text-align: center;
        margin-bottom: 30px;
        padding: 20px;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 15px;
    }

    .avatar-preview {
        font-size: 4rem;
        margin-bottom: 10px;
        animation: float 3s ease-in-out infinite;
    }

    .preview-text {
        font-size: 1rem;
        color: #666;
        margin: 0;
    }

    .avatars-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 15px;
        margin-bottom: 30px;
    }

    .avatar-option {
        position: relative;
        background: #f8f9fa;
        border: 3px solid transparent;
        border-radius: 15px;
        padding: 20px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        min-height: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .avatar-option:hover:not(.locked) {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .avatar-option.selected {
        border-color: #4ecdc4;
        background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
        color: white;
    }

    .avatar-option.current {
        border-color: #ff6b9d;
        background: linear-gradient(135deg, #ff6b9d 0%, #c471ed 100%);
        color: white;
    }

    .avatar-option.locked {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .avatar-emoji {
        font-size: 2.5rem;
        margin-bottom: 8px;
    }

    .avatar-name {
        font-size: 0.9rem;
        font-weight: bold;
        margin-bottom: 5px;
    }

    .avatar-requirement {
        font-size: 0.7rem;
        opacity: 0.8;
    }

    .lock-icon {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 1.2rem;
    }

    .unlock-hint {
        background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
        border-radius: 12px;
        padding: 15px;
        border-left: 4px solid #f39c12;
    }

    .unlock-hint p {
        margin: 0;
        font-size: 0.9rem;
        color: #856404;
    }

    .modal-footer {
        display: flex;
        gap: 15px;
        justify-content: end;
        padding: 30px;
        background: #f8f9fa;
        border-radius: 0 0 25px 25px;
    }

    .cancel-button,
    .confirm-button {
        padding: 12px 24px;
        border: none;
        border-radius: 20px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .cancel-button {
        background: #e9ecef;
        color: #666;
    }

    .confirm-button {
        background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
        color: white;
    }

    .confirm-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .cancel-button:hover,
    .confirm-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    @keyframes float {

        0%,
        100% {
            transform: translateY(0px);
        }

        50% {
            transform: translateY(-10px);
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
        .avatars-grid {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        }

        .avatar-option {
            padding: 15px;
            min-height: 100px;
        }

        .avatar-emoji {
            font-size: 2rem;
        }
    }
</style>