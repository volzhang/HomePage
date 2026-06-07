// export const openLinkInNewTab = (url:string) => {
// 	const link = document.createElement('a');
// 	link.href = url;
// 	link.target = '_blank';
// 	link.rel = 'noopener noreferrer';
// 	document.body.appendChild(link);
// 	link.click();
// 	document.body.removeChild(link);
// }

import {toast} from "sonner";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";

const ToastErr = (url:string)=>{
    const {t} = useLanguage()
    toast.error(t("can not open link") + `👉 ${url} 👈`);
}

export const openLinkInNewTab = (url: string) => {
    try {
        window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
        ToastErr(url)
    }
};

export const openLinkInCurrentTab = (url: string) => {
    try {
        window.location.href = url;
    } catch (e) {
        ToastErr(url)
    }
};