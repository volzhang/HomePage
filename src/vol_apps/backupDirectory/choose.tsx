import {useModalPortal} from "@/vol_apps/02_hooks/float/useModalPortal.tsx";
import {createSignal} from "@/vol_apps/04_persist_atoms";
import {Button} from "@/components/ui/button.tsx";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";

export const chooseOpenSignal = createSignal<boolean>(false);

export const BackUpChoose = ({
                                 directoryHandle,
                                 overwrite,
                                 restore,
                                 cancel
                             }: {
    directoryHandle: FileSystemDirectoryHandle | null,
    overwrite: (h: FileSystemDirectoryHandle | null) => void;
    restore: (h: FileSystemDirectoryHandle | null) => void;
    cancel?: () => void,
}) => {

    const open = chooseOpenSignal.use()
    const onOpenChange = (isOpen: boolean) => chooseOpenSignal.set(isOpen)

    const {modalPortal} = useModalPortal({open, onOpenChange, backgroundColorOpacity: 0.1, zIndex: 30})
    const {t} = useLanguage("backup");

    return (
        <>
            {modalPortal(
                <div className={"border text-md bg-background text-foreground w-170 h-fit flex flex-col p-4 gap-2 rounded-md"}>
                    <div className={"flex flex-col m-2 text-[16px]"}>
                        <p>{t("A backup already exists in the selected directory.")}</p>
                        <p>{t("Please choose whether to restore from this backup or discard it and overwrite it.")}</p>
                        <p className={"text-red-500"}>{t("Warning: This action cannot be undone.")}</p>
                    </div>
                    <div className={"flex flex-row gap-2 mt-3"}>
                        <Button variant={"outline"} onClick={() => {
                            overwrite(directoryHandle)
                            onOpenChange(false)
                        }}
                                className={"h-10 flex-1 text-[16px] text-red-500 hover:bg-red-500! hover:text-white"}
                        >
                            {t("Discard & Overwrite")}</Button>
                        <Button variant={"outline"} onClick={() => {
                            restore(directoryHandle)
                            onOpenChange(false)
                        }}
                                className={"h-10 flex-1 text-[16px] text-red-500 hover:bg-red-500! hover:text-white"}>
                            {t("Restore from Backup")}</Button>
                    </div>
                    <Button variant={"outline"} onClick={() => {
                        cancel?.()
                        onOpenChange(false)
                    }}
                            className={"h-10 flex-1 text-[16px] hover:bg-sBlue! hover:text-white"}
                    >


                        {t("Cancel")}</Button>
                </div>
            )}
        </>
    )
}