// api_ai.tsx
import { useState } from "react";

export const Aiapi = () => {
	const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
	const [input, setInput] = useState("");
	const [reasoning, setReasoning] = useState("");
	const [finalAnswer, setFinalAnswer] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [useTool, setUseTool] = useState(true); // 是否启用工具示例

	const apiKey = "b9556c4ede40406697d436f00a285072.TymFmqF32iFRtnPS";

	const weatherTool = {
		type: "function",
		function: {
			name: "get_weather",
			description: "获取指定城市未来几天的天气预报",
			parameters: {
				type: "object",
				properties: {
					city: { type: "string", description: "城市名称，如 '上海'" },
					date: { type: "string", description: "日期，如 '明天' 或 '2026-02-16'" },
				},
				required: ["city"],
			},
		},
	};

	const sendMessage = async () => {
		if (!input.trim()) return;

		// 添加用户消息到历史
		const newMessages = [...messages, { role: "user", content: input }];
		setMessages(newMessages);
		setInput("");
		setReasoning("");
		setFinalAnswer("");
		setError(null);
		setLoading(true);

		try {
			const requestBody: any = {
				model: "glm-4.7-flash",
				messages: [
					{
						role: "system",
						content: "你是helpful助手，直接给出最终答案，不要输出任何关于工具调用、函数、thinking的过程或额外说明。"
					},
					...newMessages,
				],
				temperature: 0.7,
				max_tokens: 4096,
				stream: true,
			};

			// 如果开启工具，则附加工具定义
			if (useTool) {
				requestBody.tools = [weatherTool];
				requestBody.tool_choice = "auto";
			}

			const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				const errText = await response.text();
				throw new Error(`HTTP ${response.status} - ${errText}`);
			}

			if (!response.body) throw new Error("响应体为空");

			const reader = response.body.getReader();
			const decoder = new TextDecoder("utf-8");

			let assistantMessage = ""; // 累积 assistant content
			let toolCalls = ""; // 简单记录工具调用（调试用）

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				const lines = chunk.split("\n");

				for (const line of lines) {
					if (line.trim() === "") continue;
					if (line.startsWith("data: ")) {
						const data = line.slice(6).trim();
						if (data === "[DONE]") break;

						try {
							const parsed = JSON.parse(data);
							const delta = parsed.choices?.[0]?.delta;

							if (delta) {
								// 思考过程
								if (delta.reasoning_content) {
									setReasoning((prev) => prev + delta.reasoning_content);
								}

								// 正常回答内容
								if (delta.content) {
									assistantMessage += delta.content;
									setFinalAnswer(assistantMessage);
								}

								// 工具调用（简单显示，实际生产中应处理 tool_calls）
								if (delta.tool_calls) {
									toolCalls += JSON.stringify(delta.tool_calls, null, 2) + "\n";
									console.log("Tool call detected:", delta.tool_calls);
								}
							}
						} catch (e) {
							console.warn("JSON 解析失败:", e, data);
						}
					}
				}
			}

			// 对话结束后把 assistant 的回答加入历史
			if (assistantMessage) {
				setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
			}

			// 如果有工具调用信息，也可以显示（这里简单 console）
			if (toolCalls) {
				console.log("检测到工具调用：\n", toolCalls);
			}
		} catch (err: any) {
			setError(err.message || "请求失败");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ padding: "16px", maxWidth: "800px", margin: "0 auto" }}>
			<h2>GLM-4.7-Flash 对话测试（支持工具）</h2>

			{/* 对话历史 */}
			<div
				style={{
					border: "1px solid #ddd",
					borderRadius: "8px",
					padding: "12px",
					height: "400px",
					overflowY: "auto",
					marginBottom: "16px",
					background: "#fafafa",
				}}
			>
				{messages.map((msg, index) => (
					<div
						key={index}
						style={{
							marginBottom: "12px",
							textAlign: msg.role === "user" ? "right" : "left",
						}}
					>
						<strong style={{ color: msg.role === "user" ? "#1976d2" : "#d81e06" }}>
							{msg.role === "user" ? "你：" : "模型："}
						</strong>
						<pre
							style={{
								margin: "4px 0",
								whiteSpace: "pre-wrap",
								wordBreak: "break-all",
								background: msg.role === "user" ? "#e3f2fd" : "#fffde7",
								padding: "8px",
								borderRadius: "6px",
								display: "inline-block",
								maxWidth: "80%",
							}}
						>
              {msg.content}
            </pre>
					</div>
				))}

				{/* 实时流式输出区域 */}
				{(reasoning || finalAnswer) && (
					<div style={{ marginTop: "16px" }}>
						{reasoning && (
							<div>
								<h4 style={{ color: "#666" }}>思考过程：</h4>
								<pre
									style={{
										background: "#f0f0f0",
										padding: "10px",
										borderRadius: "6px",
										whiteSpace: "pre-wrap",
										fontSize: "0.9em",
										color: "#444",
									}}
								>
                  {reasoning}
                </pre>
							</div>
						)}

						{finalAnswer && (
							<div style={{ marginTop: reasoning ? "16px" : "0" }}>
								<h4>回答：</h4>
								<pre
									style={{
										background: "#fff8e1",
										padding: "10px",
										borderRadius: "6px",
										whiteSpace: "pre-wrap",
									}}
								>
                  {finalAnswer}
                </pre>
							</div>
						)}
					</div>
				)}
			</div>

			{/* 输入区 */}
			<div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
					placeholder="输入消息...（例如：上海明天天气怎么样？）"
					disabled={loading}
					style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
				/>
				<button onClick={sendMessage} disabled={loading} style={{ padding: "10px 20px" }}>
					{loading ? "发送中..." : "发送"}
				</button>
			</div>

			{/* 工具开关 + 错误显示 */}
			<div style={{ marginBottom: "12px" }}>
				<label>
					<input type="checkbox" checked={useTool} onChange={(e) => setUseTool(e.target.checked)} />
					启用天气查询工具 (get_weather)
				</label>
			</div>

			{error && <p style={{ color: "red" }}>错误：{error}</p>}
		</div>
	);
};