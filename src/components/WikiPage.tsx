import { useSearchParams } from "@solidjs/router";
import { Link, MetaProvider, Style } from "@solidjs/meta";
import { Show, createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";
import { transformCss } from "~/utils/transformCss";
import { createScriptLoader } from "@solid-primitives/script-loader";

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
  html: string | undefined;
  pageTitle: string;
};

export function WikiPage(props: WikiPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
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
      setSearchParams({ page: [...searchParamsArray(), title].join(",") });
    }
  };

  const isWhitespaceTextNode = (node: ChildNode) => {
    return (
      node.nodeType === Node.TEXT_NODE && !/\S/.test(node.textContent || "")
    );
  };

  const transformNodeToElement = (node: ChildNode, index: number) => {
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
    const children = Array.from(element.childNodes).map((child, idx) =>
      transformNodeToElement(child, idx),
    );

    if (tagName === "link" || tagName === "meta") {
      return null;
    }

    if (tagName === "style") {
      return (
        <MetaProvider>
          <Style>{element.textContent}</Style>
        </MetaProvider>
      );
    }

    const typeOf = element.getAttribute("typeof") || null;
    const className = element.getAttribute("class") || undefined;
    const style = element.getAttribute("style") || null;
    const colspan = element.getAttribute("colspan") || null;
    const src = tagName === "img" ? element.getAttribute("src") || null : null;
    const attributes = Array.from(element.attributes).reduce(
      (acc, attr) => ({ ...acc, [attr.name]: attr.value }),
      {},
    );

    if (tagName === "script") {
      createScriptLoader({
        src: attributes.src ?? element.textContent,
        ...attributes,
      });
      return null;
    }

    if (tagName === "a") {
      const title = element.getAttribute("title");
      if (element.getAttribute("rel") !== "mw:WikiLink") {
        return (
          <Anchor
            className={"non-wiki-link " + className}
            title={null}
            handleLinkClick={(e) => e.preventDefault()}
          >
            {children}
          </Anchor>
        );
      }

      return (
        <Anchor
          className={styleLinks(title || "") + " " + className}
          title={title}
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
    if (!props.html) return null;
    const document = new DOMParser().parseFromString(
      props.html || "",
      "text/html",
    );
    console.log("html: ", document);

    return Array.from(document.childNodes).map((node, index) =>
      transformNodeToElement(node, index),
    );
  };

  console.log(renderedBody());

  return (
    <div class="w-full">
      <MetaProvider>
        <Link rel="stylesheet" href="/wikipedia.css" />
      </MetaProvider>
      <div class="text-2xl font-bold">{props.pageTitle}</div>
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
  className: string;
  handleLinkClick: (
    e: MouseEvent & { currentTarget: HTMLAnchorElement; target: Element },
    title: string | null,
  ) => void;
  children;
  title: string | null;
}) {
  return (
    <a class={className} href="#" onClick={(e) => handleLinkClick(e, title)}>
      {children}
    </a>
  );
}
