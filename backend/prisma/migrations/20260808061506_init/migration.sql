-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS') NOT NULL DEFAULT 'SALES',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `businessName` VARCHAR(191) NOT NULL,
    `gstNumber` VARCHAR(191) NULL,
    `customerType` ENUM('RETAIL', 'WHOLESALE', 'DISTRIBUTOR') NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `status` ENUM('LEAD', 'ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'LEAD',
    `followUpDate` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `unitPrice` DECIMAL(10, 2) NOT NULL,
    `currentStock` INTEGER NOT NULL DEFAULT 0,
    `minimumStock` INTEGER NOT NULL DEFAULT 0,
    `warehouse` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockMovement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `type` ENUM('IN', 'OUT') NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesChallan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `challanNumber` VARCHAR(191) NOT NULL,
    `customerId` INTEGER NOT NULL,
    `totalQuantity` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SalesChallan_challanNumber_key`(`challanNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesChallanItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `challanId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `productName` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `unitPrice` DECIMAL(10, 2) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesChallan` ADD CONSTRAINT `SalesChallan_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesChallan` ADD CONSTRAINT `SalesChallan_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesChallanItem` ADD CONSTRAINT `SalesChallanItem_challanId_fkey` FOREIGN KEY (`challanId`) REFERENCES `SalesChallan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesChallanItem` ADD CONSTRAINT `SalesChallanItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
