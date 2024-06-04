import { Globe } from "lucide-solid";
import { WikiPage } from "./WikiPage";
import { ErrorBoundary, Suspense } from "solid-js";

export function WikiContent({
  html,
  title,
  pageTitle,
}: {
  html: Document;
  title: string;
  pageTitle: string;
}) {
  return (
    <div class="scroll-y h-[calc(100vh-20px)] w-[650px] min-w-[650px] overflow-x-hidden overflow-y-scroll py-3 pr-3 scrollbar-thin">
      <ErrorBoundary fallback={<div>Error</div>}>
        <Suspense
          fallback={
            <>
              <div class="text-2xl font-bold">{title}</div>
              <Globe class="mx-auto mt-8 w-6 animate-spin" />
            </>
          }
        >
          <>
            <WikiPage html={html} pageTitle={pageTitle} />
          </>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
