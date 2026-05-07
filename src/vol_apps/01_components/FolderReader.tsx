// import { useState, useEffect } from 'react';
// import { get, set } from 'idb-keyval';
//
// interface TreeNode {
//     name: string;
//     kind: 'file' | 'dir';
//     children?: TreeNode[];
// }
//
// export default function FolderReader() {
//     const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
//     const [tree, setTree] = useState<TreeNode[]>([]);
//     const [info, setInfo] = useState('');
//
//     const readTree = async (handle: FileSystemDirectoryHandle): Promise<TreeNode[]> => {
//         const items: TreeNode[] = [];
//         for await (const [name, h] of handle.entries()) {
//             if (h.kind === 'directory') {
//                 items.push({ name, kind: 'dir', children: await readTree(h) });
//             } else {
//                 items.push({ name, kind: 'file' });
//             }
//         }
//         return items;
//     };
//
//     const refreshList = async (handle: FileSystemDirectoryHandle) => {
//         setInfo('读取中...');
//         const t = await readTree(handle);
//         setTree(t);
//         setDirHandle(handle);
//         setInfo('');
//     };
//
//     const pick = async () => {
//         const h = await window.showDirectoryPicker();
//         await set('dh', h);
//         await refreshList(h);
//     };
//
//     useEffect(() => {
//         (async () => {
//             const saved = await get<FileSystemDirectoryHandle>('dh');
//             if (!saved) {
//                 setInfo('无已保存的文件夹，请选择一个。');
//                 return;
//             }
//             const perm = await saved.queryPermission({ mode: 'read' });
//             if (perm === 'granted') {
//                 await refreshList(saved);
//             } else if (perm === 'prompt') {
//                 setInfo('需要重新授权');
//                 const state = await saved.requestPermission({ mode: 'read' });
//                 if (state === 'granted') {
//                     await refreshList(saved);
//                 } else {
//                     setInfo('授权被拒绝');
//                 }
//             } else {
//                 setInfo('权限被拒绝，请重新选择文件夹');
//             }
//         })();
//     }, []);
//
//     const TreeView = ({ nodes, lvl = 0 }: { nodes: TreeNode[]; lvl?: number }) => (
//         <ul style={{ marginLeft: lvl * 20 }}>
//             {nodes.map((n) => (
//                 <li key={n.name}>
//                     {n.kind === 'dir' ? '📁' : '📄'} {n.name}
//                     {n.children && <TreeView nodes={n.children} lvl={lvl + 1} />}
//                 </li>
//             ))}
//         </ul>
//     );
//
//     return (
//         <div className="p-4">
//             <button onClick={pick} className="px-4 py-2 bg-blue-500 text-white rounded mb-4">
//                 选择文件夹
//             </button>
//             {info && <div className="text-gray-600 mb-2">{info}</div>}
//             {tree.length > 0 && <TreeView nodes={tree} />}
//         </div>
//     );
// }