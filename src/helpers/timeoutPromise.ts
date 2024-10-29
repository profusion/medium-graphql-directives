const timeoutPromise = (p: Promise<unknown>, ms: number, timeoutError: Symbol) => {
  let timeoutId: NodeJS.Timeout;
  return Promise.race([
    p,
    new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(timeoutError);
      }, ms);
    }),
  ]).finally(() => clearTimeout(timeoutId));
};

export default timeoutPromise;
