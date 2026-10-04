jest.mock("expo-secure-store", () => {
  const values = new Map<string, string>();

  return {
    deleteItemAsync: jest.fn(async (key: string) => {
      values.delete(key);
    }),
    getItemAsync: jest.fn(async (key: string) => values.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
  };
});
