import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db.server';

export const loader = async () => {
  const count = await db.joke.count();
  const randomRowNumber = Math.floor(Math.random() * count);
  const [randomJoke] = await db.joke.findMany({
    skip: randomRowNumber,
    take: 1,
  });
  return json({ randomJoke });
};

export default function JokesIndexRoute() {
  const { randomJoke } = useLoaderData<typeof loader>();
  return (
    <div>
      <p>Here's a random joke:</p>
      <p>{randomJoke.content}</p>
    </div>
  );
}
