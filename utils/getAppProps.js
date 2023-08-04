import { getSession } from "@auth0/nextjs-auth0";
import { supabase } from '../lib/supabaseClient'

export const getAppProps = async (ctx) => {
  console.log('getAppProps called');  // <- Add this

  let userSession;
  try {
    userSession = await getSession(ctx.req, ctx.res);
    console.log('User session:', userSession);  // <- Add this
  } catch (error) {
    console.error('Error getting user session:', error);  // <- Add this
    throw error;  // This will stop execution of the function
  }

  

  // Access the user's ID
  const userId = userSession.user.sub;

  let data, error;
  try {
    const response = await supabase
      .from('Posts')
      .select('id, created_at,title, post, topic, keywords')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    data = response.data;
    error = response.error;

    
    console.log('Error:', error);
  } catch (error) {
    console.error('Error querying Supabase:', error);  // <- Add this
    throw error;  // This will stop execution of the function
  }

 // Check if data is null and return an empty array if it is
const posts = data ? data.map(({ id, created_at, ...rest }) => ({
  id,
  created: created_at,
  ...rest,
})) : [];



return { posts ,
postId: ctx.params?.postId || null }
};