import { supabase } from "./supabaseClient";

const PASSIVE_BLOOM_TABLE = "passivebloom";

export type PassiveBloomRow = {
  id: number;
  created_at: string;
  amount: number;
};

export class PassiveBloom {
  static async getAll(): Promise<PassiveBloomRow[]> {
    const { data, error } = await supabase
      .from(PASSIVE_BLOOM_TABLE)
      .select("*");
    if (error) throw error;
    return data as PassiveBloomRow[];
  }

  static async getById(id: number): Promise<PassiveBloomRow | null> {
    const { data, error } = await supabase
      .from(PASSIVE_BLOOM_TABLE)
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as PassiveBloomRow;
  }

  // Add more methods as needed (insert, update, delete)
}
