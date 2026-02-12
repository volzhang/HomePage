// privacy-policy.tsx
import type {JSX} from "react";

const ExtensionName = "Home Page";
const EMAIL = "volzhang@qq.com";
const WEBSITE = "https://github.com/volzhang/HomePage";
const LAST_UPDATED = "2026-01-21";

type Section = {
	title: string;
	content: JSX.Element;
};

const sections: Section[] = [
	{
		title: "1. Data Collection",
		content: (
			<>
				The browser extension named <strong className="text-black">{ExtensionName}</strong>{" "}
				<strong className="text-black">
					does not collect, store, transmit, or share any personal information or user data whatsoever
				</strong>.
				The extension operates entirely locally within your browser.
			</>
		),
	},
	{
		title: "2. Permissions Explanation",
		content: (
			<>
				Any permissions requested (e.g., access to specific websites) are used solely to enable the core
				functionality of modifying page appearance or behavior, and are{" "}
				<strong>not used to collect, transmit, or store any user data</strong>.
			</>
		),
	},
	{
		title: "3. External Links",
		content: (
			<>
				This extension or its description may contain links to external sites (such as an official website).
				We are not responsible for the content or privacy practices of such external sites.
				<br/>
				Project Website: <a href={WEBSITE} className="text-primary hover:underline">{WEBSITE}</a>
			</>
		),
	},
	{
		title: "4. Contact Information",
		content: (
			<>
				If you have any questions or concerns about this privacy policy or the extension,
				please contact the developer directly:
				<br/>
				Email: <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">{EMAIL}</a>
			</>
		),
	},
	{
		title: "5. Our Commitment",
		content: (
			<>
				We are committed to your privacy.
				The core principle that "{ExtensionName}"{" "} <strong className="text-red-500">
				does not collect user data </strong>
				is a foundational part of its design. <strong className="text-red-500">
				This principle will not change with future updates</strong>.
				We pledge to uphold this no-data-collection policy, ensuring that the extension remains
				a tool that respects and protects your privacy by default.
			</>
		),
	},
];

export default function PrivacyPage() {
	return (
		<div className="min-h-screen bg-background flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
			<article className="max-w-3xl w-full bg-card text-card-foreground rounded-xl shadow-xl p-8 md:p-10 lg:p-12">
				<h1 className="text-3xl md:text-4xl font-bold text-[#0056b3] mb-6 pb-4 border-b">
					Privacy Policy for {ExtensionName}
				</h1>

				<p className="text-muted-foreground mb-10 italic">
					Last Updated: {LAST_UPDATED}
				</p>

				<div className="prose dark:prose-invert prose-sm sm:prose-base max-w-none space-y-9">
					{sections.map((section, idx) => (
						<section key={idx}>
							<h2 className="text-[1.1rem] font-bold text-foreground mb-3 tracking-tight">
								{section.title}
							</h2>
							<div className="text-gray-700 dark:text-gray-300 leading-relaxed text-[0.95rem]">
								{section.content}
							</div>
						</section>
					))}
				</div>

				<div className="mt-12 pt-8 border-t border-border text-sm text-gray-600 dark:text-gray-400">
					<p className="mb-4">
						This privacy policy is subject to change, and any updates will be reflected on this page.
					</p>
					<a
						href="/"
						className="text-primary hover:underline inline-flex items-center gap-1.5 font-medium"
					>
						← Back to Home Page
					</a>
				</div>
			</article>
		</div>
	);
}