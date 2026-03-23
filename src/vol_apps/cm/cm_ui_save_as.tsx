import {useCmStore} from "@/vol_apps/cm/cm_store";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {Save} from "lucide-react";

export const handleCmSaveAs = async (doc: string, name: string, type: string) => {
	try {
		// 检查浏览器是否支持 File System Access API
		//@ts-ignore
		if (!window.showSaveFilePicker) {
			toast.error("您的浏览器不支持直接保存文件，请升级或使用 Chrome/Edge。");
			return;
		}

		// 弹出保存文件选择器，可自定义文件名和扩展名
		//@ts-ignore
		const fileHandle = await window.showSaveFilePicker({
			suggestedName: name,
			types: [
				{
					description: "Text Files",
					accept: {"text/plain": [type]},
				},
			],
		});

		// 创建可写流
		const writable = await fileHandle.createWritable();
		await writable.write(doc);
		await writable.close();

		toast.success("文件保存成功！");
	} catch (err) {
		if (err instanceof Error && err.name !== "AbortError") {
			toast.error("保存失败，请重试。");
		}
	}
};

export const CmUiSaveAsBtn = () => {
	const {doc, name, type} = useCmStore();
	return (
		<Button variant={"outline"} size={"icon"} onClick={() => handleCmSaveAs(doc, name, type)}>
			<Save/>
		</Button>
	);
};