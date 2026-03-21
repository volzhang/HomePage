import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

import {cn} from "@/lib/utils";
import {img, useBgStore} from "@/vol_apps/bg/bg_store";
import {useBing} from "@/vol_apps/bg/bg_useBing";
import {ImgFilePickerBtn} from "@/vol_apps/tool/filePicker";
import {blobToString} from "@/vol_apps/tool/isType";
import {Folder} from "lucide-react";
import {useId} from "react";
import {useTranslation} from "react-i18next";

export function BgUi() {
	const {t} = useTranslation("bg");

	const id1 = useId();
	const id2 = useId();
	const id3 = useId();
	const id4 = useId();
	const id5 = useId();
	const id6 = useId();

	const id7 = useId();
	const id8 = useId();
	const id9 = useId();

	const id10 = useId();
	const id11 = useId();
	const id12 = useId();

	const {
		bgRepeat, bgCenter, otherVisible, bgUiVisible, bgSize, bgType,
		setBgType, setBgRepeat, setOtherVisible, setBgCenter, setBgImg, setBgSize, setBgUiVisible
	} = useBgStore();

	const { consumeCacheAndReloadBing, reLoadImgToCache} = useBing()

	return (

		<div className={cn("fixed right-1 top-1 w-64 p-5 gap-5 flex flex-col z-1",
			{"hidden": !bgUiVisible},
			"bg-ui-panel",  //添加类 bg-ui-panel，供全局 CSS 识别。
			)}>
			{/* 上传背景图 */}
			<ImgFilePickerBtn
				onPick={async (file) => {
					void reLoadImgToCache()
					setBgImg(await blobToString(file))
					setBgType("custom")
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
				onValueChange={(value) => {
					if (value === "default") {
						void reLoadImgToCache()
						setBgImg(img)
						setBgRepeat(true)
						setBgSize("auto")
						setBgCenter(false)
					} else if (value === "bing") {
						void consumeCacheAndReloadBing()
						setBgRepeat(false)
						setBgSize("cover")
						setBgCenter(true)
					} else {
						void reLoadImgToCache()
					}
					setBgType(value);
				}}
				className={cn("w-full p-6 gap-4 rounded-md",
					"border border-secondary bg-secondary hover:bg-background",
					"flex flex-col items-start justify-center")}>


				<div className={`flex h-8 items-center gap-2`}>
					<RadioGroupItem value="bing" id={id11}/>
					<Label htmlFor={id11} className={`text-xl`}>
						{t("DailyBing")}
					</Label>
				</div>

				<div className={`flex h-8 items-center gap-2`}>
					<RadioGroupItem value="custom" id={id10}/>
					<Label htmlFor={id10} className={`text-xl`}>
						{t("Custom")}
					</Label>
				</div>

				<div className={`flex h-8 items-center gap-2`}>
					<RadioGroupItem value="default" id={id12}/>
					<Label htmlFor={id12} className={`text-xl`}>
						{t("Reset Defaults")}
					</Label>
				</div>

			</RadioGroup>

			{/* 只看背景 */}
			<RadioGroup
				defaultValue={otherVisible ? "true" : "false"}
				onValueChange={(value) => setOtherVisible(value === "true")}
				className={cn(
					"w-full p-6 gap-4 border rounded-md",
					"flex flex-col items-start justify-center",
					"bg-secondary border-secondary text-secondary-foreground hover:bg-background"
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
					"border-secondary bg-secondary hover:bg-background",
					"flex flex-col items-start justify-center",
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
				className={cn(
					"w-full p-6 gap-4 border rounded-md",
					"border-secondary bg-secondary hover:bg-background",
					"flex flex-col items-start justify-center"
				)}>
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
						"border border-secondary bg-secondary hover:bg-background",
						"flex flex-col items-start justify-center")}>
					<div className={`flex h-8 items-center gap-2`}>
						<RadioGroupItem value="auto" id={id7}/>
						<Label htmlFor={id7} className={`text-xl`}>
							{t("Original Size")}
						</Label>
					</div>

					<div className={`flex h-8 items-center gap-2`}>
						<RadioGroupItem value="contain" id={id8}/>
						<Label htmlFor={id8} className={`text-xl`}>
							{t("Contain")}
						</Label>
					</div>

					<div className={`flex h-8 items-center gap-2`}>
						<RadioGroupItem value="cover" id={id9}/>
						<Label htmlFor={id9} className={`text-xl`}>
							{t("Cover")}
						</Label>
					</div>
				</RadioGroup>
			</div>
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
