import { Card, CardContent } from "@/components/ui/card";
import { client, urlFor } from "@/lib/sanity";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { simplenewsCard } from "@/lib/interface";

async function getData() {
  const query = `*[_type == 'news']{
    title,
    "slug":slug.current,
    content,
    description,
    postimage,
  }`;

  const data = await client.fetch(query);

  return data;
}

export default async function Home() {
  const data: simplenewsCard[] = await getData();
  
  return (
    <div className="grid grid-cols-1 laptop:grid-cols-3 pc:grid-cols-4 tablet:grid-cols-2 mt-5 gap-5 mb-20">
      {data && data.map((post, idx) => (
        <Card key={idx}>
          {post && (
            <>
              <Image
                src={urlFor(post.postimage).url()}
                alt="image"
                width={500}
                height={500}
                className="rounded-t-lg h-[200px] object-cover"
              />

              <CardContent className="mt-5">
                <h3 className="text-lg line-clamp-2 font-bold">{post.title}</h3>
                <p className="line-clamp-3 text-sm mt-2 text-gray-600 dark:text-gray-300">
                  {post.description}
                </p>
                <Button asChild className="w-full mt-5">
                  <Link href={`/news/${post.slug}`}>Read more</Link>
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}
