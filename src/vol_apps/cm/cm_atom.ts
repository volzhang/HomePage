import {initStoreState} from "@/vol_apps/04_persist_atoms";

export const cmStore = initStoreState({
    storeName:"cm",
    fields:{
        isVisible: false,
        doc: "落霞与孤鹜齐飞，\n" +
            "秋水共长天一色。\n" +
            "Sunset clouds fly with lone mallards side by side,\n" +
            "Autumn waters blend into the hues of the vast sky.",
        name: "document.txt",
        type: ".txt",

        enableLineNumbers: false,
        enableLineWrapping: false,

        fontPx: 32,
        fontWeight: 400,
        fontLineHeight: 42,
        fontMeta: {fullName: "monospace", family: "monospace"},
        fontBase64: "",
    }
})