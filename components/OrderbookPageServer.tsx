import { OrderbookChart } from "@/components/OrderbookChart";

const CACHE_TIME_KEY_IN_SECONDS = 30;

async function getData() {
  const res = await fetch('https://api.example.com/...', { next: { revalidate: CACHE_TIME_KEY_IN_SECONDS } });
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  // Recommendation: handle errors
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }

  return res.json();
}


export default async function Page({
  params,
}: {
  params: { slug: string[] | undefined };
}) {


  return (
    <div>
      <div className="relative z-10 flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-start p-4">
          <OrderbookChart height={400} width={800} />
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
