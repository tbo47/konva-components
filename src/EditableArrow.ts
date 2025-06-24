/**
 * https://github.com/tbo47/konva-components
 */
import { Arrow, ArrowConfig } from 'konva-es/lib/shapes/Arrow'
import { Rect } from 'konva-es/lib/shapes/Rect'
import { getAnchorSize, GLOBAL_KONVA_COMPONENTS_CONF, isTouchDevice, unselectAllShapes } from './ScrollableStage'

export interface EditableArrowConfig extends ArrowConfig {
    transformFollowLayer?: boolean
}

export class EditableArrow extends Arrow {
    anchors: Rect[] = []
    transformFollowLayer = false
    constructor(config: EditableArrowConfig) {
        config.stroke = config.stroke || '#0058ff'
        if (config.fill === undefined) config.fill = config.stroke
        super(config)
        this.transformFollowLayer = config.transformFollowLayer || false
        if (this.strokeWidth() < 20) {
            this.hitStrokeWidth(20)
        }
        if (this.strokeWidth() < 20 && isTouchDevice) {
            this.hitStrokeWidth(50)
        }
        if (!isTouchDevice) {
            this.on('mouseover', (e) => (e.target.getStage()!.container().style.cursor = 'move'))
            this.on('mouseout', (e) => (e.target.getStage()!.container().style.cursor = 'default'))
        }
        this.on('click tap', () => {
            unselectAllShapes()
            GLOBAL_KONVA_COMPONENTS_CONF.currentlySelected.push(this)
            this.moveToTop()
            this.draggable(true)
            this.anchors = this.#addAnchors()
        })

        let optiIndex = 0
        const dragMoveAction = (optimize = true) => {
            if (optimize && optiIndex++ % 6 !== 0) return
            const scale = (this.transformFollowLayer ? this.getLayer()! : this.getStage()!).scale()
            const points = this.points()
            this.anchors[0].x(points[0] + this.x() - getAnchorSize(scale.x) / 2)
            this.anchors[0].y(points[1] + this.y() - getAnchorSize(scale.y) / 2)
            this.anchors[1].x(points[points.length - 2] + this.x() - getAnchorSize(scale.x) / 2)
            this.anchors[1].y(points[points.length - 1] + this.y() - getAnchorSize(scale.y) / 2)
        }
        this.on('dragmove', () => dragMoveAction())
        this.on('dragend', () => dragMoveAction(false))
    }

    #addAnchors() {
        const pts = this.points()
        const x = this.x()
        const y = this.y()
        let optiIndex = 0
        const scale = (this.transformFollowLayer ? this.getLayer()! : this.getStage()!).scale()
        const anchorOffset = getAnchorSize(scale.x) / 2
        const anchorStart = this.#createAnchor(
            this.name() + ' start',
            pts.at(0)! + x - anchorOffset,
            pts.at(1)! + y - anchorOffset
        )
        this.getLayer()!.add(anchorStart)
        anchorStart.moveToTop()
        anchorStart.on('dragstart', () => {
            this.draggable(false)
        })
        const anchorDragAction = (optimize = true) => {
            if (optimize && optiIndex++ % 6 !== 0) return
            const pts = this.points()
            pts[0] = anchorStart.x() - this.x() + anchorOffset
            pts[1] = anchorStart.y() - this.y() + anchorOffset
            this.points(pts)
        }
        anchorStart.on('dragmove', () => anchorDragAction())
        anchorStart.on('dragend', () => {
            anchorDragAction(false)
            this.draggable(true)
            this.fire('transformend')
        })
        const anchorEnd = this.#createAnchor(
            this.name() + ' start',
            pts.at(-2)! + x - anchorOffset,
            pts.at(-1)! + y - anchorOffset
        )
        this.getLayer()!.add(anchorEnd)
        anchorEnd.moveToTop()
        anchorEnd.on('dragstart', () => {
            this.draggable(false)
        })
        const anchorDragActionEnd = (optimize = true) => {
            if (optimize && optiIndex++ % 6 !== 0) return
            const pts = this.points()
            pts[pts.length - 2] = anchorEnd.x() - this.x() + anchorOffset
            pts[pts.length - 1] = anchorEnd.y() - this.y() + anchorOffset
            this.points(pts)
        }
        anchorEnd.on('dragmove', () => anchorDragActionEnd())
        anchorEnd.on('dragend', () => {
            anchorDragActionEnd(false)
            this.draggable(true)
            this.fire('transformend')
        })
        return [anchorStart, anchorEnd]
    }

    #createAnchor(name = '', x = 0, y = 0) {
        const scale = (this.transformFollowLayer ? this.getLayer()! : this.getStage()!).scale()

        const anchor = new Rect({
            stroke: 'rgb(0, 161, 255)',
            fill: 'white',
            strokeWidth: 1,
            name: name + ' _anchor',
            dragDistance: 0,
            draggable: true,
            width: getAnchorSize(scale.x),
            height: getAnchorSize(scale.y),
            x,
            y,
        })
        if (!isTouchDevice) {
            anchor.on('mouseenter', () => (anchor.getStage()!.container().style.cursor = 'pointer'))
            anchor.on('mouseout', () => (anchor.getStage()!.container().style.cursor = 'default'))
        }
        return anchor
    }
}
