/**
 * https://github.com/tbo47/konva-components
 */
import { Shape } from 'konva-es/lib/Shape'
import { Transformer } from 'konva-es/lib/shapes/Transformer'
import { EditableArrow } from './EditableArrow'

export const isTouchDevice = 'ontouchstart' in window

export function getAnchorSize(scale = 1) {
    return (isTouchDevice ? 20 : 10) / scale
}

// Utility debounce function
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => fn(...args), delay)
    }
}

export const transformerDefaultConfig = {
    rotationSnaps: [0],
    anchorSize: getAnchorSize(),
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

export const resetGlobalKonvaComponentsConf = () => {
    GLOBAL_KONVA_COMPONENTS_CONF.editableTextTransformer = newTransformerForText()
    GLOBAL_KONVA_COMPONENTS_CONF.transformer = newComponentTransformer()
    GLOBAL_KONVA_COMPONENTS_CONF.transformerNoRotation = newTransformerNoRotation()
    GLOBAL_KONVA_COMPONENTS_CONF.currentlySelected = []
}

export const unselectAllShapes = () => {
    getTransformers().forEach((tr) => tr.nodes([]))
    GLOBAL_KONVA_COMPONENTS_CONF.currentlySelected.forEach((shape) => {
        shape.draggable(false)
        const arrow = shape as EditableArrow
        arrow.anchors?.forEach((anchor) => anchor.destroy())
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
export function findMinXY(pts: number[]) {
    let minX = pts[0]
    let minY = pts[1]
    for (let i = 2; i < pts.length; i += 2) {
        if (pts[i] < minX) minX = pts[i]
        if (pts[i + 1] < minY) minY = pts[i + 1]
    }
    return { minX, minY }
}
