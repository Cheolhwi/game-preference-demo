import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import html2canvas from "html2canvas";

// React DnD
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  GAME: "game",
};

// 默认中文标签
const defaultLabelsZh = [
  "最爱的",
  "最影响我的",
  "最惊艳的",
  "最长情的",
  "最快乐的",
  "最想安利的",
  "最喜欢的剧情",
  "最喜欢的画面",
  "最喜欢的配乐",
  "最喜欢的配音",
  "最喜欢的角色",
  "最喜欢的结局",
  "最爽快的",
  "玩的第一款",
  "最受苦的",
  "消磨时间就玩",
  "最治愈的",
  "我咋会喜欢这个",
  "最致郁的",
  "最被低估的",
];

// 默认英文标签
const defaultLabelsEn = [
  "Favorite",
  "Most Influential",
  "Most Stunning",
  "Most Enduring",
  "Happiest",
  "Most Recommended",
  "Favorite Story",
  "Favorite Visuals",
  "Favorite Soundtrack",
  "Favorite Voice Acting",
  "Favorite Character",
  "Favorite Ending",
  "Most Thrilling",
  "First Game Played",
  "Most Challenging",
  "For Killing Time",
  "Most Healing",
  "Unexpectedly Liked",
  "Most Depressing",
  "Most Underrated",
];

// 页面中需要翻译的文本
const translations = {
  zh: {
    searchGame: "搜索游戏",
    placeholderSearch: "输入关键字后按回车或点击搜索...",
    shareButton: "下载截图",
    gamePreference: "游戏生涯喜好表",
    dropPlaceholder: "拖拽到此",
    languageLabel: "中文",
    toggleLanguage: "English",
    searchBtn: "搜索",
  },
  en: {
    searchGame: "Search Games",
    placeholderSearch: "Enter keywords and press Enter or click Search...",
    shareButton: "Download Screenshot",
    gamePreference: "GameGrid Table",
    dropPlaceholder: "Drag game here",
    languageLabel: "English",
    toggleLanguage: "中文",
    searchBtn: "Search",
  },
};

// ==============
// 可拖拽的游戏卡片
// ==============
function GameCard({ game }) {
  const [{ isDragging }, dragRef] = useDrag({
    type: ItemTypes.GAME,
    item: { game },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;

  return (
    <div ref={dragRef} className="game-card" style={{ opacity }} title={game.name}>
      {game.background_image ? (
        <img src={game.background_image} alt={game.name} className="game-cover" />
      ) : (
        <div className="game-cover placeholder">No Image</div>
      )}
      <div className="game-name">{game.name}</div>
    </div>
  );
}

// ==============
// 表格单元格：可放置游戏并可编辑标签
// ==============
function DropCell({ index, cells, setCells, lang }) {
  const cell = cells[index]; // { label, game }

  const handleLabelChange = (e) => {
    const newCells = [...cells];
    newCells[index] = { ...cell, label: e.target.value };
    setCells(newCells);
  };

  const [{ isOver }, dropRef] = useDrop({
    accept: ItemTypes.GAME,
    drop: (item) => {
      const newCells = [...cells];
      newCells[index] = { ...cell, game: item.game };
      setCells(newCells);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const highlight = isOver ? "highlight" : "";

  return (
    <div ref={dropRef} className={`drop-cell ${highlight}`}>
      <div className="cell-content">
        <input
          className="cell-label-input"
          type="text"
          value={cell.label}
          onChange={handleLabelChange}
        />
        {cell.game ? (
          <>
            {cell.game.background_image ? (
              <img src={cell.game.background_image} alt={cell.game.name} className="cell-cover" />
            ) : (
              <div className="cell-cover placeholder">No Image</div>
            )}
            <div className="cell-name">{cell.game.name}</div>
          </>
        ) : (
          <div className="cell-placeholder">{translations[lang].dropPlaceholder}</div>
        )}
      </div>
    </div>
  );
}

// ==============
// 主组件
// ==============
function App() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  // 语言状态："zh" 或 "en"
  const [language, setLanguage] = useState("zh");
  // 根据当前语言选择对应的默认标签数组
  const initialLabels = language === "zh" ? defaultLabelsZh : defaultLabelsEn;
  // 每个格子包含 label 和 game 信息
  const [cells, setCells] = useState(initialLabels.map((label) => ({ label, game: null })));

  // 当语言切换时，重置 cells（这里的逻辑是：清空已放置的游戏，重新加载默认标签）
  useEffect(() => {
    setCells(initialLabels.map((label) => ({ label, game: null })));
  }, [language]);

  // 注意：这里我们使用 Bangumi API，因此 apiKey 改为你的 Bangumi API key
  const bangumiKey = "5HdbVXpfq5pg9fhfyxAbIDBe2Q9O81rawc6AX3p9";
  const rawgKey = "74994c13feea457f99ba69fc08546913"
  const tableRef = useRef(null);

  // 按回车搜索
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };


  // 在 handleSearch 中，根据 language 不同，调用不同 API
  const handleSearch = async () => {
    if (!query) return;

    try {
      let results = [];

      if (language === "zh") {
        // 调用 Bangumi API
        const response = await fetch(
          `https://api.bgm.tv/search/subject/${encodeURIComponent(query)}?type=4&apikey=${bangumiKey}`
        );
        const data = await response.json();

        // 转换 Bangumi subject -> { id, name, background_image }
        results = data.list.map((subject) => {
          const rawImage =
            subject.images?.medium || subject.images?.large || null;
          // 强制替换 http:// 为 https:// 避免混合内容
          const safeImage = rawImage
            ? rawImage.replace(/^http:\/\//, "https://")
            : null;

          return {
            id: subject.id,
            name: subject.name_cn || subject.name,
            background_image: safeImage,
          };
        });
      } else {
        // 调用 RAWG API
        const response = await fetch(
          `https://api.rawg.io/api/games?key=${rawgKey}&search=${encodeURIComponent(query)}`
        );
        const data = await response.json();

        // 转换 RAWG 结果 -> { id, name, background_image }
        results = data.results.map((item) => ({
          id: item.id,
          name: item.name,
          background_image: item.background_image || null,
        }));
      }

      // 只保留前 10 条
      setSearchResults(results.slice(0, 10));
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  

  // 切换语言
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "zh" ? "en" : "zh"));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        {/* 左侧面板：搜索栏 + 纵向搜索结果 */}
        <div className="left-panel">
          <h2>{translations[language].searchGame}</h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder={translations[language].placeholderSearch}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSearch}>{translations[language].searchBtn}</button>
          </div>
          <div className="search-results">
            {searchResults.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>

        {/* 右侧内容：喜好表 */}
        <div className="right-content">
          {/* 右上角功能按钮 */}
          <div className="top-buttons">
            <button className="lang-toggle-button" onClick={toggleLanguage}>
              {translations[language].toggleLanguage}
            </button>
          </div>
          <h1>{translations[language].gamePreference}</h1>
          <div className="drag-table" ref={tableRef}>
            {cells.map((_, idx) => (
              <DropCell key={idx} index={idx} cells={cells} setCells={setCells} lang={language} />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
