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
            const stage = this.getStage()
            // stop default scrolling
            e.evt.preventDefault()

            const oldScale = this.scaleX()
            const pointer = this.getPointerPosition()
            if (!pointer) return

            const mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            }

            // how to scale? Zoom in? Or zoom out?
            let direction = e.evt.deltaY > 0 ? 1 : -1

            // when we zoom on trackpad, e.evt.ctrlKey is true
            // in that case lets revert direction
            if (e.evt.ctrlKey) {
                direction = -direction
            }

            const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy

            stage.scale({ x: newScale, y: newScale })

            const newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            }
            stage.position(newPos)
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
}
