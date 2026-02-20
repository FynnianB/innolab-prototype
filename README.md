# Innolab Prototype

This is a code bundle for Innolab Prototype. The original project is available at https://www.figma.com/design/wIAfyIwBLDK3K3ObHTqlQt/Innolab-Prototype.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Hosting: Cloudflare Pages (kostenlos)

Die App ist für **Cloudflare Pages** eingerichtet: saubere URL (z. B. `https://innolab-prototype.pages.dev`), unbegrenzte Bandbreite, automatischer Deploy bei jedem Push.

### Cloudflare Pages einrichten – Schritt für Schritt

**1. Cloudflare-Account**  
Falls noch keiner vorhanden: Auf [dash.cloudflare.com](https://dash.cloudflare.com) gehen und kostenlos registrieren bzw. anmelden.

**2. Zu Pages wechseln**  
Im Dashboard links **Workers & Pages** auswählen, dann oben rechts **Create** klicken → **Pages** → **Connect to Git**.

**3. GitHub verbinden**  
- Auf **Connect Git** klicken.  
- **GitHub** als Provider wählen und mit **Authorize Cloudflare** den Zugriff erlauben (einmalig).  
- Dein GitHub-Account wird angezeigt; bei Bedarf **Only select repositories** wählen und das Repo `innolab-prototype` freigeben.  
- **Install** bzw. **Save** bestätigen.

**4. Repository auswählen**  
- In der Liste das Repository **innolab-prototype** auswählen und **Begin setup** (bzw. **Install** / **Weiter**) klicken.

**5. Build-Einstellungen**  
Folgende Werte eintragen (Framework Preset ist egal, die Felder überschreiben):

| Einstellung | Wert |
|-------------|------|
| **Project name** | `innolab-prototype` (oder ein anderer Name – wird Teil der URL) |
| **Production branch** | `main` (oder `master`, je nach deiner Standard-Branch) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | leer lassen |
| **Environment variables** | keine nötig |

**6. Deploy starten**  
Auf **Save and Deploy** klicken. Cloudflare installiert Abhängigkeiten, führt `npm run build` aus und veröffentlicht den Inhalt von `dist/`.

**7. Fertig**  
Nach 1–2 Minuten erscheint die Live-URL, z. B.  
**`https://innolab-prototype.pages.dev`**  
(die genaue URL steht auf der Projektseite unter **Deployments** → neues Deployment → **View build** / **Visit site**).

**Später:** Jeder Push auf die Production-Branch (z. B. `main`) löst automatisch einen neuen Build und Deploy aus. SPA-Routing (z. B. `/story/US-001`) übernimmt `wrangler.toml` (`not_found_handling = "single-page-application"`).

### Alternative: Netlify

[netlify.com](https://www.netlify.com) → **Import from Git** → **Build:** `npm run build`, **Publish directory:** `dist`. Unter **Site settings** → **Redirects** eine Regel hinzufügen: `/* /index.html 200` (SPA-Routing).

### Lokale Vorschau des Production-Builds

```bash
npm run build
npm run preview
```
