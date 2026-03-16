import {Button} from "@/components/ui/button";
import {closeSearchPanel, openSearchPanel} from "@codemirror/search";
import type {EditorView} from "@codemirror/view";
import {useState} from "react";
import {Search} from "lucide-react";

export const CmUiSearchPanelOpen = ({viewRef}: { viewRef: any }) => {
	const [open, setOpen] = useState(false);
	const handleClick = () => {
		if (!open) {
			openSearchPanel(viewRef.current as EditorView);

		} else {
			closeSearchPanel(viewRef.current as EditorView);
		}
		setOpen(!open);
	};
	return (
		<Button variant={"outline"} onClick={handleClick} size={"icon"}>
			<Search/>
		</Button>
	);
};