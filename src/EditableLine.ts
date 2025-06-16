/**
 * https://github.com/tbo47/konva-components
 */
import { Line, LineConfig } from 'konva-es/lib/shapes/Line'
import { Transformer } from 'konva-es/lib/shapes/Transformer'
import { GLOBAL_KONVA_COMPONENTS_CONF, unselectAllShapes } from './ScrollableStage'

export interface EditableLineConfig extends LineConfig {
    pattern?: 0 | 1
    transformFollowLayer?: boolean
}

export class EditableLine extends Line {
    #transformer: Transformer
    constructor(config: EditableLineConfig) {
        config.stroke = config.stroke || '#0058ff'
        super(config)
        this.#transformer = GLOBAL_KONVA_COMPONENTS_CONF.transformerNoRotation

        this.on('transformend', (e) => {
            const a = Math.abs(e.target.rotation())
            let { width, height } = this.getClientRect()
            console.log('transformend', width, height, e.target.rotation())
            let scaleX = 1
            let scaleY = 1
            if (config.transformFollowLayer) {
                const layer = this.getLayer()!
                scaleX = layer.scaleX()
                scaleY = layer.scaleY()
            } else {
                const stage = this.getStage()!
                scaleX = stage.scaleX()
                scaleY = stage.scaleY()
            }
            width = width / scaleX
            height = height / scaleY

            this.adjustPath(width, height)
            this.scaleX(1)
            this.scaleY(1)
        })
        this.hitFunc((context) => {
            context.beginPath()
            context.rect(4, 3, this.width() - 15, this.height() - 15)
            context.closePath()
            context.fillStrokeShape(this)
        })
        if (!('ontouchstart' in window)) {
            this.on('mouseover', (e) => (e.target.getStage()!.container().style.cursor = 'move'))
            this.on('mouseout', (e) => (e.target.getStage()!.container().style.cursor = 'default'))
        }
        this.on('click tap', () => {
            const layer = this.#transformer.getLayer()
            if (!layer) {
                this.getLayer()!.add(this.#transformer)
            }
            unselectAllShapes()
            this.#transformer.nodes([this])
            this.draggable(true)
            GLOBAL_KONVA_COMPONENTS_CONF.currentlySelected.push(this)
        })
    }
    adjustPath(width: number, height: number) {
        const points = this.points().map((p, i) => {
            if (i % 2 === 0) {
                p = (p / this.width()) * width
            } else {
                p = (p / this.height()) * height
            }
            return p
        })
        this.points(points)
    }
}
