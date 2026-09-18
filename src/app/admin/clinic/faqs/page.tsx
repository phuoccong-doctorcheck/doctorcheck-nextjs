import { redirect } from 'next/navigation';

export default function AdminFaqsPage() {
  redirect('/admin/clinic?tab=faqs');
}
