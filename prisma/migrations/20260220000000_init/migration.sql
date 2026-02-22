-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `author_name` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `rating` INTEGER NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `admins_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invitations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url_id` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `template_type` VARCHAR(10) NOT NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `groom_name` VARCHAR(20) NOT NULL,
    `groom_contact` VARCHAR(20) NULL,
    `groom_father` VARCHAR(20) NULL,
    `groom_father_contact` VARCHAR(20) NULL,
    `groom_mother` VARCHAR(20) NULL,
    `groom_mother_contact` VARCHAR(20) NULL,
    `bride_name` VARCHAR(20) NOT NULL,
    `bride_contact` VARCHAR(20) NULL,
    `bride_father` VARCHAR(20) NULL,
    `bride_father_contact` VARCHAR(20) NULL,
    `bride_mother` VARCHAR(20) NULL,
    `bride_mother_contact` VARCHAR(20) NULL,
    `wedding_date` DATETIME(0) NOT NULL,
    `location_name` VARCHAR(100) NOT NULL,
    `location_detail` VARCHAR(100) NULL,
    `location_address` VARCHAR(200) NOT NULL,
    `location_lat` DECIMAL(10, 8) NULL,
    `location_lng` DECIMAL(11, 8) NULL,
    `transport_subway` TEXT NULL,
    `transport_bus` TEXT NULL,
    `transport_parking` TEXT NULL,
    `welcome_msg` TEXT NULL,
    `main_photo_url` TEXT NULL,
    `middle_photo_url` VARCHAR(255) NULL,
    `og_photo_url` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `invitations_url_id_key`(`url_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invitation_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invitation_id` INTEGER NOT NULL,
    `side` VARCHAR(10) NOT NULL,
    `bank_name` VARCHAR(20) NOT NULL,
    `account_number` VARCHAR(50) NOT NULL,
    `owner_name` VARCHAR(20) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `invitation_accounts_invitation_id_idx`(`invitation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invitation_photos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invitation_id` INTEGER NOT NULL,
    `photo_url` VARCHAR(255) NOT NULL,
    `sort_order` INTEGER NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `invitation_photos_invitation_id_idx`(`invitation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invitation_interviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invitation_id` INTEGER NOT NULL,
    `question` VARCHAR(255) NOT NULL,
    `answer` TEXT NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `invitation_interviews_invitation_id_idx`(`invitation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `invitation_accounts` ADD CONSTRAINT `invitation_accounts_invitation_id_fkey` FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `invitation_photos` ADD CONSTRAINT `invitation_photos_invitation_id_fkey` FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `invitation_interviews` ADD CONSTRAINT `invitation_interviews_invitation_id_fkey` FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
