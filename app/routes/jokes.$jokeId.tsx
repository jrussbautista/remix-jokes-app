import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db.server';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const joke = await db.joke.findUnique({ where: { id: params.jokeId } });
  console.log('joke', joke);
  if (!joke) {
    throw new Error('Joke not found');
  }
  return json({ joke });
};

export default function JokeRoute() {
  const { joke } = useLoaderData<typeof loader>();
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{joke.content}</p>
      <Link to=".">"{joke.name}" Permalink</Link>
    </div>
  );
}
