This regroups components build on top of [konva-es](https://www.npmjs.com/package/konva-es). Navigation should look familiar to Figma users.

<p align="center">
<a href="https://tbo47.github.io/" ><img src="https://img.shields.io/badge/created_by-tbo47-blue.svg" alt="Created by tbo47"></a>
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License"></a>
<a href="https://www.npmjs.com/package/konva-es-components" rel="nofollow"><img src="https://img.shields.io/npm/dw/konva-es-components.svg" alt="npm"></a>
</p>

-   [ScrollableStage.ts](src/ScrollableStage.ts) is [this ex](https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html) and [this one](https://konvajs.org/docs/sandbox/Multi-touch_Scale_Stage.html)
-   [Cloud.ts](src/Cloud.ts) let you draw clouds
-   [EditableText.ts](src/EditableText.ts) is [this example](https://konvajs.org/docs/sandbox/Editable_Text.html) wrapped in a component with some changes

[Here is a demo and the code is bellow](https://command-and-control.cloud/#/demo):

```javascript
import { Cloud, EditableText, newComponentTransformer, newTransformerForText, ScrollableStage } from 'konva-es-components'
import { Layer } from 'konva-es/lib/Layer'

const stage = new ScrollableStage({
    container: 'container', // id of container <div>
    width: window.innerWidth,
    height: window.innerHeight,
})

const layer = new Layer()
stage.add(layer)

const tr = newComponentTransformer()
layer.add(tr)
const cloud = new Cloud({ x: 100, y: 120, draggable: true })
layer.add(cloud)
tr.nodes([cloud])

const tt = newTransformerForText()
layer.add(tt)
const txt = new EditableText({ x: 100, y: 300, width: 400, draggable: true, text, transformer: tt })
layer.add(txt)
tt.nodes([txt])
```

Note: to use with [konva](https://www.npmjs.com/package/konva), just change `konva-es` by `konva` in the imports.

Install in your project: `npm install konva-es-components`
