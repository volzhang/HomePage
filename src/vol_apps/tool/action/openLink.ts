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

export const openLinkInNewTab = (url: string) => {
    console.log(url)
    try {
        window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
        toast.error(`unknown Url: ${url}`)
        //     toast.error(
        //         language === "en"
        //             ? `unknown Url: ${url}`
        //             : `未知 Url: ${url}`
        //     );
        // }
    }
};

export const openLinkInCurrentTab = (url: string) => {
    console.log(url)
    try {
        window.location.href = url;
    } catch (e) {
        toast.error(`unknown Url: ${url}`)
    }
};