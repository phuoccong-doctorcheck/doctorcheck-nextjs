import { redirect } from 'next/navigation';

export default function AdminTestimonialsPage() {
  redirect('/admin/clinic?tab=videos');
}
