/**
 * https://github.com/tbo47/konva-components
 */
import { Stage, StageConfig } from 'konva-es/lib/Stage'

export interface ScrollableStageConfig extends StageConfig {
    scaleBy?: number
}

export class ScrollableStage extends Stage {
    constructor(config: ScrollableStageConfig) {
        super(config)
        const scaleBy = config.scaleBy ?? 1.01
        this.on('wheel', (e) => {
            e.evt.preventDefault()
            if (e.evt.ctrlKey) {
                this.#handleZoom(e.evt, scaleBy)
            } else {
                this.#handlePan(e.evt)
            }
        })
        this.#preventDefaultTouchActions()
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
        const oldScale = this.scaleX()
        const pointer = this.getPointerPosition()
        if (!pointer) return

        const mousePointTo = {
            x: (pointer.x - this.x()) / oldScale,
            y: (pointer.y - this.y()) / oldScale,
        }

        const newScale = evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy

        this.scale({ x: newScale, y: newScale })

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        }
        this.position(newPos)
    }

    #handlePan(event: WheelEvent) {
        // Simple panning by wheel
        const { deltaX, deltaY } = event
        const oldPos = this.position()
    }
}
