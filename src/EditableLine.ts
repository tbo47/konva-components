/**
 * https://github.com/tbo47/konva-components
 */
import { Line, LineConfig } from 'konva-es/lib/shapes/Line'
import { Transformer } from 'konva-es/lib/shapes/Transformer'
import { findMinXY, GLOBAL_KONVA_COMPONENTS_CONF, unselectAllShapes } from './ScrollableStage'

export interface EditableLineConfig extends LineConfig {
    transformFollowLayer?: boolean
}

export class EditableLine extends Line {
    #transformer: Transformer
    constructor(config: EditableLineConfig) {
        config.stroke = config.stroke || '#0058ff'
        super(config)
        this.#transformer = GLOBAL_KONVA_COMPONENTS_CONF.transformerNoRotation

        this.on('transformend', (e) => {
            let { width, height } = this.getClientRect()
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
        if (this.strokeWidth() < 10) {
            this.hitStrokeWidth(10)
        }
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
            this.moveToTop()
        })
    }
    adjustPath(width: number, height: number) {
        const pts = this.points()
        let offsetX = 0
        let offsetY = 0
        if (this.x() === 0 && this.y() === 0 && pts.length > 3) {
            // the points are in absolute coordinates, so we need to adjust the rectangle
            const { minX, minY } = findMinXY(pts)
            offsetX = minX
            offsetY = minY
        }
        const points = pts.map((p, i) => {
            p -= i % 2 === 0 ? offsetX : offsetY
            if (i % 2 === 0) {
                p = (p / this.width()) * width
            } else {
                p = (p / this.height()) * height
            }
            p += i % 2 === 0 ? offsetX : offsetY
            return p
        })
        this.points(points)
    }
}
