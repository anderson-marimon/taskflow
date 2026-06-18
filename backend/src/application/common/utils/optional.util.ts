export const optional = <T>(value: Nullable<T>): Maybe<T> => {
  return value === null ? undefined : value;
};
