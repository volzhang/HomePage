import {Button} from "@/components/ui/button";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import {Input} from "@/components/ui/input"
import {Spinner} from "@/components/ui/spinner";
import {cn} from "@/lib/utils";
import {useTileStore} from "@/vol_apps/tile/tile_store";
import {BookmarkIcon, LoaderCircle,} from "lucide-react";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {type Tag} from "@/vol_apps/tile/tile_store_types.js"

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuLabel,
    ContextMenuGroup
} from "@/components/ui/context-menu";
import {useEditableInput} from "@/vol_apps/tool/component/input.js";
import {t} from "i18next";

export const BroadMatches = ({isBroadMatches, handleOnClick}: {
    isBroadMatches: boolean,
    handleOnClick?: () => void,
}) => {
    const {t} = useTranslation("tag");
    return (
        <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
                <BookmarkIcon onClick={handleOnClick}
                              className={cn(
                                  "size-6",
                                  isBroadMatches
                                      ? "text-ring hover:text-[#0078d7]"
                                      : "text-[#0078d7] fill-[#0078d7]",
                              )}/>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto" side="bottom" sideOffset={18}>
                <div className="text-[13px]">
                    {t(
                        "Left-click a tag to select only this one.\nRight-click a tag to open menu for more operations.\nClick me to toggle mode.\nCurrently: tiles match {{mode}} selected tags",
                        {mode: isBroadMatches ? t("ANY") : t("ALL")}
                    )
                        .split("\n").map((line, i) => (
                            <div key={i}>{line.trim()}</div>
                        ))}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

export const TagUpdate = () => {
    const {t} = useTranslation("tag");
    const {tiles, updateTags} = useTileStore();
    const [isUpdate, setIsUpdate] = useState<boolean>(false);

    const handleClick = () => {
        setIsUpdate(true);
        const timerPromise = new Promise(resolve => setTimeout(resolve, 1000));
        const updatePromise = Promise.resolve().then(() => updateTags(tiles));
        Promise.all([timerPromise, updatePromise]).finally(() => {
            setIsUpdate(false);
        });
    };

    return (
        <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
                {isUpdate
                    ? <Spinner className={"size-6 text-[#0078d7]"}></Spinner>
                    : <LoaderCircle className={"size-6 text-ring hover:text-[#0078d7]"} onClick={handleClick}/>}
            </HoverCardTrigger>
            <HoverCardContent className="w-auto" side="bottom" sideOffset={18}>
                <div className="text-[13px]">
                    {t("Click to sync tags")}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

export const TagComponent = () => {

    const {
        updateTag, toggleTag, deleteTag, hasUntaggedTiles, isBroadMatches,
        untaggedChecked, setUntaggedChecked, renameTag, tags, setIsBroadMatches,
    } = useTileStore();

    const TagItem = ({tag}: { tag: Tag }) => {
        const {t} = useTranslation("tag");

        const [inEdit, setInEdit] = useState(false);

        const {
            inputProps,
            inputString,
            inputRef,
            setInputSize,
            setInputString
        } = useEditableInput({
            // initialValue: tag.name,
            handleSubmit: () => {
                renameTag(tag.id, inputString);
                setInEdit(false);
            },
            handleEscape: () => {
                setInputString(tag.name);
                setInEdit(false);
            },
        });

        useEffect(() => {
            if (inEdit) {
                const id = setTimeout(() => {
                    inputRef.current?.focus();
                    const len = inputString.length
                    inputRef.current?.setSelectionRange(len, len);
                }, 350); // 延迟 300以上
                return () => clearTimeout(id);
            }
        }, [inEdit]);

        const btn = (
            <Button
                hidden={inEdit}
                className={cn(
                    "border-0",
                    {"text-white bg-[#0078d7] hover:bg-[#0078d7] ": tag.checked},
                )}
                variant={tag.checked ? "default" : "outline"}
                onClick={() => {
                    tags.map(items => {
                        updateTag(items.id, {checked: items.id === tag.id});
                    });
                    if (untaggedChecked) setUntaggedChecked(false);
                }}
                onContextMenu={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setInputSize({
                        width: rect.width,
                        height: rect.height,
                    });
                }}
            >
                {tag.name}
            </Button>
        );

        return (
            <>
                <Button hidden={!inEdit} style={{display: inEdit ? 'inline-flex' : 'none'}}
                        className={cn(
                            "p-0 border-0",
                            {"text-white bg-[#0078d7] hover:bg-[#0078d7]": tag.checked}
                        )}
                        variant={tag.checked ? "default" : "outline"}>
                    <Input
                        hidden={!inEdit}
                        ref={inputRef}
                        className={"bg-transparent w-full h-full ring-0!"}
                        {...inputProps}
                    />
                </Button>
                <ContextMenu>
                    <ContextMenuTrigger>
                        {btn}
                    </ContextMenuTrigger>
                    <ContextMenuContent avoidCollisions={false} alignOffset={18}>
                        <ContextMenuGroup>
                            <ContextMenuLabel className="text-[#0078d7] font-bold">
                                {tag.name}
                            </ContextMenuLabel>
                            <ContextMenuItem onClick={() => toggleTag(tag.id)}>
                                {t("Toggle selection")}
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => {
                                setInputString(tag.name)
                                setInEdit(true)
                            }}>
                                {t("Rename")}
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => deleteTag(tag.id)}>
                                {t("Delete")}
                            </ContextMenuItem>
                        </ContextMenuGroup>
                    </ContextMenuContent>
                </ContextMenu>
            </>

        );
    };


    const Tags = tags.map(tag => (
        <TagItem key={tag.id} tag={tag}/>
    ));

    return (
        <>
            <div className={cn(
                "animate-fade-in-scale",
                "flex flex-wrap items-center px-8 py-4 gap-4 mx-auto",
                "w-[85%] min-h-18!",
                "select-none",
            )}>
                {Tags}
                {
                    hasUntaggedTiles() || untaggedChecked ?
                        <Button variant={untaggedChecked ? "default" : "outline"}
                                onClick={() => {
                                    setUntaggedChecked(true)
                                    tags.map(items => {
                                        updateTag(items.id, {checked: false})
                                    });
                                }}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    setUntaggedChecked(!untaggedChecked)
                                }}
                                className={cn(untaggedChecked
                                    ? "text-white bg-[#0078d7] hover:bg-[#0078d7] border-none select-none"
                                    : "border-none"
                                )
                                }>
                            {t("Untagged")}
                        </Button>
                        : null
                }
                <BroadMatches isBroadMatches={isBroadMatches} handleOnClick={
                    () => setIsBroadMatches(!isBroadMatches)
                }/>
                <TagUpdate/>

            </div>
        </>

    );
};