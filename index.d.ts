declare module "esd-js" {
    export function calc(game: string, percent: number, errOnInaccuracy: boolean): number;

    export function ESDCompare(baseESD: number, compareESD: number, cdeg?: number): number;
    export function PercentCompare(
        game: string,
        basePercent: number,
        comparePercent: number,
        cdeg?: number
    ): number;
}
