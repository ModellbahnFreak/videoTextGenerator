export abstract class Plugin {
    public abstract init(): void;

    public onSendMessage: (msg: any) => void = () => { };
    protected clearAll() {
        this.onSendMessage({
            type: "clearAll"
        });
    }

    protected setSingle(field: string, value: string) {
        this.onSendMessage({
            type: "set",
            stringKey: field,
            cue: [
                {
                    value
                }
            ],
        });
    }
}