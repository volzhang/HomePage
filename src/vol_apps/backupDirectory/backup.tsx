import {useCenteredFloating} from "@/vol_apps/02_hooks/float/useCenteredFloating.ts";
import {Button} from "@/components/ui/button.tsx";
import {toast} from "sonner";
import {get, set} from "idb-keyval";
import {getPersistedStoresBackupData} from "@/vol_apps/tool/backupAndRestore.ts";
import {tryStringify} from "@/vol_apps/tool/isType/isValidType.ts";
import {createSignal} from "@/vol_apps/04_persist_atoms";

const IDB_KEY = "HomePageBackup"

export const backupOpenSignal = createSignal<boolean>(false);

export const Backup = () => {
    const open = backupOpenSignal.use()
    const close = () => backupOpenSignal.set(false)

    // const [open, setOpen] = useState(false);

    const {floatingRef, floatingStyle, floatingPortal} = useCenteredFloating({
        open,
        duration: 250,
        exitDuration: 200,
        scale: 90,
        zIndex: 999,
    });

    const ensureReadWritePermission = async (handle: FileSystemDirectoryHandle) => {
        //@ts-ignore
        const permission = await handle.queryPermission({mode: "readwrite"});
        if (permission === "granted") return true;
        //@ts-ignore
        const requestPermission = await handle.requestPermission({mode: "readwrite"});
        return requestPermission === "granted";
    };

    const handleSelectDir = async () => {
        try {
            // @ts-ignore
            const h = await window.showDirectoryPicker();
            if (await ensureReadWritePermission(h)) {
                await set(IDB_KEY, h);
                toast.success("已选择备份目录");
            } else {
                toast.error("Permission denied");
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return;
        }
    }

    const handleBackup = async () => {
        const dirHandle = await get(IDB_KEY);

        if (!dirHandle) {
            toast.error("Select directory first.")
            return
        }

        if (!await ensureReadWritePermission(dirHandle)) {
            toast.error("Permission denied.")
            return
        }

        try {
            const backupData = getPersistedStoresBackupData();
            const jsonContent = tryStringify(backupData);
            const blob = new Blob([jsonContent], {type: "application/json;charset=utf-8"});

            const subDirHandle = await dirHandle.getDirectoryHandle(IDB_KEY, {create: true});
            const fileHandle = await subDirHandle.getFileHandle("HomePageBackup.json", {create: true});
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();

            toast.success("手动备份成功");
        } catch (error: unknown) {
            if (error instanceof Error && error.name === "NotFoundError") {
                toast.error("目录已不存在或无法访问，请重新选择。");
                await set(IDB_KEY, null);
                return;
            }
            const message = error instanceof Error ? error.message : String(error);
            toast.error("写入失败: " + message);
        }
    };

    return (
        <>
            {/*<Button variant={"outline"} onClick={toggle}>打开居中弹窗</Button>*/}
            {floatingPortal(
                <div
                    ref={floatingRef}
                    style={floatingStyle}
                >
                    <div className={"bg-background text-foreground border w-200 h-100 flex flex-col p-2 gap-2"}>

                        <div>
                            <p>选择一个本地目录</p>
                            <p>插件将在此目录下创建 HomePageBackup 文件夹，</p>
                            <p>所有读写操作仅限此文件夹内，不会影响其他文件。</p>
                        </div>
                        <div>
                            <p>写入内容：</p>
                            <p>最新的 JSON 存档文件（backup.json）</p>
                            <p>{`文件大小通常 <10 MB，若包含大量图标或高清壁纸可能更大。`}</p>
                        </div>
                        <div>
                            <p>操作安全：</p>
                            <p>只覆写存档文件，不会删除任何文件。</p>
                        </div>

                        <Button className={"w-fit"} onClick={handleSelectDir}> 选择文件夹 </Button>
                        <Button className={"w-fit"} onClick={handleBackup}> 写入文件 </Button>
                        <Button className={"w-fit"} onClick={close}> 关闭 </Button>
                    </div>
                </div>
            )}
        </>
    );
};