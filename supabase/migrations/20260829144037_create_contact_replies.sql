create table if not exists public.contact_replies (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public."contact-with-me"(id) on delete cascade,
  subject text not null,
  message text not null,
  attachment_names text[] not null default '{}',
  sent_at timestamptz not null default now()
);

create index if not exists contact_replies_contact_id_idx
  on public.contact_replies(contact_id);

alter table public.contact_replies enable row level security;

create policy "Service role full access on contact_replies"
  on public.contact_replies
  for all
  to service_role
  using (true)
  with check (true);

create policy "Enable read access for authenticated users"
  on public.contact_replies
  for select
  to authenticated
  using (true);
