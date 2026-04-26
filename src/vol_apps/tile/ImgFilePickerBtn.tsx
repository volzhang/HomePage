import {cn} from "@/lib/utils";
import {TextareaField} from "./TextareaField";
import {useLanguageStore} from "@/vol_apps/language/language_store";

type ImgFilePickerBtnProps = {
    fileName?: string;
    onFilePick: (file: File) => void;
    className?: string;
    inputClassName?: string;
};

export const ImgFilePickerBtn = ({
                                     fileName,
                                     onFilePick,
                                     className,
                                     inputClassName,
                                 }: ImgFilePickerBtnProps) => {

    const handleClick = async () => {
        try {
            // @ts-ignore
            const [fileHandle] = await window.showOpenFilePicker({
                types: [
                    {
                        description: "Images",
                        accept: {
                            "image/png": [".png"],
                            "image/jpeg": [".jpg", ".jpeg"],
                            "image/webp": [".webp"],
                            "image/svg+xml": [".svg"],
                            "image/gif": [".gif"],
                            "image/bmp": [".bmp"],
                            "image/x-icon": [".ico"],
                            "image/avif": [".avif"],
                        },
                    },
                ],
                multiple: false,
                excludeAcceptAllOption: true,
            });
            const file = await fileHandle.getFile();
            onFilePick(file);
        } catch (error) {
            // 取消或失败
        }
    };

    const {t} = useLanguageStore()
    const P1 = t("file:")
    const P2 = t("Click to upload a icon")

    const displayValue = fileName ? P1 + `${fileName}` : P2

    return (
        <div className={cn(className,
            "bg-secondary text-secondary-foreground",
            "hover:bg-sBlue"
        )} onClick={handleClick}>
            <TextareaField
                className={cn(inputClassName,
                    "text-lg",
                    "pointer-events-none bg-transparent",
                    "font-medium hover:text-white"
                )}
                disabled={true}
                value={displayValue}
            />
        </div>
    );
};