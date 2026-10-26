-- AlterTable
ALTER TABLE `invitations` ADD COLUMN `groom_photo_url` VARCHAR(255) NULL AFTER `og_photo_url`;
ALTER TABLE `invitations` ADD COLUMN `bride_photo_url` VARCHAR(255) NULL AFTER `groom_photo_url`;
