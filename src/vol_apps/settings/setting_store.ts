import { create } from 'zustand';

export type SETTING_VALUE = 'background' | 'tiles' | 'tags' | 'search';

interface SettingState {
    open: boolean;
    value: SETTING_VALUE;
    setOpen: (open: boolean) => void;
    setValue: (value: SETTING_VALUE) => void;
    openSetting: (v: SETTING_VALUE) => void;
}

export const useSettingStore = create<SettingState>((set) => ({
    open: false,
    value: 'background',
    setOpen: (open) => set({ open }),
    setValue: (value) => set({ value }),
    openSetting: (v) => set({ value: v, open: true }),
}));