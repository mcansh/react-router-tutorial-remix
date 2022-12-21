import type { DataFunctionArgs } from "@remix-run/cloudflare";
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";

export interface ContactsDataFunctionArgs extends DataFunctionArgs {
  context: {
    CONTACTS: KVNamespace;
  };
}

export interface Contact {
  id: string;
  createdAt: number;
  first?: string;
  last?: string;
  favorite?: boolean;
  avatar?: string;
  twitter?: string;
  notes?: string;
}

function isContact(contact: any): contact is Contact {
  return (
    typeof contact === "object" &&
    contact !== null &&
    typeof contact.id === "string" &&
    typeof contact.createdAt === "number"
  );
}

async function getContactsFromCache(
  kv: ContactsDataFunctionArgs["context"]["CONTACTS"]
): Promise<Contact[]> {
  let contacts = await kv.get("contacts");
  if (contacts) {
    let verified = JSON.parse(contacts).filter(isContact);
    return verified;
  }
  kv.put("contacts", JSON.stringify([]));
  return [];
}

export async function getContacts(
  kv: ContactsDataFunctionArgs["context"]["CONTACTS"],
  query?: string | undefined | null
) {
  await fakeNetwork(`getContacts:${query}`);
  let contacts = await getContactsFromCache(kv);
  if (query) {
    contacts = matchSorter(contacts, query, { keys: ["first", "last"] });
  }
  return contacts.sort(sortBy("last", "createdAt"));
}

export async function createContact(
  kv: ContactsDataFunctionArgs["context"]["CONTACTS"]
) {
  await fakeNetwork();
  let id = Math.random().toString(36).substring(2, 9);
  let contact = { id, createdAt: Date.now() };
  let contacts = await getContacts(kv);
  contacts.unshift(contact);
  await set(kv, contacts);
  return contact;
}

export async function getContact(
  kv: ContactsDataFunctionArgs["context"]["CONTACTS"],
  id: Contact["id"]
) {
  await fakeNetwork(`contact:${id}`);
  let contacts = await getContactsFromCache(kv);
  let contact = contacts.find((contact) => contact.id === id);
  return contact ?? null;
}

export async function updateContact(
  kv: ContactsDataFunctionArgs["context"]["CONTACTS"],
  id: Contact["id"],
  updates: Partial<Omit<Contact, "id" | "createdAt">>
) {
  await fakeNetwork();
  let contacts = await getContactsFromCache(kv);
  let contact = contacts.find((contact) => contact.id === id);
  if (!contact) throw new Error(`No contact found for ${id}`);
  Object.assign(contact, updates);
  await set(kv, contacts);
  return contact;
}

export async function deleteContact(
  kv: ContactsDataFunctionArgs["context"]["CONTACTS"],
  id: Contact["id"]
) {
  let contacts = await getContactsFromCache(kv);
  let index = contacts.findIndex((contact) => contact.id === id);
  if (index > -1) {
    contacts.splice(index, 1);
    await set(kv, contacts);
    return true;
  }
  return false;
}

function set(
  kv: ContactsDataFunctionArgs["context"]["CONTACTS"],
  contacts: Contact[]
) {
  return kv.put("contacts", JSON.stringify(contacts));
}

let fakeCache: Record<string, true> = {};

async function fakeNetwork(key?: string) {
  if (!key) {
    fakeCache = {};
  }

  if (fakeCache[key!]) {
    return;
  }

  fakeCache[key!] = true;

  return new Promise((res) => {
    setTimeout(res, Math.random() * 800);
  });
}
