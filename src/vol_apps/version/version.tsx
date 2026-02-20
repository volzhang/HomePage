import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";

export const fetchVersion = async ():Promise<string> => {
	const res = await fetch("/manifest.json");
	const data = await res.json();
	return data.version || "unknown";
};

export const Version = () => {
	const {t} = useTranslation("version");
	const [version, setVersion] = useState<string>("");

	useEffect(() => {
		const loadVersion = async () => {
			const ver = await fetchVersion();
			setVersion(ver);
		};
		loadVersion().then(() => {});
	}, []);

	return (
		<Button
			variant={"outline"}
			disabled={true}
			className={cn(
				"border-0! ring-0! bg-transparent!",
				"text-foreground!",
			)}>
			{t("Version")}：{version}
		</Button>
	);
};