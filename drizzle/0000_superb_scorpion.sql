CREATE TABLE `Associate` (
	`userId` text,
	`athleteId` text,
	PRIMARY KEY(`userId`, `athleteId`),
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athleteId`) REFERENCES `Athlete`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Athlete` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`surname` text NOT NULL,
	`dateOfBirth` text NOT NULL,
	`expirationMedicalCertificate` text NOT NULL,
	`homeAddress` text NOT NULL,
	`nin` text NOT NULL,
	`status` text DEFAULT 'inactive' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Championship` (
	`id` text PRIMARY KEY NOT NULL,
	`paid` integer DEFAULT true NOT NULL,
	`name` text NOT NULL,
	`sportsCommittee` text NOT NULL,
	`idTeam` text,
	FOREIGN KEY (`idTeam`) REFERENCES `Team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `IsIn` (
	`idTeam` text,
	`idAthlete` text,
	PRIMARY KEY(`idTeam`, `idAthlete`),
	FOREIGN KEY (`idTeam`) REFERENCES `Team`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`idAthlete`) REFERENCES `Athlete`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Notification` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text DEFAULT (CURRENT_TIMESTAMP),
	`text` text NOT NULL,
	`read` integer DEFAULT true NOT NULL,
	`idAdmin` text NOT NULL,
	`idAthlete` text NOT NULL,
	FOREIGN KEY (`idAdmin`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`idAthlete`) REFERENCES `Athlete`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Payment` (
	`id` text PRIMARY KEY NOT NULL,
	`amount` real NOT NULL,
	`date` text DEFAULT (CURRENT_TIMESTAMP),
	`reason` text NOT NULL,
	`idAthlete` text,
	`idSponsor` text,
	`idSeason` text NOT NULL,
	FOREIGN KEY (`idAthlete`) REFERENCES `Athlete`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`idSponsor`) REFERENCES `Sponsor`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`idSeason`) REFERENCES `SportSeason`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Session` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` text,
	`token` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Sponsor` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`email` text,
	`phone` text
);
--> statement-breakpoint
CREATE TABLE `SportSeason` (
	`id` text PRIMARY KEY NOT NULL,
	`season` text NOT NULL,
	`status` text DEFAULT 'inactive' NOT NULL,
	`renewalFee` text NOT NULL,
	`newFee` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Team` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`subscribePassword` text NOT NULL,
	`password` text NOT NULL,
	`idSeason` text NOT NULL,
	FOREIGN KEY (`idSeason`) REFERENCES `SportSeason`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ToSponsor` (
	`idSeason` text,
	`idSponsor` text,
	PRIMARY KEY(`idSeason`, `idSponsor`),
	FOREIGN KEY (`idSeason`) REFERENCES `SportSeason`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`idSponsor`) REFERENCES `Sponsor`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`surname` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`emailVerified` integer DEFAULT true NOT NULL,
	`image` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text,
	`role` text DEFAULT 'client' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_unique` ON `User` (`email`);--> statement-breakpoint
CREATE TABLE `Verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text
);
