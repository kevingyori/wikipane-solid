import { useSearchParams } from "@solidjs/router";
import { For } from "solid-js";
import { Pane } from "~/components/Pane";

export default function WikiPanes() {
  const [searchParams] = useSearchParams();
  const searchParamsArray = searchParams.page?.split(",");
  console.log(searchParamsArray);

  return (
    <>
      <For each={searchParamsArray} fallback={<div>Search for a page</div>}>
        {(title, index) => <Pane title={title} index={index()} />}
      </For>
    </>
  );
}
