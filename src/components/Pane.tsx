import { useSearchParams } from "@solidjs/router";
import { Show, createResource } from "solid-js";
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

type PaneProps = {
  title: string;
  index: number;
};

export function Pane(props: PaneProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // const page = createQuery(() => ({
  //   queryKey: ["page", title],
  //   queryFn: () => fetchPage(title),
  //   throwOnError: true,
  // }));

  const [page] = createResource(props.title, fetchPage);

  const parseHTML = (data: string) => {
    return new DOMParser().parseFromString(data, "text/html");
  };

  const html = () => parseHTML(page() ?? "");

  const pageTitle = () =>
    html().querySelector("head")?.querySelector("title")?.textContent ?? "";

  const searchParamsArray = () => searchParams.page?.split(",") ?? [];

  function closePane() {
    console.log("closePane", props.index, searchParamsArray());
    if (searchParamsArray().length === 1) {
      console.log("closePane", "last");
      setSearchParams({ page: null });
    }
    console.log("closePane", "remove", props.title);
    const newParams = searchParamsArray().filter((p) => p !== props.title);
    setSearchParams({ page: newParams.join(",") });
  }

  const left = () => props.index * 40;
  const right = () => -650 + (searchParamsArray.length - props.index - 1) * 40;
  const sidebarRight = () => props.index * 40 + "px";

  return (
    <div
      class="shadow-xl shadow-gray-300"
      style={{
        position: "sticky",
        left: left() + "px",
        right: right() + "px",
      }}
    >
      <div class="flex bg-white scrollbar-thin">
        {/* Sidebar */}
        <div
          class="group sticky w-10 min-w-10 cursor-vertical-text text-gray-700"
          style={{ "z-index": props.index, right: sidebarRight() }}
        >
          <button onClick={closePane} class="p-2">
            {/* <SquareX class="text-gray-200 transition-colors group-hover:text-gray-400 hover:!text-red-600" /> */}
            X
          </button>
          <Show when={page.error}>
            <WikiTitle title="Error" />
          </Show>
          <Show when={page.loading}>
            <WikiTitle title={props.title} />
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
              <div class="text-2xl font-bold">{props.title}</div>O
              {/* <Globe class="mx-auto mt-8 w-6 animate-spin" /> */}
            </>
          </Show>
          <Show when={page()}>
            <WikiPage html={page()} pageTitle={pageTitle()} />
          </Show>
        </div>
      </div>
    </div>
  );
}
