# Domain configuration: mycommunityhub.co.za

## Registrar summary

| Item | Value |
|------|--------|
| **Domain** | mycommunityhub.co.za |
| **Registration** | 1 year |
| **DNS management** | Free / 1 year |
| **Email forwarding** | Free / 1 year |
| **Hosting** | Not added yet — add when ready to go live |

### Default nameservers (parking)

- **Nameserver 1:** `parking1.zadns.co.za`
- **Nameserver 2:** `parking2.zadns.co.za`
- Nameservers 3–5: (optional)

---

## Using the domain with CommunityHub

### 1. Add hosting (when ready)

In your domain registrar panel, use “Add hosting” (or equivalent) so the domain can point to your app.

### 2. Point the domain to Vercel (frontend)

You can either **switch to Vercel’s nameservers** (recommended by Vercel for “Invalid Configuration”) or **keep your current DNS** and add A + CNAME records.

---

#### Option 1: Switch to Vercel DNS (fixes “Invalid Configuration” / 307)

Vercel is asking you to **update your domain’s nameservers**. Do this in your **domain registrar** (where you manage mycommunityhub.co.za), in the **Nameservers** section:

| Slot | Replace with |
|------|-------------------------------|
| **Nameserver 1** | `ns1.vercel-dns.com` |
| **Nameserver 2** | `ns2.vercel-dns.com` |
| Nameserver 3–5 | Leave empty or remove |

**Steps:**  
1. Open your registrar → **Domains** → **mycommunityhub.co.za** → **Nameservers** (or “DNS” / “Name servers”).  
2. Change from the current values (e.g. parking1.zadns.co.za, parking2.zadns.co.za) to **ns1.vercel-dns.com** and **ns2.vercel-dns.com**.  
3. Save. Propagation can take a few minutes up to 48 hours.  
4. In Vercel → **Domains**, click **Refresh** or **Verify**; both domains should turn valid and SSL will be issued.

**Note:** With Vercel DNS, you manage DNS inside Vercel. If you need email (SPF/DMARC), re-add those TXT records in Vercel → **Domains** → your domain → **DNS Records** after the switch.

---

#### Option 2: Keep current nameservers (parking1/2.zadns.co.za)

**Records you already have (keep these)** — for email only:

| Host Name | Record Type | Address | Priority |
|-----------|-------------|---------|----------|
| mycommunityhub.co.za. | SPF (txt) | `"v=spf1 mx a include:_spf.absolutehosting.joburg ~all"` | N/A |
| _dmarc.mycommunityhub.co.za. | SPF (txt) | `"v=DMARC1; p=none"` | N/A |

Do **not** remove these. They are for email (SPF/DMARC).

**Add these two records** in DNS Management (same panel: Host Name, Record Type, Address, Priority):

| Host Name | Record Type | Address | Priority |
|-----------|-------------|---------|----------|
| **@** or **mycommunityhub.co.za** (or leave blank if that = root) | **A (Address)** | **216.198.79.1** | N/A (leave blank or default) |
| **www** | **CNAME** | **d43cc91272f59430.vercel-dns-017.com.** | N/A |

- **Root:** Add one **A** record — Host Name = `@` or your provider’s option for “root domain”, Record Type = **A (Address)**, Address = **216.198.79.1**. Leave Priority blank (it’s for MX only).
- **www:** Add one **CNAME** — Host Name = **www**, Record Type = **CNAME**, Address = **d43cc91272f59430.vercel-dns-017.com.** (trailing dot optional if the panel adds it).

After saving, wait a few minutes (up to 48 hours in rare cases). Vercel will then verify and the domain should show as valid. Use “Refresh” or “Verify” in Vercel’s Domains page.

### 3. Backend (API) and CORS

- Keep your API on Render (e.g. `https://your-communityhub-api.onrender.com`).
- In Render (or `server/.env`), set:
  - `CLIENT_ORIGIN=https://mycommunityhub.co.za`
  - And if you use `www`: `CLIENT_ORIGIN` can list both origins if your stack supports it, or use the one you prefer as primary.
- In Vercel, keep `VITE_API_URL` pointing at that Render URL (the frontend will call the API by that URL).

### 4. Optional: API subdomain

If you want the API at e.g. `api.mycommunityhub.co.za`:

- Point `api.mycommunityhub.co.za` to your Render service (CNAME or A record as Render instructs).
- Then set `VITE_API_URL=https://api.mycommunityhub.co.za` in Vercel and use the same URL in `CLIENT_ORIGIN` on the backend.

---

## Checklist

- [ ] Hosting added at registrar (when going live)
- [ ] Domain added in Vercel (mycommunityhub.co.za and www)
- [ ] **Either:** nameservers set to **ns1.vercel-dns.com** and **ns2.vercel-dns.com** at registrar **or** A + CNAME records added at current DNS
- [ ] Vercel Domains page shows both domains as valid (not “Invalid Configuration”)
- [ ] If using Vercel DNS: re-add SPF/DMARC TXT records in Vercel for email
- [ ] `CLIENT_ORIGIN` on backend set to `https://mycommunityhub.co.za` (and www if used)
- [ ] SSL certificate active on Vercel (automatic once DNS is correct)
