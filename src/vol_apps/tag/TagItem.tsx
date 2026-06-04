import {useEffect, useRef, useState} from "react";
import {InputButton} from "@/vol_apps/tag/InputButton";
import type {Tag} from "@/vol_apps/tile/tile_store_types";
import {ContextMenu, ContextMenuTrigger} from "@/components/ui/context-menu";
import {TagMenuContent, UntaggedMenuContent} from "@/vol_apps/tag/TagMenuContent";
import {useLanguageAtom} from "@/vol_apps/language/languageAtom.ts";
import {useTagItemStyleFromAtom} from "@/vol_apps/tag/useTagItemStyleFromAtom.ts";

type TagItemProps =
    | {
    type: "tag";
    tag: Tag;
    renameTag: (id: number, name: string) => void;
    deleteTag: (id: number) => void;
    toggleTag: (id: number) => void;
    checkOnlyThisTag: (id: number) => void;
    deleteTilesWithOnlyThisTag: (id: number) => void;
}
    | {
    type: "untagged";
    checkOnlyUntagged: () => void;
    untaggedChecked: boolean;
    deleteUntaggedTiles: () => void;
    setUntaggedChecked: (checked: boolean) => void;
};

export const TagItem = (props: TagItemProps) => {

    const {t} = useLanguageAtom("tagBar")

    // const {tagStyles} = props

    if (props.type === "tag") {
        const {tag, renameTag, deleteTag, checkOnlyThisTag, deleteTilesWithOnlyThisTag, toggleTag} = props
        const {inputRef, inputValue, setInputValue, inEdit, setInEdit, handleRename, handleDefault} = useEditTag({tag, renameTag})
        const tagItemStyle = useTagItemStyleFromAtom(tag.checked); // 这里直接使用 atom 订阅
        const handleClick = () => {
            if (!inEdit) checkOnlyThisTag(tag.id)
        }

        return (
            <>
                <ContextMenu>
                    <ContextMenuTrigger>
                        <InputButton
                            ref={inputRef}
                            value={inputValue}
                            onValueChange={setInputValue}
                            inEdit={inEdit}
                            handleClick={handleClick}
                            inputProps={{
                                onBlur: handleRename,
                                onKeyDown: (e) => {
                                    if (e.key === "Enter") e.currentTarget.blur();
                                    if (e.key === "Escape") handleDefault()
                                }
                            }}
                            className={tagItemStyle.className}
                            styles={tagItemStyle.style}
                        />
                    </ContextMenuTrigger>
                    <TagMenuContent
                        tag={tag}
                        toggleTag={toggleTag}
                        setInEdit={setInEdit}
                        deleteTag={deleteTag}
                        deleteTilesWithOnlyThisTag={deleteTilesWithOnlyThisTag}/>
                </ContextMenu>
            </>
        )

    }

    if (props.type === "untagged") {
        const {
            checkOnlyUntagged,
            untaggedChecked,
            deleteUntaggedTiles,
            setUntaggedChecked,
        } = props
        const tagItemStyle = useTagItemStyleFromAtom(untaggedChecked);
        const handleClick = () => checkOnlyUntagged()
        return (
            <>
                <ContextMenu>
                    <ContextMenuTrigger>
                        <InputButton
                            value={t("UntaggedTiles")}
                            inEdit={false}
                            handleClick={handleClick}
                            className={tagItemStyle.className}
                            styles={tagItemStyle.style}
                        />
                    </ContextMenuTrigger>
                    <UntaggedMenuContent
                        deleteUntaggedTiles={deleteUntaggedTiles}
                        setUntaggedChecked={setUntaggedChecked}
                        untaggedChecked={untaggedChecked}
                    />
                </ContextMenu>
            </>
        )
    }
}

// type TagStyles = {
//     textOpacity: number,
//     textColor: string,
//     textPadding: { x: number, y: number },
//     fontSize: number,
//     fontWeight: number,
//     font: FontItem,
//     backgroundColor: string,
//     backgroundOpacity: number,
//     radius: number,
// }

// export const useTagItemStyle = (
//     {
//         checked,
//         tagStyles,
//     }: {
//         checked: boolean
//         tagStyles: TagStyles
//     }
// ) => {
//
//     const {theme} = useThemeAtom()
//
//     const textColorStyle = (() => {
//         if (tagStyles.textColor === "auto") {
//             if (tagStyles.textOpacity === 1.01) return {}
//             if (theme === "light") return {color: `rgba(10,10,10, ${tagStyles.textOpacity})`}
//             if (theme === "dark") return {color: `rgba(250,250,250, ${tagStyles.textOpacity})`}
//         } else {
//             const r = parseInt(tagStyles.textColor.slice(1, 3), 16)
//             const g = parseInt(tagStyles.textColor.slice(3, 5), 16)
//             const b = parseInt(tagStyles.textColor.slice(5, 7), 16)
//             return {color: `rgba(${r}, ${g}, ${b}, ${tagStyles.textOpacity})`}
//         }
//     })()
//
//     const backgroundColorStyle = (() => {
//         if (tagStyles.backgroundColor === "auto") {
//             if (tagStyles.backgroundOpacity === 1.01) return {}
//             if (theme === "light") return {backgroundColor: `rgba(250,250,250, ${tagStyles.backgroundOpacity})`}
//             if (theme === "dark") return {backgroundColor: `rgba(10,10,10, ${tagStyles.backgroundOpacity})`}
//         } else {
//             const r = parseInt(tagStyles.backgroundColor.slice(1, 3), 16)
//             const g = parseInt(tagStyles.backgroundColor.slice(3, 5), 16)
//             const b = parseInt(tagStyles.backgroundColor.slice(5, 7), 16)
//             return {backgroundColor: `rgba(${r}, ${g}, ${b}, ${tagStyles.backgroundOpacity})`}
//         }
//     })()
//
//     return {
//         className: cn(
//             "border-none bg-background text-foreground",
//             "dark:bg-input/30",
//             checked && "bg-sBlue! text-white!"
//         ),
//         style: {
//             fontSize: `${tagStyles.fontSize}px`,
//             fontWeight: tagStyles.fontWeight,
//             fontFamily: tagStyles.font.family,
//             padding: `${tagStyles.textPadding.y}px ${tagStyles.textPadding.x}px`,
//             borderRadius: `${tagStyles.radius}px`,
//             ...textColorStyle,
//             ...backgroundColorStyle,
//         } satisfies React.CSSProperties
//     }
// }

const useEditTag = (
    {
        tag,
        renameTag,
    }: {
        tag: Tag
        renameTag: (id: number, name: string) => void
    }
) => {

    const inputRef = useRef<HTMLInputElement>(null)
    const [value, setValue] = useState(tag.name)
    const [inEdit, setInEdit] = useState(false)

    useEffect(() => {
        setValue(tag.name)
    }, [tag.name])

    useEffect(() => {
        if (!inEdit) return
        const id = setTimeout(() => {
            inputRef.current?.focus()
            const len = value.length
            inputRef.current?.setSelectionRange(len, len)
        }, 300)
        return () => clearTimeout(id)
    }, [inEdit, value])

    const handleRename = () => {
        renameTag(tag.id, value)
        setInEdit(false)
    }

    const handleDefault = () => {
        setValue(tag.name)
        setInEdit(false)
    }

    return {
        inputRef,
        inputValue: value,
        setInputValue: setValue,
        inEdit,
        setInEdit,
        handleRename,
        handleDefault,
    }
}