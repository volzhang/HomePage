import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";

export const Version = () => {
	const {t} = useTranslation("version");
	const [version, setVersion] = useState<string>("");

	useEffect(() => {
		fetch("/manifest.json")
			.then((res) => res.json())
			.then((data) => setVersion(data.version || "unknown"));
	}, []);

	return (
		<Button
			variant={"outline"}
			disabled={true}
			className={cn(
				"border-0! ring-0! bg-transparent!",
				"text-foreground",
			)}>
			{t("Version")}：{version}
		</Button>
	);
};