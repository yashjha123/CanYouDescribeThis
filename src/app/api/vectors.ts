// // Mock function to get random images
// export async function getRandomImages(supabase: any) {
//   // In a real implementation, this would fetch from Supabase
//   // For now, we'll return mock data
//   return Array.from({ length: 9 }, (_, i) => ({
//     id: `img-${i}`,
//     src: `https://picsum.photos/seed/img-${i}/230/180`,
//     color: "black",
//     index: i,
//     selected: false,
//   }))
// }

// // Mock function to get text embeddings
// export async function getTextEmbeddings(text: string) {
//   // In a real implementation, this would call an embedding API
//   // For now, we'll return a mock embedding
//   return Array.from({ length: 1536 }, () => Math.random() * 2 - 1)
// }

// // Mock function to check if text matches images
// export async function checkIfTextMatchesImages(textEmbedding: number[], imageIds: string[], supabase: any) {
//   // In a real implementation, this would query Supabase for matches
//   // For now, we'll return random matches
//   const randomMatches = Math.random() > 0.5 ? [imageIds[Math.floor(Math.random() * imageIds.length)]] : []

//   return randomMatches.map((id) => ({
//     id,
//     similarity: 0.8 + Math.random() * 0.2, // Random similarity between 0.8 and 1.0
//   }))
// }

import { SupabaseClient } from "@supabase/supabase-js";
// interface CardType {
//   id: string,
//   src: string;
//   color: string;
//   index: number;
//   selected: boolean;
// }

// create or replace function match_documents (
//     query_embedding vector(512),
//     match_threshold float,
//     match_count int
//   )
export const getTextEmbeddings = async (text: string) => {
  // rest api fetch to
  // -H "Authorization: Bearer <your-API-key>"
  const token = process.env.NEXT_PUBLIC_CLIP_TOKEN as string;
  const URL = process.env.NEXT_PUBLIC_CLIP_SERVER_URL as string;
  const response = await fetch(URL+"/predictions/clip_text", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      "Authorization": `Bearer ${token}`,
    },
    body: text,
  }).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    return res.json();
  });
  return response;
};

export const getRecommendations = async (
  embedding: number[],
  client: SupabaseClient
) => {
  const { data, error } = await client.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: 0,
    match_count: 10,
  });

  if (error) {
    console.error(error);
  }

  return data;
};

export const getPublicURL = async (path: string, client: SupabaseClient) => {
  const { data } = client.storage.from("images").getPublicUrl(path);
  return data.publicUrl;
};

type RandomImage = {
  id: string;
  path: string;
};
export const getRandomImages = async (supabase: SupabaseClient) => {
  // rpc to get_random_images
  const { data, error } = await supabase.rpc("get_random_images", {});
  if (error) {
    console.error(error);
  }
  console.log(data);
  const populatedImages = data.map(async (item: RandomImage, index: number) => {
    return {
      id: item.path as string,
      src: await getPublicURL(item.path, supabase),
      color: "#03A791",
      index: index,
      selected: false,
    };
  });
  return Promise.all(populatedImages);
};

type MatchResult = {
  id: string;
  similarity: number;
};

const normalize_vector = (vector: number[]) => {
  const norm = Math.sqrt(vector.reduce((acc, val) => acc + val * val, 0));
  return vector.map((val) => val / norm);
};

export const checkIfTextMatchesImages = async (
  text_embeddings: number[],
  image_ids: string[],
  client: SupabaseClient
): Promise<MatchResult[]> => {
  const { data, error } = await client.rpc("match_documents_in_context", {
    query_embedding: normalize_vector(text_embeddings),
    id_list: image_ids,
  });

  console.log(data);
  if (error) {
    console.error(error);
    return [];
  }



  return data.filter((item: MatchResult) => item.similarity > 0.23);
};
