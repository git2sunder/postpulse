import { getSession } from '@auth0/nextjs-auth0';
import { supabase } from "../../lib/supabaseClient";
import { AppLayout } from "../../components/AppLayout";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import { getAppProps } from '../../utils/getAppProps';
import { useState } from 'react';
// (import other modules as before...)

export default function Post(props) {
  const [editMode, setEditMode] = useState(false);
  const [editedPost, setEditedPost] = useState(props.post.post);

  const handleEditButton = () => {
    setEditMode(!editMode);
  };

  const handleSaveButton = async () => {
    const { data, error } = await supabase
      .from('Posts')
      .update({ post: editedPost })
      .eq('id', props.post.id);
    if (error) {
      console.error(error);
    } else {
      setEditMode(false);
    }
  };

  return (
    <div className='flex flex-col h-full p-8 space-y-8'>
      <div className='text-xl font-bold p-2 bg-stone-200 rounded-lg'>
        Blog Post
      </div>
      <div className="flex flex-row space-x-4">
        <div className="w-3/5 p-2 rounded-lg shadow-lg border border-gray-200">
          {editMode
            ? <textarea value={editedPost} onChange={(e) => setEditedPost(e.target.value)} className="mt-4 w-full h-64 p-2 rounded border border-gray-200" />
            : <div dangerouslySetInnerHTML={{__html: props.post.post || " "}}></div>
          }
        </div>
        <div className="w-2/5 p-2 rounded-lg shadow-lg border border-gray-200">
          {props.post.image && 
            <img src={props.post.image} alt="Post" className="w-full rounded-lg" />
          }
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <button onClick={handleEditButton} className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-700 transition duration-300 ease-in-out shadow-md">Edit</button>
        {editMode && 
          <button onClick={handleSaveButton} className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-700 transition duration-300 ease-in-out shadow-md">Save</button>
        }
      </div>
    </div>
  );
}
// (getLayout and getServerSideProps functions as before...)

  
Post.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = async (ctx) => {
  const userSession = await getSession(ctx.req, ctx.res);
  const props = await getAppProps(ctx);
  console.log('getServerSideProps in PostID page is running'); // Add this line


  // If no session exists, redirect to login
  if (!userSession) {
    return {
      redirect: {
        destination: '/',  // Adjust according to your login path
        permanent: false,
      },
    }
  }

  const userId = userSession.user.sub;
  const postId = ctx.params.postId;

  const { data, error } = await supabase
    .from('Posts')
    .select('id,title, post, topic, keywords,image')
    .eq('user_id', userId)
    .eq('id', postId);

  if (error) {
    console.error(error);
    return {
      redirect: {
          destination: "/post/new",
          permanent: false
      }
    }
  }

  return {
    props: { 
      post: data[0],
      ...props,

    },
  };
};