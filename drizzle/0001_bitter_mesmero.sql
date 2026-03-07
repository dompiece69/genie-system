CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('scan_started','scan_completed','pain_point_found','solution_generated','product_published','product_viewed','order_placed','order_completed') NOT NULL,
	`entityId` int,
	`entityType` varchar(64),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `app_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(128) NOT NULL,
	`value` text,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `app_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `app_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`userId` int,
	`buyerEmail` varchar(320) NOT NULL,
	`buyerName` varchar(256),
	`amount` float NOT NULL,
	`status` enum('pending','completed','refunded','failed') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(64),
	`deliveryStatus` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`downloadToken` varchar(128),
	`downloadExpiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pain_points` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(512) NOT NULL,
	`description` text NOT NULL,
	`source` varchar(128),
	`sourceUrl` text,
	`niche` varchar(128),
	`tags` json DEFAULT ('[]'),
	`urgencyScore` float DEFAULT 0,
	`marketPotentialScore` float DEFAULT 0,
	`overallScore` float DEFAULT 0,
	`status` enum('new','analyzed','solution_pending','solution_ready','published','archived') NOT NULL DEFAULT 'new',
	`rawData` json,
	`scanJobId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pain_points_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`solutionId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`description` text NOT NULL,
	`shortDescription` varchar(256),
	`price` float NOT NULL DEFAULT 0,
	`category` varchar(128),
	`tags` json DEFAULT ('[]'),
	`coverImageUrl` text,
	`isPublished` boolean NOT NULL DEFAULT false,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`salesCount` int NOT NULL DEFAULT 0,
	`viewCount` int NOT NULL DEFAULT 0,
	`rating` float DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scan_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` int,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`painPointsFound` int NOT NULL DEFAULT 0,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scan_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scan_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`type` enum('reddit','forum','twitter','hackernews','quora','producthunt','custom') NOT NULL,
	`url` text,
	`keywords` json DEFAULT ('[]'),
	`isActive` boolean NOT NULL DEFAULT true,
	`scanIntervalMinutes` int NOT NULL DEFAULT 60,
	`lastScannedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scan_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `solution_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`type` enum('automation_script','pdf_guide','mini_tool','checklist','template','video_script') NOT NULL,
	`promptTemplate` text NOT NULL,
	`defaultPrice` float DEFAULT 9.99,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `solution_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `solutions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`painPointId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`description` text NOT NULL,
	`type` enum('automation_script','pdf_guide','mini_tool','checklist','template','video_script') NOT NULL,
	`content` text,
	`fileUrl` text,
	`fileKey` text,
	`status` enum('draft','pending_review','approved','rejected','published') NOT NULL DEFAULT 'draft',
	`generatedBy` enum('ai','manual') NOT NULL DEFAULT 'ai',
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `solutions_id` PRIMARY KEY(`id`)
);
