import { redirect } from 'next/navigation';

export default function AdminStoriesPage() {
  redirect('/admin/clinic?tab=stories');
}
