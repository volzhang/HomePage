import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {App} from "./App";

import "@/vol_apps/tool/action/fetch";
import {initBgLayer} from "@/vol_apps/bg/bg_util.ts";
import {manifestJson} from "@/vol_apps/tool/action/fetch.ts";

export let VERSION = "unknown";

const main = async () => {
    await initBgLayer()
    VERSION = await manifestJson()
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
};

void main();
