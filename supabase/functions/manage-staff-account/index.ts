import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user: caller },
    } = await supabaseAdmin.auth.getUser(token);
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: callerRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    const isAdmin = callerRoles?.some((r: any) => r.role === "admin");
    
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { email, password, fullName, role, ldStaffId, clinicStaffId } = body;

      if (!email || !password || !fullName) {
        return new Response(
          JSON.stringify({ error: "Email, password, and full name required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Create auth user
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });

      if (createError) throw createError;

      const userId = newUser.user.id;

      // Assign role
      if (role) {
        await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: userId, role });
      }

      // Link to ld_staff
      if (ldStaffId) {
        await supabaseAdmin
          .from("ld_staff")
          .update({ user_id: userId })
          .eq("id", ldStaffId);
      }

      // Link to clinic staff
      if (clinicStaffId) {
        await supabaseAdmin
          .from("staff")
          .update({ user_id: userId })
          .eq("id", clinicStaffId);
      }

      return new Response(
        JSON.stringify({ success: true, userId }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (action === "update-password") {
      const { targetUserId, newPassword } = body;

      if (!targetUserId || !newPassword) {
        return new Response(
          JSON.stringify({ error: "Target user ID and new password required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Admin can change anyone's password; staff can only change their own
      const isSelf = caller.id === targetUserId;
      if (!isAdmin && !isSelf) {
        return new Response(
          JSON.stringify({ error: "You can only change your own password" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (newPassword.length < 6) {
        return new Response(
          JSON.stringify({ error: "Password must be at least 6 characters" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
          password: newPassword,
        });

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
