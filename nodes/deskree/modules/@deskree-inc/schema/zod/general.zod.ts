import {z} from "zod";

const providerTypes = z.enum(["gcp"]);
const planTypes = z.enum(["free", "starter", "premium"]);

const GeneralValidator = z.object({
    provider: providerTypes,
    plan: planTypes,
});

type GeneralTypes = z.infer<typeof GeneralValidator>;

export {GeneralValidator, GeneralTypes};
