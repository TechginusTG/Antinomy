import React, { useState, useEffect } from 'react';
import { Modal, Slider, ColorPicker } from 'antd';
import useFlowStore from '../../utils/flowStore';
import { themes } from '../../utils/themeManager';

const SettingsModal = () => {
  const {
    theme,
    setTheme,
    chatWidth,
    setChatWidth,
    isSettingsOpen,
    setIsSettingsOpen,
    level,
    customThemeColors,
    setCustomThemeColors,
    getCustomColorVarName,
  } = useFlowStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleColorChange = (index, color) => {
    setCustomThemeColors(index, color.toHexString());
  };

  const basicThemes = themes.filter((t) => t.level === 1);
  const specialThemes = themes.filter((t) => t.level > 1);

  const colorVarLabels = {
    '--background-primary': '색상 1(전체 앱 배경)',
    '--background-secondary': '색상 2(시작 페이지, 입력칸 배경)',
    '--background-header': '색상 3(헤더)',
    '--background-flow-wrapper': '색상 4(다이어그램 필드)',
    '--text-primary': '색상 5(텍스트)',
    '--text-secondary': '색상 6(서브 텍스트, 현재 미사용)',
    '--border-color': '색상 7(테두리)',
    '--header-title-color': '색상 8(헤더 제목)',
    '--bubble-user-bg': '색상 9(사용자 말풍선)',
    '--bubble-ai-bg': '색상 10(AI 말풍선)',
  };

  return (
    <Modal
      title="Settings"
      open={isSettingsOpen}
      onCancel={() => setIsSettingsOpen(false)}
      onOk={() => setIsSettingsOpen(false)}
      width={600}
    >
      <div>
        <p>
          테마 선택: <b style={{ textTransform: 'uppercase' }}>{theme}</b>
        </p>
        <div>
          {basicThemes.map((t) => (
            <label key={t.name} style={{ marginRight: '16px' }}>
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
        <div style={{ marginTop: '8px' }}>
          {specialThemes.map((t) => (
            <label key={t.name} style={{ marginRight: '16px', display: 'inline-flex', alignItems: 'center' }}>
              <input
                type="radio"
                value={t.name}
                checked={theme === t.name}
                onChange={handleThemeChange}
                disabled={level < t.level}
              />
              <span style={{ whiteSpace: 'nowrap' }}>
                {t.label}
                {level < t.level && ` (Lv.${t.level})`}
              </span>
            </label>
          ))}
        </div>
        {theme === 'custom' && (
          <div style={{ marginTop: '16px' }}>
            <p>커스텀 색상 선택:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {customThemeColors.map((color, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ marginBottom: '8px' }}>{colorVarLabels[getCustomColorVarName(index)]}</label>
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
        {!isMobile && (
          <div style={{ marginTop: 24 }}>
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
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SettingsModal;
