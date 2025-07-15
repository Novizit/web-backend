-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('Individual', 'Apartment', 'Villa');

-- CreateEnum
CREATE TYPE "BhkType" AS ENUM ('OneRK', 'OneBHK', 'TwoBHK', 'ThreeBHK', 'FourBHK');

-- CreateEnum
CREATE TYPE "Furnishing" AS ENUM ('Unfurnished', 'SemiFurnished', 'FullFurnished');

-- CreateEnum
CREATE TYPE "PreferredTenant" AS ENUM ('Any', 'Family', 'Bachelor');

-- CreateEnum
CREATE TYPE "OwnerType" AS ENUM ('Landlord', 'Other');

-- CreateTable
CREATE TABLE "properties" (
    "id" SERIAL NOT NULL,
    "propertyName" TEXT NOT NULL,
    "rent" DOUBLE PRECISION NOT NULL,
    "securityDeposit" DOUBLE PRECISION NOT NULL,
    "maintenance" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "bhkType" "BhkType" NOT NULL,
    "furnishing" "Furnishing" NOT NULL,
    "preferredTenant" "PreferredTenant" NOT NULL,
    "ownerType" "OwnerType" NOT NULL,
    "ownerName" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);
