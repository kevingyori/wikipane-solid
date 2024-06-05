import { createQuery } from "@tanstack/solid-query";
import { debounce } from "@solid-primitives/scheduled";
import { Command } from "cmdk-solid";
import "../cmdk.scss";
import { Portal } from "solid-js/web";
import {
  Accessor,
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js";
import { useSearchParams } from "@solidjs/router";

function fetchSearchResults(query: string) {
  if (query.length < 3) return { data: [], isPending: false, isError: false };
  const url = `https://en.wikipedia.org/w/api.php?origin=*&action=opensearch&format=json&search=${encodeURIComponent(query)}&namespace=0&limit=6&formatversion=2`;
  return fetch(url).then((res) => res.json());
}

export function Search({
  open,
  setOpen,
}: {
  open: Accessor<boolean>;
  setOpen: any;
}) {
  const [query, setQuery] = createSignal("");
  const [, setSearchParams] = useSearchParams();
  const results = createQuery(() => ({
    queryKey: [query()],
    queryFn: () => fetchSearchResults(query()),
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: query().length >= 3,
  }));
  const [title, setTitle] = createSignal("");
  const [searchParams] = useSearchParams();
  const isEmptyPage = () => searchParams.page?.split(",") === undefined;
  const [inputRef, setInputRef] = createSignal<HTMLInputElement | null>(null);

  const handleNavigateToPage = (title: string) => {
    // setSearchParams((prev) => {
    //   const wikiPages = prev.get("page")?.split(",");
    //   if (!wikiPages) {
    //     prev.append("page", title);
    //     return prev;
    //   }
    //   wikiPages?.push(title);
    //   prev.set("page", wikiPages?.join(","));
    //   return prev;
    // });
    if (!searchParams.page) {
      setSearchParams({ page: title });
      return;
    }
    const searchParamsArray = () => searchParams?.page?.split(",");

    if (!searchParamsArray().includes(title)) {
      setSearchParams({ page: [...searchParamsArray(), title].join(",") });
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen(!open());
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
    if (open() || isEmptyPage()) {
      if (e.key === "Enter") {
        // TODO: handle empty search
        if (query() === "") return;
        if (title() === "") return;
        e.preventDefault();
        setOpen(false);
        setQuery("");
        handleNavigateToPage(title());
      }
    }
  };

  createEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    onCleanup(() => document.removeEventListener("keydown", handleKeyDown));
  });

  createEffect(() => {
    if (open() || isEmptyPage()) {
      inputRef()?.focus();
    }
  });

  return (
    <Show when={open() || isEmptyPage()}>
      <Portal mount={document.getElementById("modal")}>
        <Command
          value={title()}
          onValueChange={setTitle}
          label="Search Wikipedia"
          class="linear fixed left-[50%] top-[35%] z-50 w-[32rem] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md border border-gray-200 bg-white shadow"
        >
          <Command.Input
            placeholder="Search Wikpedia"
            onValueChange={setQuery}
            value={query()}
            ref={setInputRef}
          />

          <Command.List>
            <Command.Empty>No results found.</Command.Empty>
            <Command.Separator />

            <Switch>
              <Match when={results.isError}>
                <div class="text-red-500">Error: {results.error?.message}</div>
              </Match>
              <Match when={results.data}>
                <For each={results.data[1]}>
                  {(result, i) => (
                    <Command.Item
                      onClick={() => {
                        const title = results.data[3][i()].substring(
                          results.data[3][i()].lastIndexOf("/") + 1,
                        );
                        handleNavigateToPage(title);
                      }}
                    >
                      {result}
                    </Command.Item>
                  )}
                </For>
              </Match>
            </Switch>
          </Command.List>
        </Command>
      </Portal>
    </Show>
  );
}
