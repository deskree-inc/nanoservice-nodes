import {z} from "zod";

const locationZoneTypes = z.enum([
    "us-west1-a",
    "us-west1-b",
    "us-west1-c",
    "us-west4-a",
    "us-west4-b",
    "us-west4-c",
    "us-east1-b",
    "us-east1-c",
    "us-east1-d",
    "us-east4-a",
    "us-east4-b",
    "us-east4-c",
    "northamerica-northeast1-a",
    "northamerica-northeast1-b",
    "northamerica-northeast1-c",
    "southamerica-east1-a",
    "southamerica-east1-b",
    "southamerica-east1-c",
    "europe-west2-a",
    "europe-west2-b",
    "europe-west2-c",
    "europe-west3-a",
    "europe-west3-b",
    "europe-west3-c",
    "asia-south1-a",
    "asia-south1-b",
    "asia-south1-c",
    "asia-southeast1-a",
    "asia-southeast1-b",
    "asia-southeast1-c",
    "asia-northeast1-a",
    "asia-northeast1-b",
    "asia-northeast1-c",
    "australia-southeast1-a",
    "australia-southeast1-b",
    "australia-southeast1-c"
]);
const locationRegionTypes = z.enum([
    "us-west1",
    "us-west4",
    "us-east1",
    "us-east4",
    "northamerica-northeast1",
    "southamerica-east1",
    "europe-west2",
    "europe-west3",
    "asia-south1",
    "asia-southeast1",
    "asia-northeast1",
    "australia-southeast1"
]);

const LocationValidator = z.object({
    zone: locationZoneTypes,
    region: locationRegionTypes,
});

const OptionalServiceValidator = z.object({
    enabled: z.boolean(),
    version: z.string(),
});

const RequiredServiceValidator = z.object({
    version: z.string(),
});

const IntegrationsValidator = z.object({
    version: z.string(),
    enabled: z.boolean(),
    config: z.record(z.string(), z.string()),
});

const IntegrationsList = z.enum([
    "asana",
    "slack",
    "github",
    "openai",
    "stripe",
    "hubspot",
    "mailgun",
    "shopify",
    "webflow",
    "affinity",
    "sendgrid",
    "typeform",
    "mailchimp",
    "bigcommerce",
    "shipstation",
    "squarespace",
    "shutterstock",
    "activecampaign"
]);

const ServiceValidator = z.object({
    auth: OptionalServiceValidator,
    rest: OptionalServiceValidator,
    backup: OptionalServiceValidator,
    config: RequiredServiceValidator,
    graphql: OptionalServiceValidator,
    webhooks: RequiredServiceValidator,
    analytics: RequiredServiceValidator,
    api_gateway: RequiredServiceValidator,
    data_export_import: RequiredServiceValidator,
    integrations: z.record(IntegrationsList, IntegrationsValidator),
});

const SocialValidator = z.object({
    enabled: z.boolean(),
    client_id: z.string(),
    client_secret: z.string(),
});

const IdentityValidator = z.object({
    email: z.object({
        enabled: z.boolean(),
    }),
    google: SocialValidator,
    github: SocialValidator,
    facebook: SocialValidator,
});


const InfrastructureValidator = z.object({
    location: LocationValidator,
    services: ServiceValidator,
    identities: IdentityValidator,
    project_name: z.string().startsWith("deskree-"),
});

type LocationTypes = z.infer<typeof LocationValidator>;
type ServiceTypes = z.infer<typeof ServiceValidator>;
type IdentityTypes = z.infer<typeof IdentityValidator>;
type InfrastructureTypes = z.infer<typeof InfrastructureValidator>;

export {
    LocationTypes,
    LocationValidator,
    ServiceTypes,
    ServiceValidator,
    IdentityTypes,
    IdentityValidator,
    InfrastructureTypes,
    InfrastructureValidator
};
