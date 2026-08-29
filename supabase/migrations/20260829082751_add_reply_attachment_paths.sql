alter table public.contact_replies
  add column if not exists attachment_paths text[] not null default '{}';

insert into storage.buckets (id, name, public)
values ('contact-attachments', 'contact-attachments', false)
on conflict (id) do nothing;

create policy "Service role full access on contact-attachments"
  on storage.objects
  for all
  to service_role
  using (bucket_id = 'contact-attachments')
  with check (bucket_id = 'contact-attachments');

create policy "Authenticated read access on contact-attachments"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'contact-attachments');
