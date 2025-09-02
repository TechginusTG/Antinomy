import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      userNote: "",
      username: null,
      setUserNote: (note) => set({ userNote: note }),
      setUsername: (name) => set({ username: name }),
      login: (name) => set({ username: name }),
      logout: () => {
        set({ username: null, userNote: "" });
        localStorage.removeItem('authToken');
      },
    }),
    {
      name: "user-note-storage", // 로컬 스토리지에 저장될 때 사용될 키
    }
  )
);

export default useUserStore;
