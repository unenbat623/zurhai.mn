
type ToastType = 'error' | 'success' | 'info';

export const toastEvent = {
  list: [] as ((message: string, type: ToastType) => void)[],
  subscribe(fn: (message: string, type: ToastType) => void) {
    this.list.push(fn);
    return () => {
      this.list = this.list.filter(f => f !== fn);
    };
  },
  notify(message: string, type: ToastType = 'info') {
    this.list.forEach(fn => fn(message, type));
  }
};

export const toast = {
  error: (msg: string) => toastEvent.notify(msg, 'error'),
  success: (msg: string) => toastEvent.notify(msg, 'success'),
  info: (msg: string) => toastEvent.notify(msg, 'info'),
};
