import {sqliteTable, text, integer, real, primaryKey} from "drizzle-orm/sqlite-core";
import {sql} from "drizzle-orm";

//----------- BETTER-AUTH TABLES -----------
export const Session = sqliteTable('Session', {
    id: text().primaryKey(),
    expiresAt: text(),
    token: text().notNull(),
    createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text(),
    ipAddress: text(),
    userAgent: text(),
    userId: text().references(() => User.id, {onDelete: "cascade"}).notNull(),
});

export const Verification = sqliteTable('Verification', {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: text(),
    createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text(),
});
export const role = ['admin', 'administrative', 'user'] as const;

export const Account = sqliteTable('Account', {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text().references(() => User.id, {onDelete: "cascade"}).notNull(),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: text(),
    refreshTokenExpiresAt: text(),
    scope: text(),
    password: text(),
    createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text(),
});

export const User = sqliteTable('User', {
    id: text().primaryKey(),
    name: text().notNull(),
    surname: text().notNull(),
    phoneNumber: text(),
    email: text().unique().notNull(),
    emailVerified: integer({mode: 'boolean'}).notNull().default(true),
    image: text(),
    createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text(),
    role: text('role', {enum: role}).notNull().default('user'),
});

//----------- END BETTER-AUTH TABLES -----------

export const status = ['active', 'inactive'] as const;

export const SportSeason = sqliteTable('SportSeason', {
    id: text().primaryKey(),
    season: text().notNull(),
    status: text('status', {enum: status}).notNull().default('inactive'),
    renewalFee: text().notNull(),
    newFee: text().notNull(),
});

export const Team = sqliteTable('Team', {
    id: text().primaryKey(),
    name: text().notNull(),
    subscribePassword: text().notNull(),
    idSeason: text().references(() => SportSeason.id, {onDelete: "cascade"}).notNull(),
});

export const Athlete = sqliteTable('Athlete', {
    id: text().primaryKey(),
    name: text().notNull(),
    surname: text().notNull(),
    dateOfBirth: text().notNull(),
    expirationMedicalCertificate: text().notNull(),
    homeAddress: text().notNull(),
    nin: text().notNull(),
    birthPlace: text().notNull(),
    countryBirthPlace: text().notNull(),
    status: text('status', {enum: status}).notNull().default('inactive'),
    ci: text().notNull(),
    expiredCI: text().notNull()
})

export const Notification = sqliteTable('Notification', {
    id: text().primaryKey(),
    date: text().default(sql`(CURRENT_TIMESTAMP)`),
    text: text().notNull(),
    read: integer({mode: 'boolean'}).notNull().default(true),
    idAdmin: text().references(() => User.id, {onDelete: "cascade"}).notNull(),
    idAthlete: text().references(() => Athlete.id, {onDelete: "cascade"}).notNull(),
})

export const Payment = sqliteTable('Payment', {
    id: text().primaryKey(),
    amount: real().notNull(),
    reason: text().notNull(),
    type: text().notNull(),
    recipientType: text().notNull(),
    dueDate: text(),
    paymentDate: text(),
    date: text().default(sql`(CURRENT_TIMESTAMP)`),
    isDraft: integer({mode: "boolean"}).default(false).notNull(),
    idAthlete: text().references(() => Athlete.id, {onDelete: "cascade"}),
    idSponsor: text().references(() => Sponsor.id, {onDelete: "cascade"}),
    idUser: text(),
    externalEntityName: text(),
    idSeason: text().references(() => SportSeason.id, {onDelete: "cascade"}).notNull(),
});

export const Sponsor = sqliteTable('Sponsor', {
    id: text().primaryKey(),
    name: text().notNull(),
    description: text(),
    email: text(),
    phone: text(),
})

export const ToSponsor = sqliteTable('ToSponsor', {
    idSeason: text().references(() => SportSeason.id, {onDelete: "cascade"}),
    idSponsor: text().references(() => Sponsor.id, {onDelete: "cascade"}),
}, (table) => ({
    pk: primaryKey({columns: [table.idSeason, table.idSponsor]}),
}))

export const IsIn = sqliteTable('IsIn', {
    idTeam: text().references(() => Team.id, {onDelete: "cascade"}),
    idAthlete: text().references(() => Athlete.id, {onDelete: "cascade"}),
}, (table) => ({
    pk: primaryKey({columns: [table.idTeam, table.idAthlete]}),
}))

export const commitee = ['PGS', 'VolleyCup', 'FIPAV', 'CSI'] as const;


export const Championship = sqliteTable('Championship', {
    id: text().primaryKey(),
    paid: integer({mode: 'boolean'}).notNull().default(true),
    name: text().notNull(),
    sportsCommittee: text('sportsCommittee', {enum: commitee}).notNull(),
    idTeam:
        text().references(() => Team.id, {onDelete: "cascade"}),
})

export const Associate = sqliteTable('Associate', {
    userId: text().references(() => User.id, {onDelete: "cascade"}),
    athleteId: text().references(() => Athlete.id, {onDelete: "cascade"}),
}, (table) => ({
    pk: primaryKey({columns: [table.userId, table.athleteId]}),
}));