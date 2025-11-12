CREATE TABLE `game_saves` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`saveName` varchar(100) NOT NULL,
	`playerHealth` int NOT NULL DEFAULT 100,
	`playerMaxHealth` int NOT NULL DEFAULT 100,
	`playerEnergy` int NOT NULL DEFAULT 100,
	`playerMaxEnergy` int NOT NULL DEFAULT 100,
	`playerExp` int NOT NULL DEFAULT 0,
	`playerLevel` int NOT NULL DEFAULT 1,
	`playerMoney` int NOT NULL DEFAULT 200,
	`playerX` int NOT NULL DEFAULT 0,
	`playerY` int NOT NULL DEFAULT 0,
	`playerZ` int NOT NULL DEFAULT 0,
	`currentDialogue` varchar(100),
	`gameTime` varchar(50) NOT NULL DEFAULT 'morning',
	`score` int NOT NULL DEFAULT 0,
	`combo` int NOT NULL DEFAULT 0,
	`inventory` text NOT NULL DEFAULT ('[]'),
	`equipment` text NOT NULL DEFAULT ('{}'),
	`activeQuests` text NOT NULL DEFAULT ('[]'),
	`completedQuests` text NOT NULL DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `game_saves_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `game_saves` ADD CONSTRAINT `game_saves_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;