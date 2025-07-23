import { z } from "zod";

/**
 * Represents the data transfer object used for user registration.
 *
 * This object validates the fields required for user registration
 * including an email and a password. The email must be in a valid
 * email format, and the password must meet the minimum length requirement.
 */
export const registerDto = z.object({
  email: z.email(),
  password: z.string().min(6),
});
/**
 * RegisterDto is a type inferred from the schema `registerDto` using Zod.
 * It represents the data transfer object structure required for user registration.
 * The schema defines the expected shape and validation rules for the registration data.
 */
export type RegisterDto = z.infer<typeof registerDto>;

/**
 * Represents the data transfer object for user login.
 * Contains the necessary fields for user authentication.
 *
 * Structure:
 * - `email`: A valid email address for the user.
 * - `password`: A string representing the user's password, which must be at least 6 characters long.
 *
 * This object is validated using the Zod library.
 */
export const loginDto = z.object({
  email: z.email(),
  password: z.string().min(6),
});
/**
 * Represents the data transfer object (DTO) for user login.
 * This type is inferred from the `loginDto` schema, ensuring strong typing and validation.
 */
export type LoginDto = z.infer<typeof loginDto>;
