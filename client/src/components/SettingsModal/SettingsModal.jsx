import React from 'react';
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
      </div>
    </Modal>
  );
};

export default SettingsModal;
