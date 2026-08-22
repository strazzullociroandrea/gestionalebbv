ALTER TABLE `Payment` ADD `type` text NOT NULL;--> statement-breakpoint
ALTER TABLE `Payment` ADD `recipientType` text NOT NULL;--> statement-breakpoint
ALTER TABLE `Payment` ADD `dueDate` text;--> statement-breakpoint
ALTER TABLE `Payment` ADD `paymentDate` text;--> statement-breakpoint
ALTER TABLE `Payment` ADD `isDraft` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `Payment` ADD `idUser` text;--> statement-breakpoint
ALTER TABLE `Payment` ADD `externalEntityName` text;