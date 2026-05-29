// import {cn} from "@/lib/utils";
// import {useLanguageStore} from "@/vol_apps/language/language_store";
// import type {Tag} from "@/vol_apps/tile/tile_store_types";
// import {InputButton} from "@/vol_apps/tag/InputButton";
// import type {FontItem} from "@/vol_apps/cm/cm_store";
// import {useThemeStore} from "@/vol_apps/theme/theme_store";
//
// export const TagItem_Untagged = (
//     {
//         untaggedChecked,
//         checkOnlyUntagged,
//         hasUntaggedTiles,
//         tagStyles,
//     }: {
//         hasUntaggedTiles: boolean
//         untaggedChecked: boolean
//         setUntaggedChecked: (checked: boolean) => void
//         checkOnlyUntagged: () => void
//         deleteUntaggedTiles: () => void
//         tagStyles: {
//             textOpacity: number,
//             textColor: string,
//             textPadding: { x: number, y: number },
//
//             fontSize: number,
//             fontWeight: number,
//             font: FontItem,
//
//             backgroundColor: string,
//             backgroundOpacity: number,
//
//             radius: number,
//         }
//     }
// ) => {
//     const {t} = useLanguageStore("tagBar")
//
//     const tag: Tag = {
//         id: -1,
//         name: t("UntaggedTiles"),
//         checked: untaggedChecked
//     }
//
//     // noinspection DuplicatedCode
//     const {theme} = useThemeStore()
//
//     const textColorStyle = (() => {
//         if (tagStyles.textColor === "auto" ) {
//             if (tagStyles.textOpacity === 1.01) return {}
//             if (theme === "light") return {color: `rgba(10,10,10, ${tagStyles.textOpacity})`}
//             else return {color: `rgba(250,250,250, ${tagStyles.textOpacity})`}
//         } else {
//             const r = parseInt(tagStyles.textColor.slice(1, 3), 16);
//             const g = parseInt(tagStyles.textColor.slice(3, 5), 16);
//             const b = parseInt(tagStyles.textColor.slice(5, 7), 16);
//             return {color: `rgba(${r}, ${g}, ${b}, ${tagStyles.textOpacity})`};
//         }
//     })();
//
//     const backgroundColorStyle = (() => {
//         if (tagStyles.backgroundColor === "auto") {
//             if (tagStyles.backgroundOpacity === 1.01) return {}
//             if (theme === "light") return {backgroundColor: `rgba(250,250,250, ${tagStyles.backgroundOpacity})`}
//             else return {backgroundColor: `rgba(10,10,10, ${tagStyles.backgroundOpacity})`}
//         } else {
//             const r = parseInt(tagStyles.backgroundColor.slice(1, 3), 16);
//             const g = parseInt(tagStyles.backgroundColor.slice(3, 5), 16);
//             const b = parseInt(tagStyles.backgroundColor.slice(5, 7), 16);
//             return {backgroundColor: `rgba(${r}, ${g}, ${b}, ${tagStyles.backgroundOpacity})`};
//         }
//     })();
//
//     const handleClick = () => checkOnlyUntagged()
//
//     return (
//
//         <>
//
//                 {hasUntaggedTiles && <InputButton
//                     value={tag.name}
//                     inEdit={false}
//                     handleClick={handleClick}
//                     className={cn(
//                         "border-none bg-background text-foreground",
//                         "dark:bg-input/30",
//                         tag.checked && "bg-sBlue! text-white!"
//                     )}
//                     styles={{
//                         fontSize: `${tagStyles.fontSize}px`,
//                         fontWeight: tagStyles.fontWeight,
//                         fontFamily: tagStyles.font.family,
//                         padding: `${tagStyles.textPadding.y}px ${tagStyles.textPadding.x}px`,
//                         borderRadius: `${tagStyles.radius}px`,
//                         ...textColorStyle,
//                         ...backgroundColorStyle,
//                     }}/>}
//
//         </>
//
//     )
// }