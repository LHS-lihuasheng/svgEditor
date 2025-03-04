#### `useDrop`
`useDrop` 钩子用于将组件接入 DnD 系统，使其成为一个放置目标（Drop Target）。通过传入 **规范对象（spec）**，可以声明式地指定：
- 可接受的数据类型（accept）
- 需要收集的属性（props）
- 其他可选配置

`useDrop` 返回一个数组，包含：
1. **收集的属性**（collected props）
2. **放置目标的 `ref`**，需绑定到可放置的 DOM 元素上

##### **示例代码**
```jsx
import { useDrop } from 'react-dnd'

function MyDropTarget(props) {
  const [collectedProps, drop] = useDrop(() => ({
    accept
  }))

  return <div ref={drop}>Drop Target</div>
}
```

##### **参数**
- **spec（规范对象）**：用于描述放置行为的对象，或返回该对象的函数（详见下文）
- **deps（依赖数组）**：用于优化性能，类似于 React 内置的 `useMemo`。默认情况下，函数 `spec` 使用 `[]`，对象 `spec` 使用 `[spec]`。

##### **返回值**
返回一个数组，包含：
1. **收集的属性**（collected props）：从 `collect` 函数中收集的属性对象，若未定义 `collect`，则返回空对象 `{}`。
2. **放置目标 `ref`**（drop target ref）：用于连接放置目标，必须绑定到可放置的 DOM 元素上。

##### **规范对象（spec）属性**
- `accept`（**必填**）：`string`、`symbol` 或 **数组**，指定此放置目标能接受的拖拽源类型。
- `options`（**可选**）：普通对象，包含：
  - `arePropsEqual(props, otherProps)`（可选）：用于优化性能，减少不必要的组件更新。
- `drop(item, monitor)`（**可选**）：当有兼容的拖拽项被放置时调用，可返回 `undefined` 或一个普通对象作为 `drop` 结果，结果会在 `monitor.getDropResult()` 中提供给 `useDrag` 端。
- `hover(item, monitor)`（**可选**）：当有拖拽项悬停在此组件上时调用，可使用 `monitor.isOver({ shallow: true })` 判断是否为当前目标（排除嵌套情况）。
- `canDrop(item, monitor)`（**可选**）：判断是否允许放置，例如基于 `props` 或 `monitor.getItem()` 进行动态条件判断。
- `collect(monitor, props)`（**可选**）：收集函数，返回对象中的属性会注入组件 `props`。

---

### **总结**
| Hook      | 作用                    | 主要参数                               | 返回值                                      |
| --------- | ----------------------- | -------------------------------------- | ------------------------------------------- |
| `useDrag` | 使组件成为 **拖拽源**   | `type`（拖拽类型）, `item`（拖拽数据） | `[collectedProps, dragRef, dragPreviewRef]` |
| `useDrop` | 使组件成为 **放置目标** | `accept`（接受的类型）                 | `[collectedProps, dropRef]`                 |

`useDrag` 主要用于定义可拖拽的组件，而 `useDrop` 用于定义可接收拖拽组件的放置区域。两者结合可以实现完整的拖拽交互。