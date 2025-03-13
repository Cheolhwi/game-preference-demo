# Game Preference Demo

这是一个基于 React 的游戏喜好表应用，允许用户搜索游戏并通过拖拽将游戏卡片放入自定义的喜好表格中。  
- **中文模式** 下使用 Bangumi API（支持中文游戏名称），  
- **英文模式** 下使用 RAWG API。

应用支持编辑表格中每个格子的标签和中英文切换。

## 特性

- **游戏搜索**：中文模式调用 Bangumi API，英文模式调用 RAWG API。
- **拖拽交互**：将搜索到的游戏卡片拖拽到喜好表格中。
- **标签编辑**：每个格子的标签可以实时编辑。
- **中英文切换**：右上角按钮切换中文和英文模式。

## API Key 配置

本项目使用两个 API：

1. **Bangumi API**  
   - 用于中文搜索。  
   - 搜索接口示例：  
     ```
     https://api.bgm.tv/search/subject/{关键词}?type=4&apikey={YOUR_BANGUMI_API_KEY}
     ```
     
2. **RAWG API**  
   - 用于英文搜索。  
   - 搜索接口示例：  
     ```
     https://api.rawg.io/api/games?key={YOUR_RAWG_API_KEY}&search={关键词}
     ```
   - 请根据 [RAWG API 文档](https://rawg.io/apidocs) 申请并在代码中替换 RAWG API key。

   - 为方便管理，将这些 API key 存储在项目根目录下自行创建的 `.env` 文件中, 并将`.env`加入`.gitignore`

    ```
    REACT_APP_BANGUMI_API_KEY=YOUR_BANGUMI_API_KEY_HERE
    REACT_APP_RAWG_API_KEY=YOUR_RAWG_API_KEY_HERE
    ```


## 部署到 GitHub Pages

本项目基于 [Create React App](https://create-react-app.dev/) 构建，并使用 [gh-pages](https://www.npmjs.com/package/gh-pages) 部署到 GitHub Pages。

### 1. 安装依赖

在项目根目录下执行：

```bash
npm install
npm install --save gh-pages
```

### 2. 配置 package.json
在 package.json 中添加 homepage 字段，值为你的 GitHub Pages 地址：
```
"homepage": "https://{your_github_username}.github.io/game-preference-demo",
```
同时在 scripts 部分添加部署相关脚本：
```
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```
### 3. 推送代码到 GitHub
如果你还没有将代码提交到 GitHub，请在项目根目录下执行：
```
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/{your_github_username}/game-preference-demo.git
git push -u origin main
```

### 4. 部署
在项目根目录下执行：
```
npm run deploy
```
该命令会自动执行 npm run build 生成静态文件，并将生成的 build 文件夹推送到 GitHub 仓库的 gh-pages 分支。部署完成后，你的应用将在以下地址访问：
```
https://{your_github_username}.github.io/game-preference-demo/
```

### 本地运行

在项目根目录下执行：

```
npm start
```

然后打开 http://localhost:3000 以开发模式运行应用。

