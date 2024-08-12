CREATE TABLE `chatSessionsTable` (
	`id` text NOT NULL,
	`topic` text NOT NULL,
	`timestamp` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `messagesTable` (
	`id` text NOT NULL,
	`sessionId` text,
	`senderRole` text,
	`timestamp` text DEFAULT (CURRENT_TIMESTAMP),
	`data` text NOT NULL,
	FOREIGN KEY (`sessionId`) REFERENCES `chatSessionsTable`(`id`) ON UPDATE no action ON DELETE cascade
);
