import {Button} from "@/components/ui/button";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";
import {useSignal} from "@/vol_apps/04_persist_atoms";
import {cmStore} from "@/vol_apps/cm/cm_atom.ts";

export const CmUiLineWrapping = () => {
	const {t} = useLanguage()

	const {enableLineWrapping, setEnableLineWrapping} = useSignal(cmStore("enableLineWrapping"));

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