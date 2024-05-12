export type ROConsumer<T> = (d: T) => void;

export interface DataKey<T> {
    readonly value: Readonly<T> | undefined;
    set(newValue: T): void;
    on(handler: ROConsumer<T>): void;
    off(handler: ROConsumer<T>): void;
}