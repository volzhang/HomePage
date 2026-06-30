
import {Button} from "@/components/ui/button";
import {getFileExt} from "@/vol_apps/tool/action/getFileExt";
import {FolderOpen} from "lucide-react";
import {toast} from "sonner";
import {useSignal} from "@/vol_apps/04_persist_atoms";
import {cmStore} from "@/vol_apps/cm/cm_atom.ts";

export const CmUiOpenDoc = () => {

	const { setDoc } = useSignal(cmStore("doc"));
	const { setName } = useSignal(cmStore("name"));
	const { setType } = useSignal(cmStore("type"));

	const handleClick = async () => {
		try {
			//@ts-ignore
			if (!window.showOpenFilePicker) {
				toast.error("您的浏览器不支持本功能，推荐使用 Chrome/Edge。");
				return;
			}
			//@ts-ignore
			const [fileHandle] = await window.showOpenFilePicker({
				types: [
					{
						description: "Text Files",
						accept: {
							"text/plain": [
								".txt", ".md", ".json",
								".js", ".ts", ".css",
								".jsx", ".tsx",
								".py"
							]
						}
					}
				],
				multiple: false
			});

			const file = await fileHandle.getFile();

			const doc = await file.text();
			const name = file.name
			const ext = getFileExt(file.name);

			setDoc(doc);
			setName(name);
			setType(ext);

			toast.success(`已打开文件：${file.name}`);

		} catch (err) {
			if (err instanceof Error && err.name !== "AbortError") {
				toast.error(`打开文件失败：${err.message}`);
			}
		}
	};

	return (
		<Button
			variant="outline"
			size="icon"
			onClick={handleClick}
		>
			<FolderOpen/>
		</Button>
	);
};