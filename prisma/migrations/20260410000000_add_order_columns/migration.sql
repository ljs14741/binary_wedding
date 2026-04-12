-- AlterTable
ALTER TABLE `invitations` ADD COLUMN `groom_order` VARCHAR(10) NULL AFTER `groom_contact`;
ALTER TABLE `invitations` ADD COLUMN `bride_order` VARCHAR(10) NULL AFTER `bride_contact`;
