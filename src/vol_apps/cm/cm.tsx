import {cn} from "@/lib/utils";
import {CmClose, CmIsVisibleSig} from "@/vol_apps/cm/cm_open";
import {CmUiFont} from "@/vol_apps/cm/cm_ui_font";
import {CmUiFontFamily} from "@/vol_apps/cm/cm_ui_font_family";
import {CmUiLineNumbers} from "@/vol_apps/cm/cm_ui_linenumbers";
import {CmUiLineWrapping} from "@/vol_apps/cm/cm_ui_linewrapping";
import {CmUiOpenDoc} from "@/vol_apps/cm/cm_ui_open_doc";
import {CmUiSaveAsBtn} from "@/vol_apps/cm/cm_ui_save_as";
import {CmUiSearchPanelOpen} from "@/vol_apps/cm/cm_ui_search_panel_open";
import {Theme} from "@/vol_apps/theme/theme";
import {isFontAvailable} from "@/vol_apps/tool/isAvailable/isFontAvailable";
import {useEffect, useRef} from "react";

import {Compartment} from "@codemirror/state";
import {searchKeymap, highlightSelectionMatches, search,} from "@codemirror/search";
import {EditorView, lineNumbers, keymap,} from "@codemirror/view";
import {storeHub, useSignal} from "@/vol_apps/04_persist_atoms";
import {cmStore} from "@/vol_apps/cm/cm_atom.ts";

export const Cm = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const themeRef = useRef(new Compartment());
    const lineNumbersRef = useRef(new Compartment());
    const lineWrappingRef = useRef(new Compartment());

    const {fontMeta, setFontMeta} = useSignal(cmStore("fontMeta"));
    const {doc, setDoc} = useSignal(cmStore("doc"));
    const isVisible = CmIsVisibleSig.use()
    const setIsVisible = CmIsVisibleSig.set
    const {enableLineNumbers} = useSignal(cmStore("enableLineNumbers"));
    const {enableLineWrapping} = useSignal(cmStore("enableLineWrapping"));
    const {fontPx} = useSignal(cmStore("fontPx"));
    const {fontWeight} = useSignal(cmStore("fontWeight"));
    const {fontLineHeight} = useSignal(cmStore("fontLineHeight"));

    const hydrated = storeHub.getStore("cm").useStoreHydrated()

    // const hydrated = useStoreHydrated(useCmStore)

    // 在组件内替换原来的字体检查 Effect
    useEffect(() => {
        if (!hydrated) return;

        let cancelled = false;
        const checkFont = async () => {
            try {
                const available = isFontAvailable(fontMeta.family);
                if (cancelled) return;
                if (!available && fontMeta.family !== "monospace") {
                    setFontMeta({fullName: "monospace", family: "monospace"});
                    // toast.error(`"${fontMeta.family}" 不存在，已回退至 monospace`);
                }
            } catch (err) {
                console.log("字体检查失败", err);
            }
        };

        checkFont().then();
        return () => {
            cancelled = true;
        };
    }, [hydrated]); // 依赖项完整

    const fontSize = fontPx.toString() + "px";
    const fontFallback = "monospace";
    const fontFamily = `${fontMeta.fullName}, ${fontFallback}`;
    const lineHeight = fontLineHeight.toString() + "px"

    const fontStyles = EditorView.theme({
        "&": {height: "100%"},
        ".cm-scroller": {overflow: "auto"},
        "& .cm-content": {
            fontSize,
            fontFamily,
            fontWeight,
            lineHeight,
            background: "var(--background)",
            color: "var(--foreground)",
            caretColor: "var(--foreground)",
        },
        "& .cm-gutter": {
            background: "var(--background)",
            fontSize,
        },
        "& .cm-gutterElement": {
            color: "var(--foreground)",
        },
        ".cm-cursor": {
            borderLeftColor: "var(--foreground)"
        },
    });

    //初始化
    useEffect(() => {
        if (!containerRef.current) return;
        const view = new EditorView({
            doc,
            extensions: [
                lineNumbersRef.current.of(enableLineNumbers ? lineNumbers() : []),
                lineWrappingRef.current.of(enableLineWrapping ? EditorView.lineWrapping : []),
                themeRef.current.of(fontStyles),

                // ==================== 搜索功能 ====================
                search({top: true}),
                // keymap.of(searchKeymap.filter((binding) => binding.run !== openSearchPanel)),
                keymap.of(searchKeymap),
                highlightSelectionMatches(),
                // ====================================================

                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        setDoc(update.state.doc.toString());
                    }
                })
            ],
            parent: containerRef.current,
        });
        viewRef.current = view;
        return () => {
            view.destroy();
            viewRef.current = null;
        };
    }, [hydrated]);

    //更新样式
    useEffect(() => {
        const view = viewRef.current;
        if (!view) return;
        view.dispatch({
                effects: [
                    lineNumbersRef.current.reconfigure(enableLineNumbers ? lineNumbers() : []),
                    lineWrappingRef.current.reconfigure(enableLineWrapping ? EditorView.lineWrapping : []),
                    themeRef.current.reconfigure(fontStyles),
                ],
            }
        );
    }, [fontStyles, enableLineNumbers, enableLineWrapping]);

    // 外部文档同步（当 store 中的 doc 变化时更新编辑器）
    useEffect(() => {
        const view = viewRef.current;
        if (!view) return;
        const currentDoc = view.state.doc.toString();
        if (currentDoc !== doc) {
            view.dispatch({
                changes: {from: 0, to: view.state.doc.length, insert: doc},
            });
        }
    }, [doc]);

    //ESC 关闭
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsVisible(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className={cn({"hidden": !isVisible},
            "fixed top-0 bottom-0 right-0 left-0 m-1 rounded-md",
            "bg-background",
            "z-20",
            "animate-fade-in-scale"
        )}>
            {hydrated
                ? (<div className="flex flex-col h-full">
                    {/* toolbar */}
                    <div className={"flex m-2 gap-2"}>
                        <Theme/>
                        <CmUiOpenDoc/>
                        <CmUiSaveAsBtn/>
                        <CmUiLineNumbers/>
                        <CmUiLineWrapping/>
                        <CmUiFontFamily/>
                        <CmUiFont/>
                        <CmUiSearchPanelOpen viewRef={viewRef}/>
                        <CmClose className={"absolute right-2"}/>
                    </div>
                    {/* editor area */}
                    <div className="flex-1 overflow-hidden">
                        <div className={"m-2 h-full ring-0 outline-0"} ref={containerRef}/>
                    </div>
                </div>)
                : null}
        </div>
    );
};