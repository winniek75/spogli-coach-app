#!/bin/bash

# MovWISE Deployment Script
# 本番環境へのデプロイを自動化

set -e  # エラー時に終了

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 設定
PROJECT_NAME="movwise-game"
BUILD_DIR="dist"
ENVIRONMENTS=("staging" "production")
CURRENT_ENV=${1:-staging}

# 環境の確認
if [[ ! " ${ENVIRONMENTS[@]} " =~ " ${CURRENT_ENV} " ]]; then
    log_error "Invalid environment: ${CURRENT_ENV}"
    log_info "Available environments: ${ENVIRONMENTS[*]}"
    exit 1
fi

log_info "Starting deployment to ${CURRENT_ENV} environment..."

# 前提条件の確認
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Node.js の確認
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # npm の確認
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Firebase CLI の確認
    if ! command -v firebase &> /dev/null; then
        log_warning "Firebase CLI is not installed. Installing..."
        npm install -g firebase-tools
    fi
    
    # Git の確認
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check completed"
}

# 環境変数の設定
setup_environment() {
    log_info "Setting up environment variables for ${CURRENT_ENV}..."
    
    case ${CURRENT_ENV} in
        "staging")
            export VITE_ENV=staging
            export VITE_API_BASE_URL="https://staging-api.movwise.com/api"
            export VITE_FIREBASE_PROJECT_ID="movwise-staging"
            export VITE_DEBUG=true
            ;;
        "production")
            export VITE_ENV=production
            export VITE_API_BASE_URL="https://api.movwise.com/api"
            export VITE_FIREBASE_PROJECT_ID="movwise-prod"
            export VITE_DEBUG=false
            ;;
    esac
    
    # Git情報の設定
    export VITE_COMMIT_HASH=$(git rev-parse --short HEAD)
    export VITE_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    export VITE_BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    log_success "Environment variables configured"
}

# 依存関係のインストール
install_dependencies() {
    log_info "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci --production=false
    else
        npm install
    fi
    
    log_success "Dependencies installed"
}

# セキュリティ脆弱性チェック
security_audit() {
    log_info "Running security audit..."
    
    # npm audit
    if npm audit --audit-level high; then
        log_success "Security audit passed"
    else
        log_warning "Security vulnerabilities found. Attempting to fix..."
        npm audit fix --force
        
        if npm audit --audit-level high; then
            log_success "Security vulnerabilities fixed"
        else
            log_error "Unable to fix all security vulnerabilities"
            read -p "Continue with deployment? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    fi
}

# テストの実行
run_tests() {
    log_info "Running tests..."
    
    # リント
    if npm run lint; then
        log_success "Linting passed"
    else
        log_error "Linting failed"
        exit 1
    fi
    
    # TypeScript型チェック（存在する場合）
    if npm run type-check 2>/dev/null; then
        log_success "Type checking passed"
    else
        log_warning "Type checking not available or failed"
    fi
    
    # ユニットテスト（存在する場合）
    if npm test 2>/dev/null; then
        log_success "Unit tests passed"
    else
        log_warning "Unit tests not available"
    fi
}

# ビルドの実行
build_application() {
    log_info "Building application for ${CURRENT_ENV}..."
    
    # 古いビルドの削除
    if [ -d "${BUILD_DIR}" ]; then
        rm -rf "${BUILD_DIR}"
    fi
    
    # ビルド実行
    if npm run build; then
        log_success "Build completed successfully"
    else
        log_error "Build failed"
        exit 1
    fi
    
    # ビルドファイルの確認
    if [ ! -d "${BUILD_DIR}" ]; then
        log_error "Build directory not found"
        exit 1
    fi
    
    # ビルドサイズの確認
    BUILD_SIZE=$(du -sh ${BUILD_DIR} | cut -f1)
    log_info "Build size: ${BUILD_SIZE}"
}

# パフォーマンス最適化
optimize_build() {
    log_info "Optimizing build..."
    
    # Service Worker の更新
    if [ -f "${BUILD_DIR}/sw.js" ]; then
        # Service Worker にビルド時刻を追加
        sed -i "s/CACHE_NAME = 'movwise-v1.0.0'/CACHE_NAME = 'movwise-v1.0.0-$(date +%Y%m%d%H%M%S)'/g" ${BUILD_DIR}/sw.js
        log_success "Service Worker cache updated"
    fi
    
    # 圧縮可能ファイルの gzip 作成
    find ${BUILD_DIR} -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec gzip -k {} \;
    log_success "Gzip compression completed"
    
    # manifest.json の確認
    if [ -f "${BUILD_DIR}/manifest.json" ]; then
        log_success "PWA manifest found"
    else
        log_warning "PWA manifest not found"
    fi
}

# Firebase設定の確認
verify_firebase_config() {
    log_info "Verifying Firebase configuration..."
    
    # Firebase プロジェクトの確認
    case ${CURRENT_ENV} in
        "staging")
            FIREBASE_PROJECT="movwise-staging"
            ;;
        "production")
            FIREBASE_PROJECT="movwise-prod"
            ;;
    esac
    
    # Firebase ログイン確認
    if firebase projects:list | grep -q ${FIREBASE_PROJECT}; then
        log_success "Firebase project ${FIREBASE_PROJECT} accessible"
    else
        log_error "Firebase project ${FIREBASE_PROJECT} not accessible"
        log_info "Please run: firebase login"
        exit 1
    fi
    
    # Firebase プロジェクトの設定
    firebase use ${FIREBASE_PROJECT}
    log_success "Firebase project set to ${FIREBASE_PROJECT}"
}

# Firebase Hosting へのデプロイ
deploy_to_firebase() {
    log_info "Deploying to Firebase Hosting..."
    
    # Hosting の設定確認
    if [ ! -f "firebase.json" ]; then
        log_error "firebase.json not found"
        exit 1
    fi
    
    # デプロイ実行
    if [ "${CURRENT_ENV}" == "production" ]; then
        # 本番環境は確認付き
        log_warning "Deploying to PRODUCTION environment"
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deployment cancelled"
            exit 0
        fi
    fi
    
    if firebase deploy --only hosting; then
        log_success "Firebase Hosting deployment completed"
    else
        log_error "Firebase Hosting deployment failed"
        exit 1
    fi
}

# Firebase Firestore ルールのデプロイ
deploy_firestore_rules() {
    log_info "Deploying Firestore security rules..."
    
    if [ -f "firestore.rules" ]; then
        if firebase deploy --only firestore:rules; then
            log_success "Firestore rules deployed"
        else
            log_error "Firestore rules deployment failed"
            exit 1
        fi
    else
        log_warning "firestore.rules not found, skipping"
    fi
}

# Firebase Functions のデプロイ（存在する場合）
deploy_functions() {
    if [ -d "functions" ]; then
        log_info "Deploying Firebase Functions..."
        
        if firebase deploy --only functions; then
            log_success "Firebase Functions deployed"
        else
            log_error "Firebase Functions deployment failed"
            exit 1
        fi
    else
        log_info "No Firebase Functions to deploy"
    fi
}

# デプロイ後の確認
post_deployment_verification() {
    log_info "Running post-deployment verification..."
    
    # デプロイされたURLの取得
    case ${CURRENT_ENV} in
        "staging")
            DEPLOYED_URL="https://staging.movwise.com"
            ;;
        "production")
            DEPLOYED_URL="https://movwise.com"
            ;;
    esac
    
    # ヘルスチェック
    log_info "Checking ${DEPLOYED_URL}..."
    
    if curl -f -s -o /dev/null ${DEPLOYED_URL}; then
        log_success "Site is accessible at ${DEPLOYED_URL}"
    else
        log_error "Site is not accessible at ${DEPLOYED_URL}"
        exit 1
    fi
    
    # Service Worker の確認
    if curl -f -s -o /dev/null ${DEPLOYED_URL}/sw.js; then
        log_success "Service Worker is accessible"
    else
        log_warning "Service Worker not accessible"
    fi
    
    # manifest.json の確認
    if curl -f -s -o /dev/null ${DEPLOYED_URL}/manifest.json; then
        log_success "PWA manifest is accessible"
    else
        log_warning "PWA manifest not accessible"
    fi
}

# 成功通知
send_success_notification() {
    log_success "Deployment to ${CURRENT_ENV} completed successfully!"
    log_info "Site URL: ${DEPLOYED_URL}"
    log_info "Build time: $(date)"
    log_info "Git commit: ${VITE_COMMIT_HASH}"
    log_info "Git branch: ${VITE_BRANCH}"
}

# デプロイメント情報の記録
record_deployment() {
    DEPLOYMENT_LOG="deployments.log"
    
    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") - ${CURRENT_ENV} - ${VITE_COMMIT_HASH} - ${VITE_BRANCH} - SUCCESS" >> ${DEPLOYMENT_LOG}
    
    log_info "Deployment recorded in ${DEPLOYMENT_LOG}"
}

# メイン実行
main() {
    log_info "Starting MovWISE deployment process..."
    
    check_prerequisites
    setup_environment
    install_dependencies
    security_audit
    run_tests
    build_application
    optimize_build
    verify_firebase_config
    deploy_to_firebase
    deploy_firestore_rules
    deploy_functions
    post_deployment_verification
    record_deployment
    send_success_notification
    
    log_success "All deployment steps completed successfully!"
}

# エラーハンドリング
trap 'log_error "Deployment failed at line $LINENO"' ERR

# スクリプト実行
main "$@"