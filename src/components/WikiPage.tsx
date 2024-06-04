export function WikiPage({
  body,
  pageTitle,
}: {
  body: HTMLBodyElement;
  pageTitle: string;
}) {
  return (
    <div class="w-full">
      <div class="text-2xl font-bold">{pageTitle}</div>
      <div class="prose max-w-none" innerHTML={body.innerHTML}></div>
    </div>
  );
}
