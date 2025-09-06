import { create } from "zustand";

const useUserStore = create((set) => ({
  userNote: "",
  username: null,
  exp: 0,
  lvl: 1,
  
  // 사용자 정보를 한 번에 설정하는 함수
  login: (user) => set({
    username: user.name,
    exp: user.exp,
    lvl: user.lvl,
  }),

  // 로그아웃
  logout: () => {
    set({ username: null, userNote: "", exp: 0, lvl: 1 });
    localStorage.removeItem('authToken');
  },

  // 사용자 메모 설정 (클라이언트 전용 기능)
  setUserNote: (note) => set({ userNote: note }),
}));

export default useUserStore;
