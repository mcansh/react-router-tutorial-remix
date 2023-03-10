import { redirect } from "@remix-run/cloudflare";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import type { ContactsDataFunctionArgs } from "~/contacts";
import { getContact, updateContact } from "~/contacts";

export async function loader({ context, params }: ContactsDataFunctionArgs) {
  if (!params.contactId) throw new Error("missing contactId param");
  let contact = await getContact(context.CONTACTS, params.contactId);
  if (!contact) {
    throw new Response("contact not found", { status: 404 });
  }
  return contact;
}

export async function action({
  context,
  params,
  request,
}: ContactsDataFunctionArgs) {
  if (!params.contactId) throw new Error("missing contactId param");
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  await updateContact(context.CONTACTS, params.contactId, updates as any);
  return redirect(`/contacts/${params.contactId}`);
}

export default function EditContact() {
  const contact = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Form method="post" id="contact-form">
      <p>
        <span>Name</span>
        <input
          placeholder="First"
          aria-label="First name"
          type="text"
          name="first"
          defaultValue={contact.first}
        />
        <input
          placeholder="Last"
          aria-label="Last name"
          type="text"
          name="last"
          defaultValue={contact.last}
        />
      </p>
      <label>
        <span>Twitter</span>
        <input
          type="text"
          name="twitter"
          placeholder="@jack"
          defaultValue={contact.twitter}
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          placeholder="https://example.com/avatar.jpg"
          aria-label="Avatar URL"
          type="text"
          name="avatar"
          defaultValue={contact.avatar}
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea name="notes" defaultValue={contact.notes} rows={6} />
      </label>
      <p>
        <button type="submit">Save</button>
        <button
          type="button"
          onClick={() => {
            navigate(-1);
          }}
        >
          Cancel
        </button>
      </p>
    </Form>
  );
}
