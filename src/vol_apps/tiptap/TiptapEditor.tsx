// src/components/TiptapEditor.tsx
import {download} from "@/vol_apps/tool/download";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface TiptapEditorProps {
	className?: string
}

export  const TiptapEditor=({ className }: TiptapEditorProps = {})  => {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3],
				},
			}),
		],
		content: `
      <h1>我的日记</h1>
      <p>${new Date().toLocaleDateString('zh-CN')}，今天想写点什么...</p>
    `,
		editorProps: {
			attributes: {
				class: cn(
					'prose prose-neutral dark:prose-invert',
					'focus:outline-none',
					'max-w-none',
					'min-h-[500px]',
					'p-6',
					'leading-7',
					className
				),
			},
		},
	})

	// 简单示例：获取内容（目前只取纯文本，后续可改成 markdown）
	const handleSave = () => {
		// if (!editor) return
		// const content = editor.getText()
	}

	const handleExport = () => {
		if (!editor) return

		const content = editor.getText()  // 或后续改成 markdown
		const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
		const dataUrl = URL.createObjectURL(blob)

		download(dataUrl, `日记_${new Date().toLocaleDateString('zh-CN')}.txt`)
		setTimeout(() => URL.revokeObjectURL(dataUrl), 100)
	}

	if (!editor) {
		return (
			<div className="border rounded-lg p-8 bg-background animate-pulse">
				<div className="h-10 bg-muted rounded w-1/2 mb-6"></div>
				<div className="h-5 bg-muted rounded w-full mb-3"></div>
				<div className="h-5 bg-muted rounded w-3/4"></div>
			</div>
		)
	}

	return (
		<div className={cn(
			"w-full max-w-4xl mx-auto px-4 py-8",
			className
		)}>
			{/* 标题 + 日期 + 操作按钮 */}
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-bold">日记</h1>

				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="sm"
						onClick={handleExport}
					>
						另存为
					</Button>
					<Button
						size="sm"
						onClick={handleSave}
					>
						保存
					</Button>
				</div>
			</div>

			{/* 编辑器主体 */}
			<div className={cn(
				"border rounded-lg overflow-hidden",
				"bg-background shadow-sm",
				"focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
				"transition-all duration-200"
			)}>
				<EditorContent editor={editor} />
			</div>
		</div>
	)
}