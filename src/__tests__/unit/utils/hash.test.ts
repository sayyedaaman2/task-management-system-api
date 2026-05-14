import { hashPassword, comparePassword } from "@/utils/hash.js";

describe("Hash Utils", () => {
  describe("hashPassword", () => {
    it("should return a hashed string different from the original", async () => {
      const password = "Test@1234";
      const hashed = await hashPassword(password);

      expect(hashed).not.toBe(password);
      expect(typeof hashed).toBe("string");
    });

    it("should return different hashes for the same password", async () => {
      const password = "Test@1234";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("comparePassword", () => {
    it("should return true for correct password", async () => {
      const password = "Test@1234";
      const hashed = await hashPassword(password);
      const result = await comparePassword(password, hashed);

      expect(result).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const password = "Test@1234";
      const hashed = await hashPassword(password);
      const result = await comparePassword("WrongPass", hashed);

      expect(result).toBe(false);
    });
  });
});
