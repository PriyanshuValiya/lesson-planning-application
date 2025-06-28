create table public.student_data (
  student_id uuid not null default gen_random_uuid (),
  "Roll_No" text null,
  "Student_Name" text null,
  "Gender" text null,
  "Birth_Date" text null,
  "Mobile_No" text null,
  "Guardian_Mobile" text null,
  "Guardian_Name" text null,
  "Counsellor" text null,
  "Guardian_Email" text null,
  "Division" bigint null,
  "Batch" text null,
  "Sem" bigint null,
  "Department" text null,
  constraint student_data_pkey primary key (student_id)
) TABLESPACE pg_default;