PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Notification` (
	`id` text PRIMARY KEY NOT NULL,
	`dateCreation` text DEFAULT (CURRENT_TIMESTAMP),
	`dateExpiration` text NOT NULL,
	`text` text NOT NULL,
	`idAthlete` text NOT NULL,
	FOREIGN KEY (`idAthlete`) REFERENCES `Athlete`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Notification`("id", "dateCreation", "dateExpiration", "text", "idAthlete") SELECT "id", "dateCreation", "dateExpiration", "text", "idAthlete" FROM `Notification`;--> statement-breakpoint
DROP TABLE `Notification`;--> statement-breakpoint
ALTER TABLE `__new_Notification` RENAME TO `Notification`;--> statement-breakpoint
PRAGMA foreign_keys=ON;