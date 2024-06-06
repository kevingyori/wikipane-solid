import { Link, MetaProvider } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import { For, createMemo, createSignal } from "solid-js";
import { Pane } from "~/components/Pane";

export default function WikiPanes() {
  const [searchParams] = useSearchParams();
  const searchParamsArray = createMemo(() => searchParams.page?.split(","));
  const [animatePane, setAnimatePane] = createSignal("");

  return (
    <>
      <MetaProvider>
        <Link rel="stylesheet" href="/wikipedia.css" />
      </MetaProvider>
      <For each={searchParamsArray()}>
        {(title, index) => (
          <Pane
            title={title}
            index={index()}
            animatePane={animatePane()}
            setAnimatePane={setAnimatePane}
          />
        )}
      </For>
    </>
  );
}
