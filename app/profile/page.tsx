import { redirect } from "next/navigation";

export default function ProfilePage() {
  // /profile has been consolidated into Dashboard Settings -> Account & Plan tab
  redirect("/dashboard/settings?tab=account");
}
