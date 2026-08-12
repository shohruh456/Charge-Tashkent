let listener = null

export const toast = (message, type = 'success') => listener?.(message, type)
export const registerToastListener = (nextListener) => { listener = nextListener }
