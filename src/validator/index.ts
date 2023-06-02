import {z} from 'zod';

const allowedExtensions = ["jpg", "jpeg", "png"];
export const fileSchema = z
  .object({
    name: z.string(),
    type: z.string(),
  })
  .refine((file) => {
    const fileExtension = file.name.split(".").pop().toLowerCase();
    return allowedExtensions.includes(fileExtension);
  }, "Invalid file format. Only JPG, JPEG, and PNG files are allowed.");



export const dimensionSchema = z.number().int();  