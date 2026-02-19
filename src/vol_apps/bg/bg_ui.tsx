import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

import {cn} from "@/lib/utils";
import {sizeItems, useBgStore} from "@/vol_apps/bg/bg_store";
import {ImgFilePickerBtn} from "@/vol_apps/tool/filePicker";
import {blobToString} from "@/vol_apps/tool/isType";
import {Folder} from "lucide-react";
import {useId} from "react";
import {useTranslation} from "react-i18next";

export function BgUi() {
	//i18n
	const {t} = useTranslation("bg");

	//不常用地功能，就不用写了
	//目前代码还凑活，但还有一些优化
	// 1 id
	// 2 统一map来处理RadioGroup选项，统一初始化配置

	const id1 = useId();
	const id2 = useId();
	const id3 = useId();
	const id4 = useId();
	const id5 = useId();
	const id6 = useId();

	const {
		bgRepeat, bgCenter, otherVisible, bgUiVisible, bgSize,
		setBgRepeat, setOtherVisible, setBgCenter, setBgImg, setBgSize, setBgUiVisible
	} = useBgStore();

	return (

		<div className={cn("fixed right-1 top-1 w-64 p-5 gap-5 flex flex-col z-1",
			{"hidden": !bgUiVisible})}>
			{/* 上传背景图 */}
			<ImgFilePickerBtn
				onPick={async (file) => setBgImg(await blobToString(file))}
				children={
					<Button
						variant={"outline"}
						className={"text-xl w-full h-16 gap-6 items-center"}>
						<Folder className={`scale-180`}/>
						{t("Upload Image")}
					</Button>
				}/>
			{/* 只看背景 */}
			<RadioGroup
				defaultValue={otherVisible ? "true" : "false"}
				onValueChange={(value) => setOtherVisible(value === "true")}
				className={cn(
					"w-full p-6 gap-4 border rounded-md",
					"flex flex-col items-start justify-center",
					"bg-secondary border-secondary text-secondary-foreground"
				)}>
				<div className={"flex h-8 items-center gap-2"}>
					<RadioGroupItem value="true" id={id1}/>
					<Label htmlFor={id1} className={"text-xl"}>
						{t("Default View")}
					</Label>
				</div>
				<div className={`flex h-8 items-center gap-2`}>
					<RadioGroupItem value="false" id={id2}/>
					<Label htmlFor={id2} className={"text-xl"}>
						{t("Hide Others")}
					</Label>
				</div>
			</RadioGroup>
			{/* 重复显示 */}
			<RadioGroup
				value={bgRepeat ? "repeat" : "no-repeat"}
				onValueChange={(value) => setBgRepeat(value === "repeat")}
				className={cn(
					"w-full p-6 gap-4 border rounded-md ",
					"border-secondary bg-secondary",
					"flex flex-col items-start justify-center"
				)}>
				<div className={"flex h-8 items-center gap-2"}>
					<RadioGroupItem value="repeat" id={id3}/>
					<Label htmlFor={id3} className={"text-xl"}>
						{t("Repeat")}
					</Label>
				</div>
				<div className={"flex h-8 items-center gap-2"}>
					<RadioGroupItem value="no-repeat" id={id4}/>
					<Label htmlFor={id4} className={"text-xl"}>
						{t("Single")}
					</Label>
				</div>
			</RadioGroup>
			{/* 居中显示 */}
			<RadioGroup
				value={bgCenter ? "center" : "not-center"}
				onValueChange={(value) => setBgCenter(value === "center")}
				className={
					`w-full p-6 gap-4 border rounded-md border-secondary bg-secondary
							flex flex-col items-start justify-center`}>
				<div className={`flex h-8 items-center gap-2`}>
					<RadioGroupItem value="not-center" id={id6}/>
					<Label htmlFor={id6} className={`text-xl`}>
						{t("Top Left")}
					</Label>
				</div>
				<div className={`flex h-8 items-center gap-2`}>
					<RadioGroupItem value="center" id={id5}/>
					<Label htmlFor={id5} className={`text-xl`}>
						{t("Center")}
					</Label>
				</div>
			</RadioGroup>
			{/* 自定义大小 */}
			<div>
				<RadioGroup
					value={bgSize}
					onValueChange={(value) => setBgSize(value)}
					className={cn("w-full p-6 gap-4 rounded-md",
						"border border-secondary bg-secondary",
						"flex flex-col items-start justify-center")}>
					{sizeItems.map(item => (
						<div key={`${item.value}-content`}
							 className={`flex h-8 items-center gap-2`}>
							<RadioGroupItem
								key={`${item.value}-item`}
								value={item.value}
								id={`${item.value}-${item.label}`}
							/>
							<Label
								className="h-full w-full text-xl"
								key={`${item.value}-label`}
								htmlFor={`${item.value}-${item.label}`}
							>
								{item.label}
							</Label>
						</div>
					))}
				</RadioGroup>
			</div>
			<Button
				onClick={() => {
					setBgUiVisible(false);
					setOtherVisible(true);
				}}
				type="button"
				variant={"outline"}
				className={`h-16 text-xl`}>
				{t("OK")}
			</Button>
		</div>
	);
}
