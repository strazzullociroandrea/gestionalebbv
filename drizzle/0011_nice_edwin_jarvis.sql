PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Associate` (
	`userId` text,
	`athleteId` text,
	PRIMARY KEY(`userId`, `athleteId`),
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`athleteId`) REFERENCES `Athlete`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Associate`("userId", "athleteId") SELECT "userId", "athleteId" FROM `Associate`;--> statement-breakpoint
DROP TABLE `Associate`;--> statement-breakpoint
ALTER TABLE `__new_Associate` RENAME TO `Associate`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_Championship` (
	`id` text PRIMARY KEY NOT NULL,
	`paid` integer DEFAULT true NOT NULL,
	`name` text NOT NULL,
	`sportsCommittee` text NOT NULL,
	`idTeam` text,
	FOREIGN KEY (`idTeam`) REFERENCES `Team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_Championship`("id", "paid", "name", "sportsCommittee", "idTeam") SELECT "id", "paid", "name", "sportsCommittee", "idTeam" FROM `Championship`;--> statement-breakpoint
DROP TABLE `Championship`;--> statement-breakpoint
ALTER TABLE `__new_Championship` RENAME TO `Championship`;--> statement-breakpoint
CREATE TABLE `__new_IsIn` (
	`idTeam` text,
	`idAthlete` text,
	PRIMARY KEY(`idTeam`, `idAthlete`),
	FOREIGN KEY (`idTeam`) REFERENCES `Team`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`idAthlete`) REFERENCES `Athlete`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_IsIn`("idTeam", "idAthlete") SELECT "idTeam", "idAthlete" FROM `IsIn`;--> statement-breakpoint
DROP TABLE `IsIn`;--> statement-breakpoint
ALTER TABLE `__new_IsIn` RENAME TO `IsIn`;--> statement-breakpoint
CREATE TABLE `__new_ToSponsor` (
	`idSeason` text,
	`idSponsor` text,
	PRIMARY KEY(`idSeason`, `idSponsor`),
	FOREIGN KEY (`idSeason`) REFERENCES `SportSeason`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`idSponsor`) REFERENCES `Sponsor`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_ToSponsor`("idSeason", "idSponsor") SELECT "idSeason", "idSponsor" FROM `ToSponsor`;--> statement-breakpoint
DROP TABLE `ToSponsor`;--> statement-breakpoint
ALTER TABLE `__new_ToSponsor` RENAME TO `ToSponsor`;