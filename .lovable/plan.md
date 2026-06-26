# BivaroX — Volledig Feature- & Technisch Overzicht

> Dit is een rapport, geen implementatieplan. Geen acties nodig — enkel ter kennisname.

## 1. Concept

Multi-tenant B2B platform voor Belgische bedrijven met **twee portalen**:
- **Klantportaal** — contractmanagement (alle leveranciers­contracten centraal beheren, monitoren en analyseren).
- **Leveranciersportaal** — marktplaats voor geanonimiseerde leads uit aflopende contracten, betaald met credits.

Branding: BivaroX, tekstueel logo (geen afbeelding), Navy / Amber / Sage palet, Inter font, Stripe/Notion-achtige esthetiek. White-label (geen Lovable-badge).

---

## 2. Klantportaal — Features

### 2.1 Dashboard (`/dashboard`)
- KPI-kaarten: totaal aantal contracten, totale waarde, maandkosten, **Actie Vereist** (telt verlopen + bijna verlopen, rood bij kritiek).
- Snelkoppelingen naar contracten, categorieën, marktplaats.

### 2.2 Contractbeheer (`/dashboard/contracts`)
- CRUD op contracten met velden: naam, leverancier, categorie, looptijd (start/einddatum), maand- en jaarkost, totale waarde, opzegtermijn, contactgegevens, verantwoordelijke, aantal devices, notities.
- **Statuslogica** via DB-trigger `set_contract_status` + functie `calculate_contract_status`:
  - `expired` (rood) zodra einddatum < vandaag.
  - `expiring` (geel) binnen opzegtermijn of 90 dagen.
  - `active` (groen) daarbuiten.
- Formulier ondersteunt manueel intypen van datums (dd-mm-jjjj) én kalender­selectie; kostenvelden selecteren auto bij focus.
- **PDF-upload** (contracten + facturen) gekoppeld aan contract.
- **ContractDetailsDialog**: volledige weergave incl. documenten, kosten, contactinfo.

### 2.3 Categoriebeheer (`/dashboard/categories`)
- 41 standaardcategorieën (wagens, IT, HR, telecom, energie, verzekeringen, …) — beveiligd, niet verwijderbaar.
- Gebruikers kunnen eigen categorieën aanmaken, bewerken, verwijderen.

### 2.4 Bedrijfsprofiel (`/dashboard/company`)
- Velden: bedrijfsnaam, contactpersoon, e-mail, telefoon, straat + nr, postcode, stad, **provincie** (BE), **sector**.
- Sector + provincie worden gebruikt als anonieme metadata bij leads.

### 2.5 Instellingen (`/dashboard/settings`)
- **OCR-toggle** (`ocr_enabled` op profiel) — voorbereid maar standaard uit; toekomstige premium-feature via Lovable AI Gateway.

### 2.6 Documenten
- Private storage bucket `documents`.
- Veilig openen via **Blob-URL** (omzeilt ad-blockers, 60s TTL, niet deelbaar).
- RLS: alleen eigenaar of koper van bijhorende lead.

### 2.7 Notificaties
- Edge function `check-contract-notifications` controleert 6m / 3m / 1m voor einddatum.
- Dagelijks om 08:00 via `pg_cron` + `pg_net`.

### 2.8 Marktplaats-publicatie
- Klant publiceert aflopend contract als lead met:
  - **Data-selectie checkboxes**: maandkosten ja/nee, PDF contract ja/nee, PDF facturen ja/nee → bepaalt tier automatisch.
  - **Max. aantal leveranciers** dat lead mag claimen.
  - **Verplichte GDPR-toestemming** met dynamische sector­tekst.
- Knop **"Van marktplaats halen"** zolang nog niet geclaimd.

---

## 3. Leveranciersportaal (`/supplier`) — Features

### 3.1 Inbox
- Realtime lijst van open, **geanonimiseerde** leads (enkel sector, provincie, categorie, einddatum, devices).
- Telt "X van Y leveranciers" beschikbaar (dedup).

### 3.2 Lead-tiers
- **Basis** — contactinfo na claim.
- **Premium** — alles behalve PDF's.
- **Elite** — alles incl. PDF's.
Tier wordt bepaald door de checkboxes van de klant.

### 3.3 Mijn Leads
- Geclaimde leads met volledige detailweergave conform tier.
- PDF-toegang strikt gecontroleerd via `get_lead_documents()`.

### 3.4 Credits
- Saldo + demo-aankopen.
- `calculate_lead_credits()` bepaalt prijs op basis van max. leveranciers en data-zichtbaarheid.

### 3.5 Profiel
- Bedrijfsgegevens, activatie leveranciersmodus (`is_supplier`).

---

## 4. Authenticatie & Rollen

- Email/wachtwoord + Magic Link.
- Geen anonieme signup.
- `handle_new_user()` trigger maakt profile + default rol `viewer`.
- Rollen in aparte tabel `user_roles` (enum `app_role`).
- `has_role()` en `is_supplier()` zijn `SECURITY DEFINER` helpers om RLS-recursie te vermijden.

---

## 5. Database — Tabellen

| Tabel | Doel |
|---|---|
| `profiles` | Bedrijfs- en contactgegevens, sector, provincie, `is_supplier`, `ocr_enabled` |
| `user_roles` | Rolmapping (admin/viewer/…) |
| `contract_categories` | 41 standaard + custom categorieën |
| `contracts` | Hoofdtabel contracten (32 kolommen) |
| `documents` | PDF-metadata, gekoppeld aan contract |
| `marketplace_leads` | Gepubliceerde leads + claim-status |
| `credit_transactions` | Saldo-mutaties leveranciers |
| `notifications` | In-app meldingen |
| `supplier_appointments` | Afspraken tussen klant en leverancier |
| `supplier_ratings` | Beoordelingen |
| `blocked_suppliers` | Door klant geblokkeerde leveranciers |

---

## 6. Beveiligde Backend-functies

- `list_marketplace_listings()` — geanonimiseerde feed voor leveranciers.
- `get_my_claimed_leads()` — volledige details, alleen voor eigen geclaimde leads.
- `get_lead_documents(lead_id)` — PDF-paden vrijgegeven na status `claimed/in_progress/completed`.
- `can_supplier_access_document(object_name)` — storage-policy helper.
- `calculate_contract_status`, `set_contract_status` — auto-status.
- `calculate_lead_credits` — prijsberekening.
- `has_role`, `is_supplier` — RLS-helpers.

---

## 7. Beveiliging

- **RLS** op alle public tabellen. Contracts strikt eigenaar-only.
- Expliciete `GRANT`s per tabel (authenticated / service_role).
- Storage `documents` privaat; toegang via signed download → Blob-URL.
- GDPR-consent verplicht bij lead-publicatie.
- Lead-data tier-gestuurd vrijgegeven door SECURITY DEFINER functies (nooit directe SELECT vanuit client).

---

## 8. Infrastructuur

- **Stack**: React 18 + Vite 5 + TypeScript 5 + Tailwind v3 + shadcn/ui.
- **Backend**: Lovable Cloud (Supabase) — Postgres, Auth, Storage, Edge Functions.
- **Background jobs**: `pg_cron` + `pg_net` voor dagelijkse notificatie-check.
- **AI** (voorbereid, niet actief): Lovable AI Gateway voor toekomstige OCR.
- **PWA-ready**.

---

## 9. Openstaande / besproken items

- **OCR**: code-pad voorbereid, toggle aanwezig, nog niet geactiveerd (kost-controle).
- **Persoonsgegevens van derden op contracten**: opties besproken (AI-redactie, extra klantbevestiging, verplichte NDA voor leveranciers) — nog geen keuze gemaakt.
- Publicatie naar productie nog niet uitgevoerd.

---

Laat weten welk onderdeel u verder uitgewerkt wilt zien of welke volgende feature ik mag oppakken.
