create table "user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" boolean not null, "image" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null, "twoFactorEnabled" boolean);

create table "session" ("id" text not null primary key, "expiresAt" timestamptz not null, "token" text not null unique, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null, "ipAddress" text, "userAgent" text, "userId" text not null references "user" ("id") on delete cascade, "activeOrganizationId" text);

create table "account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "user" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, "scope" text, "password" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null);

create table "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" timestamptz not null, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);

create table "organization" ("id" text not null primary key, "name" text not null, "slug" text not null unique, "logo" text, "createdAt" timestamptz not null, "metadata" text);

create table "member" ("id" text not null primary key, "organizationId" text not null references "organization" ("id") on delete cascade, "userId" text not null references "user" ("id") on delete cascade, "role" text not null, "createdAt" timestamptz not null);

create table "invitation" ("id" text not null primary key, "organizationId" text not null references "organization" ("id") on delete cascade, "email" text not null, "role" text, "status" text not null, "expiresAt" timestamptz not null, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "inviterId" text not null references "user" ("id") on delete cascade);

create table "twoFactor" ("id" text not null primary key, "secret" text not null, "backupCodes" text not null, "userId" text not null references "user" ("id") on delete cascade, "verified" boolean, "failedVerificationCount" integer, "lockedUntil" timestamptz);

create table "rateLimit" ("id" text not null primary key, "key" text not null unique, "count" integer not null, "lastRequest" bigint not null);

create index "session_userId_idx" on "session" ("userId");

create index "account_userId_idx" on "account" ("userId");

create index "verification_identifier_idx" on "verification" ("identifier");

create index "member_organizationId_idx" on "member" ("organizationId");

create index "member_userId_idx" on "member" ("userId");

create index "invitation_organizationId_idx" on "invitation" ("organizationId");

create index "invitation_email_idx" on "invitation" ("email");

create index "twoFactor_secret_idx" on "twoFactor" ("secret");

create index "twoFactor_userId_idx" on "twoFactor" ("userId");

-- SportLens domain records. Better Auth owns identity, sessions, organizations,
-- invitations, and 2FA; these tables own application/API-key lifecycle.
create table if not exists "application" (
  "id" text primary key,
  "name" text not null,
  "slug" text not null,
  "description" text,
  "website" text,
  "organizationId" text not null references "organization" ("id") on delete cascade,
  "environment" text not null check ("environment" in ('test', 'production')),
  "status" text not null default 'active' check ("status" in ('active', 'archived')),
  "createdBy" text not null references "user" ("id"),
  "createdAt" timestamptz not null default current_timestamp,
  "updatedAt" timestamptz not null default current_timestamp,
  unique ("organizationId", "slug")
);

create table if not exists "apiKey" (
  "id" text primary key,
  "applicationId" text not null references "application" ("id") on delete cascade,
  "organizationId" text not null references "organization" ("id") on delete cascade,
  "name" text not null,
  "environment" text not null check ("environment" in ('test', 'production')),
  "keyHash" text not null unique,
  "keyPreview" text not null,
  "status" text not null default 'active' check ("status" in ('active', 'revoked')),
  "permissions" jsonb not null default '[]'::jsonb,
  "plan" text not null default 'free',
  "rateLimit" integer not null default 1000,
  "createdAt" timestamptz not null default current_timestamp,
  "lastUsedAt" timestamptz,
  "expiresAt" timestamptz
);

create index if not exists "application_organizationId_idx" on "application" ("organizationId");
create index if not exists "apiKey_applicationId_idx" on "apiKey" ("applicationId");
create index if not exists "apiKey_organizationId_idx" on "apiKey" ("organizationId");
create index if not exists "apiKey_status_idx" on "apiKey" ("status");
