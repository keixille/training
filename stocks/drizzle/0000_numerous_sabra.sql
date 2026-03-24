CREATE SCHEMA IF NOT EXISTS "indo_premier";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "indo_premier"."broker_summary_daily" (
	"id" serial PRIMARY KEY NOT NULL,
	"stock_code" text NOT NULL,
	"broker_code" text NOT NULL,
	"volume" numeric(20, 2) DEFAULT '0' NOT NULL,
	"average_price" numeric(20, 2) DEFAULT '0' NOT NULL,
	"daily_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "indo_premier"."broker_summary_monthly" (
	"id" serial PRIMARY KEY NOT NULL,
	"stock_code" text NOT NULL,
	"broker_code" text NOT NULL,
	"volume" numeric(20, 2) DEFAULT '0' NOT NULL,
	"average_price" numeric(20, 2) DEFAULT '0' NOT NULL,
	"monthly_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "indo_premier"."broker_summary_yearly" (
	"id" serial PRIMARY KEY NOT NULL,
	"stock_code" text NOT NULL,
	"broker_code" text NOT NULL,
	"volume" numeric(20, 2) DEFAULT '0' NOT NULL,
	"average_price" numeric(20, 2) DEFAULT '0' NOT NULL,
	"yearly_date" date NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "broker_summary_daily_idx" ON "indo_premier"."broker_summary_daily" USING btree ("stock_code","daily_date","broker_code");--> statement-breakpoint
CREATE UNIQUE INDEX "broker_summary_monthly_idx" ON "indo_premier"."broker_summary_monthly" USING btree ("stock_code","monthly_date","broker_code");--> statement-breakpoint
CREATE UNIQUE INDEX "broker_summary_yearly_idx" ON "indo_premier"."broker_summary_yearly" USING btree ("stock_code","yearly_date","broker_code");