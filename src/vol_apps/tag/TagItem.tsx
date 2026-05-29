import {useEffect, useRef, useState} from "react";
import {InputButton} from "@/vol_apps/tag/InputButton";
import type {Tag} from "@/vol_apps/tile/tile_store_types";
import {ContextMenu_TagItem} from "@/vol_apps/tag/ContextMenu_TagItem";
import {cn} from "@/lib/utils";
import type {FontItem} from "@/vol_apps/cm/cm_store";
import {useThemeStore} from "@/vol_apps/theme/theme_store";

export const TagItem = (
    {
        tag,
        toggleTag,
        renameTag,
        deleteTag,
        checkOnlyThisTag,
        deleteTilesWithOnlyThisTag,
        tagStyles,
    }: {
        tag: Tag
        toggleTag: (id: Tag["id"]) => void
        renameTag: (id: Tag["id"], name: Tag["name"]) => void
        deleteTag: (id: Tag["id"]) => void
        checkOnlyThisTag: (id: Tag["id"]) => void
        deleteTilesWithOnlyThisTag: (id: Tag["id"]) => void
        tagStyles: {
            textOpacity: number,
            textColor: string,
            textPadding: { x: number, y: number },

            fontSize: number,
            fontWeight: number,
            font: FontItem,

            backgroundColor: string,
            backgroundOpacity: number,

            radius: number,
        }
    }
) => {

    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState(tag.name);
    const [inEdit, setInEdit] = useState<boolean>(false)

    useEffect(() => {
        setInputValue(tag.name);
    }, [tag.name]);

    const handleClick = () => {
        if (!inEdit) checkOnlyThisTag(tag.id)
    }

    const handleRename = () => {
        renameTag(tag.id, inputValue)
        setInEdit(false)
    }

    const handleDefault = () => {
        setInputValue(tag.name);
        setInEdit(false);
    }

    useEffect(() => {
        if (inEdit) {
            const id = setTimeout(() => {
                inputRef.current?.focus();
                const len = inputValue.length;
                inputRef.current?.setSelectionRange(len, len);
            }, 300);
            return () => clearTimeout(id);
        }
    }, [inEdit, inputValue]);


    // noinspection DuplicatedCode
    const {theme} = useThemeStore()

    const textColorStyle = (() => {
        if (tagStyles.textColor === "auto" ) {
            if (tagStyles.textOpacity === 1) return {}
            if (theme === "light") return {color: `rgba(10,10,10, ${tagStyles.textOpacity})`}
            else return {color: `rgba(250,250,250, ${tagStyles.textOpacity})`}
        } else {
            const r = parseInt(tagStyles.textColor.slice(1, 3), 16);
            const g = parseInt(tagStyles.textColor.slice(3, 5), 16);
            const b = parseInt(tagStyles.textColor.slice(5, 7), 16);
            return {color: `rgba(${r}, ${g}, ${b}, ${tagStyles.textOpacity})`};
        }
    })();

    const backgroundColorStyle = (() => {
        if (tagStyles.backgroundColor === "auto") {
            if (tagStyles.backgroundOpacity === 1) return {}
            if (theme === "light") return {backgroundColor: `rgba(250,250,250, ${tagStyles.backgroundOpacity})`}
            else return {backgroundColor: `rgba(10,10,10, ${tagStyles.backgroundOpacity})`}
        } else {
            const r = parseInt(tagStyles.backgroundColor.slice(1, 3), 16);
            const g = parseInt(tagStyles.backgroundColor.slice(3, 5), 16);
            const b = parseInt(tagStyles.backgroundColor.slice(5, 7), 16);
            return {backgroundColor: `rgba(${r}, ${g}, ${b}, ${tagStyles.backgroundOpacity})`};
        }
    })();

    return (
        <>
            <ContextMenu_TagItem
                tag={tag}
                toggleTag={toggleTag}
                deleteTag={deleteTag}
                setInEdit={setInEdit}
                deleteTilesWithOnlyThisTag={deleteTilesWithOnlyThisTag}
            >
                <InputButton
                    ref={inputRef}
                    value={inputValue}
                    onValueChange={setInputValue}
                    inEdit={inEdit}
                    handleClick={handleClick}
                    inputProps={
                        {
                            onBlur: handleRename,
                            onKeyDown: (e) => {
                                if (e.key === "Enter") e.currentTarget.blur();
                                if (e.key === "Escape") handleDefault()
                            },
                        }
                    }
                    className={cn(
                        "border-none bg-background text-foreground",
                        "dark:bg-input/30",
                        tag.checked && "bg-sBlue! text-white!"
                    )}
                    styles={{
                        fontSize: `${tagStyles.fontSize}px`,
                        fontWeight: tagStyles.fontWeight,
                        fontFamily: tagStyles.font.family,
                        padding: `${tagStyles.textPadding.y}px ${tagStyles.textPadding.x}px`,
                        borderRadius: `${tagStyles.radius}px`,
                        ...textColorStyle,
                        ...backgroundColorStyle,
                    }}
                />
            </ContextMenu_TagItem>
        </>
    )
}