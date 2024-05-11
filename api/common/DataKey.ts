export interface DataKey<T> {
    readonly value: Readonly<T>
    set(newValue: T, receiveChange?: boolean): void;
    on(handler: (d: Readonly<T>) => void): void;
    off(handler: (d: Readonly<T>) => void): void;
}