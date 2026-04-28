// import {cn} from "@/lib/utils";
// import {ChevronRightIcon} from "lucide-react";
// import {createContext, useContext, useState} from "react";
// import {Floating} from "@/vol_apps/01_components/Floating";
//
// const TRIGGER_CLASS = cn(
//     "relative w-24 h-9",
//     "rounded-md border bg-background shadow-xs text-sm",
//     "outline-none select-none",
//     "hover:bg-accent hover:text-accent-foreground",
//     "dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
// )
//
// const MENU_CLASS = cn(
//     "absolute px-1 py-1 w-max min-w-max",
//     "border bg-popover text-popover-foreground rounded-md shadow-md",
//     "z-1",
// )
//
// const ITEM_CLASS = cn(
//     "relative px-2 h-8 w-full min-w-32",
//     "text-sm rounded-sm",
//     "hover:bg-foreground/5",
//     "whitespace-nowrap",
// )
//
// const ICON_CLASS = cn(
//     "ml-auto h-4 w-4"
// )
//
// const DEFAULT_SUBMENU_CLASS = cn(
//     "absolute left-full top-0 -translate-y-1"
// )
//
// type MenuTree = {
//     key: string;
//     label: string;
// } & (
//     | { onClick: () => void; children?: never }
//     | { children: MenuTree[]; onClick?: never }
//     );
//
// type MenuTreeRoot = MenuTree[]
// type MenuTreePath = MenuTree["key"][]
// type MenuTreeContext = {
//     path: MenuTreePath;
//     setPath: (path: MenuTreePath) => void;
// }
//
// const MenuContext = createContext<MenuTreeContext | null>(null);
// const useMenuContext = () => {
//     const context = useContext(MenuContext);
//     if (!context) throw new Error("useMenuContext must be used within a MenuContextProvider");
//     return context;
// };
//
// const MenuContextProvider = ({children}: { children: React.ReactNode }) => {
//     const [path, setPath] = useState<MenuTreePath>([]);
//     return (
//         <MenuContext value={{path, setPath}}>
//             {children}
//         </MenuContext>
//     )
// }
//
// const RenderMenuTree = ({node, parentPath}: { node: MenuTree, parentPath: MenuTreePath}) => {
//     const hasChildren = !!node.children?.length;
//     const {path, setPath} = useMenuContext();
//     const currentPath = [...parentPath, node.key];
//
//     const open = currentPath.every((seg, i) => path[i] === seg);
//     const handleMouseEnter = () => {
//         if (path.join(",") !== currentPath.join(",")) {
//             setPath(currentPath)
//         }
//     }
//     const handleClick = () => {
//         if (hasChildren) return
//         node.onClick?.();
//         setPath([])
//     }
//
//     return (
//         <>
//             <li key={node.key} className={ITEM_CLASS}>
//                 <button onClick={handleClick} onMouseEnter={handleMouseEnter}>
//                     {node.label}
//                     {hasChildren && <ChevronRightIcon className={ICON_CLASS}/>}
//                 </button>
//                 {hasChildren && <div className={cn(DEFAULT_SUBMENU_CLASS)}>
//                     <Floating open={open}>
//                         <ul className={MENU_CLASS}>
//                             {node.children!.map(childNode =>
//                                 <RenderMenuTree
//                                     key={childNode.key}
//                                     node={childNode}
//                                     parentPath={currentPath}
//                                 />
//                             )}
//                         </ul>
//                     </Floating>
//                 </div>}
//             </li>
//         </>
//     )
// }
//
// const MENU:MenuTreeRoot = [
//     {key:"0", label:"按钮0", children:[
//             {key:"0.0", label:"按钮0.0",  onClick: ()=>{console.log(0.0)}},
//             {key:"0.1", label:"按钮0.1",  onClick: ()=>{console.log(0.1)}},
//             {key:"0.2", label:"按钮0.2",  onClick: ()=>{console.log(0.2)}},
//         ]},
//     {key:"1", label:"按钮1", onClick: ()=>{console.log(1)}},
//     {key:"2", label:"按钮2", onClick: ()=>{console.log(2)}},
// ]
//
// const MenuV2 = ({menu, MenuClassName}: {
//     menu?: MenuTreeRoot,
//     MenuClassName?: string
// }) => {
//     if (!menu) menu = MENU;
//
//     const {path, setPath} = useMenuContext();
//     const currentPath = ["Root"];
//     const isOpen = path.includes("Root")
//     const handleClick = () => isOpen ? setPath([]) : setPath(["Root"])
//
//     return (
//         <div className={TRIGGER_CLASS}>
//             <button className={TRIGGER_CLASS} onClick={handleClick}>
//                 菜单
//             </button>
//             <div className={cn("absolute left-full", MenuClassName)}>
//                 <Floating open={isOpen}>
//                     <ul className={MENU_CLASS}>
//                         {menu.map(nodeItem => <RenderMenuTree key={nodeItem.key} node={nodeItem} parentPath={currentPath}/>)}
//                     </ul>
//                 </Floating>
//             </div>
//         </div>
//     )
// }
//
// export const useMenuV2 = () => {
//     return <MenuContextProvider>
//         <MenuV2 />
//     </MenuContextProvider>
// }