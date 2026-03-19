import {Button} from "@/components/ui/button";
import {useCmStore} from "@/vol_apps/cm/cm_store";

export const CmUiLineWrapping = () => {
	const {enableLineWrapping, setEnableLineWrapping} = useCmStore();

	const buttonText = enableLineWrapping
		? "Word Wrap"
		: "No Wrap";

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