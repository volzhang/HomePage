import {Button} from "@/components/ui/button";
import {useLanguageAtom} from "@/vol_apps/language/languageAtom.ts";

type ImgFilePickerBtnProps = {
    fileName?: string;
    onFilePick: (file: File) => void;
    className?: string;
    inputClassName?: string;
};

export const ImgFilePickerBtn = ({
                                     onFilePick,
                                     className,
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

    const {t} = useLanguageAtom()
    return (
        <Button variant={"secondary"} className={className} onClick={handleClick}>
            {t("Choose Icon")}
        </Button>
    );
};