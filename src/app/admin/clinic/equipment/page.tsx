import { redirect } from 'next/navigation';

export default function AdminEquipmentPage() {
  redirect('/admin/clinic?tab=equipment');
}
