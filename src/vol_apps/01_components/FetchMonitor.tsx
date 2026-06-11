import {useFetchTrace, type FetchTrace} from "@/vol_apps/02_hooks/http/useFetchTrace";
import {useEffect, useRef, useState} from "react";
import {formatTimestamp} from "@/vol_apps/03_utils/format/formatTimestamp";
import {formatBytes} from "@/vol_apps/03_utils/format/formatBytes";
import {cn} from "@/lib/utils";

type FetchMonitorProps = {
    url?: string;                // 内部模式时使用的默认 URL
    trace?: FetchTrace;          // 外部传入的 trace，存在时组件变为纯展示模式
};

export const FetchMonitor = ({url = "https://bing.com/th?id=OHR.HedgehogMeadow_ZH-CN8845586473_UHD.jpg", trace: externalTrace}: FetchMonitorProps) => {
    // 内部模式的状态
    const [src, setSrc] = useState<string>(url);
    const {trace: internalTrace, start, cancel} = useFetchTrace(src);

    // 外部传入的 url 变化时同步到内部 src（仅当组件处于内部模式时有用）
    useEffect(() => {
        setSrc(url);
    }, [url]);

    // 决定实际使用的 trace 数据
    const displayTrace = externalTrace ?? internalTrace;

    // 判断是否为图片
    const isImage =
        displayTrace.file &&
        (displayTrace.file.type.startsWith("image") ||
            /\.(png|jpg|jpeg|gif|webp|bmp|svg)/i.test(displayTrace.url ?? ""));

    // 是否为纯展示模式（由外部提供 trace）
    const isDisplayOnly = externalTrace !== undefined;

    // 进度百分比
    const percent =
        displayTrace.total && displayTrace.total > 0
            ? (displayTrace.received / displayTrace.total) * 100
            : null;

    // 文本文件内容提取
    const [jsonText, setJsonText] = useState<string>("");

    useEffect(() => {
        const getText = async () => {
            if (!displayTrace.file) return
            if (isImage) return
            const t = await displayTrace.file.text();
            setJsonText(t);
        };
        void getText();
    }, [displayTrace.file]);



    // 内部模式专用的 textarea 高度自适应（展示模式下会渲染但不可见，无影响）
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };
    useEffect(() => {
        adjustHeight();
    }, [src]);

    // 公共的 trace 信息展示区域
    const renderTraceInfo = () => (
        <>
            <div>sta: {displayTrace.state}</div>
            <div>sts: {displayTrace.status ?? "-"}</div>
            <div>rcv: {formatBytes(displayTrace.received)}</div>
            <div>tot: {formatBytes(displayTrace.total)}</div>
            <div>prg: {percent !== null ? `${percent.toFixed(2)}%` : "unknown"}</div>
            <div>sat: {formatTimestamp(displayTrace.startedAt)}</div>
            <div>eat: {formatTimestamp(displayTrace.endedAt)}</div>
            {displayTrace.file && (
                isImage ?
                    <img
                        src={URL.createObjectURL(displayTrace.file)}
                        alt="result"
                        style={{width: 300}}
                    /> :
                    <p className="break-all">{jsonText}</p>
            )}
        </>
    );

    return (
        <div
            className={cn(
                "flex flex-col items-start justify-start scroll-auto text-foreground bg-background font-mono"
            )}
        >
            <div className="w-full h-1 bg-foreground"></div>

            {!isDisplayOnly && (
                <>
                    <p>url:</p>
                    <textarea
                        onInput={adjustHeight}
                        ref={textareaRef}
                        value={src}
                        className="border w-full overflow-hidden"
                        rows={1}
                        onChange={(e) => setSrc(e.target.value)}
                    />
                </>
            )}

            {renderTraceInfo()}

            {!isDisplayOnly && (
                <>
                    <div className="w-full h-1 bg-foreground"></div>
                    <div className={cn("flex flex-row w-full items-center justify-between")}>
                        <button onClick={start}>开始</button>
                        <button onClick={cancel}>取消</button>
                    </div>
                </>
            )}

            <div className="w-full h-1 bg-foreground"></div>
        </div>
    );
};