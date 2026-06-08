# Signal 设计文档

## 设计目标

传统状态管理要求先定义 Store/Atom，再消费状态，产生大量样板代码。
本系统采用 Field First 理念：开发者真正关心的是字段，而不是 Store。

> 先使用字段，再由系统自动组织到 Store 中。

---

## 核心理念

### 1. 像 useState 一样简单

理想中的使用方式：

```ts
const { theme, setTheme, themeHydrated } = useSignal("theme", "theme", "dark");
```

同时获得:

* 全局共享
* 自动持久化
* 自动水合
* 跨组件访问

---

### 2. Store 仅是持久化边界

* Store 用于组织和持久化一组字段（如 styleStore 包含 size、color 等）

* 每个 Store 对应 IndexedDB 中的一个独立存储空间

* 持久化以 Store 为单位，仅存储与默认值不同的字段

例如

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

系统只保留一种基础状态对象 Signal，所有能力都建立在此之上：

* Signal：基础信号（use / set / get / subscribe）

* Derived：派生信号，依赖其他信号自动更新

* Expanded：增强的信号，增加了水合能力

没有额外的 Atom、Slice、Proxy 概念，尽可能降低学习成本。

---

### 4. 结构稳定

Store 在初始化时创建固定数量的空槽位（SignalSlot）。
字段按需激活，映射到空闲槽位，后续不再变动。

优点：

* Signal 引用稳定
* Derived 依赖稳定
* Subscribe 关系稳定

不会因为字段增减而重建依赖图。

---

### 5. StoreHub 统一管理

StoreHub 负责：

* 创建和获取 Store

* 解析字段（storeName, fieldName, defaultValue）

* 激活 Signal

开发者无需手动管理 Store 生命周期，只需通过 useSignal 访问状态。

---

### 使用方式

#### 基础用法：

```ts
const {
    visible, 
    setVisible, 
    visibleHydrated
} = useSignal("tagStyle", "visible", true);
```

#### 集中配置(推荐):

当某个 Store 包含多个字段时，使用 createStoreConfig 集中定义默认值：

```ts
export const tagStyleConfig = createStoreConfig({
  storeName: "tagStyle",
  fields: {
    visible: true,
    radius: 8,
    gap: { x: 16, y: 16 },
    backgroundColor: "auto",
    // ... 更多字段
  }
});

```
为什么推荐集中配置？

稳定初始值：确保同一字段在不同组件中被调用时，始终使用同一个默认值，避免因多次激活导致初始值不一致。

集中管理初始值：所有字段的默认值在一个地方定义，修改时只需改一处，便于维护和全局调整。

---

## 设计总结

这套系统追求的不是功能最多。

而是让状态管理尽可能接近：

```ts
useState()
```

的使用体验。

同时获得：

* 全局共享
* 精准订阅
* 自动持久化
* 自动水合
* 跨组件访问

能力。
