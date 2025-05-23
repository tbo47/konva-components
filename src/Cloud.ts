import { Path, PathConfig } from 'konva-es/lib/shapes/Path'

/**
 * https://github.com/tbo47/konva-cloud
 * 
 * https://yqnn.github.io/svg-path-editor/#P=m0_0_a_3_3_0_0_1_4_-2_a_4.6_4.6_0_0_1_8_2_m_0_0_a_3_3_0_0_1_4_-2_a_4.6_4.6_0_0_1_8_2_m_0_0_a_3_3_0_0_1_4_-2_a_4.6_4.6_0_0_1_8_2_m_0_0_a_3_3_0_0_1_2_4_a_4.6_4.6_0_0_1_-2_8_m_0_0_a_3_3_0_0_1_2_4_a_4.6_4.6_0_0_1_-2_8_m_0_0_a_3_3_0_0_1_-4_2_a_4.6_4.6_0_0_1_-8_-2_m_0_0_a_3_3_0_0_1_-4_2_a_4.6_4.6_0_0_1_-8_-2_m_0_0_a_3_3_0_0_1_-4_2_a_4.6_4.6_0_0_1_-8_-2_m_0_0_a_3_3_0_0_1_-2_-4_a_4.6_4.6_0_0_1_2_-8_m_0_0_a_3_3_0_0_1_-2_-4_a_4.6_4.6_0_0_1_2_-8_m_0_0
 */
export interface ICloudPattern {
    topPath: string
    topOffset: string
    topWidth: number
    rightPath: string
    rightOffset: string
    bottomPath: string
    bottomOffset: string
    leftPath: string
    leftOffset: string
    leftHeight: number
}
export interface CloudConfig extends PathConfig {
    pattern?: 0 | 1
}

/**
 * https://yqnn.github.io/svg-path-editor/#P=m0_0_a_3_3_0_0_1_4_-2_a_4.6_4.6_0_0_1_8_2_m_0_0_a_3_3_0_0_1_4_-2_a_4.6_4.6_0_0_1_8_2_m_0_0_a_3_3_0_0_1_4_-2_a_4.6_4.6_0_0_1_8_2_m_0_0_a_3_3_0_0_1_2_4_a_4.6_4.6_0_0_1_-2_8_m_0_0_a_3_3_0_0_1_2_4_a_4.6_4.6_0_0_1_-2_8_m_0_0_a_3_3_0_0_1_-4_2_a_4.6_4.6_0_0_1_-8_-2_m_0_0_a_3_3_0_0_1_-4_2_a_4.6_4.6_0_0_1_-8_-2_m_0_0_a_3_3_0_0_1_-4_2_a_4.6_4.6_0_0_1_-8_-2_m_0_0_a_3_3_0_0_1_-2_-4_a_4.6_4.6_0_0_1_2_-8_m_0_0_a_3_3_0_0_1_-2_-4_a_4.6_4.6_0_0_1_2_-8_m_0_0
 */
export const CLOUDS: ICloudPattern[] = [
    {
        topPath: `a 8 8 0 0 1 14 5`,
        topOffset: `m -2 -5`,
        topWidth: 12,
        rightPath: `a 8 8 0 0 1 -5 14`,
        rightOffset: `m 5 -2`,
        bottomPath: `a 8 8 0 0 1 -14 -5`,
        bottomOffset: `m 2 5`,
        leftPath: `a 8 8 0 0 1 5 -14`,
        leftOffset: `m -5 2`,
        leftHeight: 12,
    },
    {
        topPath: `a 3 3 0 0 1 4 -2 a 4.6 4.6 0 0 1 8 2`,
        topOffset: `m 0 0`,
        topWidth: 12,
        rightPath: `a 3 3 0 0 1 2 4 a 4.6 4.6 0 0 1 -2 8`,
        rightOffset: `m 0 0`,
        bottomPath: `a 3 3 0 0 1 -4 2 a 4.6 4.6 0 0 1 -8 -2`,
        bottomOffset: `m 0 0`,
        leftPath: `a 3 3 0 0 1 -2 -4 a  4.6 4.6 0 0 1 2 -8`,
        leftOffset: `m 0 0`,
        leftHeight: 12,
    },
]

/**
 * Cloud shape
 *
 * Example:
 * ```javascript
 * const cloud = new Cloud({
 *     x: 10,
 *     y: 10,
 *     width: 200,
 *     height: 100,
 *     draggable: true,
 *     stroke: '#0058ff',
 *     name: 'clouding',
 * })
 * ```
 *
 * If you want to expand the cloud by dragging the mouse, you can use the following code:
 * ```javascript
 * const width = cursorPos.x - cloud.x()
 * const height = cursorPos.y - cloud.y()
 * cloud.adjustPath(width, height)
 * ```
 */
export class Cloud extends Path {
    #pattern = 0
    constructor(config: CloudConfig) {
        config.name = config.name || 'clouding'
        config.stroke = config.stroke || '#0058ff'
        super(config)
        this.#pattern = config.pattern || 0
        this.adjustPath(config.width || 0, config.height || 0)

        this.on('transformend', (e) => {
            let { width, height } = this.getClientRect()
            const layer = this.getLayer()
            const scaleX = layer?.scaleX() || 1
            const scaleY = layer?.scaleY() || 1
            width = width / scaleX
            height = height / scaleY

            const a = Math.abs(e.target.rotation())
            const sinA = Math.sin((a * Math.PI) / 180)
            const cosA = Math.cos((a * Math.PI) / 180)
            const h = (width * sinA - height * cosA) / (sinA ** 2 - cosA ** 2)
            const w = (width * cosA - height * sinA) / (cosA ** 2 - sinA ** 2)
            this.adjustPath(w, h)
            this.scaleX(1)
            this.scaleY(1)
        })
        this.hitFunc((context) => {
            context.beginPath()
            context.rect(4, 3, this.width() - 15, this.height() - 15)
            context.closePath()
            context.fillStrokeShape(this)
        })
    }
    adjustPath(width: number, height: number) {
        const p = CLOUDS[this.#pattern]
        const topPathCounter = Math.floor(Math.abs(width) / p.topWidth)
        const leftPathCounter = Math.floor(Math.abs(height) / p.leftHeight)
        const path =
            `${p.topPath} ${p.topOffset} `.repeat(topPathCounter) +
            `${p.rightPath} ${p.rightOffset} `.repeat(leftPathCounter) +
            `${p.bottomPath} ${p.bottomOffset} `.repeat(topPathCounter) +
            `${p.leftPath} ${p.leftOffset} `.repeat(leftPathCounter)

        this.setAttr('data', path)
        this.width(width)
        this.height(height)
    }
}
