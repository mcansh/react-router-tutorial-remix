import * as React from "react";
import type {
  DataFunctionArgs,
  LinksFunction,
  MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Form,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useSubmit,
  useNavigation,
} from "@remix-run/react";
import { createContact, getContacts } from "./contacts";
import ErrorPage from "./error-page";
import appStylesHref from "./styles/index.css";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: appStylesHref }];
};

export async function loader({ request }: DataFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || undefined;
  const contacts = await getContacts(q);
  return { contacts, q };
}

export async function action() {
  const contact = await createContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  React.useEffect(() => {
    let input = document.getElementById("q");
    if (input && input instanceof HTMLInputElement && q) {
      input.value = q;
    }
  }, [q]);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div id="root">
          <div id="sidebar">
            <h1>React Router Contacts</h1>
            <div>
              <Form id="search-form" role="search">
                <input
                  id="q"
                  className={searching ? "loading" : ""}
                  aria-label="Search contacts"
                  placeholder="Search"
                  type="search"
                  name="q"
                  defaultValue={q}
                  onChange={(event) => {
                    const isFirstSearch = q == null;
                    submit(event.currentTarget.form, {
                      replace: !isFirstSearch,
                    });
                  }}
                />
                <div id="search-spinner" aria-hidden hidden={!searching} />
                <div className="sr-only" aria-live="polite"></div>
              </Form>
              <Form method="post">
                <button type="submit">New</button>
              </Form>
            </div>
            <nav>
              {contacts.length ? (
                <ul>
                  {contacts.map((contact) => (
                    <li key={contact.id}>
                      <NavLink
                        to={`contacts/${contact.id}`}
                        className={({ isActive, isPending }) =>
                          isActive ? "active" : isPending ? "pending" : ""
                        }
                      >
                        {contact.first || contact.last ? (
                          <>
                            {contact.first} {contact.last}
                          </>
                        ) : (
                          <i>No Name</i>
                        )}{" "}
                        {contact.favorite && <span>★</span>}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  <i>No contacts</i>
                </p>
              )}
            </nav>
          </div>
          <div
            id="detail"
            className={navigation.state === "loading" ? "loading" : ""}
          >
            <Outlet />
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorPage error={error} />;
}

export function CatchBoundary() {
  let caught = useCatch();
  let error = new Error(caught.statusText);
  return <ErrorPage error={error} />;
}
