const getProperty = (obj: Record<string, any>, propertyPath: string) =>
  propertyPath
    .split('.')
    .reduce((acc: Record<string, any>, path: string) => acc[path] ?? '', obj);

/**
 * Flat all objects in an array
 * @param nestedObjs the array of objects where each of them will be flatted
 * @param keys A Matrix (n x 2) of keys to be included in each object, where each line indicaties the field name alias, and the path to this value (in dot notation)
 * @returns A new arrayobject containing only the specified keys (all flatted)
 */
export const flatObjectsArray = <T extends Object>(
  nestedObjs: ReadonlyArray<T>,
  keys: any
) => {
  if (!keys.length) return nestedObjs;

  return nestedObjs.flatMap((nestedObj) => [
    keys.reduce((acc: Record<string, unknown>, key: string[]) => {
      acc[key[0]] = getProperty(nestedObj, key[1]);

      return acc;
    }, {}),
  ]) as ReadonlyArray<T>;
};
