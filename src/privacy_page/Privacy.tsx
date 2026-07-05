import {get} from "idb-keyval";
import {useEffect, useState} from "react";
import type {JSX} from "react";

const ExtensionNameCN = "主页";
const ExtensionNameEN = "Home Page";
const EMAIL = "volzhang@qq.com";
const WEBSITE = "https://github.com/volzhang/HomePage";

const LAST_UPDATED = "2026-01-21";

type Section = {
    title: string;
    content: JSX.Element;
};

type Lang = "en" | "zh";

const ui = {
    en: {
        lastUpdated: "Last Updated",
        back: "← Back to Home Page",
        footer:
            "This privacy policy is subject to change, and any updates will be reflected on this page.",
        switchEn: "EN",
        switchZh: "中文",
    },
    zh: {
        lastUpdated: "最后更新",
        back: "← 返回 主页",
        footer: "本隐私政策可能会更新，任何变更都会在此页面发布。",
        switchEn: "EN",
        switchZh: "中文",
    },
};

const contentMap: Record<Lang, Section[]> = {
    zh: [
        {
            title: "1. 项目初衷",
            content: (
                <>
                    许多主页扩展要么依赖云端且功能复杂。 <br/>
                    要么只是简单工具，缺少自定义能力与设计感。 <br/>
                    我决定写这个插件填补这一空白。 <br/>
                    隐私优先。美观干净。可自定义。
                </>
            ),
        },
        {
            title: "2. 权限说明",
            content: (
                <>
                    所有请求的权限仅用于核心功能。 <br/>
                    <strong>
                        所有数据都在用户设备内，不会收集或上传任何用户数据。
                    </strong>
                </>
            ),
        },
        {
            title: "3. 透明性",
            content: (
                <>
                    项目源码已在 GitHub 开源，用于透明与公开审查。 <br/>
                    <a href={WEBSITE} className="text-xs italic hover:underline">
                        {WEBSITE}
                    </a>
                </>
            ),
        },
        {
            title: "4. 承诺与联系",
            content: (
                <>
                    我认为： <br/>
                    主页工具不应该以隐私换取便利。 <br/>
                    <br/>
                    {ExtensionNameCN}插件 不收集、不存储、不传输任何用户数据。 <br/>
                    这是项目的核心原则。{" "}
                    <strong>未来版本不会改变这一点。</strong> <br/>
                    <br/>
                    欢迎联系：{" "}
                    <a href={`mailto:${EMAIL}`} className="text-xs italic hover:underline">
                        {EMAIL}
                    </a>
                </>
            ),
        },
    ],

    en: [
        {
            title: "1. Origin & Purpose",
            content: (
                <>
                    Many homepage extensions are either cloud-based and feature-heavy. <br/>
                    Others are simple tools with limited customization and basic design. <br/>
                    I built this extension to fill that gap. <br/>
                    Privacy-first. Clean. Customizable.
                </>
            ),
        },
        {
            title: "2. Permissions",
            content: (
                <>
                    All requested permissions are used only for core functionality. <br/>
                    <strong>
                        All data stays on the user’s device.
                        Nothing is collected or transmitted.
                    </strong>
                </>
            ),
        },
        {
            title: "3. Transparency",
            content: (
                <>
                    The source code is open on GitHub for transparency and public review. <br/>
                    <a href={WEBSITE} className="text-xs italic hover:underline">
                        {WEBSITE}
                    </a>
                </>
            ),
        },
        {
            title: "4. Commitment & Contact",
            content: (
                <>
                    I believe: <br/>
                    a homepage tool should not trade privacy for convenience. <br/>
                    <br/>
                    {ExtensionNameEN} extension does not collect, store, transmit, or share any user data. <br/>
                    This is a core design principle.{" "}
                    <strong>It will not change in future updates.</strong> <br/>
                    <br/>
                    Contact:{" "}
                    <a href={`mailto:${EMAIL}`} className="text-xs italic hover:underline">
                        {EMAIL}
                    </a>
                </>
            ),
        },
    ],
};

export default function PrivacyPage() {
	const [lang, setLang] = useState<Lang>("en");

	const hydration = async () => {
		const store = await get("language") as
			| undefined
			| { state?: { language?: "en" | "cn" } };
		console.log("store", store);
		const saved = store?.state?.language;
		if (saved === "en") setLang("en");
		if (saved === "cn") setLang("zh");
	}

	useEffect(() => {
		void hydration()
	}, []);

    const sections = contentMap[lang];

    return (
        <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <article className="max-w-3xl w-full bg-card text-card-foreground rounded-xl shadow-xl p-8 md:p-10 lg:p-12">

                {/* language switch */}
                <div className="flex gap-2 mb-6 text-sm">
                    <button onClick={() => setLang("en")}>
                        {ui[lang].switchEn}
                    </button>
                    <button onClick={() => setLang("zh")}>
                        {ui[lang].switchZh}
                    </button>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-[#0056b3] mb-6 pb-4 border-b">
                    {lang === "en"
                        ? `Privacy Policy for ${ExtensionNameEN}`
                        : `${ExtensionNameCN} 隐私政策`}
                </h1>

                <p className="text-muted-foreground mb-10 italic">
                    {ui[lang].lastUpdated}: {LAST_UPDATED}
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
                    <p className="mb-4">{ui[lang].footer}</p>

                    <a
                        href="index.html"
                        className="text-primary hover:underline inline-flex items-center gap-1.5 font-medium"
                    >
                        {ui[lang].back}
                    </a>
                </div>
            </article>
        </div>
    );
}