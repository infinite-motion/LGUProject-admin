-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ROOT_SUPERADMIN', 'ADMIN');

-- AlterTable
ALTER TABLE "SuperAdmin" ADD COLUMN     "appointedById" TEXT,
ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'ADMIN';

-- AddForeignKey
ALTER TABLE "SuperAdmin" ADD CONSTRAINT "SuperAdmin_appointedById_fkey" FOREIGN KEY ("appointedById") REFERENCES "SuperAdmin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
