import { RegisterExperience } from '@/components/RegisterExperience';
import { RegisterGuard } from '@/components/register/RegisterGuard';

export default function RegisterPage() {
  return (
    <RegisterGuard>
      <RegisterExperience />
    </RegisterGuard>
  );
}
