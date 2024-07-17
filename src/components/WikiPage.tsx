import { useSearchParams } from "@solidjs/router";
import { Link, MetaProvider } from "@solidjs/meta";
import {
  JSX,
  Setter,
  Show,
  Suspense,
  createMemo,
  createResource,
  useTransition,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { Motion } from "solid-motionone";
import { Globe } from "lucide-solid";

const ignoredTags = new Set(["link", "meta", "base", "style"]);

const voidElements = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

type WikiPageProps = {
  html: Document | undefined;
  pageTitle: string;
  title: () => string;
  animatePane: string;
  setAnimatePane: Setter<string>;
};

export function WikiPage(props: WikiPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, start] = useTransition();
  const searchParamsArray = createMemo(
    () => searchParams.page?.split(",") ?? [],
  );

  const handleLinkClick = (title: string | null) => {
    if (title === null) return;

    if (!searchParamsArray().includes(title)) {
      props.setAnimatePane(title);
      const currentPageIndex = searchParamsArray().indexOf(props.title());
      const newParams = [...searchParamsArray()];
      newParams.splice(currentPageIndex + 1, 0, title);

      setSearchParams({ page: newParams.join(",") });
    }
  };

  const isWhitespaceTextNode = (node: ChildNode) => {
    return (
      node.nodeType === Node.TEXT_NODE && !/\S/.test(node.textContent || "")
    );
  };

  const transformNodeToElement = (node: ChildNode) => {
    if (isWhitespaceTextNode(node)) {
      return null;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();

    if (ignoredTags.has(tagName)) {
      return null;
    }

    const children = Array.from(element.childNodes).map((child) =>
      transformNodeToElement(child),
    );

    // if (tagName === "style") {
    //   return (
    //     <MetaProvider>
    //       <Style>{element.textContent}</Style>
    //     </MetaProvider>
    //   );
    // }

    // const className = element.getAttribute("class") || undefined;
    // const attributes = Array.from(element.attributes).reduce(
    //   (acc, attr) => ({ ...acc, [attr.name]: attr.value }),
    //   {},
    // );

    const typeOf = element.getAttribute("typeof") || null;
    const className = element.getAttribute("class") || null;
    const style = element.getAttribute("style") || null;
    const colspan = element.getAttribute("colspan") || null;
    const src = tagName === "img" ? element.getAttribute("src") || null : null;

    // if (tagName === "script") {
    //   createScriptLoader({
    //     src: attributes.src ?? element.textContent,
    //     ...attributes,
    //   });
    //   return null;
    // }

    if (tagName === "a") {
      if (element.getAttribute("rel") !== "mw:WikiLink") {
        return (
          <a
            class={"non-wiki-link " + className}
            onclick={(e) => e.preventDefault()}
          >
            {children}
          </a>
        );
      }
      const title = element.getAttribute("title") || null;
      if (title === null) {
        return (
          <a
            class={"non-wiki-link " + className}
            onclick={(e) => e.preventDefault()}
          >
            {children}
          </a>
        );
      }

      return (
        <a
          class={
            searchParamsArray().includes(title)
              ? "bg-blue-200"
              : "" + " " + className
          }
          onClick={() => {
            handleLinkClick(title);
          }}
        >
          {children}
        </a>
      );
    }

    const props = {
      typeOf,
      className,
      style,
      colspan,
      src,
    };

    if (voidElements.has(tagName)) {
      return <Dynamic component={tagName} {...props} />;
    }

    return <Dynamic component={tagName} {...props} children={children} />;
  };

  const renderedBody = () => {
    if (!props.html) {
      return;
    }

    const nodes = Array.from(props.html.body.childNodes).map((node) =>
      transformNodeToElement(node),
    );

    return nodes;
  };

  const [renderedResource] = createResource(async () => {
    // delay rendering until the animation is complete
    setTimeout(() => {}, 300);
    return renderedBody();
  });

  return (
    <div class="w-full h-full">
      <div class="text-2xl font-bold" innerHTML={props.pageTitle} />
      <Show when={props.html !== null}>
        <Suspense>
          <Motion
            class="prose max-w-none"
            animate={{ opacity: [0, 1] }}
            transition={{ duration: 0.2, easing: "ease-in-out", delay: 0.4 }}
          >
            {/* {renderedBody()} */}
            {renderedResource()}
          </Motion>
        </Suspense>
      </Show>
    </div>
  );
}
