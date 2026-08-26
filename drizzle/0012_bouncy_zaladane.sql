ALTER TABLE `Notification` RENAME COLUMN "date" TO "dateCreation";--> statement-breakpoint
ALTER TABLE `Notification` ADD `dateExpiration` text NOT NULL;