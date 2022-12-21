import { Meta, Links } from "@remix-run/react";

interface ErrorResponse extends Error {
  statusText?: string;
}

export default function ErrorPage({ error }: { error: ErrorResponse }) {
  console.error(error);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div id="root">
          <div id="error-page">
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occurred.</p>
            <p>
              <i>{error.statusText || error.message}</i>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
