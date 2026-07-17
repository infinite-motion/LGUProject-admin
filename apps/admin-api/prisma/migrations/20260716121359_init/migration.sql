-- CreateTable
CREATE TABLE "SuperAdmin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuperAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LguTenant" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "apiUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "licenseKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LguTenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingRequest" (
    "id" TEXT NOT NULL,
    "orgCode" TEXT NOT NULL,
    "orgName" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "sysAdminEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperAdminAuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuperAdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_email_key" ON "SuperAdmin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LguTenant_code_key" ON "LguTenant"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LguTenant_licenseKey_key" ON "LguTenant"("licenseKey");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingRequest_orgCode_key" ON "OnboardingRequest"("orgCode");

-- AddForeignKey
ALTER TABLE "SuperAdminAuditLog" ADD CONSTRAINT "SuperAdminAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "SuperAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
