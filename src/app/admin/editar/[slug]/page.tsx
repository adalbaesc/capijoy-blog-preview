import {createServerClient} from '@/lib/supabaseServer';
import EditPostForm from '@/components/EditPostForm';
import {notFound} from 'next/navigation';

export default async function EditPostPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;

  const supabase = await createServerClient();
  const {data: post} = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('locale', 'pt')
    .single();

  if (!post) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Editar Post: {post.title}</h1>
      <EditPostForm post={post} />
    </div>
  );
}
