import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

import {cn} from "@/lib/utils";
import {type BgType, type SizeType, img} from "@/vol_apps/bg/bg_store";
import {blobToString} from "@/vol_apps/tool/a2b/blobToString";
import {ImgFilePickerBtn} from "@/vol_apps/tool/action/filePicker";
import {Folder} from "lucide-react";
import {useId} from "react";

export function BgUiSetting(
	{
		bgRepeat, bgCenter, otherVisible, bgUiVisible, bgSize, bgType,
		setBgType, setBgRepeat, setOtherVisible, setBgCenter, setBgImg, setBgSize, setBgUiVisible,
		wallpaperJpgBlob, t,
	}: any
) {
	const id = useId();

	const bgTypeOptions = [
		{value: "bing", label: t("DailyBing")},
		{value: "custom", label: t("Custom")},
		{value: "default", label: t("Reset Defaults")},
	];
	const visibleOptions = [
		{value: "true", label: t("Default View")},
		{value: "false", label: t("Hide Others")},
	];
	const repeatOptions = [
		{value: "repeat", label: t("Repeat")},
		{value: "no-repeat", label: t("Single")},
	];
	const centerOptions = [
		{value: "not-center", label: t("Top Left")},
		{value: "center", label: t("Center")},
	];
	const sizeOptions = [
		{value: "auto", label: t("Original Size")},
		{value: "contain", label: t("Contain")},
		{value: "cover", label: t("Cover")},
	];

	return (
		<div className={cn("fixed right-1 top-1 w-64 p-5 gap-5 flex flex-col z-10",
			{"hidden": !bgUiVisible},
			"bg-ui-panel",  //添加类 bg-ui-panel，供全局 CSS 识别。
		)}>
			{/* 上传背景图 */}
			<ImgFilePickerBtn
				onPick={async (file) => {
					setBgImg(await blobToString(file));
					setBgType("custom");
				}}
				children={
					<Button
						variant={"default"}
						className={cn("text-xl w-full h-16 gap-6 items-center",
							"bg-secondary border-secondary",
							"text-secondary-foreground",
							"hover:bg-background hover:text-secondary-foreground"
						)}>
						<Folder className={`scale-180`}/>
						{t("Upload Image")}
					</Button>
				}/>
			{/* 背景类型 */}
			<RadioGroup
				value={bgType}
				onValueChange={async (value) => {
					if (value === "default") {
						setBgImg(img);
						setBgRepeat(true);
						setBgSize("auto");
						setBgCenter(false);
					} else if (value === "bing") {
						blobToString(wallpaperJpgBlob).then(setBgImg)
						setBgRepeat(false);
						setBgSize("cover");
						setBgCenter(true);
					} else {

					}
					setBgType(value as BgType);
				}}
				className={cn(
					"w-full p-6 gap-4 rounded-md",
					"border border-secondary bg-secondary hover:bg-background",
					"flex flex-col items-start justify-center"
				)}
			>
				{bgTypeOptions.map((opt) => {
					const rid = `${id}-${opt.value}`;
					return (
						<div key={opt.value} className="flex h-8 items-center gap-2">
							<RadioGroupItem value={opt.value} id={rid}/>
							<Label htmlFor={rid} className="text-xl">
								{opt.label}
							</Label>
						</div>
					);
				})}
			</RadioGroup>

			{/* 只看背景 */}
			<RadioGroup
				// 非受控设计： 防止 otherVisible=false 持久化导致 UI 被隐藏且无法恢复
				// 刷新时默认回退到 true，确保始终可见（安全兜底）
				defaultValue={otherVisible ? "true" : "false"}
				onValueChange={(value) => setOtherVisible(value === "true")}
				className={cn(
					"w-full p-6 gap-4 border rounded-md",
					"flex flex-col items-start justify-center",
					"bg-secondary border-secondary text-secondary-foreground hover:bg-background"
				)}
			>
				{visibleOptions.map((opt) => {
					const rid = `${id}-visible-${opt.value}`;
					return (
						<div key={opt.value} className="flex h-8 items-center gap-2">
							<RadioGroupItem value={opt.value} id={rid}/>
							<Label htmlFor={rid} className="text-xl">
								{opt.label}
							</Label>
						</div>
					);
				})}
			</RadioGroup>
			{/* 重复显示 */}
			<RadioGroup
				value={bgRepeat ? "repeat" : "no-repeat"}
				onValueChange={(value) => setBgRepeat(value === "repeat")}
				className={cn(
					"w-full p-6 gap-4 border rounded-md",
					"border-secondary bg-secondary hover:bg-background",
					"flex flex-col items-start justify-center"
				)}
			>
				{repeatOptions.map((opt) => {
					const rid = `${id}-repeat-${opt.value}`;
					return (
						<div key={opt.value} className="flex h-8 items-center gap-2">
							<RadioGroupItem value={opt.value} id={rid}/>
							<Label htmlFor={rid} className="text-xl">
								{opt.label}
							</Label>
						</div>
					);
				})}
			</RadioGroup>
			{/* 居中显示 */}
			<RadioGroup
				value={bgCenter ? "center" : "not-center"}
				onValueChange={(value) => setBgCenter(value === "center")}
				className={cn(
					"w-full p-6 gap-4 border rounded-md",
					"border-secondary bg-secondary hover:bg-background",
					"flex flex-col items-start justify-center"
				)}
			>
				{centerOptions.map((opt) => {
					const rid = `${id}-center-${opt.value}`;
					return (
						<div key={opt.value} className="flex h-8 items-center gap-2">
							<RadioGroupItem value={opt.value} id={rid}/>
							<Label htmlFor={rid} className="text-xl">
								{opt.label}
							</Label>
						</div>
					);
				})}
			</RadioGroup>
			{/* 自定义大小 */}
			<RadioGroup
				value={bgSize}
				onValueChange={(value) => setBgSize(value as SizeType)}
				className={cn(
					"w-full p-6 gap-4 rounded-md",
					"border border-secondary bg-secondary hover:bg-background",
					"flex flex-col items-start justify-center"
				)}
			>
				{sizeOptions.map((opt) => {
					const rid = `${id}-size-${opt.value}`;
					return (
						<div key={opt.value} className="flex h-8 items-center gap-2">
							<RadioGroupItem value={opt.value} id={rid}/>
							<Label htmlFor={rid} className="text-xl">
								{opt.label}
							</Label>
						</div>
					);
				})}
			</RadioGroup>
			<Button
				onClick={() => {
					setBgUiVisible(false);
					setOtherVisible(true);
				}}
				type="button"
				variant={"default"}
				className={cn(
					"h-16 text-xl",
					"bg-secondary border-secondary",
					"text-secondary-foreground",
					"hover:bg-background hover:text-secondary-foreground"
				)}>
				{t("OK")}
			</Button>
		</div>
	);
}
