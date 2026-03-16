import {useCmStore} from "@/vol_apps/cm/cm_store";
import {Input} from "@/components/ui/input";
import {useEffect, useState} from "react";

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 128;

export const CmUiFontSize = ()=>{
	const {fontPx, setFontPx} = useCmStore()
	const [inputFontSize, setInputFontSize] = useState<string>(fontPx.toString());

	useEffect(() => {
		setInputFontSize(fontPx.toString());
	}, [fontPx]);

	const handleBlur = () => {
		let newSize = parseFloat(inputFontSize);
		if (isNaN(newSize)) {
			newSize = fontPx; // 无效输入则回退到当前有效值
		} else {
			newSize = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, newSize));
		}
		setFontPx(newSize);                 // 更新 store（触发持久化和编辑器主题更新）
		setInputFontSize(newSize.toString()); // 确保输入框显示边界处理后的值
	};

	return(
		<>
			<Input
				className={"bg-background text-foreground w-16 flex text-right"}
				type="text"
				value={inputFontSize}
				onChange={(e) => setInputFontSize(e.target.value)}
				onBlur={handleBlur}
				onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
			>
			</Input>
		</>
	)
}