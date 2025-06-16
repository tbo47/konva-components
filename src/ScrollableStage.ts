/**
 * https://github.com/tbo47/konva-components
 */
import { Shape } from 'konva-es/lib/Shape'
import { Transformer } from 'konva-es/lib/shapes/Transformer'
import { Stage, StageConfig } from 'konva-es/lib/Stage'
import { Vector2d } from 'konva-es/lib/types'

export const isTouchDevice = 'ontouchstart' in window

export const transformerDefaultConfig = {
    rotationSnaps: [0],
    anchorSize: isTouchDevice ? 20 : 10,
    rotationSnapTolerance: 3,
}
export const newTransformerForText = () => {
    return new Transformer({
        ...transformerDefaultConfig,
        enabledAnchors: ['middle-left', 'middle-right'],
        boundBoxFunc: (oldBox, newBox) => {
            newBox.width = Math.max(30, newBox.width)
            return newBox
        },
    })
}
export const newTransformerNoRotation = () => {
    return new Transformer({
        ...transformerDefaultConfig,
        rotateEnabled: false,
    })
}
/**
 * Creates a new Transformer with snap effects and fixed for touch devices.
 */
export const newComponentTransformer = () => {
    return new Transformer({ ...transformerDefaultConfig })
}

export const GLOBAL_KONVA_COMPONENTS_CONF = {
    /**
     * Transformer for editable text shapes.
     */
    editableTextTransformer: newTransformerForText(),
    /**
     * All purpose transformer. For shapes that are not text.
     */
    transformer: newComponentTransformer(),
    transformerNoRotation: newTransformerNoRotation(),
    currentlySelected: [] as Shape[],
}

export const unselectAllShapes = () => {
    getTransformers().forEach((tr) => tr.nodes([]))
    GLOBAL_KONVA_COMPONENTS_CONF.currentlySelected.forEach((shape) => {
        shape.draggable(false)
    })
    GLOBAL_KONVA_COMPONENTS_CONF.currentlySelected = []
}

export const getTransformers = () => {
    return [
        GLOBAL_KONVA_COMPONENTS_CONF.editableTextTransformer,
        GLOBAL_KONVA_COMPONENTS_CONF.transformer,
        GLOBAL_KONVA_COMPONENTS_CONF.transformerNoRotation,
    ]
}

export interface ScrollableStageConfig extends StageConfig {
    scaleBy?: number
}

function getDistance(p1: Vector2d, p2: Vector2d) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

function getCenter(p1: Vector2d, p2: Vector2d) {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
    }
}

export class ScrollableStage extends Stage {
    #lastCenter: Vector2d | null = null
    #lastDist = 0
    #dragStopped = false

    constructor(config: ScrollableStageConfig) {
        config.width = config.width || window.innerWidth
        config.height = config.height || window.innerHeight
        config.draggable = true
        super(config)
        const scaleBy = config.scaleBy ?? 1.02
        this.on('wheel', (e) => {
            e.evt.preventDefault()
            if (e.evt.ctrlKey) {
                // TODO debounce this?
                this.#handleZoom(e.evt, scaleBy)
            } else {
                this.#handlePan(e.evt)
            }
        })
        this.#preventDefaultTouchActions()
        //this.container().addEventListener('contextmenu', (e) => e.preventDefault())

        this.on('touchmove', (e) => {
            e.evt.preventDefault()
            const touch1 = e.evt.touches[0]
            const touch2 = e.evt.touches[1]

            // we need to restore dragging, if it was cancelled by multi-touch
            if (touch1 && !touch2 && !this.isDragging() && this.#dragStopped) {
                this.startDrag()
                this.#dragStopped = false
            }

            if (touch1 && touch2) {
                // if the stage was under Konva's drag&drop
                // we need to stop it, and implement our own pan logic with two pointers
                if (this.isDragging()) {
                    this.#dragStopped = true
                    this.stopDrag()
                }

                const p1 = {
                    x: touch1.clientX,
                    y: touch1.clientY,
                }
                const p2 = {
                    x: touch2.clientX,
                    y: touch2.clientY,
                }

                if (!this.#lastCenter) {
                    this.#lastCenter = getCenter(p1, p2)
                    return
                }
                const newCenter = getCenter(p1, p2)

                const dist = getDistance(p1, p2)

                if (!this.#lastDist) this.#lastDist = dist

                // local coordinates of center point
                const pointTo = {
                    x: (newCenter.x - this.x()) / this.scaleX(),
                    y: (newCenter.y - this.y()) / this.scaleX(),
                }

                const scale = this.scaleX() * (dist / this.#lastDist)

                this.scaleX(scale)
                this.scaleY(scale)

                // calculate new position of the stage
                const dx = newCenter.x - this.#lastCenter.x
                const dy = newCenter.y - this.#lastCenter.y

                const newPos = {
                    x: newCenter.x - pointTo.x * scale + dx,
                    y: newCenter.y - pointTo.y * scale + dy,
                }

                this.position(newPos)

                this.#lastDist = dist
                this.#lastCenter = newCenter
            }
        })

        this.on('touchend', () => {
            this.#lastDist = 0
            this.#lastCenter = null
        })

        this.on('click tap', (e) => {
            if (e.target === this) unselectAllShapes()
        })
    }

    /**
     * Prevent default touch actions to avoid zooming and scrolling
     * Useful for mobile devices
     */
    #preventDefaultTouchActions() {
        document.addEventListener('gesturestart', (e) => e.preventDefault())
        document.addEventListener(
            'touchmove',
            (e) => {
                e.preventDefault()
            },
            { passive: false }
        )
    }

    #handleZoom(evt: WheelEvent, scaleBy: number) {
        const isTrackpad = this.#detectTrackpad(evt)
        const oldScale = this.scaleX()
        const pointer = this.getPointerPosition()
        if (!pointer) return

        const mousePointTo = {
            x: (pointer.x - this.x()) / oldScale,
            y: (pointer.y - this.y()) / oldScale,
        }

        scaleBy = isTrackpad ? scaleBy : scaleBy * 1.2
        const newScale = evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy

        this.scale({ x: newScale, y: newScale })

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        }
        this.position(newPos)
    }

    #handlePan(event: WheelEvent) {
        const { deltaX, deltaY } = event
        const oldPos = this.position()
        this.position({ x: oldPos.x - deltaX, y: oldPos.y - deltaY })
        event.preventDefault()
        event.stopPropagation()
    }

    // https://stackoverflow.com/questions/10744645/detect-touchpad-vs-mouse-in-javascript
    #detectTrackpad(event: WheelEvent) {
        const { deltaY } = event
        if (deltaY && !Number.isInteger(deltaY)) {
            return false
        }
        return true
    }
}

export function findMinXY (pts: number[]) {
    let minX = pts[0]
    let minY = pts[1]
    for (let i = 2; i < pts.length; i += 2) {
        if (pts[i] < minX) minX = pts[i]
        if (pts[i + 1] < minY) minY = pts[i + 1]
    }
    return { minX, minY }
}

