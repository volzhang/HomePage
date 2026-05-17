import {useFetchTrace} from "../02_hooks/http/useFetchTrace";
import {useEffect, useRef, useState} from "react";
import {formatTimestamp} from "@/vol_apps/02_hooks/format/formatTimestamp";
import {formatBytes} from "@/vol_apps/02_hooks/format/formatBytes";
import {cn} from "@/lib/utils";

export function FetchMonitor(
    {url = "https://bing.com/th?id=OHR.HedgehogMeadow_ZH-CN8845586473_UHD.jpg"}:{url?:string},
) {

    const [src, setSrc] = useState<string>(url);
    const {trace, start, cancel} = useFetchTrace(src);

    useEffect(() => {
        setSrc(url);
    }, [url]);

    const percent =
        trace.total && trace.total > 0
            ? (trace.received / trace.total) * 100
            : null;

    const [jsonText, setJsonText] = useState<string>("");
    useEffect(() => {
        const getText = async () =>{
            if (!trace.file) return
            if (!trace.file.type.startsWith("text")) return
            const t = await trace.file.text();
            setJsonText(t);
        }
        void getText()
    }, [trace.file]);

    const isImage =
        trace.file &&
        (
            trace.file.type.startsWith("image") ||
            /\.(png|jpg|jpeg|gif|webp|bmp|svg)/i.test(src)
        );

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };
    useEffect(() => {
        adjustHeight();
    }, [src]);

    return (
        <div className={cn("flex flex-col items-start justify-start" +
            "scroll-auto text-foreground bg-background font-mono")}>
            <div className={"w-full h-1 bg-foreground"}></div>
            <p>url:</p>
            <textarea onInput={adjustHeight} ref={textareaRef} value={src}
                  className="border w-full overflow-hidden"
                rows={1} onChange={(e) => setSrc(e.target.value)}/>
            <div>sta: {trace.state}</div>
            <div>sts: {trace.status ?? "-"}</div>
            <div>rcv: {formatBytes(trace.received)}</div>
            <div>tot: {formatBytes(trace.total)}</div>
            <div>prg: {percent !== null ? `${percent.toFixed(2)}%` : "unknown"}</div>
            <div>sat: {formatTimestamp(trace.startedAt)}</div>
            <div>eat: {formatTimestamp(trace.endedAt)}</div>
            {
                trace.file && (
                    isImage ? (
                        <img
                            src={URL.createObjectURL(trace.file)}
                            alt="result"
                            style={{ width: 300 }}
                        />
                    ) : trace.file.type.startsWith("text") ? (
                        <p className={"break-all"}>{jsonText}</p>
                    ) : (
                        <p>unknown file type: {trace.file.type || "empty"}</p>
                    )
                )
            }
            <div className={"w-full h-1 bg-foreground"}></div>
            <div className={cn("flex flex-row w-full items-center justify-between")}>
                <button onClick={start}>开始</button>
                <button onClick={cancel}>取消</button>
            </div>
            <div className={"w-full h-1 bg-foreground"}></div>
        </div>
    );
}