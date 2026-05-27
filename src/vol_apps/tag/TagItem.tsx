import {useState} from "react";
import {InputButton} from "@/vol_apps/tag/InputButton";
import type {Tag} from "@/vol_apps/tile/tile_store_types";

export const NewTagItem = (
    {
        tag,
        toggleTag,
        renameTag,
    }:{
        tag:Tag
        toggleTag: (id: Tag["id"]) => void
        renameTag: (id: Tag["id"], name: Tag["name"] ) => void
    }
)=>{
    const [inputValue, setInputValue] = useState("");
    const [inEdit, setInEdit] = useState<boolean>(false)

    const handleClick = () => {
        if (!inEdit) toggleTag(tag.id)
    }

    return (
        <>
            <InputButton
                inEdit={inEdit}
                handleClick={handleClick}
                inputProps={
                    {
                        onBlur: () => {
                            renameTag(tag.id, inputValue)
                            setInEdit(false)
                        },
                        onKeyDown: (e) => {
                            if (e.key === "Enter") {
                                e.currentTarget.blur();
                            }
                            if (e.key === "Escape") {
                                setInputValue(tag.name);
                                setInEdit(false);
                            }
                        },
                    }
                }
            />
        </>
    )
}