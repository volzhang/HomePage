Signal 设计文档

## 设计目标

传统状态管理要求先定义 Store/Atom，再消费状态，产生大量样板代码。  
本系统采用 **Field First** 理念：开发者真正关心的是字段，而不是 Store。

> 先使用字段，再由系统自动组织到 Store 中。

---

## 核心理念

### 1. 像 `useState` 一样简单

- React `useState` 的替代（支持跨组件访问，不自动持久化）

```ts
// 组件外使用
export const themeSignal = createSignal<"light" | "dark">("dark")
// 组件或 hook 内使用
const theme = themeSignal.use()
```

- Zustand Persisting State 的替代（支持跨组件访问，支持 IndexedDB 自动持久化）

```ts
// 组件或 hook 内
// 参数：storeName, fieldName, initialValue
const { theme, setTheme, themeHydrated } = useSignal("themeStore", "theme", "dark");
```

---

### 2. Store 仅是持久化边界

- Store 用于组织和持久化一组字段（如 `styleStore` 包含 `size`、`color` 等）
- 每个 Store 对应 IndexedDB 中的一个独立存储空间
- 持久化以 Store 为单位，仅存储与默认值不同的字段

例如：

```txt
style
 ├─ size
 ├─ color
 └─ opacity

search
 ├─ keyword
 ├─ history
 └─ searchEngine
```

---

### 3. 唯一原语：Signal

系统只保留一种基础状态对象 **Signal**，所有能力都建立在此之上：

- **Signal**  
  基础读写信号。提供 `use` / `set` / `get` / `subscribe` 方法，是状态的最小单元。

- **Derived**  
  派生信号（只读）。依赖其他 Signal 自动计算，依赖稳定，只在结果变化时通知订阅者。

- **Expanded**  
  增强信号。在基础 Signal 上增加了水合、重置、变更检测等能力，是 Store 内部实际使用的单元。它额外提供：

    - `hydrate` / `useHydrated`：控制持久化数据的恢复状态
    - `setDefault` / `reset`：记录默认值并支持一键恢复
    - `isChanged` / `useChanged`：判断当前值是否偏离默认值

没有额外的 Atom、Slice、Proxy 概念，尽可能降低学习成本。

---

### 4. 结构稳定

每个 Store 在初始化时会根据预先注册的槽位数量创建固定数量的空槽位（`SignalSlot`）。  
字段按需激活时，会映射到一个空闲槽位，该绑定关系后续不再变动。

优点：

- **Signal 引用稳定** — 槽位对应的 Signal 对象永不变化，React 组件中订阅的引用永远不变
- **Derived 依赖稳定** — 派生信号依赖的具体 Signal 不会因字段增减而重新创建
- **Subscribe 关系稳定** — 不会因为字段变化而重建整个依赖图，避免不必要重渲染

因为所有槽位在 Store 创建时一次性分配完毕，后续只是“填空”，所以整个依赖体系是完全静态和可预测的。

---

### 5. StoreHub 统一管理

StoreHub 负责：

- 创建和获取 Store
- 解析字段（`storeName`, `fieldName`, `defaultValue`）
- 激活 Signal 并返回对应的 `Expanded` 信号

**注意**：所有 Store 必须在 `STORE_CONFIG` 中提前注册名称和最大槽位数。  
如果运行时需要的字段数超过槽位上限，会直接抛出错误，这保证了结构稳定和内存可控。

开发者无需手动管理 Store 生命周期，只需通过 `useSignal` 访问状态。

---

## 持久化与水合（Hydration）

本系统基于 IndexedDB 实现了自动持久化和水合恢复。

### 自动保存
任何字段变化都会触发防抖后的最小化写入（仅保存与默认值不同的字段），Store 级别控制。

### 水合流程
应用启动时，StoreHub 会为每个 Store 异步读取 IndexedDB 中对应的存档：
1. 如果存在存档，则调用 `store.hydrate(savedState)` 恢复所有值；
2. 如果不存在存档或读取失败，则调用 `store.hydrate()` 将每个激活的字段标记为水合完成（使用默认值）。

### `Hydrated` 状态
每个字段都提供 `xxxHydrated` 布尔值，表示该字段是否已完成水合。  
只有当 `Hydrated` 为 `true` 时，取到的值才是最终可用的持久化状态，在此之前可能仍是默认初始值。

这保证了用户看到的第一个有效渲染就已经携带了上一次关闭前的状态。

---

## 使用方式

### 基础用法

```ts
// 组件或 hook 中
const {
    visible,
    setVisible,
    visibleHydrated
} = useSignal("tagStyle", "visible", true);
```

### 初始化工具（推荐）

当某个 Store 包含多个字段时，使用 `initStoreState` 集中定义默认值：

```ts
// 组件外
export const tagStyleStore = initStoreState({
    storeName: "tagStyle",
    fields: {
        visible: true,
        radius: 8,
        gap: { x: 16, y: 16 },
        backgroundColor: "auto",
        // ... 更多字段
    }
});

// 组件或 hook 中
const {
    visible,
    setVisible,
    visibleHydrated
} = useSignal(tagStyleStore("visible"));
```

> `tagStyleStore("visible")` 实际上返回的是一个元组 `["tagStyle", "visible", true]`，可以直接传给 `useSignal` 或 `getSignal` 的元组形式调用。

**为什么推荐集中配置？**

- **稳定初始值**：确保同一字段在不同组件中被调用时，始终使用同一个默认值，避免因多次激活导致初始值不一致。
- **集中管理初始值**：所有字段的默认值在一个地方定义，修改时只需改一处，便于维护和全局调整。
- **避免“先到先得”陷阱**：系统会以第一次激活时的默认值为准（先到先得），集中配置可以彻底消除因组件加载顺序不同而产生的默认值漂移问题。

---

### 高级用法

#### 不订阅地读取或修改状态

有时只需要读取当前值而不触发组件重新渲染（例如在事件回调中），可以使用 `getSignal`：

```ts
const keywordSignal = getSignal("search", "keyword", "");
// 读取当前值（不订阅）
console.log(keywordSignal.get());
// 修改值（跨组件生效）
keywordSignal.set("new keyword");
```

#### 获取整个 Store 的状态或重置

通过 StoreHub 可以拿到 Store 实例，进而操作整个 Store：

```ts
const store = storeHub.getStore("tagStyle");
// 整个 Store 是否水合完毕
const allHydrated = store.useStoreHydrated();
// 是否有字段偏离默认值
const hasChanges = store.useStoreChanged();
// 一键重置所有字段到默认值
store.reset();
```

---

## 设计总结

这套系统让状态管理尽可能接近：

```ts
useState()
```

的使用体验。

同时获得：

- 全局共享
- 精准订阅
- 自动持久化（IndexedDB）
- 自动水合
- 跨组件访问
- 默认值管理与重置
- 结构稳定的依赖图

的能力。