import { jest } from "@jest/globals";
import { AppError } from "@/utils/error.js";
import { generateToken, verifyToken, decodeToken, isTokenValid, refreshToken } from "@/utils/jwt.js";
const mockPayload = {
  userId: "64f1a2b3c4d5e6f7a8b9c0d1",
  email: "test@example.com",
  userType: "user",
};

describe("JWT Utils", () => {
  
  describe("generateToken", () => {
    it("should generate a valid access token", () => {
      const token = generateToken(mockPayload, false);

      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);
    });

    it("should generate a valid refresh token", () => {
      const token = generateToken(mockPayload, true);

      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);
    });

    it("should generate different tokens for access and refresh", () => {
      const accessToken = generateToken(mockPayload, false);
      const refreshTokenValue = generateToken(mockPayload, true);

      expect(accessToken).not.toBe(refreshTokenValue);
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid access token and return payload", () => {
      const token = generateToken(mockPayload, false);
      const decoded = verifyToken(token, false);

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.userType).toBe(mockPayload.userType);
    });

    it("should verify a valid refresh token and return payload", () => {
      const token = generateToken(mockPayload, true);
      const decoded = verifyToken(token, true);

      expect(decoded.userId).toBe(mockPayload.userId);
    });

    it("should throw AppError for invalid token", () => {
      expect(() => verifyToken("invalid.token.here", false)).toThrow(AppError);
    });

    it("should throw AppError when verifying access token with refresh secret", () => {
      const token = generateToken(mockPayload, false);

      expect(() => verifyToken(token, true)).toThrow(AppError);
    });
  });

  describe("decodeToken", () => {
    it("should decode token without verification", () => {
      const token = generateToken(mockPayload, false);
      const decoded = decodeToken(token);

      expect(decoded?.userId).toBe(mockPayload.userId);
      expect(decoded?.email).toBe(mockPayload.email);
    });

    it("should return null for invalid token", () => {
      const decoded = decodeToken("not.a.token");

      expect(decoded).toBeNull();
    });
  });

  describe("isTokenValid", () => {
    it("should return true for valid token", () => {
      const token = generateToken(mockPayload, false);

      expect(isTokenValid(token)).toBe(true);
    });

    it("should return false for invalid token", () => {
      expect(isTokenValid("invalid.token.here")).toBe(false);
    });
  });
  describe("refreshToken", () => {
  it("should return a new access token from valid refresh token", () => {
    const refreshTokenStr = generateToken(mockPayload, true);
    const newAccessToken = refreshToken(refreshTokenStr);

    expect(typeof newAccessToken).toBe("string");
    expect(newAccessToken.split(".").length).toBe(3);
  });

  it("should throw AppError for invalid refresh token", () => {
    expect(() => refreshToken("invalid.token.here")).toThrow(AppError);
  });
  it("should throw AppError when token is expired", () => {
  const token = generateToken(mockPayload, false);

  jest.useFakeTimers();
  jest.setSystemTime(Date.now() + 1000 * 60 * 60 * 24);

  expect(() => verifyToken(token, false)).toThrow(AppError);

  jest.useRealTimers();
});
});
});