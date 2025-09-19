import { create } from "zustand";

// 설정 기본값
const defaultSettings = {
  theme: "light",
  customThemeColors: [
    "#ffffff",
    "#f0f2f5",
    "#ffffff",
    "#f1f1f1",
    "#333333",
    "#555555",
    "#dddddd",
    "#000000",
    "antiquewhite",
    "aquamarine",
  ],
  chatWidth: 30,
  chatFontSize: 14,
  mode: 'basic',
  aiProvider: 'gemini',
  userNote: "",
};

const useUserStore = create((set) => ({
  username: null,
  exp: 0,
  lvl: 1,
  settings: defaultSettings,
  
  /**
   * (로그인 등) 외부로부터 받은 설정 객체로 상태를 업데이트합니다.
   * @param {object} newSettings - 새로운 설정값 객체
   */
  setUserSettings: (newSettings) => {
    // null이나 undefined인 값은 제외하고 업데이트
    const filteredSettings = Object.entries(newSettings).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    set((state) => ({
      settings: { ...state.settings, ...filteredSettings },
    }));
  },

  /**
   * 특정 설정 키의 값을 업데이트합니다.
   * @param {string} key - 업데이트할 설정의 키
   * @param {*} value - 새로운 값
   */
  updateSetting: (key, value) => {
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    }));
  },

  // 사용자 정보를 설정하고, 함께 전달된 설정값도 적용합니다.
  login: (user) => {
    set((state) => ({
      username: user.name,
      exp: user.exp,
      lvl: user.lvl,
      // user.settings가 존재하면 기존 설정을 덮어씁니다.
      settings: user.settings ? { ...state.settings, ...user.settings } : state.settings
    }));
  },

  // 로그아웃 시 모든 정보를 초기화합니다.
  logout: () => {
    set({ 
      username: null, 
      exp: 0, 
      lvl: 1,
      settings: defaultSettings 
    });
    localStorage.removeItem('authToken');
    localStorage.removeItem('conversationId');
    localStorage.removeItem('diagram-data');
  },

  setStats: (stats) => {
    set({
      exp: stats.exp,
      lvl: stats.lvl,
    });
  },
}));

export default useUserStore;