-- CreateEnum
CREATE TYPE "SlotType" AS ENUM ('work', 'break');

-- CreateEnum
CREATE TYPE "OvertimeReason" AS ENUM ('colleague_abscence', 'client_issue', 'manager_request', 'other');

-- CreateEnum
CREATE TYPE "ChangeRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "schedule_slots" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "type" "SlotType" NOT NULL DEFAULT 'work',

    CONSTRAINT "schedule_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_restrictions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "weekly_hours_target" DOUBLE PRECISION NOT NULL DEFAULT 35,
    "break_frequency_hours" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "notes" TEXT,

    CONSTRAINT "employee_restrictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overtime_declarations" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "reason" "OvertimeReason" NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "overtime_declarations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_change_requests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "original_slot_id" INTEGER NOT NULL,
    "new_date" DATE NOT NULL,
    "new_start_time" TIME NOT NULL,
    "new_end_time" TIME NOT NULL,
    "status" "ChangeRequestStatus" NOT NULL DEFAULT 'pending',
    "employee_message" TEXT,
    "admin_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_restrictions_user_id_key" ON "employee_restrictions"("user_id");

-- AddForeignKey
ALTER TABLE "schedule_slots" ADD CONSTRAINT "schedule_slots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_restrictions" ADD CONSTRAINT "employee_restrictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime_declarations" ADD CONSTRAINT "overtime_declarations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_change_requests" ADD CONSTRAINT "schedule_change_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_change_requests" ADD CONSTRAINT "schedule_change_requests_original_slot_id_fkey" FOREIGN KEY ("original_slot_id") REFERENCES "schedule_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
