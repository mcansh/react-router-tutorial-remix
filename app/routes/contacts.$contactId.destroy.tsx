import { redirect } from "@remix-run/cloudflare";

import type { ContactsDataFunctionArgs } from "../contacts";
import { deleteContact } from "../contacts";

export async function action({ context, params }: ContactsDataFunctionArgs) {
  if (!params.contactId) throw new Error("missing contactId param");
  await deleteContact(context.CONTACTS, params.contactId);
  return redirect("/");
}

export function ErrorBoundary() {
  return <div>Oops! There was an error.</div>;
}
