import type { CorsOptions } from "cors";
import cors from "cors";

export function corsMiddleware(options?: CorsOptions) {
  return cors(options);
}
