/**
 * https://github.com/tbo47/konva-components
 */
import { Line, LineConfig } from 'konva-es/lib/shapes/Line'
import { Transformer } from 'konva-es/lib/shapes/Transformer'
import { findMinXY, GLOBAL_KONVA_COMPONENTS_CONF, isTouchDevice, unselectAllShapes } from './ScrollableStage'

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

            const scale = (config.transformFollowLayer ? this.getLayer()! : this.getStage()!).scale()
            width = width / scale.x
            height = height / scale.y

            this.adjustPath(width, height)
            this.scaleX(1)
            this.scaleY(1)
        })
        if (this.strokeWidth() < 10) {
            this.hitStrokeWidth(10)
        }
        if (this.strokeWidth() < 10 && isTouchDevice) {
            this.hitStrokeWidth(30)
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
