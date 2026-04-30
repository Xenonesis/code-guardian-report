/**
 * Next.js Instrumentation File
 * Runs once at server startup (both development and production).
 *
 * Purpose: Override DNS resolver to use Google's public DNS (8.8.8.8)
 * instead of the local DNS server which blocks certain Neon endpoints.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dns = await import("dns");

    // Use Google's public DNS to bypass local ISP/network DNS restrictions
    // This is needed because the local DNS server blocks *.neon.tech subdomains
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

    console.log(
      "[Instrumentation] DNS servers set to Google (8.8.8.8) and Cloudflare (1.1.1.1)"
    );
  }
}
