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
import { Cloud, EditableText, ScrollableStage } from 'konva-es-components'
import { Layer } from 'konva-es/lib/Layer'

const stage = new ScrollableStage({
    container: 'container', // id of container <div>
    width: window.innerWidth,
    height: window.innerHeight,
})

const layer = new Layer()
stage.add(layer)

const txt = new EditableText({ x: 30, y: 30, width: 400, text: "This is a text" })
layer.add(txt)
txt.on('dragend transformend', (e) => console.log(e))

const cloud = new Cloud({ x: 100, y: 360 })
layer.add(cloud)
cloud.on('dragend transformend', (e) => console.log(e))

const line = new EditableLine({ x: 30, y: 630, points: [0, 100, 20, 40, 370, 0] })
layer.add(line)

const arrow = new EditableArrow({ x: 30, y: 730, points: [0, 100, 370, 0] })
layer.add(arrow)
```

Note: to use with [konva](https://www.npmjs.com/package/konva), just change `konva-es` by `konva` in the imports.

Install in your project: `npm install konva-es-components`
