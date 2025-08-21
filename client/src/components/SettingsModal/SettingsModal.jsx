import React, { useState, useEffect } from 'react';
import { Modal, Slider } from 'antd';
import useFlowStore from '../../utils/flowStore';

const SettingsModal = () => {
  const {
    theme,
    setTheme,
    chatWidth,
    setChatWidth,
    isSettingsOpen,
    setIsSettingsOpen,
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

  return (
    <Modal
      title="Settings"
      open={isSettingsOpen}
      onCancel={() => setIsSettingsOpen(false)}
      onOk={() => setIsSettingsOpen(false)}
    >
      <div>
        <p>
          테마 선택: <b style={{ textTransform: 'uppercase' }}>{theme}</b>
        </p>
        <div>
          <label>
            <input
              type="radio"
              value="light"
              checked={theme === 'light'}
              onChange={handleThemeChange}
            />
            Light
          </label>
          <label style={{ marginLeft: 16 }}>
            <input
              type="radio"
              value="dark"
              checked={theme === 'dark'}
              onChange={handleThemeChange}
            />
            Dark
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              value="haru"
              checked={theme === 'haru'}
              onChange={handleThemeChange}
            />
            Spring
          </label>
          <label style={{ marginLeft: 7 }}>
            <input
              type="radio"
              value="natsu"
              checked={theme === 'natsu'}
              onChange={handleThemeChange}
            />
            Summer
          </label>
          <label style={{ marginLeft: 7 }}>
            <input
              type="radio"
              value="aki"
              checked={theme === 'aki'}
              onChange={handleThemeChange}
            />
            Autumn
          </label>
          <label style={{ marginLeft: 7 }}>
            <input
              type="radio"
              value="fuyu"
              checked={theme === 'fuyu'}
              onChange={handleThemeChange}
            />
            Winter
          </label>
        </div>
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
