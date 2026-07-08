import {createSignal,} from "@/vol_apps/04_persist_atoms";

export type SETTING_VALUE = 'background' | 'tiles' | 'tags' | 'search';

// export const useSettingStore = create<SettingState>((set) => ({
//     open: false,
//     value: 'background',
//     setOpen: (open) => set({ open }),
//     setValue: (value) => set({ value }),
//     openSetting: (v) => set({ value: v, open: true }),
// }));

const openSig = createSignal<boolean>(false);
const valueSig = createSignal<string>('background');

export const useSettingStore = () => {
    const open = openSig.use()
    const value = valueSig.use()
    const setOpen = (o: boolean) => openSig.set(o)
    const setValue = (v: SETTING_VALUE): void => valueSig.set(v)
    const openSetting = (v: SETTING_VALUE): void => {
        valueSig.set(v)
        openSig.set(true)
    }
    return {
        open, setOpen,
        value, setValue,
        openSetting,
    }
}