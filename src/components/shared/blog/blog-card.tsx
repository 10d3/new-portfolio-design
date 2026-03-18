import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface BlogCardProps {
  title: string,
  href: string,
  image: string,
  description: string,
  category: string,
  author: {
    name: string,
    avatar: string
  }
  featured: boolean
  date: Date
}

export default function BlogCard({ title, href, image, description, category, author, featured, date }: BlogCardProps) {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
  return (
    <Link href={href}>
      <Card className={`px-2 py-4 md:px-4 md:py-4 m-0 ${featured ? "md:flex-row-reverse flex-col-reverse" : "flex-col-reverse"}`}>
        <CardHeader className={`${featured ? "w-full md:w-1/2 md:my-auto md:flex md:flex-col md:align-middle md:justify-center" : "w-full"} p-0 m-0`}>
          <p>{formatted}</p>
          <CardTitle className="text-4xl font-bold line-clamp-2 m-0">{title}</CardTitle>
          <CardDescription className="m-0 line-clamp-2">{description}</CardDescription>
          <div className="flex flex-row mt-3 text-balance align-middle gap-1 text-sm font-light">
            By
            {author && <Avatar className="size-6 rounded-xs">
              <AvatarImage src={author.avatar || "/showcase.png"} alt={author.name} />
              <AvatarFallback className="rounded-lg">
                {author.name.split(' ').filter(Boolean).map(word => word[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>}
            {author && <p className="font-bold">{author.name}</p>} ・<p className="text-muted-foreground">#{category}</p>
          </div>
        </CardHeader>
        <CardContent className={`${featured ? "w-full md:w-1/2" : "w-full"} rounded-lg shadow-lg p-0.5 m-0 border`}>
          <Image alt={title} src={image} height={1440} width={2700} className=" object-contain rounded-lg" />
        </CardContent>
      </Card>
    </Link>
  )
}

