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
    constructor(config: EditableArrowConfig) {
        config.stroke = config.stroke || '#0058ff'
        if (config.fill === undefined) config.fill = config.stroke
        super(config)

        if (this.strokeWidth() < 10) {
            this.hitStrokeWidth(10)
        }
        if (this.strokeWidth() < 10 && isTouchDevice) {
            this.hitStrokeWidth(30)
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

        this.on('dragmove', () => {
            const points = this.points()
            this.anchors[0].x(points[0] + this.x() - getAnchorSize() / 2)
            this.anchors[0].y(points[1] + this.y() - getAnchorSize() / 2)
            this.anchors[1].x(points[points.length - 2] + this.x() - getAnchorSize() / 2)
            this.anchors[1].y(points[points.length - 1] + this.y() - getAnchorSize() / 2)
        })
    }

    #addAnchors() {
        const pts = this.points()
        const x = this.x()
        const y = this.y()
        const anchorOffset = getAnchorSize() / 2
        const anchorStart = this.#createAnchor(
            this.name() + ' start',
            pts.at(0)! + x - anchorOffset,
            pts.at(1)! + y - anchorOffset
        )
        this.getLayer()!.add(anchorStart)
        anchorStart.moveToTop()
        anchorStart.on('dragmove', () => {
            const pts = this.points()
            pts[0] = anchorStart.x() - this.x() + anchorOffset
            pts[1] = anchorStart.y() - this.y() + anchorOffset
            this.points(pts)
            this.fire('transformend')
        })
        const anchorEnd = this.#createAnchor(
            this.name() + ' start',
            pts.at(-2)! + x - anchorOffset,
            pts.at(-1)! + y - anchorOffset
        )
        this.getLayer()!.add(anchorEnd)
        anchorEnd.moveToTop()
        anchorEnd.on('dragmove', () => {
            const pts = this.points()
            pts[pts.length - 2] = anchorEnd.x() - this.x() + anchorOffset
            pts[pts.length - 1] = anchorEnd.y() - this.y() + anchorOffset
            this.points(pts)
            this.fire('transformend')
        })
        return [anchorStart, anchorEnd]
    }

    #createAnchor(name = '', x = 0, y = 0) {
        const anchor = new Rect({
            stroke: 'rgb(0, 161, 255)',
            fill: 'white',
            strokeWidth: 1,
            name: name + ' _anchor',
            dragDistance: 0,
            draggable: true,
            width: getAnchorSize(),
            height: getAnchorSize(),
            x,
            y,
        })
        anchor.on('mouseenter', () => (anchor.getStage()!.container().style.cursor = 'pointer'))
        anchor.on('mouseout', () => (anchor.getStage()!.container().style.cursor = 'default'))
        return anchor
    }
}
