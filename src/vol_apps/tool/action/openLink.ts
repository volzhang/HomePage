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
import {LanguageIsDefault} from "@/vol_apps/language/language_store";

const ToastErr = (url:string)=>{
    toast.error(
        LanguageIsDefault
            ? `can not open link 👉 ${url} 👈`
            : `无法打开链接 👉 ${url} 👈`
    );
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