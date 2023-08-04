import { supabase } from "./../lib/supabaseClient";
export async function findOrCreateUser(auth0Id) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth0_id", auth0Id)
    .single();

  if (error) {
    throw error;
  }

  if (data) {
    return data;
  } else {
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([{ auth0_id: auth0Id }])
      .single();

    if (insertError) {
      throw insertError;
    }

    return newUser;
  }
}
