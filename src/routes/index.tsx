import { createSignal } from "solid-js";
import { Options } from "~/components/Options";
import { Search } from "~/components/Search";
import WikiPanes from "~/components/WikiPanes";

export default function Home() {
  const [searchOpen, setSearchOpen] = createSignal(false);

  return (
    <>
      <div class="flex h-screen w-screen flex-row overflow-y-hidden overflow-x-scroll scrollbar-thin">
        <WikiPanes />
        <Search open={searchOpen} setOpen={setSearchOpen} />
        <Options
          setSearchOpen={setSearchOpen}
          searchOpen={() => searchOpen()}
        />
      </div>
    </>
  );
}
