#!/usr/bin/env node

/**
 * 協力学習WebSocketサーバー起動スクリプト
 * package.jsonが混在する環境での起動用
 */

// package.jsonを一時的にWebSocketサーバー用に切り替え
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const originalPackageJson = 'package.json';
const serverPackageJson = 'server-package.json';

console.log('🚀 WebSocketサーバーを起動中...');

try {
  // Vue.jsのpackage.jsonをバックアップ
  if (fs.existsSync(originalPackageJson)) {
    fs.copyFileSync(originalPackageJson, 'package-vue.json.bak');
  }

  // WebSocketサーバー用のpackage.jsonに切り替え
  if (fs.existsSync(serverPackageJson)) {
    fs.copyFileSync(serverPackageJson, originalPackageJson);
  }

  // WebSocketサーバー依存関係をインストール
  console.log('📦 WebSocketサーバー依存関係をインストール中...');
  execSync('npm install --no-save', { stdio: 'inherit' });

  // サーバー起動
  console.log('🌐 WebSocketサーバーを起動中...');
  execSync('node server.js', { stdio: 'inherit' });

} catch (error) {
  console.error('❌ WebSocketサーバーの起動に失敗:', error.message);
} finally {
  // Vue.jsのpackage.jsonを復元
  if (fs.existsSync('package-vue.json.bak')) {
    fs.copyFileSync('package-vue.json.bak', originalPackageJson);
    fs.unlinkSync('package-vue.json.bak');
    console.log('✅ Vue.js package.jsonを復元しました');
  }
}