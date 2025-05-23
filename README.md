This regroups components build on top of [konva-es](https://www.npmjs.com/package/konva-es).

[![NPM package](https://img.shields.io/npm/dw/konva-es-components.svg?logo=npm&logoColor=fff&label=NPM+package&color=limegreen)](https://www.npmjs.com/package/konva-es-components)

-   [ScrollableStage.ts](src/ScrollableStage.ts) is [this example](https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html)
-   [Cloud.ts](src/Cloud.ts) let you draw clouds
-   [EditableText.ts](src/EditableText.ts) is [this example](https://konvajs.org/docs/sandbox/Editable_Text.html) wrapped in a component with some changes

[Here is a demo and the code is bellow](https://control-and-command.com/#/demo):

```javascript
import { Cloud, EditableText, newTransformerForText, ScrollableStage } from 'konva-es-components'
import { Layer } from 'konva-es/lib/Layer'
import { Transformer } from 'konva-es/lib/shapes/Transformer'


const stage = new ScrollableStage({
    container: 'container', // id of container <div>
    width: window.innerWidth,
    height: window.innerHeight,
    scaleBy: 1.02, // how strong is the zoom
})

const layer = new Konva.Layer()
stage.add(layer)

const tr = new Konva.Transformer()
layer.add(tr)
const cloud = new Cloud({ x: 100, y: 120, draggable: true })
layer.add(cloud)
tr.nodes([cloud])

const tt = newTransformerForText()
layer.add(tt)
const txt = new EditableText({ x: 100, y: 300, draggable: true, text: 'Example', transformer: tt })
layer.add(txt)
tt.nodes([txt])
```

Note: to use with [konva](https://www.npmjs.com/package/konva), just change `konva-es` by `konva` in the imports.
