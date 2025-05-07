import { SupabaseClient } from "@supabase/supabase-js";

// create or replace function match_documents (
//     query_embedding vector(512),
//     match_threshold float,
//     match_count int
//   )


export const getRecommendations = async (
  text: string,
  client: SupabaseClient
) => {
  const { data, error } = await client.rpc("match_documents", {
    query_embedding: Array.from(Array(512).keys()),
    match_threshold: 0,
    match_count: 10,
  });

  if (error) {
    console.error(error);
  }

  return data;
};
