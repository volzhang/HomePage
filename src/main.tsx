import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {App} from "./App";
import {runBootstrap} from "@/vol_apps/bootstrap/bootstrap";

import "@/vol_apps/i8n/i18n";
import "@/vol_apps/tool/action/fetch";

const main = async () => {
    await runBootstrap();
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
};

void main();
