import { Button } from '@/components/ui/button';

export function AdminSignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <Button type="submit" variant="outline">Sign out</Button>
    </form>
  );
}
