-- AlterTable
ALTER TABLE `reviews` ADD COLUMN `admin_reply` TEXT NULL AFTER `rating`;
ALTER TABLE `reviews` ADD COLUMN `admin_replied_at` TIMESTAMP(0) NULL AFTER `admin_reply`;
