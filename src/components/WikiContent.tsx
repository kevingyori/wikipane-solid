import { Globe } from "lucide-solid";
import { WikiPage } from "./WikiPage";
import { ErrorBoundary, Match, Suspense, Switch } from "solid-js";
import { CreateQueryResult } from "@tanstack/solid-query";

export function WikiContent({
  page,
  pageTitle,
  html,
  title,
}: {
  page: CreateQueryResult<string, Error>;
  pageTitle: string;
  html: () => Document;
  title: string;
}) {
  return (
    <Switch>
      <Match when={page.isPending}>
        <>
          <div class="text-2xl font-bold">{title}</div>
          {/* <Globe class="mx-auto mt-8 w-6 animate-spin" /> */}
        </>
      </Match>
      <Match when={page.isError}>
        <span>Error: {page.error?.message}</span>
      </Match>
      <Match when={page.data}>
        <WikiPage html={html} pageTitle={pageTitle} />
      </Match>
    </Switch>
  );
}
