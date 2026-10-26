-- AlterTable
ALTER TABLE `invitations` ADD COLUMN `groom_father_mark` VARCHAR(10) NULL AFTER `groom_father_contact`;
ALTER TABLE `invitations` ADD COLUMN `groom_mother_mark` VARCHAR(10) NULL AFTER `groom_mother_contact`;
ALTER TABLE `invitations` ADD COLUMN `bride_father_mark` VARCHAR(10) NULL AFTER `bride_father_contact`;
ALTER TABLE `invitations` ADD COLUMN `bride_mother_mark` VARCHAR(10) NULL AFTER `bride_mother_contact`;
