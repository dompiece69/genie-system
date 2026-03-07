ALTER TABLE `pain_points` MODIFY COLUMN `tags` json;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `tags` json;--> statement-breakpoint
ALTER TABLE `scan_sources` MODIFY COLUMN `keywords` json;