-- CreateTable
CREATE TABLE `invitation_guestbook` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invitation_id` INTEGER NOT NULL,
    `author_name` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `invitation_guestbook_invitation_id_idx`(`invitation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `invitation_guestbook` ADD CONSTRAINT `invitation_guestbook_invitation_id_fkey` FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
