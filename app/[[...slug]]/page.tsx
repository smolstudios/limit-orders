export default function Page({
  params,
}: {
  params: { slug: string[] | undefined };
}) {
  return (
    <div>
      <div className="relative z-10 flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-start p-4">
          <p className="mb-6 text-8xl font-medium text-white">
            {params.slug?.map((s) => {
              return <span key={s}> {s} </span>;
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
