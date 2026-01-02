import { FamilyProvider } from '@/context/FamilyContext';
import FamilyTree from '@/components/FamilyTree';

export default function Home() {
  return (
    <FamilyProvider>
      <FamilyTree />
    </FamilyProvider>
  );
}
