import {
    Dialog,
    DialogContent,
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
            <DialogContent className="min-w-lg w-fit" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {/* 
                      使用与 DialogDescription 相同的样式格式: "text-sm text-muted-foreground"
                      aria-describedby={undefined} 明确禁用 ARIA 描述警告，避免控制台警告信息
                    */}
                    <div className="text-sm text-muted-foreground">{description}</div>
                </DialogHeader>
                {footer && <DialogFooter>{footer}</DialogFooter>}
            </DialogContent>
        </Dialog>
    );
};