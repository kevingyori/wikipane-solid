import { Search, Settings } from "lucide-solid";
import { Accessor, JSX, Setter, createSignal } from "solid-js";
import { Portal } from "solid-js/web";

function IconWrapper({
  children,
  ...args
}: {
  children: JSX.Element;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) {
  return (
    <div
      class="rounded-full border bg-white p-4 text-gray-900 transition-shadow duration-300 hover:cursor-pointer hover:shadow-lg"
      {...args}
    >
      {children}
    </div>
  );
}

export function Options({
  setSearchOpen,
  searchOpen,
}: {
  setSearchOpen: Setter<boolean>;
  searchOpen: Accessor<boolean>;
}) {
  const [open, setOpen] = createSignal(false);

  return (
    <Portal mount={document.body}>
      <div class="absolute bottom-4 right-3 flex flex-col-reverse gap-3 opacity-50 transition-all delay-500 duration-500 hover:opacity-100 hover:delay-0">
        <IconWrapper onClick={() => setOpen((p: boolean) => !p)}>
          <Settings />
        </IconWrapper>
        {open() ? (
          <div class="">
            <IconWrapper>
              <Search onClick={() => setSearchOpen(!searchOpen())} />
            </IconWrapper>
          </div>
        ) : null}
      </div>
    </Portal>
  );
}
