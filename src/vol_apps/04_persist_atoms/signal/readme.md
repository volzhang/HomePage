# Signal Store

## 设计目标

大多数状态管理方案都要求开发者先定义状态容器，再消费状态。

例如：

* 创建 Atom
* 创建 Store
* 导出 Store
* 引用 Store
* 获取字段

这种模式适合大型框架，但对于大量业务状态来说，会产生额外的样板代码和心智负担。

本项目尝试反过来思考：

> 开发者真正关心的不是 Store，而是字段本身。

因此，这套系统采用「Field First」设计。

开发者可以直接声明和消费字段，而不需要预先定义完整的状态结构。

---

## 核心理念

### 1. 状态应该像 useState 一样简单

希望开发体验尽可能接近：

```ts
const [theme, setTheme] = useState("dark")
```

同时保留：

* 全局共享
* 持久化
* 水合
* 跨组件访问

能力。

最终使用方式类似：

```ts
const {
    theme,
    setTheme,
    themeHydrated
} = useSignal(
    "theme",
    "theme",
    "dark"
)
```

开发者只需要关心当前字段。

---

### 2. 先使用，再组织

传统方案：

```txt
Store
 ↓
Field
```

本方案：

```txt
Field
 ↓
Store
```

Store 是存储组织单位。

Field 才是开发者主要接触的对象。

---

### 3. Store 是持久化边界

Store 用于组织和持久化多个字段。

例如：

```txt
theme
 ├─ theme
 ├─ language
 └─ tagStyle

search
 ├─ keyword
 ├─ history
 └─ style
```

每个 Store 对应一个独立存储空间。

持久化以 Store 为单位进行。

---

### 4. Signal 是唯一状态原语

系统只保留一种基础状态对象：

```txt
Signal
```

所有状态能力都建立在 Signal 之上。

包括：

```txt
Signal
 ↓
Derived
 ↓
ExpandedSignal
```

不存在额外的 Atom、Slice、Proxy 等概念。

尽可能降低概念数量。

---

### 5. ExpandedSignal = Signal++

ExpandedSignal 是对基础 Signal 的增强。

它仍然是 Signal。

只是增加了额外能力。

例如：

```txt
hydrate()
isHydrated()
useHydrated()
```

未来也可以继续扩展：

```txt
dirty
validate
metadata
persist
```

而不影响基础 Signal 的简单性。

---

### 6. 结构稳定优先

本系统允许运行时注册字段。

但并不动态创建响应式结构。

Store 在初始化时就创建固定数量的 Signal Slot：

```txt
slot0
slot1
slot2
...
slotN
```

后续仅进行字段激活：

```txt
theme -> slot0
language -> slot1
search -> slot2
```

因此：

* Signal 引用稳定
* Derived 依赖稳定
* Subscribe 关系稳定

不会因为新增字段而重建依赖图。

---

### 7. StoreHub 统一管理

所有 Store 由 StoreHub 管理。

职责：

```txt
StoreHub
 ├─ 创建 Store
 ├─ 获取 Store
 ├─ 解析 Field
 └─ 激活 Signal
```

开发者无需关心 Store 生命周期。

只需要通过：

```ts
useSignal(...)
```

访问状态即可。

---

## 推荐使用方式

优先使用：

```ts
useSignal(
    storeName,
    fieldName,
    defaultValue
)
```

作为唯一入口。

---

推荐：

```ts
const {
    theme,
    setTheme
} = useSignal(
    "theme",
    "theme",
    "dark"
)
```

---

不推荐：

* 手动管理 Signal 生命周期
* 直接操作 Slot
* 绕过 StoreHub 创建状态

这些属于内部实现细节。

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

核心思想可以概括为：

> 用最少的概念，提供接近 useState 的开发体验，并具备全局状态管理能力。
