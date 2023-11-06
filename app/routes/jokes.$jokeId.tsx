import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
  Form,
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useParams,
  useRouteError,
} from '@remix-run/react';
import { JokeDisplay } from '~/components/joke';
import { db } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/session.server';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  const joke = await db.joke.findUnique({ where: { id: params.jokeId } });
  if (!joke) {
    throw new Response('What a joke! Not found.', {
      status: 404,
    });
  }
  return json({ joke, isOwner: userId === joke.jokesterId });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const form = await request.formData();
  if (form.get('intent') !== 'delete') {
    throw new Response(`The intent ${form.get('intent')} is not supported`, {
      status: 400,
    });
  }
  const userId = await requireUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("Can't delete what does not exist", {
      status: 404,
    });
  }
  if (joke.jokesterId !== userId) {
    throw new Response("Pssh, nice try. That's not your joke", { status: 403 });
  }
  await db.joke.delete({
    where: {
      id: joke.id,
    },
  });
  return redirect('/jokes');
};

export default function JokeRoute() {
  const { joke, isOwner } = useLoaderData<typeof loader>();
  return <JokeDisplay isOwner={isOwner} joke={joke} />;
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 400) {
      return (
        <div className="error-container">
          What you're trying to do is not allowed.
        </div>
      );
    }
    if (error.status === 403) {
      return (
        <div className="error-container">
          Sorry, but "{jokeId}" is not your joke.
        </div>
      );
    }
    return (
      <div className="error-container">Huh? What the heck is "{jokeId}"?</div>
    );
  }

  return (
    <div className="error-container">
      There was an error loading joke by the id "${jokeId}". Sorry.
    </div>
  );
}
