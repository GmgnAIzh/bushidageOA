CREATE TABLE `announcements` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`author` text NOT NULL,
	`author_id` text NOT NULL,
	`author_role` text NOT NULL,
	`author_avatar` text,
	`publish_time` text NOT NULL,
	`category` text NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_pinned` integer DEFAULT false NOT NULL,
	`read_count` integer DEFAULT 0 NOT NULL,
	`like_count` integer DEFAULT 0 NOT NULL,
	`comment_count` integer DEFAULT 0 NOT NULL,
	`departments` text,
	`attachments` text,
	`expiry_date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `approval_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`applicant` text NOT NULL,
	`applicant_id` text NOT NULL,
	`applicant_avatar` text,
	`department` text NOT NULL,
	`submit_time` text NOT NULL,
	`current_step` integer DEFAULT 1 NOT NULL,
	`total_steps` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`amount` text,
	`description` text NOT NULL,
	`attachments` text,
	`approval_flow` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`user_name` text NOT NULL,
	`action` text NOT NULL,
	`resource` text NOT NULL,
	`resource_id` text,
	`old_values` text,
	`new_values` text,
	`ip_address` text,
	`user_agent` text,
	`timestamp` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`sender_name` text NOT NULL,
	`sender_avatar` text,
	`content` text NOT NULL,
	`type` text DEFAULT 'text' NOT NULL,
	`timestamp` text NOT NULL,
	`edited_at` text,
	`reply_to` text,
	`mentions` text,
	`reactions` text,
	`attachments` text,
	`is_encrypted` integer DEFAULT true NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`is_announcement` integer DEFAULT false NOT NULL,
	`read_by` text,
	`status` text DEFAULT 'sent' NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`is_from_bot` integer DEFAULT false NOT NULL,
	`bot_name` text,
	`thread_replies` integer DEFAULT 0,
	`is_forwarded` integer DEFAULT false NOT NULL,
	`original_sender` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`avatar` text,
	`participants` text,
	`admins` text,
	`member_count` integer DEFAULT 0 NOT NULL,
	`tags` text,
	`department` text,
	`is_pinned` integer DEFAULT false NOT NULL,
	`is_muted` integer DEFAULT false NOT NULL,
	`is_encrypted` integer DEFAULT true NOT NULL,
	`is_online` integer DEFAULT true NOT NULL,
	`is_official` integer DEFAULT false NOT NULL,
	`allow_invite` integer DEFAULT true NOT NULL,
	`allow_announcement` integer DEFAULT false NOT NULL,
	`max_members` integer DEFAULT 100 NOT NULL,
	`approval_required` integer DEFAULT false NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`manager` text NOT NULL,
	`manager_id` text NOT NULL,
	`employees` integer DEFAULT 0 NOT NULL,
	`budget` text,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_id` text NOT NULL,
	`name` text NOT NULL,
	`position` text NOT NULL,
	`department` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`status` text DEFAULT 'active' NOT NULL,
	`join_date` text NOT NULL,
	`salary` text,
	`performance` integer,
	`attendance` integer,
	`projects` integer,
	`location` text,
	`avatar` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `financial_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`currency` text NOT NULL,
	`amount` real NOT NULL,
	`usd_value` real NOT NULL,
	`from_address` text NOT NULL,
	`to_address` text NOT NULL,
	`time` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`tx_hash` text NOT NULL,
	`fee` real DEFAULT 0 NOT NULL,
	`category` text,
	`description` text,
	`tags` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`type` text NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`read_at` text,
	`data` text,
	`expires_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payment_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`amount` text NOT NULL,
	`currency` text NOT NULL,
	`requestor` text NOT NULL,
	`requestor_id` text NOT NULL,
	`department` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`date` text NOT NULL,
	`description` text,
	`urgency` text DEFAULT 'normal' NOT NULL,
	`recipient` text,
	`tx_hash` text,
	`approver` text,
	`approval_date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`type` text DEFAULT 'string' NOT NULL,
	`description` text,
	`category` text DEFAULT 'general' NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`permission` text NOT NULL,
	`resource` text,
	`granted` integer DEFAULT true NOT NULL,
	`granted_by` text NOT NULL,
	`expires_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`department` text NOT NULL,
	`position` text,
	`avatar` text,
	`phone` text,
	`status` text DEFAULT 'active' NOT NULL,
	`join_date` text NOT NULL,
	`last_login` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_id` text NOT NULL,
	`employee_name` text NOT NULL,
	`wallet_address` text NOT NULL,
	`address_type` text DEFAULT 'TRC20' NOT NULL,
	`currency` text DEFAULT 'USDT' NOT NULL,
	`balance` text DEFAULT '0.00' NOT NULL,
	`is_verified` integer DEFAULT false NOT NULL,
	`is_2fa_enabled` integer DEFAULT false NOT NULL,
	`qr_secret` text,
	`backup_codes` text,
	`last_modified` text,
	`modification_history` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `departments_name_unique` ON `departments` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `employees_employee_id_unique` ON `employees` (`employee_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `system_settings_key_unique` ON `system_settings` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);