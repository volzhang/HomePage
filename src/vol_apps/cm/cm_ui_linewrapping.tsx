import {Button} from "@/components/ui/button";
import {useCmStore} from "@/vol_apps/cm/cm_store";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";

export const CmUiLineWrapping = () => {
	const {t} = useLanguage()

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