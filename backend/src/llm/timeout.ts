export async function withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    controller: AbortController
  ): Promise<T> {
    const timeout = setTimeout(() => {
      controller.abort();
    }, ms);
  
    try {
      return await promise;
    } finally {
      clearTimeout(timeout);
    }
  }
  