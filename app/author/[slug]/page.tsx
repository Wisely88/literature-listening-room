import { notFound } from "next/navigation";
import { AuthorProfile } from "@/components/author/author-profile";
import { getAllWorks, getAuthorBySlug } from "@/lib/content/repository";

type AuthorPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  const works = await getAllWorks({ author: author.id });

  return <AuthorProfile author={author} works={works} />;
}
