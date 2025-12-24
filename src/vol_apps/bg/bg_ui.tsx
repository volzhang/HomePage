"use client";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Slider} from "@/components/ui/slider";
import {cn} from "@/lib/utils";
import {type bgSizeType, bgSizeItems, useBgStore, bgSizeSliderInit} from "@/vol_apps/bg/bg_atom";
import {FileImage} from "lucide-react";
import {useRef, useId, useState, useEffect} from "react";

const normal_style = "flex bg-secondary rounded-md w-full h-full p-4 gap-6 items-center text-xl";

function BgImg() {
	const inputRef = useRef<HTMLInputElement>(null);
	const {setBgImg} = useBgStore();

	async function handleFileUpload(file: File) {
		const blob = file.slice(0, file.size, file.type);
		await setBgImg(blob);
	}

	return (
		<div>
			<Button className={cn(normal_style, "text-2xl")}
					variant={"secondary"}
					onClick={() => inputRef.current!.click()}
			>
				<FileImage className={"scale-160"} color="gray"/>
				上传图片
			</Button>
			<input className={"hidden"} ref={inputRef} type={"file"} accept={"image/*"}
				   onChange={async (e) => {
					   const file = e.currentTarget.files?.[0];
					   if (file) {
						   await handleFileUpload(file);
					   }
				   }}/>
		</div>
	);
}

function BgOnly() {
	const {bgOnly, setBgOnly} = useBgStore();
	const id = useId();
	return (
		<div className={cn(normal_style, "gap-4")}>
			<Switch id={id}
					defaultChecked={bgOnly}
					onCheckedChange={setBgOnly}/>
			<Label htmlFor={id} className={"text-2xl"}>纯背景</Label>
		</div>
	);
}

function BgRepeat() {
	const {bgRepeat, setBgRepeat} = useBgStore();
	const id = useId();
	return (
		<div className={cn(normal_style, "gap-4")}>
			<Switch id={id}
					defaultChecked={bgRepeat}
					onCheckedChange={setBgRepeat}/>
			<Label htmlFor={id} className={"text-2xl"}>重复铺满</Label>
		</div>
	);
}

function BgCenter() {
	const {bgCenter, setBgCenter} = useBgStore();
	const id = useId();
	return (
		<div className={cn(normal_style, "gap-4")}>
			<Switch id={id}
					defaultChecked={bgCenter}
					onCheckedChange={setBgCenter}/>
			<Label htmlFor={id} className={"text-2xl"}>图片居中</Label>
		</div>
	);
}

function BgSizeRadio() {
	const {
		bgSize, setBgSize,
		bgSizeSlider, setBgSizeSlider,
	} = useBgStore();

	const [sliderDisable, setSliderDisable] = useState<boolean>(true);

	useEffect(() => {
		if (bgSize === "custom") {
			setSliderDisable(false);
		} else {
			setSliderDisable(true);
		}
	}, [bgSize]);

	return (
		<>
			<RadioGroup
				defaultValue={bgSize}
				onValueChange={async (value) => await setBgSize(value as bgSizeType)}
				className={cn(normal_style, "flex flex-col items-start")}>
				{bgSizeItems.map(item => (
					<div key={`${item.value}-content`} className={"flex items-center gap-4 p-1"}>
						<RadioGroupItem
							className={"scale-150"}
							key={`${item.value}-item`}
							value={item.value}
							id={`${item.value}-${item.label}`}
						/>
						<Label
							className={"text-2xl"}
							key={`${item.value}-label`}
							htmlFor={`${item.value}-${item.label}`}
						>
							{item.label}
						</Label>
					</div>
				))}
			</RadioGroup>

			<div className={`flex flex-col gap-4`}>
				<Slider
					disabled={sliderDisable}
					defaultValue={[parseInt(bgSizeSliderInit, 10)]}
					min={10}
					max={500}
					step={1}
					className={"w-full"}
					onValueChange={async (value) => await setBgSizeSlider(`${value[0]}%`)}
				/>
				<Label className={`text-xl font-semibold ${sliderDisable ? "opacity-40" : ""}`}>
					自定义比例: {sliderDisable ? "已禁用" : bgSizeSlider}
				</Label>
			</div>
		</>
	);
}

function BgUiBtn() {
	const {setBgUi, setBgOnly} = useBgStore();
	return (
		<Button variant={"default"} className={"p-6 text-2xl"}
				onClick={() => {
					void setBgUi(false);
					void setBgOnly(false);
				}}
		>完成</Button>
	);
}

export function Ui() {
	const {bgOnly, bgUi} = useBgStore();
	return (
		<div className={cn("fixed top-0 right-0 w-64 flex flex-col p-6 gap-4",
			{"z-1": bgOnly},
			{"hidden": !bgUi},
			// {"opacity-100": bgUi, "opacity-10": !bgUi,},
			// 上面是调试时用代码
		)}>
			<BgImg/>
			<BgOnly/>
			<BgCenter/>
			<BgRepeat/>
			<BgSizeRadio/>
			<BgUiBtn/>
		</div>
	);
}