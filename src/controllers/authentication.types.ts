import { z } from "zod";

const registerUserSchema = z
  .object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Not a valid email"),
    password: z
      .string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string",
      })
      .min(8, {
        message: "Must be 8 or more characters in length",
      })
      .refine(
        (v) => {
          return /^(?=.*[A-Z]).+$/g.test(v);
        },
        { message: "At least one uppercase expected" }
      )
      .refine(
        (v) => {
          return /^(?=.*[0-9]).+$/g.test(v);
        },
        { message: "At least one number expected" }
      )
      .refine(
        (v) => {
          return /^(?=.*[^a-zA-Z0-9]).+$/g.test(v);
        },
        { message: "At least one symbol expected" }
      ),
    confirmPassword: z
      .string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string",
      })
      .min(8, {
        message: "Must be 8 or more characters in length",
      })
      .refine(
        (v) => {
          return /^(?=.*[A-Z]).+$/g.test(v);
        },
        { message: "At least one uppercase expected" }
      )
      .refine(
        (v) => {
          return /^(?=.*[0-9]).+$/g.test(v);
        },
        { message: "At least one number expected" }
      )
      .refine(
        (v) => {
          return /^(?=.*[^a-zA-Z0-9]).+$/g.test(v);
        },
        { message: "At least one symbol expected" }
      ),
    preferredUsername: z.string({
      required_error: "Preferred username is required",
      invalid_type_error: "Preferred username be a string",
    }),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords did not match",
      });
    }
  });

export type RegisterUser = z.infer<typeof registerUserSchema>;
