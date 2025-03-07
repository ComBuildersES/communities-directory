import { create } from "zustand";

const useSidebarStore = create((set) => ({
  isSidebarVisible: window.innerWidth > 768,
  actions: {
    toggleSidebar: () =>
      set((state) => ({ isSidebarVisible: !state.isSidebarVisible })),
    setSidebarVisibility: (visible) => set({ isSidebarVisible: visible }),
  },
}));

// Selectores del estado

export const useSideBarVisible = () =>
  useSidebarStore((state) => state.isSidebarVisible);

// Selector de las acciones

export const useSidebarActions = () =>
  useSidebarStore((state) => state.actions);

// Funcion encargada de mostrar el boton o no cuando
// este en mobile

const handleResize = (set) => {
  if (window.innerWidth > 768) {
    set({ isSidebarVisible: true });
  } else {
    set({ isSidebarVisible: false });
  }
};
