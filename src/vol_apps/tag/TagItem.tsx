import {useEffect, useRef, useState} from "react";
import {InputButton} from "@/vol_apps/tag/InputButton";
import type {Tag} from "@/vol_apps/tile/tile_store_types";
import {Tag_context_menu} from "@/vol_apps/tag/tag_context_menu";
import {cn} from "@/lib/utils";

export const NewTagItem = (
    {
        tag,
        toggleTag,
        renameTag,
        deleteTag,
        checkOnlyThisTag,
        deleteTilesWithOnlyThisTag,
    }:{
        tag:Tag
        toggleTag: (id: Tag["id"]) => void
        renameTag: (id: Tag["id"], name: Tag["name"] ) => void
        deleteTag: (id: Tag["id"]) => void
        checkOnlyThisTag: (id: Tag["id"]) => void
        deleteTilesWithOnlyThisTag: (id: Tag["id"]) => void
    }
)=>{

    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState(tag.name);
    const [inEdit, setInEdit] = useState<boolean>(false)

    useEffect(() => {
        setInputValue(tag.name);
    }, [tag.name]);

    const handleClick = () => {
        if (!inEdit) checkOnlyThisTag(tag.id)
    }

    const handleRename = ()=> {
        renameTag(tag.id, inputValue)
        setInEdit(false)
    }

    const handleDefault = ()=>{
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

    return (
        <>

            <Tag_context_menu
                tag={tag}
                toggleTag = {toggleTag}
                deleteTag = {deleteTag}
                setInEdit = {setInEdit}
                deleteTilesWithOnlyThisTag = {deleteTilesWithOnlyThisTag}
            >
                <InputButton
                    ref = {inputRef}
                    className={cn(
                        "px-4 py-2",
                        "border bg-background text-foreground rounded-md",
                        "text-[14px]",
                        "font-medium",
                        "dark:bg-input/30",
                        "dark:border-input",
                        tag.checked && "bg-sBlue! text-white!"
                    )}
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
                />
            </Tag_context_menu>

        </>
    )
}