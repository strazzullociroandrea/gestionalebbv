PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_User` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`surname` text NOT NULL,
	`phoneNumber` text,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT true NOT NULL,
	`image` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text,
	`role` text DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_User`("id", "name", "surname", "phoneNumber", "email", "emailVerified", "image", "createdAt", "updatedAt", "role") SELECT "id", "name", "surname", "phoneNumber", "email", "emailVerified", "image", "createdAt", "updatedAt", "role" FROM `User`;--> statement-breakpoint
DROP TABLE `User`;--> statement-breakpoint
ALTER TABLE `__new_User` RENAME TO `User`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_unique` ON `User` (`email`);