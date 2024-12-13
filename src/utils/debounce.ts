type Func = (...args: any[]) => void;

function debounce<T extends Func>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    return function (this: any, ...args: Parameters<T>): void {
        const context = this;

        if (timeout !== undefined) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

export default debounce;