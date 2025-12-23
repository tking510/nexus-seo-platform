CREATE TABLE `domain_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`domainId` int NOT NULL,
	`date` timestamp NOT NULL,
	`totalClicks` int,
	`totalImpressions` int,
	`avgPosition` decimal(5,2),
	`avgCtr` decimal(5,4),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `domain_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `keyword_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keywordId` int NOT NULL,
	`date` timestamp NOT NULL,
	`position` decimal(5,2),
	`clicks` int,
	`impressions` int,
	`ctr` decimal(5,4),
	`aiVisibility` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `keyword_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pagespeed_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`domainId` int NOT NULL,
	`url` varchar(2000) NOT NULL,
	`date` timestamp NOT NULL,
	`performanceScore` int,
	`accessibilityScore` int,
	`bestPracticesScore` int,
	`seoScore` int,
	`lcp` int,
	`fid` int,
	`cls` int,
	`ttfb` int,
	`fcp` int,
	`speedIndex` int,
	`tbt` int,
	`rawData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pagespeed_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sync_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobType` enum('search_console','pagespeed','ai_visibility') NOT NULL,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sync_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracked_domains` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`domain` varchar(255) NOT NULL,
	`searchConsoleProperty` varchar(500),
	`isVerified` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tracked_domains_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracked_keywords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`domainId` int NOT NULL,
	`keyword` varchar(500) NOT NULL,
	`targetUrl` varchar(2000),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tracked_keywords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `googleRefreshToken` text;--> statement-breakpoint
ALTER TABLE `users` ADD `googleAccessToken` text;--> statement-breakpoint
ALTER TABLE `users` ADD `googleTokenExpiry` timestamp;