export const capitalize = <S extends string>(s: S) => (
    s.charAt(0).toUpperCase() + s.slice(1)
) as Capitalize<S>;