### **useDrag（拖拽钩子）**

`useDrag` 钩子用于将组件连接到 **拖拽与放置（DnD）** 系统，使其成为 **拖拽源（drag source）**。  
通过将一个 **规范对象（specification）** 传递给 `useDrag`，你可以声明式地描述：

- 生成的 **可拖拽类型（type）**  
- 代表拖拽源的 **item 对象**  
- 需要 **收集的 props**  
- 其他相关配置  

`useDrag` 钩子返回 **三个关键值**：
1. **收集的 props**（collected props）：可以用于组件内部  
2. **拖拽源 ref**（drag source ref）：必须绑定到 **可拖拽元素** 上  
3. **拖拽预览 ref**（drag preview ref）：可绑定到 **预览元素** 上  

---

### **示例代码**
```javascript
import { useDrag } from 'react-dnd'

function DraggableComponent(props) {
  const [collected, drag, dragPreview] = useDrag(() => ({
    type: 'BOX',
    item: { id: props.id }
  }))

  return collected.isDragging ? (
    <div ref={dragPreview} />
  ) : (
    <div ref={drag} {...collected}>
      ...
    </div>
  )
}
```

---

### **参数说明**
- **`spec`**（规范对象）  
  一个对象，或一个返回规范对象的函数。详细信息见下文。  

- **`deps`**（依赖数组）  
  用于 **缓存计算结果**，类似于 React 的 `useMemo`。  
  - 如果 `spec` 是 **函数**，默认值是 `[]`（空数组）。  
  - 如果 `spec` 是 **对象**，默认值是 `[spec]`（包含整个对象的数组）。  

---

### **返回值**
`useDrag` 返回一个 **数组**，包含以下三个值：

| 索引  | 变量                | 说明                                                               |
| ----- | ------------------- | ------------------------------------------------------------------ |
| `[0]` | **collected**       | 从 `collect` 函数返回的对象（如果 `collect` 未定义，则为空对象）。 |
| `[1]` | **dragSource Ref**  | 绑定到 **可拖拽元素**，使其成为拖拽源。                            |
| `[2]` | **dragPreview Ref** | 绑定到 **预览元素**，用于显示拖拽效果。                            |

---

### **规范对象（Specification Object）**
`spec` 是一个 **对象**，包含以下字段：

#### **1. `type`（必填）**
必须是 **字符串或 Symbol**，表示拖拽类型。  
只有 **相同类型** 的 **放置目标（Drop Target）** 才能接收该拖拽项。

#### **2. `item`（必填，对象或函数）**
表示 **被拖拽的数据**，它会传递给 **放置目标（Drop Target）**。

- **对象格式**（推荐）
  ```js
  item: { id: props.id }
  ```
  仅包含必要的数据，避免存放复杂引用（如函数），以免造成组件间的耦合。

- **函数格式**（可选）
  ```js
  item: () => ({ id: props.id })
  ```
  拖拽 **开始时** 调用，并返回 `item` 数据对象。  
  **返回 `null` 则取消拖拽**。

#### **3. `previewOptions`（可选）**
配置 **拖拽预览** 的选项，通常用于自定义拖拽时的视觉效果。

#### **4. `options`（可选）**
可包含以下属性：

| 属性                      | 说明                                                   |
| ------------------------- | ------------------------------------------------------ |
| **`dropEffect`**          | 指定拖拽效果，支持 `"move"` 或 `"copy"`。              |
| **`end(item, monitor)`**  | 拖拽结束时触发，`monitor.didDrop()` 可检查是否被放置。 |
| **`canDrag(monitor)`**    | 是否允许拖拽，若省略则始终允许。                       |
| **`isDragging(monitor)`** | 自定义 **拖拽中** 的状态，默认仅限于拖拽源组件。       |

**示例：**
```js
isDragging: (monitor) => props.id === monitor.getItem().id
```
适用于 **组件可能被卸载并重新挂载** 的情况（如 **看板应用**）。

#### **5. `collect(monitor, props)`（可选）**
用于 **收集 props**，并返回一个对象，通常用于 **样式或 UI 变化**。

**示例：**
```js
collect: (monitor) => ({
  isDragging: monitor.isDragging()
})
```
这会在拖拽时，将 `isDragging` 作为 **组件的 props** 传递进去。

---

### **总结**
`useDrag` 主要作用：
- 让 **组件变为可拖拽**  
- 提供 **收集数据的方式**  
- 绑定 **拖拽源和拖拽预览**  

**关键点**
- `type` 决定 **拖拽类型**
- `item` 传递 **拖拽数据**
- `collect` 可 **收集 props**
- `drag` 和 `dragPreview` 需绑定 **DOM 元素**

---

