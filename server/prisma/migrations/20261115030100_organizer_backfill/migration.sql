UPDATE "User" SET "role" = 'ORGANIZER' WHERE "role" = 'ADMIN' AND "organizationId" IS NOT NULL;
