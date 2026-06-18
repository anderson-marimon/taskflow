export const optional = <T>(value: T | null): T | undefined => {
  return value === null ? undefined : value;
};
