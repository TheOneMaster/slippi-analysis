export interface StageGeometryMap {
    [stageId: number]: StageGeometry
}
export interface StageGeometry {
    name: string,
    leftXBoundary: number,
    rightXBoundary: number,
    upperYBoundary: number,
    lowerYBoundary: number,
    mainPlatformHeight: number,
    sidePlatformHeight?: number,
    topPlatformHeight?: number,
    leftLedgeX: number,
    rightLedgeX: number
}
