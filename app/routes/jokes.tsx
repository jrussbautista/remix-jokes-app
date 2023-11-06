import {
  json,
  type LoaderFunctionArgs,
  type LinksFunction,
} from '@remix-run/node';
import { Form, Link, Outlet, useLoaderData } from '@remix-run/react';

import stylesUrl from '~/styles/jokes.css';
import { db } from '~/utils/db.server';
import { getUser } from '~/utils/session.server';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const jokeListItems = await db.joke.findMany({
    select: {
      id: true,
      name: true,
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });
  const user = await getUser(request);
  return json({
    jokeListItems,
    user,
  });
};

export default function JokesRoute() {
  const { jokeListItems, user } = useLoaderData<typeof loader>();
  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link to="/" title="Remix Jokes" aria-label="Remix Jokes">
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {user ? (
            <div className="user-info">
              <span>{`Hi ${user.username}`}</span>
              <Form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </Form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {jokeListItems.map((joke) => (
                <li key={joke.id}>
                  <Link to={joke.id} prefetch="intent">
                    {joke.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
      <footer className="jokes-footer">
        <div className="container">
          <Link reloadDocument to="/jokes.rss">
            RSS
          </Link>
        </div>
      </footer>
    </div>
  );
}
