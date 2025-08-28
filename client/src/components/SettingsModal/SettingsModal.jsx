import React, { useState, useEffect, useRef } from "react";
import { Modal, Slider, ColorPicker, Button } from "antd";
import useFlowStore from "../../utils/flowStore";
import { themes } from "../../utils/themeManager";

const SettingsModal = () => {
  const {
    theme,
    setTheme,
    chatWidth,
    setChatWidth,
    chatFontSize,
    setChatFontSize,
    isSettingsOpen,
    setIsSettingsOpen,
    level,
    customThemeColors,
    setCustomThemeColors,
    getCustomColorVarName,
    resetCustomThemeColors,
    saveTheme,
    loadTheme,
  } = useFlowStore();
  const { mode, setMode } = useFlowStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleColorChange = (index, color) => {
    setCustomThemeColors(index, color.toHexString());
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        let data = JSON.parse(content);
        loadTheme(data);
      } catch (error) {
        console.error("Failed to load or parse file:", error);
        alert(
          "Failed to load file. It might be corrupted or not a valid JSON file."
        );
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
      }
    };
    reader.readAsText(file);
  };

  const basicThemes = themes.filter((t) => t.level === 1);
  const specialThemes = themes.filter((t) => t.level > 1);

  const colorVarLabels = {
    "--background-primary": "색상 1(전체 앱 배경)",
    "--background-secondary": "색상 2(시작 페이지, 입력칸 배경)",
    "--background-header": "색상 3(헤더)",
    "--background-flow-wrapper": "색상 4(다이어그램 필드)",
    "--text-primary": "색상 5(텍스트)",
    "--text-secondary": "색상 6(서브 텍스트, 현재 미사용)",
    "--border-color": "색상 7(테두리)",
    "--header-title-color": "색상 8(헤더 제목)",
    "--bubble-user-bg": "색상 9(사용자 말풍선)",
    "--bubble-ai-bg": "색상 10(AI 말풍선)",
  };

  return (
    <Modal
      title="Settings"
      open={isSettingsOpen}
      onCancel={() => setIsSettingsOpen(false)}
      onOk={() => setIsSettingsOpen(false)}
      width={600}
    >
      <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
        <p>
          테마 선택: <b style={{ textTransform: "uppercase" }}>{theme}</b>
        </p>
        <div>
          {basicThemes.map((t) => (
            <label key={t.name} style={{ marginRight: "16px" }}>
              <input
                type="radio"
                value={t.name}
                checked={theme === t.name}
                onChange={handleThemeChange}
              />
              {t.label}
            </label>
          ))}
        </div>
        <div style={{ marginTop: "8px" }}>
          {specialThemes.map((t) => (
            <label
              key={t.name}
              style={{
                marginRight: "16px",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <input
                type="radio"
                value={t.name}
                checked={theme === t.name}
                onChange={handleThemeChange}
                disabled={level < t.level}
              />
              <span style={{ whiteSpace: "nowrap" }}>
                {t.label}
                {level < t.level && ` (Lv.${t.level}↑)`}
              </span>
            </label>
          ))}
        </div>
        {theme === "custom" && (
          <div style={{ marginTop: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <p style={{ margin: 0 }}>커스텀 색상 선택:</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button onClick={resetCustomThemeColors}>Reset</Button>
                <Button
                  onClick={() => {
                    const defaultName = "custom-theme";
                    const userInput = prompt(
                      "저장할 파일 이름을 입력하세요:",
                      defaultName
                    );

                    if (userInput === null) {
                      return;
                    }

                    const filenameBase =
                      userInput.trim() === "" ? defaultName : userInput.trim();

                    const sanitizedFilenameBase = filenameBase
                      .replace(/[\\/:*?'"<>|]/g, "_")
                      .replace(/\.json$/i, "");

                    const diagramFilename = `${sanitizedFilenameBase}.json`;

                    saveTheme(diagramFilename);
                  }}
                >
                  Save
                </Button>
                <Button onClick={() => fileInputRef.current.click()}>
                  Load
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                  accept=".json"
                />
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              {customThemeColors.map((color, index) => (
                <div
                  key={index}
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <label style={{ marginBottom: "8px" }}>
                    {colorVarLabels[getCustomColorVarName(index)]}
                  </label>
                  <ColorPicker
                    value={color}
                    onChange={(newColor) => handleColorChange(index, newColor)}
                    showText
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        :{" "}
        <div style={{ marginTop: 24 }}>
          {!isMobile && (
            <>
              <p>
                채팅창 너비: <b>{chatWidth}%</b>
              </p>
              <Slider
                min={20}
                max={50}
                value={chatWidth}
                onChange={setChatWidth}
                style={{ width: 200 }}
              />
            </>
          )}
          <p style={{ marginTop: 24 }}>
            채팅 글자 크기: <b>{chatFontSize}px</b>
          </p>
          <Slider
            min={10}
            max={24}
            value={chatFontSize}
            onChange={setChatFontSize}
            style={{ width: 200 }}
          />

          {/* 모드 선택 버튼 */}
          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ marginRight: 8 }}>모드:</span>
            <Button
              type={mode === "basic" ? "primary" : "default"}
              onClick={() => setMode("basic")}
            >
              기본 모드
            </Button>
            <Button
              type={mode === "worry" ? "primary" : "default"}
              onClick={() => setMode("worry")}
            >
              고민 모드
            </Button>
            <Button
              type={mode === "solution" ? "primary" : "default"}
              onClick={() => setMode("solution")}
            >
              문제해결 모드
            </Button>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <p style={{ marginBottom: 8 }}>유저노트</p>
          <textarea
            style={{
              width: "100%",
              minHeight: "80px",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              padding: "8px",
              fontSize: "14px",
              resize: "vertical",
            }}
            placeholder="AI가 기억해야할 사용자의 특이사항을 입력해주세요."
          />
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
