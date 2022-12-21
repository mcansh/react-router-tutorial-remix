import type { DataFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { deleteContact } from "../contacts";

export async function action({ params }: DataFunctionArgs) {
  if (!params.contactId) throw new Error("missing contactId param");
  await deleteContact(params.contactId);
  return redirect("/");
}
