import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter
} from "@/components/ui/dialog";
import {type ReactNode} from "react";

export const DndFileUiModal = (props: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: ReactNode;
	description: ReactNode;
	footer: ReactNode;
}) => {
	const {open, onOpenChange, title, description, footer} = props;
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="min-w-96 w-fit">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{footer && <DialogFooter>{footer}</DialogFooter>}
			</DialogContent>
		</Dialog>
	);
};