PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Athlete` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`surname` text NOT NULL,
	`dateOfBirth` text NOT NULL,
	`expirationMedicalCertificate` text NOT NULL,
	`homeAddress` text NOT NULL,
	`nin` text NOT NULL,
	`birthPlace` text NOT NULL,
	`countryBirthPlace` text NOT NULL,
	`status` text DEFAULT 'inactive' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_Athlete`("id", "name", "surname", "dateOfBirth", "expirationMedicalCertificate", "homeAddress", "nin", "birthPlace", "countryBirthPlace", "status") SELECT "id", "name", "surname", "dateOfBirth", "expirationMedicalCertificate", "homeAddress", "nin", "birthPlace", "countryBirthPlace", "status" FROM `Athlete`;--> statement-breakpoint
DROP TABLE `Athlete`;--> statement-breakpoint
ALTER TABLE `__new_Athlete` RENAME TO `Athlete`;--> statement-breakpoint
PRAGMA foreign_keys=ON;