import { useSearchParams } from "@solidjs/router";
import {
  ErrorBoundary,
  Show,
  Suspense,
  createEffect,
  createResource,
} from "solid-js";
import { Globe, SquareX } from "lucide-solid";
import { WikiPage } from "./WikiPage";
import { WikiTitle } from "./WikiTitle";

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

export function Pane({ title, index }: { title: string; index: number }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // const page = createQuery(() => ({
  //   queryKey: ["page", title],
  //   queryFn: () => fetchPage(title),
  //   throwOnError: true,
  // }));

  const [page] = createResource(title, fetchPage);

  const parseHTML = (data: string) => {
    return new DOMParser().parseFromString(data, "text/html");
  };

  const html = () => parseHTML(page() ?? "");
  const body = () => html().querySelector("body");

  const pageTitle = () =>
    html().querySelector("head")?.querySelector("title")?.textContent ?? "";

  const searchParamsArray = () => searchParams.page?.split(",") ?? [];

  function closePane() {
    console.log("closePane", index, searchParamsArray());
    if (searchParamsArray().length === 1) {
      setSearchParams({ page: null });
    }
    searchParamsArray().splice(index, 1);
    setSearchParams({ page: searchParamsArray().join(",") });
  }

  const left = index * 40;
  const right = -650 + (searchParamsArray.length - index - 1) * 40;

  return (
    <div
      class="shadow-xl shadow-gray-300"
      style={{
        position: "sticky",
        left: left + "px",
        right: right + "px",
      }}
    >
      <div class="flex bg-white scrollbar-thin">
        {/* Sidebar */}
        <div
          class="group sticky w-10 min-w-10 cursor-vertical-text text-gray-700"
          style={{ "z-index": index, right: index * 40 + "px" }}
        >
          <button onClick={closePane} class="p-2">
            {/* <SquareX class="text-gray-200 transition-colors group-hover:text-gray-400 hover:!text-red-600" /> */}
            X
          </button>
          <Show when={page.error}>
            <WikiTitle title="Error" />
          </Show>
          <Show when={page.loading}>
            <WikiTitle title={title} />
          </Show>
          <Show when={page()}>
            <WikiTitle title={pageTitle()} />
          </Show>
        </div>
        {/* Content */}
        <div class="scroll-y h-[calc(100vh-20px)] w-[650px] min-w-[650px] overflow-x-hidden overflow-y-scroll py-3 pr-3 scrollbar-thin">
          <Show when={page.error}>
            <div>Error</div>
          </Show>
          <Show when={page.loading}>
            <>
              <div class="text-2xl font-bold">{title}</div>O
              {/* <Globe class="mx-auto mt-8 w-6 animate-spin" /> */}
            </>
          </Show>
          <Show when={page()}>
            {/* <div innerHTML={page()}></div> */}
            <WikiPage html={html()} body={body()} pageTitle={pageTitle()} />
          </Show>
        </div>
      </div>
    </div>
  );
}
