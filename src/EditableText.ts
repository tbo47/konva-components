/**
 * https://github.com/tbo47/konva-components
 */
import { Konva } from 'konva-es/lib/Global'
import { Text, TextConfig } from 'konva-es/lib/shapes/Text'
import { Transformer } from 'konva-es/lib/shapes/Transformer'

export interface EditableTextConfig extends TextConfig {
    transformer: Transformer
}

export const newTransformerForText = () => {
    return new Transformer({
        enabledAnchors: ['middle-left', 'middle-right'],
        rotationSnaps: [0],
        rotationSnapTolerance: 3,
        boundBoxFunc: (oldBox, newBox) => {
            newBox.width = Math.max(30, newBox.width)
            return newBox
        },
    })
}

export class EditableText extends Text {
    transformer: Transformer

    constructor(config: EditableTextConfig) {
        Konva._fixTextRendering = true
        config.fontSize = config.fontSize || 20
        config.width = config.width || 200
        super(config)
        this.transformer = config.transformer
        this.on('transform', () => this.setAttrs({ width: this.width() * this.scaleX(), scaleX: 1 }))
        this.on('transformend', async () => {
            await this.ajustHeight()
            this.fire('textChange')
        })
        this.on('dblclick dbltap', (e) => {
            e.cancelBubble = true
            this.#textNodeOnDblClick()
        })
        if (!('ontouchstart' in window)) {
            this.on('mouseover', (e) => (e.target.getStage()!.container().style.cursor = 'move'))
            this.on('mouseout', (e) => (e.target.getStage()!.container().style.cursor = 'default'))
        }
    }

    async ajustHeight() {
        await this.#textNodeOnDblClick()
        this.#removeTextarea()
    }

    #textarea: HTMLTextAreaElement | null = null

    #handleOutsideClick = (e: Event) => {
        if (e.target !== this.#textarea) {
            this.text(this.#textarea!.value)
            this.#removeTextarea()
        }
    }

    #removeTextarea = () => {
        this.#adjustShapeHeight()
        this.#textarea!.parentNode!.removeChild(this.#textarea!)
        this.#textarea = null
        window.removeEventListener('click', this.#handleOutsideClick)
        window.removeEventListener('touchstart', this.#handleOutsideClick)
        this.show()
        this.transformer.show()
        this.transformer.forceUpdate()
    }

    #textNodeOnDblClick() {
        return new Promise<void>(async (resolve) => {
            let stage = this.getStage()
            if (!stage) {
                await new Promise((resolve) => setTimeout(resolve))
                stage = this.getStage()
            }

            if (!stage) {
                console.error('EditableText: No stage found')
                resolve()
                return
            }

            this.hide()
            this.transformer.hide()

            const textPosition = this.absolutePosition()
            const stageBox = stage.container().getBoundingClientRect()

            const areaPosition = {
                x: stageBox.left + textPosition.x,
                y: stageBox.top + textPosition.y,
            }

            const textarea = document.createElement('textarea')
            this.#textarea = textarea
            document.body.appendChild(textarea)

            textarea.value = this.text()
            textarea.style.position = 'absolute'
            textarea.style.top = areaPosition.y + 'px'
            textarea.style.left = areaPosition.x + 'px'
            const scale = this.getAbsoluteScale().x
            textarea.style.width = this.width() * scale - this.padding() * 2 + 'px'
            // textarea.style.height = this.height() * scale - this.padding() * 2 + 5 + 'px'
            textarea.style.fontSize = this.fontSize() * scale + 'px'
            textarea.style.border = 'none'
            // for debugging
            // textarea.style.border = '1px solid rgb(207, 223, 253)'
            textarea.style.padding = '0px'
            textarea.style.margin = '0px'
            textarea.style.overflow = 'hidden'
            textarea.style.background = 'none'
            textarea.style.outline = 'none'
            textarea.style.resize = 'none'
            textarea.style.lineHeight = this.lineHeight().toString()
            textarea.style.fontFamily = this.fontFamily()
            textarea.style.transformOrigin = 'left top'
            textarea.style.textAlign = this.align()
            textarea.style.color = this.fill().toString()

            const rotation = this.rotation()
            let transform = ''
            if (rotation) {
                transform += 'rotateZ(' + rotation + 'deg)'
            }
            transform += 'translateY(-' + 2 + 'px)'
            textarea.style.transform = transform

            // textarea.style.height = 'auto'
            textarea.style.height = textarea.scrollHeight + 3 + 'px'

            textarea.focus()

            textarea.addEventListener('keydown', (e) => {
                const scale = this.getAbsoluteScale().x
                textarea.style.width = this.width() * scale + 'px'
                textarea.style.height = textarea.scrollHeight + 'px'
                this.#adjustShapeHeight()
                if (e.key === 'Enter' && !e.shiftKey) {
                    this.text(textarea.value)
                    this.#removeTextarea()
                }
                if (e.key === 'Escape') {
                    this.#removeTextarea()
                }
            })

            setTimeout(() => {
                window.addEventListener('click', this.#handleOutsideClick)
                window.addEventListener('touchstart', this.#handleOutsideClick)
                resolve()
            })
        })
    }

    #adjustShapeHeight = () => {
        const scale = this.getAbsoluteScale().x
        // this.height(textarea.scrollHeight - this.fontSize())
        this.height(Math.round(this.#textarea!.scrollHeight / scale))
    }
}
