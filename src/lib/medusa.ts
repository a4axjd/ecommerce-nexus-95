
import { Medusa } from "@medusajs/medusa-js";

// Initialize the Medusa client
const medusa = new Medusa({
  baseUrl: "http://localhost:9000", // Default Medusa backend URL when running locally
  maxRetries: 3,
});

export default medusa;
