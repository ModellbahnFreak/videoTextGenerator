export type ROConsumer<T> = (d: T) => void;

export interface DataKey<T> {
    get value(): Readonly<T> | undefined;
    set value(value: Readonly<T> | undefined);
    set(newValue: T): Promise<void>;
    on(handler: ROConsumer<T>): void;
    off(handler: ROConsumer<T>): void;
    getKey(): string;
    getTopic(): string;
}