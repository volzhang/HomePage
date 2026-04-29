import {createPersistedStore} from "@/vol_apps/tool/createPersistedStore";
import {defaultIconBase64} from "@/vol_apps/tile/tile_store_types";

type RadioStore = {
    radioUrl:string
    radioFavicon:string,

    setRadioUrl:(url:RadioStore["radioUrl"])=>void
    setRadioFavicon:(favicon:RadioStore["radioFavicon"])=>void
}

const INITIAL_STATE = {
    radioUrl: "",
    radioFavicon: defaultIconBase64,
}

export const useRadioStore = createPersistedStore<RadioStore>(
    "radio",
    (set)=>({
        ...INITIAL_STATE,
        setRadioUrl: (url) => set({radioUrl: url}),
        setRadioFavicon: (radioFavicon) => set({radioFavicon}),
    }),
)

