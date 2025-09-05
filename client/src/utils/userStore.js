import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      userNote: "",
      username: null,
      exp: 0,
      lvl: 1,
      setUserNote: (note) => set({ userNote: note }),
      setUsername: (name) => set({ username: name }),
      login: (user) => set({ username: user.name, exp: user.exp, lvl: user.lvl }),
      logout: () => {
        set({ username: null, userNote: "", exp: 0, lvl: 1 });
        localStorage.removeItem('authToken');
      },
      setStats: (stats) => set(stats),
      updateStats: async (stats) => {
        set(stats);
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const response = await fetch('/api/user/stats', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(stats)
            });
            const data = await response.json();
            if (!data.success) {
              console.error('Failed to save stats to server:', data.message);
              // Optionally revert state here
            }
          } catch (error) {
            console.error('Error saving stats to server:', error);
          }
        }
      },
    }),
    {
      name: "user-note-storage",
    }
  )
);

export default useUserStore;
