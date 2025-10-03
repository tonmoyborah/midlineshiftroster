import { supabase } from "./supabase";

/**
 * Test Supabase connection and verify database setup
 */
export const testConnection = async () => {
  console.log("🔍 Testing Supabase connection...\n");

  try {
    // Test 1: Fetch clinics
    console.log("1️⃣ Testing clinics table...");
    const { data: clinics, error: clinicsError } = await supabase
      .from("clinics")
      .select("*");

    if (clinicsError) {
      console.error("❌ Clinics error:", clinicsError.message);
      return false;
    }
    console.log(`✅ Found ${clinics?.length || 0} clinics`);

    // Test 2: Fetch staff
    console.log("\n2️⃣ Testing staff table...");
    const { data: staff, error: staffError } = await supabase
      .from("staff")
      .select("*");

    if (staffError) {
      console.error("❌ Staff error:", staffError.message);
      return false;
    }
    console.log(`✅ Found ${staff?.length || 0} staff members`);

    // Test 3: Fetch leave requests
    console.log("\n3️⃣ Testing leave_requests table...");
    const { data: leaves, error: leavesError } = await supabase
      .from("leave_requests")
      .select("*");

    if (leavesError) {
      console.error("❌ Leave requests error:", leavesError.message);
      return false;
    }
    console.log(`✅ Found ${leaves?.length || 0} leave requests`);

    // Test 4: Fetch shift assignments
    console.log("\n4️⃣ Testing shift_assignments table...");
    const { data: shifts, error: shiftsError } = await supabase
      .from("shift_assignments")
      .select("*");

    if (shiftsError) {
      console.error("❌ Shift assignments error:", shiftsError.message);
      return false;
    }
    console.log(`✅ Found ${shifts?.length || 0} shift assignments`);

    // Test 5: Test database function
    console.log("\n5️⃣ Testing get_clinic_roster_for_date function...");
    const { data: roster, error: rosterError } = await supabase.rpc(
      "get_clinic_roster_for_date",
      {
        p_date: "2025-10-02",
      }
    );

    if (rosterError) {
      console.error("❌ Roster function error:", rosterError.message);
      return false;
    }
    console.log(`✅ Roster function works! Found ${roster?.length || 0} clinics`);

    console.log("\n🎉 All tests passed! Supabase is connected and working properly.\n");
    console.log("Database Summary:");
    console.log(`  - Clinics: ${clinics?.length || 0}`);
    console.log(`  - Staff: ${staff?.length || 0}`);
    console.log(`  - Leave Requests: ${leaves?.length || 0}`);
    console.log(`  - Shift Assignments: ${shifts?.length || 0}`);

    return true;
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return false;
  }
};

/**
 * Insert sample shift data if none exists
 */
export const insertSampleShifts = async () => {
  console.log("\n📝 Inserting sample shift data...");

  try {
    // Check if we have any shifts
    const { data: existingShifts } = await supabase
      .from("shift_assignments")
      .select("id")
      .limit(1);

    if (existingShifts && existingShifts.length > 0) {
      console.log("ℹ️  Shifts already exist, skipping sample data insertion");
      return;
    }

    // Get clinics and staff
    const { data: clinics } = await supabase
      .from("clinics")
      .select("id, name")
      .limit(3);

    const { data: doctors } = await supabase
      .from("staff")
      .select("id")
      .eq("role", "doctor")
      .limit(3);

    const { data: assistants } = await supabase
      .from("staff")
      .select("id")
      .eq("role", "dental_assistant")
      .limit(3);

    if (!clinics || !doctors || !assistants) {
      console.log("⚠️  No clinics/staff found, cannot insert sample data");
      return;
    }

    // Insert sample assignments for Oct 2, 2025
    const sampleShifts = [
      {
        clinic_id: clinics[0].id,
        staff_id: doctors[0].id,
        shift_date: "2025-10-02",
        is_visiting: false,
      },
      {
        clinic_id: clinics[0].id,
        staff_id: assistants[0].id,
        shift_date: "2025-10-02",
        is_visiting: false,
      },
      {
        clinic_id: clinics[1].id,
        staff_id: doctors[1].id,
        shift_date: "2025-10-02",
        is_visiting: false,
      },
      {
        clinic_id: clinics[2].id,
        staff_id: doctors[2].id,
        shift_date: "2025-10-02",
        is_visiting: true,
        notes: "Covering for colleague",
      },
    ];

    const { error } = await supabase
      .from("shift_assignments")
      .insert(sampleShifts);

    if (error) {
      console.error("❌ Error inserting sample data:", error.message);
      return;
    }

    console.log("✅ Sample shift data inserted successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

