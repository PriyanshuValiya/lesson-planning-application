"use server";

import { createClient } from "@/utils/supabase/server";

export async function saveActualCieDraft(draftData: any) {
	const supabase = await createClient();

	try {
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw new Error("Authentication required");
		}

		// Verify the faculty_id matches the authenticated user
		const { data: userData, error: userError } = await supabase
			.from("users")
			.select("id")
			.eq("auth_id", user.id)
			.single();

		if (userError || !userData) {
			throw new Error("User not found");
		}

		if (userData.id !== draftData.faculty_id) {
			throw new Error("Unauthorized: Cannot save draft for another user");
		}

		// Check if a record already exists
		const { data: existingRecord, error: fetchError } = await supabase
			.from("actual_cies")
			.select("id")
			.eq("faculty_id", draftData.faculty_id)
			.eq("subject_id", draftData.subject_id)
			.eq("cie_number", draftData.cie_number)
			.eq("forms", draftData.forms)
			.maybeSingle();

		if (fetchError) {
			throw new Error(`Error checking existing record: ${fetchError.message}`);
		}

		let result;
		if (existingRecord?.id) {
			// Update existing record
			const { data, error } = await supabase
				.from("actual_cies")
				.update(draftData)
				.eq("id", existingRecord.id)
				.select()
				.single();

			if (error) {
				throw new Error(`Update failed: ${error.message}`);
			}

			result = data;
		} else {
			// Insert new record
			const { data, error } = await supabase
				.from("actual_cies")
				.insert(draftData)
				.select()
				.single();

			if (error) {
				throw new Error(`Insert failed: ${error.message}`);
			}

			result = data; 
		}

		return {
			success: true,
			data: result,
		};
	} catch (error: any) {
		console.error("Save actual CIE draft error:", error);
		return {
			success: false,
			error: error.message || "Failed to save draft",
		};
	}
}
