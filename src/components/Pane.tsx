import { useSearchParams } from "@solidjs/router";
import { Motion } from "solid-motionone";
import {
  Match,
  Setter,
  Show,
  Switch,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";
import { WikiPage } from "./WikiPage";
import { WikiTitle } from "./WikiTitle";
import { createQuery } from "@tanstack/solid-query";
import { Globe, SquareX } from "lucide-solid";

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

const closePane = function closePane(
  searchParamsArray: () => string[],
  setSearchParams: (params: { page: string | null }) => void,
  title: string,
) {
  if (searchParamsArray().length === 1) {
    setSearchParams({ page: null });
  }
  const newParams = searchParamsArray().filter((p) => p !== title);
  setSearchParams({ page: newParams.join(",") });
};

type PaneProps = {
  title: string;
  index: number;
  animatePane: string;
  setAnimatePane: Setter<string>;
};

export function Pane(props: PaneProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = createQuery(() => ({
    queryKey: [props.title],
    queryFn: () => fetchPage(props.title),
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

  const [paneRef, setPaneRef] = createSignal<HTMLElement | null>(null);

  createEffect(() => {
    // scroll element into view
    if (props.animatePane === props.title) {
      paneRef()?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  });

  return (
    <Motion
      ref={setPaneRef}
      class="shadow-xl shadow-gray-300"
      animate={{
        opacity: props.animatePane === props.title ? [0, 1] : "",
        scale: props.animatePane === props.title ? [0.9, 1] : "",
      }}
      transition={{ duration: 0.2, easing: "ease-in-out" }}
      style={{
        position: "sticky",
        left: props.index * 40 + "px",
        right:
          -650 + (searchParamsArray().length - props.index - 1) * 40 + "px",
        display: searchParamsArray().includes(props.title) ? "block" : "none",
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
              closePane(searchParamsArray, setSearchParams, props.title)
            }
            class="p-2"
          >
            <SquareX class="text-gray-200 transition-colors group-hover:text-gray-400 hover:!text-red-600" />
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
                <Globe class="mx-auto mt-8 w-6 animate-spin" />
              </>
            </Match>
            <Match when={page.isError}>
              <span>Error: {page.error?.message}</span>
            </Match>
            <Match when={page.data}>
              <WikiPage
                html={html()}
                pageTitle={pageTitle()}
                title={() => props.title}
                animatePane={props.animatePane}
                setAnimatePane={props.setAnimatePane}
              />
            </Match>
          </Switch>
        </div>
      </div>
    </Motion>
  );
}
