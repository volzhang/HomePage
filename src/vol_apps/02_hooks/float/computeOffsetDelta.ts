import type {Delta, FloatingAnchorType, FloatingDirection, Size} from "@/vol_apps/00_types/Types";

const computeOffsetDelta = (
    {
        direction,
        offset,
    }: {
        direction: FloatingDirection;
        offset: number;
    }
) => {
    switch (direction) {
        case "bottom": return {top: offset, left: 0};
        case "top": return {top: -offset, left: 0};
        case "right": return {top: 0, left: offset};
        case "left": return {top: 0, left: -offset};
    }
}

// 这里的direction是target相对参考点的位置方向。
const computeTargetSizeDelta = (
    {
        targetSize,
        direction,
    }: {
        targetSize: Size
        direction: FloatingDirection
    }
) => {
    const getOffset = (direction: FloatingDirection) => {
        switch (direction) {
            case "top":return targetSize.height;
            case "bottom":return 0;
            case "right":return 0;
            case "left":return targetSize.width;
        }
    }
    return computeOffsetDelta({
        direction,
        offset: getOffset(direction),
    })
}


// 这里的direction是target相对参考点的位置。
const computeAnchorTypeDelta = (
    {
        targetSize,
        direction,
        anchorType,
    }: {
        targetSize: Size
        direction: FloatingDirection
        anchorType: FloatingAnchorType
    }
) => {
    // noinspection JSSuspiciousNameCombination
    const crossAxisSizeMap = {
        "top": targetSize.width,
        "bottom": targetSize.width,
        "right": targetSize.height,
        "left": targetSize.height,
    }
    const getOffset = ()=>{
        switch (anchorType) {
            case "start": return 0
            case "center": return crossAxisSizeMap[direction]/2
            case "end": return crossAxisSizeMap[direction]
        }
    }

    return computeOffsetDelta({
        direction,
        offset: getOffset(),
    })
}

// 这里的delta，是从 anchorPosition 到 targetPosition，
const computeAnchorSizeDelta = (
    {
        anchorSize,
        direction,
    }: {
        anchorSize: Size
        direction: FloatingDirection
    }
) => {
    const getOffset = ()=>{
        switch (direction) {
            case "top": return 0
            case "bottom": return anchorSize.height
            case "left": return 0
            case "right": return anchorSize.width
        }
    }
    return computeOffsetDelta({
        direction,
        offset: getOffset(),
    })
}

export const sumDeltas = (...deltas: Delta[]) =>
    deltas.reduce(
        (acc, cur) => ({ top: acc.top + cur.top, left: acc.left + cur.left }),
        { top: 0, left: 0 }
    );

export const getDeltaFromAnchorToTarget = (
    {
        anchorSize,
        targetSize,
        direction,
        anchorType,
        offset,
    }:{
        anchorSize: Size
        targetSize: Size
        direction: FloatingDirection
        anchorType: FloatingAnchorType
        offset: number,
    }
)=>{
    const delta_anchorElementSize = computeAnchorSizeDelta({anchorSize, direction})
    const delta_targetElementSize = computeTargetSizeDelta({targetSize, direction})
    const delta_anchorType = computeAnchorTypeDelta({targetSize, direction, anchorType})
    const delta_offset = computeOffsetDelta({direction, offset})
    return sumDeltas(
        delta_anchorElementSize,
        delta_targetElementSize,
        delta_anchorType,
        delta_offset
    );
}

export const getPostionFromAnchorToTarget = (
    {
        anchorPosition,
        anchorSize,
        targetSize,
        direction,
        anchorType,
        offset,
    }:{
        anchorPosition: Delta
        anchorSize: Size
        targetSize: Size
        direction: FloatingDirection
        anchorType: FloatingAnchorType
        offset: number,
    }
) => {
    const props = {anchorSize, targetSize, direction, anchorType, offset}
    return sumDeltas(anchorPosition, getDeltaFromAnchorToTarget(props))
}
