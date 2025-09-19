import React, { useState, useEffect, useRef } from "react";
import { Modal, Slider, ColorPicker, Button, InputNumber, Select } from "antd";
import useFlowStore from "../../utils/flowStore";
import useUserStore from "../../utils/userStore";
import { themes } from "../../utils/themeManager";
import styles from './SettingsModal.module.css';

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
    customThemeColors,
    setCustomThemeColors,
    getCustomColorVarName,
    resetCustomThemeColors,
    saveTheme,
    loadTheme,
    autoSaveSettings, // 자동 저장 함수 추가
    aiProvider,
    setAiProvider,
  } = useFlowStore();
  const { mode, setMode } = useFlowStore();
  const { settings, updateSetting, lvl } = useUserStore(); // userStore에서 settings와 updateSetting 사용
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [availableModes, setAvailableModes] = useState([]);
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

  useEffect(() => {
    const fetchModes = async () => {
      try {
        const response = await fetch('/api/user/modes');
        if (response.ok) {
          const data = await response.json();
          setAvailableModes(data);
        } else {
          console.error('Failed to fetch modes');
        }
      } catch (error) {
        console.error('Error fetching modes:', error);
      }
    };

    fetchModes();
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
      <div className={styles.modalBody}>
        <p>
          테마 선택: <b className={styles.themeName}>{theme}</b>
        </p>
        <div>
          {basicThemes.map((t) => (
            <label key={t.name} className={styles.themeLabel}>
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
        <div className={styles.specialThemesContainer}>
          {specialThemes.map((t) => (
            <label
              key={t.name}
              className={styles.specialThemeLabel}
            >
              <input
                type="radio"
                value={t.name}
                checked={theme === t.name}
                onChange={handleThemeChange}
                disabled={lvl < t.level}
              />
              <span className={styles.specialThemeName}>
                {t.label}
                {lvl < t.level && ` (Lv.${t.level}↑)`}
              </span>
            </label>
          ))}
        </div>
        {theme === "custom" && (
          <div className={styles.customThemeContainer}>
            <div
              className={styles.customThemeHeader}
            >
              <p className={styles.customThemeTitle}>커스텀 색상 선택:</p>
              <div className={styles.customThemeActions}>
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
                  className={styles.fileInput}
                  onChange={handleFileSelect}
                  accept=".json"
                />
              </div>
            </div>
            <div
              className={styles.colorGrid}
            >
              {customThemeColors.map((color, index) => (
                <div
                  key={index}
                  className={styles.colorPickerContainer}
                >
                  <label className={styles.colorLabel}>
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
        <div className={styles.settingsSection}>
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
                className={styles.slider}
              />
            </>
          )}
          
          <div className={styles.fontSizeContainer}>
            <p>
              채팅 글자 크기: 
            </p>
            <InputNumber
              min={10}
              max={24}
              value={chatFontSize}
              onChange={(value) => setChatFontSize(value || 10)}
            />
            <p>px</p>
          </div>

          {/* 모드 선택 버튼 */}
          <div
            className={styles.modeContainer}
          >
            <span className={styles.modeLabel}>모드:</span>
            {availableModes.map((m) => (
                <Button
                  key={m.key}
                  type={mode === m.key ? "primary" : "default"}
                  onClick={() => setMode(m.key)}
                >
                  {m.label}
                </Button>
              ))}
          </div>

          <div className={styles.modeContainer}>
            <span className={styles.modeLabel}>AI Provider:</span>
            <Select
              value={aiProvider}
              onChange={setAiProvider}
              style={{ width: 120 }}
            >
              <Select.Option value="gemini">Gemini</Select.Option>
              <Select.Option value="groq">Groq</Select.Option>
            </Select>
          </div>
        </div>
        <div className={styles.settingsSection}>
          <p className={styles.userNoteLabel}>유저노트</p>
          <textarea
            value={settings.userNote} // settings에서 값 가져오기
            onChange={(e) => {
              updateSetting('userNote', e.target.value); // userStore 업데이트
              autoSaveSettings(); // 변경사항 자동 저장
            }}
            className={styles.userNoteTextArea}
            placeholder="AI가 기억해야할 사용자의 특이사항을 입력해주세요."
          />
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;