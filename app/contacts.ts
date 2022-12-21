import { matchSorter } from "match-sorter";
import sortBy from "sort-by";
import LRUCache from "lru-cache";

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

declare global {
  var __cache__: LRUCache<string, Contact[]>;
}

let cache: LRUCache<string, Contact[]>;

if (!global.__cache__) {
  cache = new LRUCache<string, Contact[]>({ max: 100 });
  global.__cache__ = cache;
} else {
  cache = global.__cache__;
}

function getContactsFromCache(): Promise<Contact[]> {
  return new Promise<Contact[]>((res) => {
    let contacts = cache.get("contacts");
    if (contacts) return res(contacts);
    contacts = [] as Contact[];
    cache.set("contacts", contacts);
    return res(contacts);
  });
}

export async function getContacts(query?: string | undefined | null) {
  await fakeNetwork(`getContacts:${query}`);
  let contacts = await getContactsFromCache();
  if (query) {
    contacts = matchSorter(contacts, query, { keys: ["first", "last"] });
  }
  return contacts.sort(sortBy("last", "createdAt"));
}

export async function createContact() {
  await fakeNetwork();
  let id = Math.random().toString(36).substring(2, 9);
  let contact = { id, createdAt: Date.now() };
  let contacts = await getContacts();
  contacts.unshift(contact);
  await set(contacts);
  return contact;
}

export async function getContact(id: Contact["id"]) {
  await fakeNetwork(`contact:${id}`);
  let contacts = await getContactsFromCache();
  let contact = contacts.find((contact) => contact.id === id);
  return contact ?? null;
}

export async function updateContact(
  id: Contact["id"],
  updates: Omit<Contact, "id">
) {
  await fakeNetwork();
  let contacts = await getContactsFromCache();
  let contact = contacts.find((contact) => contact.id === id);
  if (!contact) throw new Error(`No contact found for ${id}`);
  Object.assign(contact, updates);
  await set(contacts);
  return contact;
}

export async function deleteContact(id: Contact["id"]) {
  let contacts = await getContactsFromCache();
  let index = contacts.findIndex((contact) => contact.id === id);
  if (index > -1) {
    contacts.splice(index, 1);
    await set(contacts);
    return true;
  }
  return false;
}

function set(contacts: Contact[]) {
  return new Promise((res) => {
    res(cache.set("contacts", contacts));
  });
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
