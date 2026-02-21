# ⚠️ 正しいSupabaseキーの取得方法

提供されたキー `sb_publishable_Gq6mgZF4M_g4HdsCRXxJGA_wKGLZ1aI` は通常のSupabase anon keyの形式ではないようです。

## 正しいキーの取得手順：

### 1. Supabaseダッシュボードを開く
https://supabase.com にログイン

### 2. プロジェクトを選択
「spogli-coach」プロジェクトを選択

### 3. Settings → APIをクリック
左メニューから「Settings」→「API」をクリック

### 4. 以下の2つの値をコピー

#### Project URL（正しい✅）
```
https://yefdgxiasmbrqkyjwhsn.supabase.co
```

#### anon public key（これが必要❗）
以下のような形式の長い文字列：
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZmRneGlhc21icnFreWp3aHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3NDkyODAsImV4cCI6MjA1NDMyNTI4MH0.（続く長い文字列）
```

**注意**:
- `anon public`と書かれた欄の値をコピー
- `service_role secret`ではありません
- キーは`eyJ`で始まる長い文字列です

### 5. 正しいキーが見つかったら教えてください

画面のスクリーンショットを撮っていただくか、`anon public`欄の値をコピーしてください。