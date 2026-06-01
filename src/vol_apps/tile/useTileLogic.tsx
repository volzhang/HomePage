import {INITIAL_STYLE, useTileStyleStore, useTileStyleStoreBase} from "./tile_style_store";
import {useEffect, useMemo, useRef, useState} from "react";
import {useBgStore} from "@/vol_apps/bg/bg_store";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {defaultIconBase64} from "@/vol_apps/tile/tile_store_types";
import {enhanceUrl, extractMainDomain} from "@/vol_apps/tool/action/enhanceUrl";
import {openLinkInCurrentTab, openLinkInNewTab} from "@/vol_apps/tool/action/openLink";
import {useFaviconVemetricPng} from "@/vol_apps/tanStackQuery/Api_FaviconVemetric";
import {isValidUrl} from "@/vol_apps/tool/isType/isValidUrl";
import {isSortable} from "@dnd-kit/react/sortable";
import {useLanguageAtom} from "@/vol_apps/language/languageAtom.ts";

export type TileLogic = ReturnType<typeof useTileLogic>;
export const useTileLogic = () => {

    const {t} = useLanguageAtom()

    const {
        tiles, tileInEditId, tileUiVisible,
        setTiles, tilesByTag, isBroadMatches,
        setTileUiVisible, setTileInEditId,
        updateTile, removeTile

    } = useTileStore()
    const {bgImg} = useBgStore()
    const displayTiles = tilesByTag(isBroadMatches ? "ANY" : "ALL")!

    // 缓存当前视图 id 顺序，方便找到左邻居
    const currentIdOrder = useMemo(() => displayTiles.map(t => t.id), [displayTiles]);

    const handleDragEnd = (event: any) => {
        const {operation, canceled} = event;
        if (canceled || !operation?.source) return;

        const {source} = operation;
        if (!isSortable(source)) return;

        const draggedId = source.id;               // 被拖拽 tile 的 id
        const toIndex = source.sortable.index;    // 目标视图位置

        // 左邻居 id：如果拖到最前面就是 null
        const filteredMap = currentIdOrder.filter(id => id !== draggedId);
        const neighborId = toIndex > 0 ? filteredMap[toIndex - 1] : null;

        // 复制 tiles，保证新数组
        const newTiles = [...tiles];

        // 删除被拖拽 tile
        const removeIndex = newTiles.findIndex(t => t.id === draggedId);
        if (removeIndex === -1) return;
        const [removed] = newTiles.splice(removeIndex, 1);

        // 决定插入位置
        let insertIndex = 0;
        if (neighborId !== null) {
            const idx = newTiles.findIndex(t => t.id === neighborId);
            insertIndex = idx !== -1 ? idx + 1 : newTiles.length;
        }

        // 插入
        newTiles.splice(insertIndex, 0, removed);

        // 更新 store
        setTiles(newTiles);
    };

    const TileStyle = useTileStyleStore();

    const backgroundRGBAColor = (() => {
        const r = parseInt(TileStyle.backgroundColor.slice(1, 3), 16);
        const g = parseInt(TileStyle.backgroundColor.slice(3, 5), 16);
        const b = parseInt(TileStyle.backgroundColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${TileStyle.backgroundOpacity})`;
    })();

    const tileOutlineRGBAColor = (() => {
        const r = parseInt(TileStyle.tileOutlineColor.slice(1, 3), 16);
        const g = parseInt(TileStyle.tileOutlineColor.slice(3, 5), 16);
        const b = parseInt(TileStyle.tileOutlineColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${TileStyle.tileOutlineOpacity})`;
    })();

    const textRGBAColor = (() => {
        const r = parseInt(TileStyle.textColor.slice(1, 3), 16);
        const g = parseInt(TileStyle.textColor.slice(3, 5), 16);
        const b = parseInt(TileStyle.textColor.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${TileStyle.textOpacity})`;
    })();

    const [stylesIsOpen, setStylesIsOpen] = useState(false);
    useEffect(() => {
        if (!tileUiVisible) {
            setStylesIsOpen(false);
        }
    }, [tileUiVisible]);

    const currentTile = tiles.find(tile => tile.id === tileInEditId);

    // LINK
    const link = currentTile?.url || ""
    const link_ref = useRef<HTMLTextAreaElement>(null);

    // NAME
    const name = currentTile?.meta.name || ""
    const setName = (name: string) => updateTile(tileInEditId, {meta: {name}})

    const setLink = (input: string) => {
        const finalUrl = URL.canParse(input)
            ? input
            : enhanceUrl(input);
        if (finalUrl !== link) {
            updateTile(tileInEditId, {url: finalUrl});
        }
    };

    const try_handle_name = (url: string) => {
        if (name) return;
        if (!URL.canParse(url)) return;

        const autoName = extractMainDomain(url);
        updateTile(tileInEditId, {
            meta: {name: autoName}
        });
    };

    const try_handle_icon = async () => {
        if (icon === defaultIconBase64) {
            await handleAutoFetchIcon()
        }
    }

    // Auto-Fetch Icon
    const [isFetchingIcon, setIsFetchingIcon] = useState<boolean>(false)

    const {refetch} = useFaviconVemetricPng(
        link.replace(/\/$/, ""),                    //这里去掉末尾斜杠/，可以提高成功率
        96, {enabled: false});

    const handleAutoFetchIcon = async () => {
        if (!isValidUrl(link)) return;
        if (isFetchingIcon) return;
        setIsFetchingIcon(true)

        const timerPromise = new Promise(resolve => setTimeout(resolve, 1000));
        const updatePromise = (async () => {
            const res = await refetch();
            if (res.data) {
                updateTile(tileInEditId, {meta: {icon: res.data}});
            }
        })();

        Promise.all([timerPromise, updatePromise]).finally(() => {
            setIsFetchingIcon(false);
        });
    };

    // TAG
    const tag = currentTile?.meta.tags.join(" ") || ""
    const handleTagChange = (s: string) => {
        //input组件输入一个string值时，至少输入的是""，
        //不会输入完全的空值
        const splitString = " ";
        let newTags = s.split(splitString);
        const inputIsEmpty = (newTags.length === 1 && newTags[0] === "")
        if (inputIsEmpty) newTags = []
        updateTile(tileInEditId, {meta: {tags: newTags}});
    };

    // ICON
    const icon = currentTile?.meta.icon || defaultIconBase64
    const setIcon = (icon: string) => {
        updateTile(tileInEditId, {meta: {icon}})
    }

    // 临时文件名（只用于显示，不保存）
    const [iconFileName, setIconFileName] = useState<string>("");

    const handleIconFilePick = async (file: File | undefined) => {
        if (!file) return;
        setIconFileName(file.name);  // 临时存文件名

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setIcon(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleSearchIcon = async () => {
        const name = currentTile?.meta.name;
        openLinkInNewTab(`https://www.bing.com/images/search?pq=icon+${name}&q=icon+${name}&qft=+filterui:imagesize-small&first=1`);
    }

    // BUTTONS
    const hasStyleChanges = useTileStyleStore((state) =>
        Object.entries(INITIAL_STYLE).some(([key, defaultValue]) =>
            JSON.stringify(state[key as keyof typeof INITIAL_STYLE]) !== JSON.stringify(defaultValue)
        )
    );

    const handleRemoveTile = () => {
        setTileUiVisible(false)
        setTimeout(() => removeTile(tileInEditId), 0)
    };
    const handleResetStyles = () => useTileStyleStoreBase.setState({...INITIAL_STYLE});

    // OK
    const ok_ref = useRef<HTMLButtonElement>(null);
    const handleOk = () => setTileUiVisible(false);

    // contextMenu

    const handleOpenInNewTab = (id: number) => {
        setTileInEditId(id)
        const tile = tiles.find(t => t.id === id)
        if (tile?.url) openLinkInNewTab(tile.url)
    }
    const handleOpenInCurrentTab = (id: number) => {
        setTileInEditId(id)
        const tile = tiles.find(t => t.id === id)
        if (tile?.url) openLinkInCurrentTab(tile.url)
    }

    const handleEdit = (id: number) => {
        setTileInEditId(id)
        setTileUiVisible(true)
    }

    const contextMenuOptions: { label: string, handler: () => void }[] = [
        {label: ("Open in new tab"), handler: () => handleOpenInNewTab(tileInEditId)},
        {label: ("Open"), handler: () => handleOpenInCurrentTab(tileInEditId)},
        {label: ("Edit"), handler: () => handleEdit(tileInEditId)},
    ]

    return {
        t,
        // contextMenu
        contextMenuOptions,
        tileInEditId,
        setTileInEditId,

        handleOpenInNewTab,
        handleOpenInCurrentTab,
        handleEdit,

        tileUiVisible,
        setTileUiVisible,

        // 磁砖墙
        displayTiles,
        // handleRightClick,

        // 拖拽
        handleDragEnd,

        // HEAD
        // 这里可能有歧义，实际上，是currentLink currentName currentTag
        link, setLink, try_handle_name, try_handle_icon, link_ref,

        name, setName,
        tag, handleTagChange,

        icon, setIcon,
        iconFileName, handleIconFilePick,

        isFetchingIcon,
        handleAutoFetchIcon,
        handleSearchIcon,

        //BODY
        handleRemoveTile,
        handleResetStyles,
        hasStyleChanges,

        //FOOT
        handleOk,
        ok_ref,

        //STYLE
        ...TileStyle,
        iconBorderOutline: stylesIsOpen,
        stylesIsOpen, setStylesIsOpen,
        bgImg,

        //背景色
        backgroundRGBAColor,
        tileOutlineRGBAColor,
        textRGBAColor,

        INITIAL_STYLE,
    }

}