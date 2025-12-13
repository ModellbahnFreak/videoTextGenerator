export class Animator {
    protected cancelRunningAnimation: (() => any) | null = null;

    public async runAnimation(animation: (sleep: (ms: number, check: () => boolean) => Promise<void>) => Promise<void> | void) {
        if (this.cancelRunningAnimation != null) {
            this.cancelRunningAnimation();
        }
        try {
            await animation(this.sleep.bind(this));
        } catch {

        }
    }

    private async sleep(ms: number, check: () => boolean): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.cancelRunningAnimation = reject;
            setTimeout(() => {
                if (this.cancelRunningAnimation == reject) {
                    if (!check || check()) {
                        resolve();
                    } else {
                        reject();
                    }
                } else {
                    reject();
                }
            }, ms)
        });
    }
}