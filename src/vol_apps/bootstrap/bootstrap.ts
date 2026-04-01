type BootstrapData = Record<string, any>;
type BootstrapTask = (data: BootstrapData) => Promise<void> | void;

const bootstrapTasks: BootstrapTask[] = [];

export const addBootstrapTask = (task: BootstrapTask) => {
    bootstrapTasks.push(task);
};

export const runBootstrap = async () => {
    const bootstrapData: BootstrapData = {};

    for (const task of bootstrapTasks) {
        try {
            await task(bootstrapData);
        } catch (error) {
            console.warn("[bootstrap] task failed:", error);
            // 简单兜底：失败就跳过，继续后续任务
        }
    }

    return bootstrapData;
};