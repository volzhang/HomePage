import {Button} from "@/components/ui/button";
import {useCmStore} from "@/vol_apps/cm/cm_store";
import {useTranslation} from "react-i18next";

export const CmUiLineWrapping = () => {
	const {t} = useTranslation("codemirror")

	const {enableLineWrapping, setEnableLineWrapping} = useCmStore();

	const buttonText = enableLineWrapping
		? t("Word Wrap")
		: t("No Wrap");

	return (
		<>
			<Button variant={"outline"} className={"w-30"}
					onClick={() => setEnableLineWrapping(!enableLineWrapping)}
			>
				{buttonText}
			</Button>
		</>
	);
};