// CircuLib auth wiring for index.html
import { signUpWithRole, signIn, signInOAuth, redirectAfterLogin, currentRole, toast } from "/circulib/supabase-client.js";

// If already logged in, jump to dashboard
currentRole().then(({ user, role }) => {
  if (user && location.hash !== "#stay") redirectAfterLogin(role);
});

function selectedRole(form) {
  const active = form.querySelector(".role-pill.active");
  return active?.dataset.role || "student";
}
// Make role-pill clicks update active state (per-form scope)
document.querySelectorAll("#loginForm, #signupForm").forEach((form) => {
  form.querySelectorAll(".role-pill").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      form.querySelectorAll(".role-pill").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
});

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const role = selectedRole(e.target);
  try {
    await signIn({ email: fd.get("email"), password: fd.get("password") });
    toast("Welcome back!");
    redirectAfterLogin(role);
  } catch (err) { toast(err.message, true); }
});

document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const role = selectedRole(e.target);
  try {
    await signUpWithRole({
      email: fd.get("email"), password: fd.get("password"),
      fullName: fd.get("fullName"), role,
    });
    toast("Account created — signing you in...");
    try {
      await signIn({ email: fd.get("email"), password: fd.get("password") });
      redirectAfterLogin(role);
    } catch { toast("Check your email to confirm, then log in."); }
  } catch (err) { toast(err.message, true); }
});

document.getElementById("googleBtn")?.addEventListener("click", async () => {
  try { await signInOAuth("google"); } catch (e) { toast(e.message, true); }
});
document.getElementById("facebookBtn")?.addEventListener("click", async () => {
  try { await signInOAuth("facebook"); }
  catch (e) { toast("Facebook needs to be enabled in backend auth settings.", true); }
});

document.getElementById("forgotLink")?.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = prompt("Enter your email to reset password:");
  if (!email) return;
  const { sb } = await import("/circulib/supabase-client.js");
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: `${location.origin}/circulib/index.html`,
  });
  toast(error ? error.message : "Reset email sent.", !!error);
});
