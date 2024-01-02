import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./tailwind.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default function App() {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-screen overflow-hidden">
        <div className="flex h-full flex-col">
          <div className="bg-gray-800">
            <img
              src="/remix-logo-new@dark.png"
              alt="Remix Logo: Colorful letters glowing on a dark background"
              className="h-16 p-2"
            />
          </div>

          <div className="min-h-0 flex-grow">
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
