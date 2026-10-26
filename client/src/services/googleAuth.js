/**
 * FutureSelector — Google Authentication Service
 * Uses Google Identity Services (GIS) standard web client.
 */

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "1001576703538-3n1on9k5c61tk54kgrdgehnjj0khu3mt.apps.googleusercontent.com";

/**
 * Ensures Google Identity Services (GIS) script is loaded
 */
export const loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.google?.accounts?.oauth2) {
      return resolve(window.google);
    }
    const existingScript = document.getElementById("google-gsi-client");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google));
      existingScript.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-gsi-client";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = (err) => reject(new Error("Failed to load Google Identity Services: " + err.message));
    document.head.appendChild(script);
  });
};

/**
 * Triggers the official Google OAuth 2.0 popup for 1-Click student sign-in
 *
 * @param {Object} options
 * @param {Function} options.onSuccess - Callback receiving { name, email, picture, googleId, accessToken }
 * @param {Function} options.onError - Callback on failure
 */
export const triggerGoogleAuth = async ({ onSuccess, onError }) => {
  try {
    await loadGoogleScript();

    if (!window.google?.accounts?.oauth2) {
      throw new Error("Google Identity Services is unavailable. Please check your internet connection.");
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "openid profile email",
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          if (onError) onError(new Error(tokenResponse.error_description || tokenResponse.error));
          return;
        }

        try {
          // Fetch student identity profile from Google UserInfo
          const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          });
          if (!userRes.ok) {
            throw new Error("Failed to fetch verified student profile from Google");
          }
          const googleProfile = await userRes.json();

          if (onSuccess) {
            onSuccess({
              name: googleProfile.name || "Student Aspirant",
              email: googleProfile.email,
              picture: googleProfile.picture || "",
              googleId: googleProfile.sub,
              accessToken: tokenResponse.access_token
            });
          }
        } catch (fetchErr) {
          if (onError) onError(fetchErr);
        }
      },
      error_callback: (error) => {
        if (onError) onError(new Error(error.message || "Google Authentication was cancelled."));
      }
    });

    // Request access token with account chooser popup
    tokenClient.requestAccessToken({ prompt: "select_account" });
  } catch (error) {
    if (onError) onError(error);
  }
};
