import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      userNote: "",
      setUserNote: (note) => set({ userNote: note }),
    }),
    {
      name: "user-note-storage", // 로컬 스토리지에 저장될 때 사용될 키
    }
  )
);

export default useUserStore;
