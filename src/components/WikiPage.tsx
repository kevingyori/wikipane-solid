import { useSearchParams } from "@solidjs/router";
import { Link, MetaProvider } from "@solidjs/meta";
import { JSX, Show, createMemo, useTransition } from "solid-js";
import { Dynamic } from "solid-js/web";

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
};

export function WikiPage(props: WikiPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, start] = useTransition();
  const searchParamsArray = createMemo(
    () => searchParams.page?.split(",") ?? [],
  );
  const styleLinks = (linkTitle: string) => {
    return searchParamsArray().includes(linkTitle) ? "bg-blue-200" : "";
  };

  const handleLinkClick = (
    e: MouseEvent & { currentTarget: HTMLAnchorElement; target: Element },
    title: string | null,
  ) => {
    e.preventDefault();
    if (title === null) return;

    if (!searchParamsArray().includes(title)) {
      console.log("searchParamsArray: ", searchParamsArray());

      setSearchParams({ page: [...searchParamsArray(), title].join(",") });
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
    const children = Array.from(element.childNodes).map((child) =>
      transformNodeToElement(child),
    );

    if (ignoredTags.has(tagName)) {
      return null;
    }

    // if (tagName === "style") {
    //   return (
    //     <MetaProvider>
    //       <Style>{element.textContent}</Style>
    //     </MetaProvider>
    //   );
    // }

    const className = element.getAttribute("class") || undefined;
    const attributes = Array.from(element.attributes).reduce(
      (acc, attr) => ({ ...acc, [attr.name]: attr.value }),
      {},
    );

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
          <Anchor
            className={() => "non-wiki-link " + className}
            title={null}
            handleLinkClick={(e) => e.preventDefault()}
          >
            {children}
          </Anchor>
        );
      }

      return (
        <Anchor
          className={() => styleLinks(attributes.title || "") + " " + className}
          title={attributes.title}
          handleLinkClick={handleLinkClick}
        >
          {children}
        </Anchor>
      );
    }

    const props = {
      ...attributes,
    };

    if (voidElements.has(tagName)) {
      return <Dynamic component={tagName} {...props} />;
    }

    return <Dynamic component={tagName} {...props} children={children} />;
  };

  const renderedBody = () => {
    if (!props.html || !props.html?.hasChildNodes()) {
      // Display a loading state when props.html is an empty DOM
      return <div>Loading...</div>;
    }

    return Array.from(props.html.body.childNodes).map((node) =>
      transformNodeToElement(node),
    );
  };

  // console.log(renderedBody());

  return (
    <div class="w-full">
      <MetaProvider>
        <Link rel="stylesheet" href="/wikipedia.css" />
      </MetaProvider>
      <div class="text-2xl font-bold" innerHTML={props.pageTitle} />
      <Show when={renderedBody() !== null}>
        <div class="prose max-w-none">{renderedBody()}</div>
      </Show>
      {/* <Show when={props.html !== null}> */}
      {/*   <div class="prose max-w-none" innerHTML={props.html?.innerHTML}></div> */}
      {/* </Show> */}
    </div>
  );
}

function Anchor({
  className,
  children,
  title,
  handleLinkClick,
}: {
  className: () => string;
  handleLinkClick: (
    e: MouseEvent & { currentTarget: HTMLAnchorElement; target: Element },
    title: string | null,
  ) => void;
  children: JSX.Element;
  title: string | null;
}) {
  return (
    <a class={className()} href="#" onClick={(e) => handleLinkClick(e, title)}>
      {children}
    </a>
  );
}
