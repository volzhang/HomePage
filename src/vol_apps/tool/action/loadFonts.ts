//@ts-ignore
import type {FontItem} from "@/vol_apps/cm/cm_store";

export const loadAllFonts = async (): Promise<FontItem[]> => {
    try {
        // @ts-ignore
        const availableFonts = await window.queryLocalFonts();
        const options = availableFonts
            .map((font: FontItem) => ({
                fullName: font.fullName,
                family: font.family
            }));
        return (options);
    } catch (err) {
        console.error(err);
        return [];
    }
};

//@ts-ignore
export const loadFonts = async (): Promise<FontItem[]> => {
    try {
        // @ts-ignore
        const availableFonts = await window.queryLocalFonts();
        // 列表太长，简化
        const excludeKeywords = [
            "black",
            "ui",
            "narrow",
            "negreta",
            "cursiva",
            "math",
            "gothic",
            "code",
            "condensed",
            "semicondensed",
            "italic",
            "thin",
            "bold",
            "semibold",
            "extrabold",
            "medium",
            "light",
            "semilight",
            "extralight",
        ];
        // 构建正则：\b(keyword1|keyword2|...)\b，忽略大小写
        const excludePattern = new RegExp(`\\b(${excludeKeywords.join("|")})\\b`, "i");

        const options = availableFonts
            .map((font: FontItem) => ({
                fullName: font.fullName,
                family: font.family
            }))
            .filter((item: FontItem) => !excludePattern.test(item.fullName));

        return (options);
    } catch (err) {
        console.error(err);
        return [];
    }
};