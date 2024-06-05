import { useSearchParams } from "@solidjs/router";
import { For, createMemo } from "solid-js";
import { Pane } from "~/components/Pane";

export default function WikiPanes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsArray = createMemo(() => searchParams.page?.split(","));

  return (
    <>
      <For
        each={searchParamsArray()}
        fallback={
          <div>
            <a href="/?page=hey">New page</a>
          </div>
        }
      >
        {(title, index) => <Pane title={title} index={index()} />}
      </For>
    </>
  );
}
