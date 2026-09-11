import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseClient;

export function getSupabaseClient() {
	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error("Supabase environment variables are required.");
	}

	if (!supabaseClient) {
		supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
	}

	return supabaseClient;
}

export const supabase = new Proxy(
	{},
	{
		get(_target, prop) {
			const client = getSupabaseClient();
			const value = client[prop];
			return typeof value === "function" ? value.bind(client) : value;
		},
	}
);