import { useSearchParams } from "@solidjs/router";
import { Match, Show, Switch, createMemo, createResource } from "solid-js";
import { WikiPage } from "./WikiPage";
import { WikiTitle } from "./WikiTitle";
import { createQuery } from "@tanstack/solid-query";

async function fetchPage(title: string) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/html/${title}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.text();
  } catch (error) {
    throw new Error("Network response was not ok");
  }
}

async function mockFetchPage(title: string): Promise<string> {
  const randomString = Math.random().toString(36).substring(7);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`<h1>${title}</h1><p>Some content
<a href="Some_Other_Page" rel="mw:WikiLink" title="${randomString}">Some Other Page</a>
</p>`);
    }, 2000);
  });
}

type PaneProps = {
  title: string;
  index: number;
};

export function Pane(props: PaneProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = createQuery(() => ({
    queryKey: [props.title],
    queryFn: () => mockFetchPage(props.title),
  }));

  const html = createMemo(() => {
    if (page.data) {
      return new DOMParser().parseFromString(page.data, "text/html");
    }
    return new DOMParser().parseFromString("", "text/html");
  });

  const pageTitle = createMemo(
    () =>
      html().querySelector("head")?.querySelector("title")?.textContent ?? "",
  );

  const searchParamsArray = createMemo(
    () => searchParams.page?.split(",") ?? [],
  );

  const closePane = function closePane(
    searchParamsArray: () => string[],
    index: number,
    title: string,
  ) {
    console.log("closePane", index, searchParamsArray());
    if (searchParamsArray().length === 1) {
      console.log("closePane", "last");
      setSearchParams({ page: null });
    }
    console.log("closePane", "remove", title);
    const newParams = searchParamsArray().filter((p) => p !== title);
    setSearchParams({ page: newParams.join(",") });
  };

  const left = createMemo(() => props.index * 40);
  const right = () => -650 + (searchParamsArray.length - props.index - 1) * 40;
  const sidebarRight = () => props.index * 40 + "px";

  return (
    <div
      class="shadow-xl shadow-gray-300"
      style={{
        position: "sticky",
        left: props.index * 40 + "px",
        right:
          -650 + (searchParamsArray().length - props.index - 1) * 40 + "px",
      }}
    >
      <div class="flex bg-white scrollbar-thin">
        {/* Sidebar */}
        <div
          class="group sticky w-10 min-w-10 cursor-vertical-text text-gray-700"
          style={{ "z-index": props.index, right: props.index * 40 + "px" }}
        >
          <button
            onClick={() =>
              closePane(searchParamsArray, props.index, props.title)
            }
            class="p-2"
          >
            {/* <SquareX class="text-gray-200 transition-colors group-hover:text-gray-400 hover:!text-red-600" /> */}
            X
          </button>
          <Show when={page.error?.message}>
            <WikiTitle title="Error" />
          </Show>
          <Show when={page.isPending}>
            <WikiTitle title={props.title} />
          </Show>
          <Show when={page.data}>
            <WikiTitle title={pageTitle()} />
          </Show>
        </div>
        {/* Content */}
        <div class="scroll-y h-[calc(100vh-20px)] w-[650px] min-w-[650px] overflow-x-hidden overflow-y-scroll py-3 pr-3 scrollbar-thin">
          <Switch>
            <Match when={page.isPending}>
              <>
                <div class="text-2xl font-bold">{props.title}</div>
                {/* <Globe class="mx-auto mt-8 w-6 animate-spin" /> */}
              </>
            </Match>
            <Match when={page.isError}>
              <span>Error: {page.error?.message}</span>
            </Match>
            <Match when={page.data}>
              <WikiPage html={html()} pageTitle={pageTitle()} />
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  );
}
