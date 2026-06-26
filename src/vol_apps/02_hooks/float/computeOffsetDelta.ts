import type {Delta, FloatingAnchorType, FloatingDirection, Size} from "@/vol_apps/00_types/Types";

/**
 * ================================================================
 * 定位计算笔记 (computeOffsetDelta.ts)
 * ================================================================
 *
 * 【中心思想】
 * 把相对定位，转换成“向量加法”。
 *
 * 最终坐标 = 起点 + 向量1 + 向量2 + 向量3 + 向量4
 *
 * 【设计思路】—— 4 层独立的位移向量
 * 1. 锚点本体偏移（Anchor Size）：
 *    锚点是有面积的，先把锚点从左上角推到自己的边缘（喷发口）。
 *
 * 2. 目标本体偏移（Target Size）：
 *    目标也是有面积的，把目标从左上角拉到自己的边缘（接驳点）。
 *
 * 3. 对齐策略偏移（Anchor Type）：
 *    锚点和目标宽度/高度可能不同，start / center / end 负责在交叉轴上滑动对齐。
 *
 * 4. 用户自定义间距（Offset）：
 *    纯外挂，按方向向量移动一段固定距离。
 *
 * 【使用方法】
 * 外部只需要调用唯一出口：getPostionFromAnchorToTarget(...)
 *
 * 传入 6 个条件：
 *   - anchorPosition: 锚点左上角在视口中的绝对坐标
 *   - anchorSize:     锚点的宽高
 *   - targetSize:     浮层的宽高
 *   - direction:      浮层相对锚点的方位（top / bottom / left / right）
 *   - anchorType:     浮层在锚点上的对齐方式（start / center / end）
 *   - offset:         间距（px）
 *
 * 返回：浮层左上角在视口中的绝对坐标 { top, left }
 *
 * ================================================================
 */


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
        anchorSize,
        targetSize,
        direction,
        anchorType,
    }: {
        anchorSize: Size
        targetSize: Size
        direction: FloatingDirection
        anchorType: FloatingAnchorType
    }
) => {

    const isVertical = direction === "top" || direction === "bottom"
    const anchorCross = isVertical ? anchorSize.width : anchorSize.height
    const targetCross = isVertical ? targetSize.width : targetSize.height

    const getOffset = () => {
        switch (anchorType) {
            case "start": return 0
            case "center": return (targetCross - anchorCross) / 2
            case "end": return (targetCross - anchorCross)
        }
    }

    const getDirection = () => {
        switch (direction) {
            case "top":return "left"
            case "bottom":return "left"
            case "left":return "top"
            case "right":return "top"
        }
    }

    return computeOffsetDelta({
        direction: getDirection(),
        offset: getOffset()
    });
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
    const delta_anchorType = computeAnchorTypeDelta({anchorSize, targetSize, direction, anchorType})
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
