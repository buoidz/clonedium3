import Head from "next/head";
import type { GetStaticProps, NextPage } from "next";
import { LoadingPage } from "~/components/loading";
import { api } from "~/utils/api";


import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/helper/ssgHelper";




const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {

  const { data, isLoading } = api.post.getPostById.useQuery({
    id,
  })

  if (isLoading) return <LoadingPage/>;

  if (!data) return <div>Something went wrong!</div>

  return (
    <>
      <Head>
        <title>{`${data.post.content} - ${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const helper = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id != "string") throw new Error ("No id");


  await helper.post.getPostById.prefetch({ id });


  return {
    props: {
      trpcState: helper.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return {paths: [], fallback: "blocking"};
};


export default SinglePostPage;

