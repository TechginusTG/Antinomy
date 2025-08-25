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
    customThemeColor,
    setCustomThemeColor,
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

  const handleColorChange = (color) => {
    setCustomThemeColor(color.toHexString());
  };

  const basicThemes = themes.filter((t) => t.level === 1);
  const specialThemes = themes.filter((t) => t.level > 1);

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
            <ColorPicker
              value={customThemeColor}
              onChange={handleColorChange}
              showText
            />
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
