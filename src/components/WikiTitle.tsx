export function WikiTitle({ title }: { title: string }) {
  return (
    <div
      class="w-screen origin-bottom-left rotate-90 bg-white pb-1.5 text-lg font-medium"
      innerHTML={title}
    />
  );
}
