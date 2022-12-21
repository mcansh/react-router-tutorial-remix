import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "@remix-run/react";
import { getContacts } from "./contacts";
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

export async function loader() {
  const contacts = await getContacts();
  return { contacts };
}

export default function App() {
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
              <form id="search-form" role="search">
                <input
                  id="q"
                  aria-label="Search contacts"
                  placeholder="Search"
                  type="search"
                  name="q"
                />
                <div id="search-spinner" aria-hidden hidden={true} />
                <div className="sr-only" aria-live="polite"></div>
              </form>
              <form method="post">
                <button type="submit">New</button>
              </form>
            </div>
            <nav>
              <ul>
                <li>
                  <Link to={`contacts/1`}>Your Name</Link>
                </li>
                <li>
                  <Link to={`contacts/2`}>Your Friend</Link>
                </li>
              </ul>
            </nav>
          </div>
          <div id="detail">
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
