# ⚔️ Albion Battle Log Viewer

Albion Onlineの過去の戦闘履歴を検索・分析できるWebツール

![Preview](https://img.shields.io/badge/Albion_Online-Battle_Log-gold?style=for-the-badge)

## ✨ 機能

- **バトルID検索** - 特定のバトルの詳細を表示
  - 参加者一覧
  - ダメージ比率（%）
  - ヒール比率（%）
  - K/D（キル/デス）
  - キルログ

- **プレイヤー検索** - プレイヤーの戦闘履歴
  - 最近のキル/デス一覧
  - バトルへのリンク

- **ギルド検索** - ギルドのトップキル
  - 高Fame獲得キル一覧

- **最近のバトル** - 直近20件のバトル一覧

## 🌐 対応サーバー

- Americas（Washington）
- Europe（Amsterdam）
- Asia（Singapore）

## 🚀 Cloudflare Pages へのデプロイ

### 1. GitHubリポジトリを作成

```bash
# リポジトリを初期化
git init
git add .
git commit -m "Initial commit"

# GitHubにプッシュ
git remote add origin https://github.com/YOUR_USERNAME/albion-battle-log.git
git push -u origin main
```

### 2. Cloudflare Pagesでデプロイ

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. 左メニューから **Workers & Pages** を選択
3. **Create application** → **Pages** タブを選択
4. **Connect to Git** をクリック
5. GitHubアカウントを連携し、リポジトリを選択
6. 以下の設定でデプロイ:

| 設定項目 | 値 |
|---------|-----|
| Production branch | `main` |
| Build command | （空欄のまま） |
| Build output directory | `/` |

7. **Save and Deploy** をクリック

### 3. 完了！

デプロイが完了すると `https://your-project.pages.dev` でアクセス可能になります。

## 📁 プロジェクト構造

```
/
├── index.html              # メインのHTML/CSS/JS
├── functions/
│   └── api/
│       └── [[path]].js     # Cloudflare Functions（APIプロキシ）
└── README.md
```

## 🔧 技術スタック

- **フロントエンド**: Vanilla HTML/CSS/JavaScript
- **バックエンド**: Cloudflare Pages Functions
- **API**: Albion Online Gameinfo API（非公式）

## ⚠️ 注意事項

- このツールは非公式です
- Albion Online APIは公式にはサポートされていません
- データは [Sandbox Interactive GmbH](https://albiononline.com/) の提供によるものです
- APIの仕様変更により動作しなくなる可能性があります

## 📝 ライセンス

MIT License

## 🙏 謝辞

- [Albion Online](https://albiononline.com/) - ゲームとAPI
- [Tools4Albion](https://www.tools4albion.com/) - API情報の参考
- [AlbionOnline2D](https://albiononline2d.com/) - インスピレーション
